import { beforeEach, describe, expect, test, vi } from 'vitest'
import { FocusManager, type Listener } from '../focusManager'
import { sleep } from './utils'
import { setIsServer } from './utils'

describe('focusManager', () => {
  let focusManager: FocusManager
  beforeEach(() => {
    vi.resetModules()
    focusManager = new FocusManager()
  })

  test('setEventListener 执行之前，需要先把之前设置的监听函数删除掉', () => {
    const remove1Spy = vi.fn()
    const remove2Spy = vi.fn()

    focusManager.setEventListener(() => remove1Spy())
    focusManager.setEventListener(() => remove2Spy())

    expect(remove1Spy).toHaveBeenCalledTimes(1)
    expect(remove2Spy).toHaveBeenCalledTimes(1)
  })

  test('setEventListener 函数参数 setFocused 必须传入 boolean 类型参数', async () => {
    let count = 0

    const setup = (setFocused: Listener) => {
      setTimeout(() => {
        setFocused(true)
        count++
      }, 20)

      return () => {}
    }

    focusManager.setEventListener(setup)

    await sleep(30)
    expect(count).toEqual(1)
    expect(focusManager.isFocused()).toBeTruthy()
  })

  test('document 不存在的话，isFocuseded 返回是 true', () => {
    const { document } = globalThis

    // @ts-expect-error
    delete globalThis.document

    focusManager.setFocused()
    expect(focusManager.isFocused()).toBeTruthy()
    globalThis.document = document
  })

  test('window 不存在时，cleanup(removeEventListener) 函数不会执行的', () => {
    const restoreIsServer = setIsServer(true)

    const removeEventListenerSpy = vi.spyOn(globalThis, 'removeEventListener')

    const unsubscribe = focusManager.subscribe(() => undefined)

    unsubscribe()

    expect(removeEventListenerSpy).not.toHaveBeenCalled()

    restoreIsServer()
  })

  test('window.addEventListener 不存在时，cleanup 函数不会执行的', () => {
    const { addEventListener } = globalThis.window

    // @ts-expect-error
    globalThis.window.addEventListener = undefined

    const removeEventListenerSpy = vi.spyOn(globalThis, 'removeEventListener')
    const unsubscribe = focusManager.subscribe(() => undefined)

    unsubscribe()

    expect(removeEventListenerSpy).not.toHaveBeenCalled()

    globalThis.window.addEventListener = addEventListener
  })

  test('当 setup 函数被取代的时候', () => {
    const unsubscribeSpy = vi.fn().mockImplementation(() => undefined)
    const handlerSpy = vi.fn().mockImplementation(() => unsubscribeSpy)

    focusManager.setEventListener(() => handlerSpy())

    const unsubscribe = focusManager.subscribe(() => undefined)

    expect(handlerSpy).toHaveBeenCalledTimes(1)

    unsubscribe()

    expect(unsubscribeSpy).toHaveBeenCalledTimes(1)

    unsubscribeSpy.mockRestore()
    handlerSpy.mockRestore()
  })

  test('当最后一个 listener 解除监听之后，需执行 removeEventListener 进行取消监听', () => {
    const addEventListenerSpy = vi.spyOn(globalThis.window, 'addEventListener')

    const removeEventListenerSpy = vi.spyOn(
      globalThis.window,
      'removeEventListener',
    )

    const unsubscribe1 = focusManager.subscribe(() => undefined)
    const unsubscribe2 = focusManager.subscribe(() => undefined)

    expect(addEventListenerSpy).toHaveBeenCalledTimes(1)

    unsubscribe1()
    expect(removeEventListenerSpy).toHaveBeenCalledTimes(0)
    unsubscribe2()
    expect(removeEventListenerSpy).toHaveBeenCalledTimes(1)
  })

  test('最后一个 listener 解除监听之后，下一轮监听时，setup 函数需重新执行', () => {
    const setupSpy = vi.fn().mockImplementation(() => () => undefined)

    focusManager.setEventListener(setupSpy)

    const unsubscribe1 = focusManager.subscribe(() => undefined)

    expect(setupSpy).toHaveBeenCalledTimes(1)

    unsubscribe1()

    expect(setupSpy).toHaveBeenCalledTimes(1)

    const unsubscribe2 = focusManager.subscribe(() => undefined)

    expect(setupSpy).toHaveBeenCalledTimes(2)

    unsubscribe2()

    expect(setupSpy).toHaveBeenCalledTimes(2)
  })

  test('setFocused 执行的时候，listeners 必须全部执行', () => {
    const listener1 = vi.fn()
    const listener2 = vi.fn()

    focusManager.subscribe(listener1)
    focusManager.subscribe(listener2)

    focusManager.setFocused(true)
    focusManager.setFocused(true)

    expect(listener1).toHaveBeenCalledTimes(1)
    expect(listener2).toHaveBeenCalledTimes(1)

    focusManager.setFocused(false)
    focusManager.setFocused(false)

    expect(listener1).toHaveBeenCalledTimes(2)
    expect(listener2).toHaveBeenCalledTimes(2)
  })
})
