import { suite, test } from 'node:test'
import assert from 'node:assert/strict'

import Lock from '../src/index.mjs'

const isResolved = (p, ms = 10) =>
  new Promise((resolve, reject) => {
    setTimeout(() => resolve(false), ms)
    p.then(() => resolve(true), reject)
  })

const trigger = () => {
  const fns = {}
  return Object.assign(
    new Promise((resolve, reject) => Object.assign(fns, { resolve, reject })),
    fns
  )
}

suite('Lock', () => {
  test('creation', () => {
    const l = new Lock()
    assert.ok(l instanceof Lock, 'is an instance of lock')
    assert.equal(l.locked, false, 'is initially unlocked')
  })

  test('basic use', async () => {
    const l = new Lock()

    const p1 = l.acquire()
    assert.equal(await isResolved(p1), true, 'acquire #1 works')
    assert.equal(l.locked, true, 'is locked')

    const p2 = l.acquire()
    assert.equal(await isResolved(p2), false, 'acquire #2 not yet')

    l.release()
    assert.equal(await isResolved(p2), true, 'acquire #2 now works')
    assert.equal(l.locked, true, 'is still locked')

    l.release()
    assert.equal(l.locked, false, 'is now unlocked')
  })

  test('over-release', async () => {
    const l = new Lock()

    const p1 = l.acquire()
    assert.equal(await isResolved(p1), true, 'acquire #1 works')
    assert.equal(l.locked, true, 'is locked')

    l.release()
    assert.equal(l.locked, false, 'is now unlocked')

    l.release()
    assert.equal(l.locked, false, 'is still unlocked')
  })

  test('exec works', async () => {
    const l = new Lock()
    const exec = l.exec

    const t1 = trigger()

    const p1 = exec(() => t1)
    const p2 = exec(() => 17)

    assert.equal(await isResolved(p1), false, 'task #1 waiting')
    assert.equal(await isResolved(p2), false, 'task #2 waiting')

    t1.resolve(23)
    assert.equal(await p1, 23, 'task #1 resolved correctly')
    assert.equal(await p2, 17, 'task #2 resolved correctly')

    assert.equal(l.locked, false, 'lock is now unlocked')
  })

  test('exec when throws', async () => {
    const l = new Lock()
    const exec = l.exec
    const err = new Error('oops')

    const p1 = exec(() => {
      throw err
    })

    const p2 = p1.then(assert.fail, e => {
      assert.equal(e, err, 'right error passed down')
      return 'oops'
    })

    assert.equal(await p2, 'oops', 'executed')
  })
})
