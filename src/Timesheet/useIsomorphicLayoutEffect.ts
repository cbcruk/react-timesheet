import { useEffect, useLayoutEffect } from 'react'

/**
 * `useLayoutEffect` in the browser, `useEffect` on the server.
 *
 * The label flipping below has to read layout before paint, but React warns
 * about `useLayoutEffect` during server rendering — where there is nothing to
 * measure anyway.
 */
export const useIsomorphicLayoutEffect =
  typeof window === 'undefined' ? useEffect : useLayoutEffect
