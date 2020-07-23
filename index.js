const TOS = require('time-ordered-set')

class Entry {
  constructor (pool, val) {
    this.pool = pool
    this.prev = null
    this.next = null
    this.value = val
    this.refs = 0
  }

  bump () {
    if (!this.refs) return
    this.pool.gcable.add(this)
    this.pool._gcMaybe()
  }

  increment () {
    this.refs++
    if (this.refs === 1) {
      this.pool.gcable.remove(this)
    }
    this.pool._gcMaybe()
  }

  decrement () {
    this.refs--
    if (this.refs === 0) {
      this.pool.gcable.add(this)
      this.pool._gcMaybe()
    }
    this.pool._gcMaybe()
  }
}

module.exports = class Pool {
  constructor ({ maxSize = Infinity, close } = {}) {
    this.maxSize = maxSize
    this.close = close
    this.gcable = new TOS()
    this.entries = new Map()
  }

  get size () {
    return this.entries.size
  }

  isFull () {
    return this.entries.size < this.maxSize
  }

  add (val, gc = true) {
    const existing = this.entries.get(val)
    if (existing) return existing
    const entry = new Entry(this, val)
    this.gcable.add(entry)
    this.entries.set(val, entry)
    if (gc) this._gcMaybe()
    return entry
  }

  gc () {
    const oldest = this.gcable.oldest
    if (!oldest) return null
    this.gcable.remove(oldest)
    this.entries.delete(oldest.value)
    if (this.close) this.close(oldest.value)
    return oldest.value
  }

  _gcMaybe () {
    if (this.entries.size <= this.maxSize && this.close) return
    this.gc()
  }

  increment (val) {
    this.add(val, false).increment()
  }

  decrement (val) {
    this.add(val, false).decrement()
  }

  bump (val) {
    this.add(val, false).bump()
  }
}
