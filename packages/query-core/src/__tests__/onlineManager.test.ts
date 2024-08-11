import { describe, expect, test, vi, beforeEach } from 'vitest'
import { OnlineManager, type Listener } from '../onlineManager'
import { sleep, setIsServer } from './utils'

describe('onlineManager', () => {
  let onlineManager: OnlineManager
  beforeEach(() => {
    onlineManager = new OnlineManager()
  })

  test('navigator 对象不存在时，isOnline 返回 true', () => {
    const navigatorSpy = vi.spyOn(globalThis, 'navigator', 'get')
    // @ts-expect-error
    navigatorSpy.mockImplementation(() => undefined)
    expect(onlineManager.isOnline()).toBeTruthy()

    navigatorSpy.mockRestore()
  })

  test('navigator 对象上 onLine 为 true时，isOline 返回 true', () => {
    const onLineSpy = vi.spyOn(navigator, 'onLine', 'get')

    onLineSpy.mockImplementation(() => true)

    expect(onlineManager.isOnline()).toBeTruthy()

    onLineSpy.mockRestore()
  })

  test('setEventListener 函数参数 setOnline 必须传入 boolean 类型参数', async () => {
    let count = 0

    const setup = (setOnline: Listener) => {
      setTimeout(() => {
        setOnline(false)
        count++
      }, 20)

      return () => {}
    }

    onlineManager.setEventListener(setup)

    await sleep(30)
    expect(count).toEqual(1)
    expect(onlineManager.isOnline()).toBeFalsy()
  })

  test('setEventListener 执行之前，需要先把之前设置的监听函数删除掉', () => {
    const remove1Spy = vi.fn()
    const remove2Spy = vi.fn()

    onlineManager.setEventListener(() => remove1Spy())
    onlineManager.setEventListener(() => remove2Spy())

    expect(remove1Spy).toHaveBeenCalledTimes(1)
    expect(remove2Spy).toHaveBeenCalledTimes(1)
  })

  test('window 不存在时，cleanup(removeEventListener) 函数不会执行的', () => {
    const restoreIsServer = setIsServer(true)

    const removeEventListenerSpy = vi.spyOn(globalThis, 'removeEventListener')

    const unsubscribe = onlineManager.subscribe(() => undefined)

    unsubscribe()

    expect(removeEventListenerSpy).not.toHaveBeenCalled()

    restoreIsServer()
  })

  test('window.addEventListener 不存在时，cleanup 函数不会执行的', () => {
    const { addEventListener } = globalThis.window

    // @ts-expect-error
    globalThis.window.addEventListener = undefined

    const removeEventListenerSpy = vi.spyOn(globalThis, 'removeEventListener')
    const unsubscribe = onlineManager.subscribe(() => undefined)

    unsubscribe()

    expect(removeEventListenerSpy).not.toHaveBeenCalled()

    globalThis.window.addEventListener = addEventListener
  })

  test('当 setup 函数被取代的时候', () => {
    const addEventListenerSpy = vi.spyOn(globalThis.window, 'addEventListener')

    const removeEventListenerSpy = vi.spyOn(
      globalThis.window,
      'removeEventListener',
    )

    // Should set the default event listener with window event listeners
    const unsubscribe = onlineManager.subscribe(() => undefined)
    expect(addEventListenerSpy).toHaveBeenCalledTimes(2)

    // Should replace the window default event listener by a new one
    // and it should call window.removeEventListener twice
    onlineManager.setEventListener(() => {
      return () => void 0
    })

    expect(removeEventListenerSpy).toHaveBeenCalledTimes(2)

    unsubscribe()
    addEventListenerSpy.mockRestore()
    removeEventListenerSpy.mockRestore()
  })

  test('当最后一个 listener 解除监听之后，需执行 removeEventListener 进行取消监听', () => {
    const addEventListenerSpy = vi.spyOn(globalThis.window, 'addEventListener')

    const removeEventListenerSpy = vi.spyOn(
      globalThis.window,
      'removeEventListener',
    )

    const unsubscribe1 = onlineManager.subscribe(() => undefined)
    const unsubscribe2 = onlineManager.subscribe(() => undefined)

    expect(addEventListenerSpy).toHaveBeenCalledTimes(2) // online + offline

    unsubscribe1()
    expect(removeEventListenerSpy).toHaveBeenCalledTimes(0)
    unsubscribe2()
    expect(removeEventListenerSpy).toHaveBeenCalledTimes(2) // online + offline
  })

  test('最后一个 listener 解除监听之后，下一轮监听时，setup 函数需重新执行', () => {
    const setupSpy = vi.fn().mockImplementation(() => () => undefined)

    onlineManager.setEventListener(setupSpy)

    const unsubscribe1 = onlineManager.subscribe(() => undefined)

    expect(setupSpy).toHaveBeenCalledTimes(1)

    unsubscribe1()

    expect(setupSpy).toHaveBeenCalledTimes(1)

    const unsubscribe2 = onlineManager.subscribe(() => undefined)

    expect(setupSpy).toHaveBeenCalledTimes(2)

    unsubscribe2()

    expect(setupSpy).toHaveBeenCalledTimes(2)
  })

  test('setOnline 执行的时候，listeners 必须全部执行', () => {
    const listener1 = vi.fn()
    const listener2 = vi.fn()

    onlineManager.subscribe(listener1)
    onlineManager.subscribe(listener2)

    onlineManager.setOnline(false)
    onlineManager.setOnline(false)

    expect(listener1).toHaveBeenCalledTimes(1)
    expect(listener2).toHaveBeenCalledTimes(1)

    onlineManager.setOnline(true)
    onlineManager.setOnline(true)

    expect(listener1).toHaveBeenCalledTimes(2)
    expect(listener2).toHaveBeenCalledTimes(2)
  })
})
