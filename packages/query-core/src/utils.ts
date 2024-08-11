import { isNumber } from 'lodash-es'

export const isServer = typeof window === 'undefined' || 'Deno' in globalThis

export function isValidTimeout(value: unknown): value is number {
  return isNumber(value) && value >= 0 && value !== Infinity
}
