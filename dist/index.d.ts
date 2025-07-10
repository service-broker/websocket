import { ClientRequestArgs, IncomingMessage } from "http";
import * as rxjs from "rxjs";
import { type ClientOptions, CloseEvent, ErrorEvent, MessageEvent, type ServerOptions, WebSocket } from "ws";
export interface Connection {
    request: IncomingMessage | {
        connectUrl: string;
    };
    message$: rxjs.Observable<MessageEvent>;
    error$: rxjs.Observable<ErrorEvent>;
    close$: rxjs.Observable<CloseEvent>;
    send: WebSocket['send'];
    close: WebSocket['close'];
    terminate: WebSocket['terminate'];
    keepAlive(interval: number, pingTimeout: number): rxjs.Observable<number>;
}
export declare function makeServer(opts: ServerOptions): rxjs.Observable<{
    connection$: rxjs.Observable<Connection>;
    error$: rxjs.Observable<ErrorEvent>;
    close$: rxjs.Observable<CloseEvent>;
    close: (cb?: (err?: Error) => void) => void;
}>;
export declare function connect(address: string | URL, options?: ClientOptions | ClientRequestArgs): rxjs.Observable<Connection>;
