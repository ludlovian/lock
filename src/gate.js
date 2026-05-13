export default class Gate {
  isOpen = true
  #prom = undefined

  open () {
    if (this.isOpen) return this
    this.#prom?.resolve()
    this.isOpen = true
    return this
  }

  close () {
    if (!this.isOpen) return this
    this.#prom = Promise.withResolvers()
    this.isOpen = false
    return this
  }

  untilOpen () {
    if (this.isOpen) return Promise.resolve()
    return this.#prom.promise
  }
}
