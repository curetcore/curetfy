import * as Headless from '@headlessui/react'
import { Link as RemixLink } from '@remix-run/react'
import { forwardRef } from 'react'

export const Link = forwardRef(function Link({ href, to, ...props }, ref) {
  const destination = to || href
  return (
    <Headless.DataInteractive>
      <RemixLink to={destination} {...props} ref={ref} />
    </Headless.DataInteractive>
  )
})
