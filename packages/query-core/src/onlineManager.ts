import { Subscribable } from './subscribable'
import { isServer } from './utils'

export type Listener = (online: boolean) => void
export type SetupFn = (setOnline: Listener) => (() => void) | undefined

const initSetup = (onOnline: Listener) => {
  if (!isServer && window.addEventListener) {
    const onlineListener = () => onOnline(true)
    const offlineListener = () => onOnline(false)
    // Listen to online
    window.addEventListener('online', onlineListener, false)
    window.addEventListener('offline', offlineListener, false)

    return () => {
      // Be sure to unsubscribe if a new handler is set
      window.removeEventListener('online', onlineListener)
      window.removeEventListener('offline', offlineListener)
    }
  }

  return
}

export class OnlineManager extends Subscribable<Listener> {
  #online = true
  #setup: SetupFn
  #cleanup?: () => void

  constructor() {
    super()
    this.#setup = initSetup
  }

  protected override onSubscribe = () => {
    if (!this.#cleanup) {
      this.setEventListener(this.#setup)
    }
  }

  protected override onUnsubscribe = () => {
    if (!this.hasListeners()) {
      this.#cleanup?.()
      this.#cleanup = undefined
    }
  }

  setEventListener = (setup: SetupFn) => {
    this.#cleanup?.()
    this.#setup = setup
    this.#cleanup = setup(this.setOnline)
  }

  setOnline = (online: boolean) => {
    const needChange = online !== this.#online

    if (needChange) {
      this.#online = online
      this.listeners.forEach((listener) => {
        listener(online)
      })
    }
  }

  isOnline() {
    return this.#online
  }
}

export const onlineManager = new OnlineManager()
