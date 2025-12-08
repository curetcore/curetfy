/**
 * Customer Metafields Service
 *
 * Built for Shopify Requirement 5.7.1:
 * "Use Shopify segments for apps that collect information from customers"
 *
 * This service manages customer metafields that enable segmentation:
 * - cod_orders_count: Number of COD orders placed
 * - first_cod_order_date: Date of first COD order
 * - last_cod_order_date: Date of most recent COD order
 * - total_cod_spent: Total amount spent via COD
 */

import type { AdminApiContext } from "@shopify/shopify-app-remix/server";

// ============================================================================
// TYPES
// ============================================================================

export interface CustomerMetafieldsInput {
  customerGid: string;
  orderTotal: number;
  currency: string;
}

export interface MetafieldUpdateResult {
  success: boolean;
  error?: string;
}

// ============================================================================
// GRAPHQL MUTATIONS
// ============================================================================

const GET_CUSTOMER_METAFIELDS_QUERY = `
  query GetCustomerMetafields($id: ID!) {
    customer(id: $id) {
      id
      metafield(namespace: "curetfy", key: "cod_orders_count") {
        value
      }
      totalSpent: metafield(namespace: "curetfy", key: "total_cod_spent") {
        value
      }
      firstOrder: metafield(namespace: "curetfy", key: "first_cod_order_date") {
        value
      }
    }
  }
`;

const SET_METAFIELDS_MUTATION = `
  mutation MetafieldsSet($metafields: [MetafieldsSetInput!]!) {
    metafieldsSet(metafields: $metafields) {
      metafields {
        id
        namespace
        key
        value
      }
      userErrors {
        field
        message
      }
    }
  }
`;

// ============================================================================
// MAIN FUNCTIONS
// ============================================================================

/**
 * Update customer metafields after a COD order
 *
 * This function:
 * 1. Gets current metafield values
 * 2. Increments order count
 * 3. Updates total spent
 * 4. Sets first/last order dates
 */
export async function updateCustomerMetafieldsForCOD(
  admin: AdminApiContext["admin"],
  input: CustomerMetafieldsInput
): Promise<MetafieldUpdateResult> {
  try {
    // Step 1: Get current metafield values
    const queryResponse = await admin.graphql(GET_CUSTOMER_METAFIELDS_QUERY, {
      variables: { id: input.customerGid },
    });
    const queryData = await queryResponse.json();

    const customer = queryData.data?.customer;
    if (!customer) {
      return {
        success: false,
        error: "Customer not found",
      };
    }

    // Parse current values
    const currentOrdersCount = parseInt(customer.metafield?.value || "0", 10);
    const currentTotalSpent = parseFloat(customer.totalSpent?.value || "0");
    const firstOrderDate = customer.firstOrder?.value;

    // Calculate new values
    const newOrdersCount = currentOrdersCount + 1;
    const newTotalSpent = currentTotalSpent + input.orderTotal;
    const now = new Date().toISOString();

    // Step 2: Build metafields array
    const metafields = [
      {
        ownerId: input.customerGid,
        namespace: "curetfy",
        key: "cod_orders_count",
        type: "number_integer",
        value: String(newOrdersCount),
      },
      {
        ownerId: input.customerGid,
        namespace: "curetfy",
        key: "total_cod_spent",
        type: "number_decimal",
        value: newTotalSpent.toFixed(2),
      },
      {
        ownerId: input.customerGid,
        namespace: "curetfy",
        key: "last_cod_order_date",
        type: "date_time",
        value: now,
      },
    ];

    // Only set first_cod_order_date if it doesn't exist
    if (!firstOrderDate) {
      metafields.push({
        ownerId: input.customerGid,
        namespace: "curetfy",
        key: "first_cod_order_date",
        type: "date_time",
        value: now,
      });
    }

    // Step 3: Update metafields
    const mutationResponse = await admin.graphql(SET_METAFIELDS_MUTATION, {
      variables: { metafields },
    });
    const mutationData = await mutationResponse.json();

    if (mutationData.data?.metafieldsSet?.userErrors?.length > 0) {
      console.error("Metafields update errors:", mutationData.data.metafieldsSet.userErrors);
      return {
        success: false,
        error: mutationData.data.metafieldsSet.userErrors.map((e: any) => e.message).join(", "),
      };
    }

    return { success: true };
  } catch (error) {
    console.error("Error updating customer metafields:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Initialize metafields for a new COD customer
 */
export async function initializeCustomerMetafields(
  admin: AdminApiContext["admin"],
  customerGid: string,
  orderTotal: number
): Promise<MetafieldUpdateResult> {
  try {
    const now = new Date().toISOString();

    const metafields = [
      {
        ownerId: customerGid,
        namespace: "curetfy",
        key: "cod_orders_count",
        type: "number_integer",
        value: "1",
      },
      {
        ownerId: customerGid,
        namespace: "curetfy",
        key: "total_cod_spent",
        type: "number_decimal",
        value: orderTotal.toFixed(2),
      },
      {
        ownerId: customerGid,
        namespace: "curetfy",
        key: "first_cod_order_date",
        type: "date_time",
        value: now,
      },
      {
        ownerId: customerGid,
        namespace: "curetfy",
        key: "last_cod_order_date",
        type: "date_time",
        value: now,
      },
    ];

    const response = await admin.graphql(SET_METAFIELDS_MUTATION, {
      variables: { metafields },
    });
    const data = await response.json();

    if (data.data?.metafieldsSet?.userErrors?.length > 0) {
      console.error("Metafields init errors:", data.data.metafieldsSet.userErrors);
      return {
        success: false,
        error: data.data.metafieldsSet.userErrors.map((e: any) => e.message).join(", "),
      };
    }

    return { success: true };
  } catch (error) {
    console.error("Error initializing customer metafields:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Get customer COD stats from metafields
 */
export async function getCustomerCODStats(
  admin: AdminApiContext["admin"],
  customerGid: string
) {
  try {
    const response = await admin.graphql(GET_CUSTOMER_METAFIELDS_QUERY, {
      variables: { id: customerGid },
    });
    const data = await response.json();

    const customer = data.data?.customer;
    if (!customer) {
      return null;
    }

    return {
      ordersCount: parseInt(customer.metafield?.value || "0", 10),
      totalSpent: parseFloat(customer.totalSpent?.value || "0"),
      firstOrderDate: customer.firstOrder?.value || null,
    };
  } catch (error) {
    console.error("Error getting customer COD stats:", error);
    return null;
  }
}
