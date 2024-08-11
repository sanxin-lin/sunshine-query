type Listener = () => void

export abstract class Subscribable<TListener extends Function = Listener> {
  protected listeners: Set<TListener>

  constructor() {
    this.listeners = new Set()
  }

  subscribe(listener: TListener): () => void {
    this.listeners.add(listener)

    this.onSubscribe()

    return () => {
      this.listeners.delete(listener)
      this.onUnsubscribe()
    }
  }

  hasListeners(): boolean {
    return this.listeners.size > 0
  }

  protected onSubscribe = (): void => {
    // Do nothing
  }

  protected onUnsubscribe = (): void => {
    // Do nothing
  }
}
