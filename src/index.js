export default class Lock {
  static #resolved = Promise.resolve()
  #locked = false
  #awaiters = []

  constructor () {
    this.exec = this.exec.bind(this)
  }

  get locked () {
    return this.#locked
  }

  acquire () {
    if (!this.#locked) {
      this.#locked = true
      return Lock.#resolved
    }
    const { resolve, promise } = Promise.withResolvers()
    this.#awaiters.push(resolve)
    return promise
  }

  release () {
    const awaiter = this.#awaiters.shift()
    if (awaiter) return awaiter()
    this.#locked = false
  }

  async exec (fn) {
    try {
      await this.acquire()
      return await Promise.try(fn)
    } finally {
      this.release()
    }
  }
}
