import test from 'node:test'
import assert from 'node:assert/strict'

import Gate from '@ludlovian/lock/gate'

const isResolved = p =>
  new Promise((resolve, reject) => {
    p.then(() => resolve(true), reject)
    setImmediate(() => resolve(false))
  })

test('Gate', () => {
  test('creation', () => {
    const g = new Gate()
    assert.ok(g instanceof Gate)
    assert.equal(g.isOpen, true)
  })

  test('close and reopen', async t => {
    const g = new Gate()

    let v = g.close()
    assert.equal(v, g)
    assert.equal(g.isOpen, false)

    const pOpen = g.untilOpen()
    assert.equal(await isResolved(pOpen), false)

    v = g.open()
    assert.equal(v, g)
    await Promise.resolve().then(() => {})
    assert.equal(g.isOpen, true)
    assert.equal(await isResolved(pOpen), true)
  })

  test('multiple opens & closes', async t => {
    const g = new Gate()

    g.close()
    assert.equal(g.isOpen, false)
    const pOpen = g.untilOpen()

    g.close()
    assert.equal(g.untilOpen(), pOpen, 'same promise returned')

    g.open()
    assert.equal(g.isOpen, true)

    g.open()

    await pOpen
  })

  test('awaiting when open', async t => {
    const g = new Gate()
    g.open()

    const pOpen = g.untilOpen()
    assert.equal(await isResolved(pOpen), true)
    await pOpen
  })
})
