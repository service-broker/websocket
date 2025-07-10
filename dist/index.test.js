import { describe, expect, Expectation } from "@service-broker/test-utils";
import assert from "assert";
import http from "http";
import * as rxjs from "rxjs";
import { connect, makeServer } from "./index.js";
describe('websocket', ({ beforeEach, afterEach, test }) => {
    let e1, e2;
    beforeEach(async () => {
        [e1, e2] = await rxjs.firstValueFrom(rxjs.forkJoin([
            makeServer({ port: 2033 }).pipe(rxjs.exhaustMap(server => server.connection$.pipe(rxjs.take(1), rxjs.finalize(() => server.close())))),
            connect('ws://localhost:2033', { autoPong: false })
        ]));
        assert(e1.request instanceof http.IncomingMessage);
        expect(e2.request, { connectUrl: 'ws://localhost:2033/' });
    });
    afterEach(() => {
        e1.close();
        e2.close();
    });
    test('send-receive', async () => {
        for (let i = 0; i < 100; i++) {
            const randStr = String(Math.random());
            const data = Math.random() >= .5 ? randStr : Buffer.from(randStr);
            const [sender, receiver] = Math.random() >= .5 ? [e1, e2] : [e2, e1];
            sender.send(data);
            expect((await rxjs.firstValueFrom(receiver.message$)).data, data);
        }
    });
    test("close", async () => {
        e1.close();
        await Promise.all([
            rxjs.firstValueFrom(e1.close$),
            rxjs.firstValueFrom(e2.close$)
        ]);
    });
    test("terminate", async () => {
        e1.terminate();
        await Promise.all([
            rxjs.firstValueFrom(e1.close$),
            rxjs.firstValueFrom(e2.close$)
        ]);
    });
    test("keep-alive-success", async () => {
        expect(await rxjs.firstValueFrom(e2.keepAlive(250, 50).pipe(rxjs.take(3), rxjs.buffer(rxjs.NEVER))), [0, 1, 2]);
    });
    test("keep-alive-timeout", async () => {
        expect(await rxjs.firstValueFrom(e1.keepAlive(250, 50).pipe(rxjs.take(3), rxjs.buffer(rxjs.NEVER), rxjs.catchError(err => rxjs.of(err)))), new Expectation('instanceOf', 'TimeoutError', actual => {
            assert(actual instanceof rxjs.TimeoutError, '!isTimeoutError');
        }));
    });
});
//# sourceMappingURL=index.test.js.map