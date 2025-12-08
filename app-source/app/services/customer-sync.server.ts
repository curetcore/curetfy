/**
 * Customer Sync Service
 *
 * Built for Shopify Requirement 5.7.3:
 * "Sync customer data for forms apps - synchronize all customer information with Shopify"
 *
 * This service creates or updates customers in Shopify when they submit the COD form.
 */

import type { AdminApiContext } from "@shopify/shopify-app-remix/server";

// ============================================================================
// TYPES
// ============================================================================

export interface CustomerInput {
  email?: string;
  phone: string;
  firstName: string;
  lastName: string;
  address?: {
    address1: string;
    address2?: string;
    city?: string;
    province?: string;
    country?: string;
    zip?: string;
  };
  tags?: string[];
  note?: string;
  acceptsMarketing?: boolean;
}

export interface SyncCustomerResult {
  success: boolean;
  customerId?: string;
  customerGid?: string;
  isNewCustomer: boolean;
  error?: string;
}

// ============================================================================
// GRAPHQL QUERIES
// ============================================================================

const FIND_CUSTOMER_BY_PHONE_QUERY = `
  query FindCustomerByPhone($query: String!) {
    customers(first: 1, query: $query) {
      edges {
        node {
          id
          email
          phone
          firstName
          lastName
          tags
        }
      }
    }
  }
`;

const FIND_CUSTOMER_BY_EMAIL_QUERY = `
  query FindCustomerByEmail($query: String!) {
    customers(first: 1, query: $query) {
      edges {
        node {
          id
          email
          phone
          firstName
          lastName
          tags
        }
      }
    }
  }
`;

const CREATE_CUSTOMER_MUTATION = `
  mutation CustomerCreate($input: CustomerInput!) {
    customerCreate(input: $input) {
      customer {
        id
        email
        phone
        firstName
        lastName
      }
      userErrors {
        field
        message
      }
    }
  }
`;

const UPDATE_CUSTOMER_MUTATION = `
  mutation CustomerUpdate($input: CustomerInput!) {
    customerUpdate(input: $input) {
      customer {
        id
        email
        phone
        firstName
        lastName
      }
      userErrors {
        field
        message
      }
    }
  }
`;

const ADD_TAGS_MUTATION = `
  mutation TagsAdd($id: ID!, $tags: [String!]!) {
    tagsAdd(id: $id, tags: $tags) {
      node {
        id
      }
      userErrors {
        field
        message
      }
    }
  }
`;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Clean and format phone number for Shopify
 * Shopify expects E.164 format: +1234567890
 */
function formatPhoneForShopify(phone: string): string {
  // Remove all non-digit characters except +
  let cleaned = phone.replace(/[^\d+]/g, "");

  // Ensure it starts with +
  if (!cleaned.startsWith("+")) {
    // Assume it's a local number, add + prefix
    cleaned = "+" + cleaned;
  }

  return cleaned;
}

/**
 * Extract GID numeric ID from Shopify Global ID
 */
function extractNumericId(gid: string): string {
  const match = gid.match(/\/(\d+)$/);
  return match ? match[1] : gid;
}

// ============================================================================
// MAIN SYNC FUNCTION
// ============================================================================

/**
 * Sync customer to Shopify
 *
 * This function:
 * 1. Searches for existing customer by phone or email
 * 2. Creates new customer if not found
 * 3. Updates existing customer with new information
 * 4. Adds "curetfy_cod_form" tag for tracking
 */
export async function syncCustomerToShopify(
  admin: AdminApiContext["admin"],
  customerData: CustomerInput
): Promise<SyncCustomerResult> {
  try {
    const formattedPhone = formatPhoneForShopify(customerData.phone);

    // Step 1: Try to find existing customer by phone
    let existingCustomer = null;

    const phoneSearchResponse = await admin.graphql(FIND_CUSTOMER_BY_PHONE_QUERY, {
      variables: { query: `phone:${formattedPhone}` },
    });
    const phoneSearchData = await phoneSearchResponse.json();

    if (phoneSearchData.data?.customers?.edges?.length > 0) {
      existingCustomer = phoneSearchData.data.customers.edges[0].node;
    }

    // Step 2: If not found by phone and email provided, try email
    if (!existingCustomer && customerData.email) {
      const emailSearchResponse = await admin.graphql(FIND_CUSTOMER_BY_EMAIL_QUERY, {
        variables: { query: `email:${customerData.email}` },
      });
      const emailSearchData = await emailSearchResponse.json();

      if (emailSearchData.data?.customers?.edges?.length > 0) {
        existingCustomer = emailSearchData.data.customers.edges[0].node;
      }
    }

    // Build address array
    const addresses = customerData.address ? [{
      address1: customerData.address.address1,
      address2: customerData.address.address2 || null,
      city: customerData.address.city || null,
      province: customerData.address.province || null,
      country: customerData.address.country || "DO",
      zip: customerData.address.zip || null,
    }] : [];

    // Build tags array
    const tags = [...(customerData.tags || []), "curetfy_cod_form"];

    if (existingCustomer) {
      // Step 3: Update existing customer
      const updateInput: any = {
        id: existingCustomer.id,
        firstName: customerData.firstName,
        lastName: customerData.lastName,
      };

      // Only update phone if different
      if (formattedPhone !== existingCustomer.phone) {
        updateInput.phone = formattedPhone;
      }

      // Only update email if provided and different
      if (customerData.email && customerData.email !== existingCustomer.email) {
        updateInput.email = customerData.email;
      }

      // Add note if provided
      if (customerData.note) {
        updateInput.note = customerData.note;
      }

      // Update addresses if provided
      if (addresses.length > 0) {
        updateInput.addresses = addresses;
      }

      const updateResponse = await admin.graphql(UPDATE_CUSTOMER_MUTATION, {
        variables: { input: updateInput },
      });
      const updateData = await updateResponse.json();

      if (updateData.data?.customerUpdate?.userErrors?.length > 0) {
        console.error("Customer update errors:", updateData.data.customerUpdate.userErrors);
        // Continue anyway - customer exists
      }

      // Add tags (merge with existing)
      const newTags = tags.filter(tag => !existingCustomer.tags?.includes(tag));
      if (newTags.length > 0) {
        await admin.graphql(ADD_TAGS_MUTATION, {
          variables: { id: existingCustomer.id, tags: newTags },
        });
      }

      return {
        success: true,
        customerId: extractNumericId(existingCustomer.id),
        customerGid: existingCustomer.id,
        isNewCustomer: false,
      };
    } else {
      // Step 4: Create new customer
      const createInput: any = {
        firstName: customerData.firstName,
        lastName: customerData.lastName,
        phone: formattedPhone,
        tags,
      };

      if (customerData.email) {
        createInput.email = customerData.email;
      }

      if (addresses.length > 0) {
        createInput.addresses = addresses;
      }

      if (customerData.note) {
        createInput.note = customerData.note;
      }

      if (customerData.acceptsMarketing !== undefined) {
        createInput.emailMarketingConsent = {
          marketingState: customerData.acceptsMarketing ? "SUBSCRIBED" : "NOT_SUBSCRIBED",
          marketingOptInLevel: "SINGLE_OPT_IN",
        };
      }

      const createResponse = await admin.graphql(CREATE_CUSTOMER_MUTATION, {
        variables: { input: createInput },
      });
      const createData = await createResponse.json();

      if (createData.data?.customerCreate?.userErrors?.length > 0) {
        const errors = createData.data.customerCreate.userErrors;
        console.error("Customer create errors:", errors);

        // Check if it's a duplicate error
        const duplicateError = errors.find((e: any) =>
          e.message?.includes("already been taken") ||
          e.message?.includes("ya existe")
        );

        if (duplicateError) {
          // Customer exists but wasn't found - might be archived
          return {
            success: false,
            error: "Customer already exists but may be archived",
            isNewCustomer: false,
          };
        }

        return {
          success: false,
          error: errors.map((e: any) => e.message).join(", "),
          isNewCustomer: false,
        };
      }

      const newCustomer = createData.data?.customerCreate?.customer;

      if (!newCustomer) {
        return {
          success: false,
          error: "Failed to create customer - no customer returned",
          isNewCustomer: false,
        };
      }

      return {
        success: true,
        customerId: extractNumericId(newCustomer.id),
        customerGid: newCustomer.id,
        isNewCustomer: true,
      };
    }
  } catch (error) {
    console.error("Error syncing customer to Shopify:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      isNewCustomer: false,
    };
  }
}

/**
 * Create Draft Order in Shopify with customer association
 *
 * This creates a proper draft order linked to the customer.
 */
export async function createShopifyDraftOrder(
  admin: AdminApiContext["admin"],
  params: {
    customerId: string;
    lineItems: Array<{
      variantId?: string;
      title: string;
      quantity: number;
      originalUnitPrice: number;
    }>;
    shippingLine?: {
      title: string;
      price: number;
    };
    note?: string;
    tags?: string[];
    shippingAddress?: {
      firstName: string;
      lastName: string;
      address1: string;
      address2?: string;
      city?: string;
      province?: string;
      country?: string;
      zip?: string;
      phone?: string;
    };
  }
) {
  const CREATE_DRAFT_ORDER_MUTATION = `
    mutation DraftOrderCreate($input: DraftOrderInput!) {
      draftOrderCreate(input: $input) {
        draftOrder {
          id
          name
          invoiceUrl
          status
          totalPrice
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  try {
    const input: any = {
      customerId: params.customerId,
      note: params.note || "Pedido creado via Curetfy COD Form",
      tags: [...(params.tags || []), "curetfy_cod_form", "pago-contraentrega"],
      lineItems: params.lineItems.map(item => ({
        title: item.title,
        quantity: item.quantity,
        originalUnitPrice: item.originalUnitPrice.toFixed(2),
        ...(item.variantId && { variantId: item.variantId }),
      })),
    };

    if (params.shippingLine) {
      input.shippingLine = {
        title: params.shippingLine.title,
        price: params.shippingLine.price.toFixed(2),
      };
    }

    if (params.shippingAddress) {
      input.shippingAddress = params.shippingAddress;
    }

    const response = await admin.graphql(CREATE_DRAFT_ORDER_MUTATION, {
      variables: { input },
    });
    const data = await response.json();

    if (data.data?.draftOrderCreate?.userErrors?.length > 0) {
      console.error("Draft order errors:", data.data.draftOrderCreate.userErrors);
      return {
        success: false,
        error: data.data.draftOrderCreate.userErrors.map((e: any) => e.message).join(", "),
      };
    }

    const draftOrder = data.data?.draftOrderCreate?.draftOrder;

    return {
      success: true,
      draftOrderId: draftOrder?.id,
      draftOrderName: draftOrder?.name,
      invoiceUrl: draftOrder?.invoiceUrl,
    };
  } catch (error) {
    console.error("Error creating draft order:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
