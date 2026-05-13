export default class Gate {
  isOpen = true
  #prom = undefined

  open () {
    if (this.isOpen) return
    this.#prom?.resolve()
    this.isOpen = true
  }

  close () {
    if (!this.isOpen) return
    this.#prom = Promise.withResolvers()
    this.isOpen = false
  }

  untilOpen () {
    if (this.isOpen) return Promise.resolve()
    return this.#prom.promise
  }
}
