# refpool

Pool of references that gc the least recently unref'ed ones when it reaches a max size

```
npm install refpool
```

## Usage

``` js
const Pool = require('refpool')

const p = new Pool({
  maxSize: 42,
  close (data) {
    console.log('should close', data)
  }
})

const someResource = ...

p.add(data) // add it to the pool
p.increment(data) // add it and increment the reference count
p.decrement(data) // decrement the ref count
p.bump(data) // indicate that you used a thing in the pool
```

When more than `maxSize` items are inserted the least recently used
resource with no references will be passed to close.

## License

MIT
