import { beforeEach, describe, expect, test, vi } from 'vitest'
import { createNotifyManager } from '../notifyManager'
import { sleep } from './utils'

describe('notifyManager', () => {
  let notifyManagerTest = createNotifyManager()

  beforeEach(() => {
    notifyManagerTest = createNotifyManager()
  })

  test('使用默认的 notifyFn', async () => {
    const callbackSpy = vi.fn()
    notifyManagerTest.schedule(callbackSpy)
    await sleep(1)
    expect(callbackSpy).toHaveBeenCalled()
  })

  test('使用默认的 batchNotifyFn', async () => {
    const callbackScheduleSpy = vi
      .fn()
      .mockImplementation(async () => await sleep(20))
    const callbackBatchLevel2Spy = vi.fn().mockImplementation(async () => {
      notifyManagerTest.schedule(callbackScheduleSpy)
    })
    const callbackBatchLevel1Spy = vi.fn().mockImplementation(async () => {
      notifyManagerTest.batch(callbackBatchLevel2Spy)
    })

    notifyManagerTest.batch(callbackBatchLevel1Spy)

    await sleep(30)

    expect(callbackBatchLevel1Spy).toHaveBeenCalledTimes(1)
    expect(callbackBatchLevel2Spy).toHaveBeenCalledTimes(1)
    expect(callbackScheduleSpy).toHaveBeenCalledTimes(1)
  })

  test('自定义 scheduler', async () => {
    const customCallback = vi.fn((cb) => queueMicrotask(cb))
    const notifySpy = vi.fn()

    notifyManagerTest.setScheduler(customCallback)
    notifyManagerTest.setNotifyFunction(notifySpy)

    notifyManagerTest.batch(() => notifyManagerTest.schedule(vi.fn))

    expect(customCallback).toHaveBeenCalledTimes(1)

    // wait until the microtask has run
    await new Promise<void>((res) => queueMicrotask(res))

    expect(notifySpy).toHaveBeenCalledTimes(1)
  })
})
