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
    return new Promise(resolve => this.#awaiters.push(resolve))
  }

  release () {
    const awaiter = this.#awaiters.shift()
    if (awaiter) return awaiter()
    this.#locked = false
  }

  async exec (fn) {
    try {
      await this.acquire()
      return await Promise.resolve(fn())
    } finally {
      this.release()
    }
  }
}
