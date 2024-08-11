import { isBoolean } from 'lodash-es'
import { Subscribable } from './subscribable'
import { isServer } from './utils'

export type Listener = (focused: boolean) => void

export type SetupFn = (
  setFocused: (focused?: boolean) => void,
) => (() => void) | undefined

const initSetup: SetupFn = (setFocused) => {
  // addEventListener does not exist in React Native, but window does
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (!isServer && window.addEventListener) {
    const listener = () => setFocused()
    // Listen to visibilitychange
    window.addEventListener('visibilitychange', listener, false)

    return () => {
      // Be sure to unsubscribe if a new handler is set
      window.removeEventListener('visibilitychange', listener)
    }
  }
  return
}

export class FocusManager extends Subscribable<Listener> {
  #focused?: boolean
  #cleanup?: () => void

  #setup: SetupFn

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
    this.#cleanup = setup((focused) => {
      if (isBoolean(focused)) {
        this.setFocused(focused)
      } else {
        this.onFocused()
      }
    })
  }

  setFocused = (focused?: boolean) => {
    const needChange = this.#focused !== focused

    if (needChange) {
      this.#focused = focused
      this.onFocused()
    }
  }

  onFocused = () => {
    const focused = this.isFocus()
    this.listeners.forEach((listener) => {
      listener(focused)
    })
  }

  isFocus = () => {
    if (isBoolean(this.#focused)) return this.#focused

    // document global can be unavailable in react native
    return globalThis.document?.visibilityState !== 'hidden'
  }
}

export const focusManager = new FocusManager()
