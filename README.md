# websocket
A WebSocket connection wrapper that exposes events as RxJS observables, allowing for idiomatic management of connection lifecycle.

## Usage (server)

```typescript
import { makeServer, Connection } from '@service-broker/websocket'

makeServer({ port: 8080 }).pipe(
  rxjs.exhaustMap(server =>
    rxjs.merge(
      server.connection$.pipe(
        rxjs.mergeMap(handleConnection)
      ),
      server.error$.pipe(
        rxjs.tap(event => console.error(event.error))
      )
    ).pipe(
      rxjs.finalize(() => server.close())
    )
  ),
  rxjs.takeUntil(shutdown$)
).subscribe()

function handleConnection(con: Connection) {
  return rxjs.merge(
    con.message$.pipe(
      rxjs.tap(event => handleMessage(event.data))
    ),
    con.error$.pipe(
      rxjs.tap(event => console.error(event.error))
    ),
    con.keepAlive(interval, pingTimeout).pipe(
      rxjs.catchError(err => {
        console.error('Ping timed out')
        con.terminate()
        return rxjs.EMPTY
      })
    )
  ).pipe(
    rxjs.takeUntil(con.close$),
    rxjs.finalize(() => con.close())
  )
}
```

## Usage (client)

```typescript
import { connect } from '@service-broker/websocket'

connect(wsUrl).pipe(
  rxjs.retry(),
  rxjs.exhaustMap(handleConnection),
  rxjs.repeat(),
  rxjs.takeUntil(shutdown$)
).subscribe()
```
