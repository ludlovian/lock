# Lock
Simple promise-based sequential locking & serial executor.


## Lock

### new Lock()
```
import Lock from '@ludlovian/lock'
const l = new Lock()
```

Creates a new lock object. There are no configurable options.
The lock is started in an _unlocked_ state.

### .acquire() => Promise

Returns a promise which resolves when the lock has been acquired.

If the lock is already _unlocked_ this happens immediately. Otherwise, callers
are placed in a FIFO queue.

In either case, the lock is now _locked_.

### .release() => void

Releases an acquired lock. If any other `acquire`rs are waiting, the first one
is given the lock. Otherwise, it is returned to an _unlocked_ state.

### .locked => Boolean

Tells you whether the lock is _locked_ or _unlocked_.

### .exec(fn: () => any) => Promise

Returns a promise of the function execution. Waits to `acquire` the lock, then
runs the function, and finally `release`s the lock. The promise will resolve
to the resolved value or rejection reason.

The `.exec` value is already bound to the lock object.
