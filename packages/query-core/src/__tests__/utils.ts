import * as utils from '../utils'

export function sleep(timeout: number): Promise<void> {
  return new Promise((resolve, _reject) => {
    setTimeout(resolve, timeout)
  })
}

// This monkey-patches the isServer-value from utils,
// so that we can pretend to be in a server environment
export function setIsServer(isServer: boolean) {
  const original = utils.isServer
  Object.defineProperty(utils, 'isServer', {
    get: () => isServer,
  })

  return () => {
    Object.defineProperty(utils, 'isServer', {
      get: () => original,
    })
  }
}
