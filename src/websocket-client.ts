// import WebSocket from 'ws'; ??
import WebSocket from 'isomorphic-ws';
import ReconnectingWebSocket, { Options } from 'reconnecting-websocket';
import { EventEmitter } from 'events';

import { currentEpoch, generateSignature } from './util';

import {
    WebSocketChannel,
    WebSocketResponseChannel,
    WebSocketResponse,
    SubscriptionEvent,
    CandlesEvent,
    HeartBeatsEvent,
    Level2Event,
    MarketTradesEvent,
    StatusEvent,
    TickerEvent,
    TickerBatchEvent,
    UserEvent,
} from './types/websocket';

export enum Event {
    OPEN = 'OPEN',
    CLOSE = 'CLOSE',
    ERROR = 'ERROR',
    MESSAGE = 'MESSAGE',

    SUBSCRIPTIONS = 'subscriptions', // emits when user subscribe to channel
    //
    MESSAGE_CANDLES = 'MESSAGE_CANDLES',
    MESSAGE_HEARTBEAT = 'MESSAGE_HEARTBEAT',
    MESSAGE_LEVEL2 = 'MESSAGE_LEVEL2',
    MESSAGE_MARKET_TRADES = 'MESSAGE_MARKET_TRADES',
    MESSAGE_STATUS = 'MESSAGE_STATUS',
    MESSAGE_TICKER = 'MESSAGE_TICKER',
    MESSAGE_TICKER_BATCH = 'MESSAGE_TICKER_BATCH',
    MESSAGE_USER = 'MESSAGE_USER',
}

export interface WebSocketClient {
    on(event: Event.CLOSE, listener: (event: CloseEvent) => void): this;
    on(event: Event.ERROR, listener: (event: ErrorEvent) => void): this;
    on(event: Event.OPEN, listener: (event: Event) => void): this;

    // TODO: fix naming?
    on(
        event: Event.MESSAGE_CANDLES,
        listener: (msg: WebSocketResponse<CandlesEvent>) => void
    ): this;

    on(
        event: Event.MESSAGE_HEARTBEAT,
        listener: (msg: WebSocketResponse<HeartBeatsEvent>) => void
    ): this;

    on(event: Event.MESSAGE_LEVEL2, listener: (msg: WebSocketResponse<Level2Event>) => void): this;

    on(
        event: Event.MESSAGE_MARKET_TRADES,
        listener: (msg: WebSocketResponse<MarketTradesEvent>) => void
    ): this;

    on(event: Event.MESSAGE_STATUS, listener: (msg: WebSocketResponse<StatusEvent>) => void): this;

    on(event: Event.MESSAGE_TICKER, listener: (msg: WebSocketResponse<TickerEvent>) => void): this;

    on(
        event: Event.MESSAGE_TICKER_BATCH,
        listener: (msg: WebSocketResponse<TickerBatchEvent>) => void
    ): this;

    on(event: Event.MESSAGE_USER, listener: (msg: WebSocketResponse<UserEvent>) => void): this;
    on(
        event: Event.SUBSCRIPTIONS,
        listener: (msg: WebSocketResponse<SubscriptionEvent>) => void
    ): this;
}

export class WebSocketClient extends EventEmitter {
    baseURL = 'wss://advanced-trade-ws.coinbase.com';
    private key = '';
    private secret = '';
    private ws: ReconnectingWebSocket;

    constructor(
        //
        key: string,
        secret: string
    ) {
        if (!key || !secret) {
            throw Error('require API Key and Secret to continue');
        }
        super();

        this.key = key;
        this.secret = secret;
    }

    public connect() {
        /*
            TODO: ws required functionalities
            - .onopen .onclose .onmessage .onerror
            - .ping .pong / heartbeat
            - reconnects if connection closed
        */

        if (this.ws) {
            throw Error('Websocket Connection established already.');
        }

        // https://github.com/joewalnes/reconnecting-websocket
        const rcOptions: Options = {
            WebSocket: WebSocket,
            connectionTimeout: 2000,
            debug: false,
            maxReconnectionDelay: 4000,
        };
        this.ws = new ReconnectingWebSocket(this.baseURL, [], rcOptions);

        this.ws.onopen = (): void => {
            this.emit(Event.OPEN);
        };

        this.ws.onclose = (event: CloseEvent): void => {
            this.emit(Event.CLOSE, event);
        };

        this.ws.onmessage = (event: MessageEvent): void => {
            const data = JSON.parse(event.data);

            // { type: 'error', message: 'authentication failure' }
            if ('type' in data && data['type'] == 'error') {
                // TODO: emit('ERROR') ?
            }

            const channel = data.channel;
            switch (channel) {
                // case 'subscriptions'
                case WebSocketResponseChannel.SUBSCRIPTIONS:
                    this.emit(Event.SUBSCRIPTIONS, data);
                    break;

                case WebSocketResponseChannel.CANDLES:
                    this.emit(Event.MESSAGE_CANDLES, data);
                    break;

                case WebSocketResponseChannel.HEARTBEAT:
                    this.emit(Event.MESSAGE_HEARTBEAT, data);
                    break;

                case WebSocketResponseChannel.LEVEL2:
                    this.emit(Event.MESSAGE_LEVEL2, data);
                    break;
                case WebSocketResponseChannel.MARKET_TRADES:
                    this.emit(Event.MESSAGE_MARKET_TRADES, data);
                    break;
                case WebSocketResponseChannel.STATUS:
                    this.emit(Event.MESSAGE_STATUS, data);
                    break;
                case WebSocketResponseChannel.TICKER:
                    this.emit(Event.MESSAGE_TICKER, data);
                    break;

                case WebSocketResponseChannel.TICKER_BATCH:
                    this.emit(Event.MESSAGE_TICKER_BATCH, data);
                    break;
                case WebSocketResponseChannel.USER:
                    this.emit(Event.MESSAGE_USER, data);
                    break;
                default:
                    console.log('not in any channel, printing channel:', channel);
                    break;
            }
        };
    }

    public disconnect() {
        this.ws.close();
    }

    public send(message: string) {
        this.ws.send(message);
    }

    public subscribe(channel: WebSocketChannel, product_ids: string[]) {
        // const ts = currentEpoch();
        // const message = ts + channel + product_ids.join(',');
        // const signature = generateSignature(this.secret, message);

        // const data = {
        //     type: 'subscribe',
        //     product_ids: product_ids,
        //     channel: channel,
        //     api_key: this.key,
        //     timestamp: ts,
        //     signature: signature,
        // };

        // const payload = JSON.stringify(data);
        // this.send(payload);

        const topic = this.generateTopic(channel, product_ids, 'subscribe');
        this.send(JSON.stringify(topic));
    }
    public unsubscribe(channel: WebSocketChannel, product_ids: string[]) {
        // const ts = currentEpoch();
        // const message = ts + channel + product_ids.join(',');
        // const signature = generateSignature(this.secret, message);

        // const data = {
        //     type: 'unsubscribe',
        //     product_ids: product_ids,
        //     channel: channel,
        //     api_key: this.key,
        //     timestamp: ts,
        //     signature: signature,
        // };

        // const payload = JSON.stringify(data);
        // this.send(payload);

        const topic = this.generateTopic(channel, product_ids, 'unsubscribe');
        this.send(JSON.stringify(topic));
    }

    // generate payload
    public generateTopic(channel: WebSocketChannel, product_ids: string[], type: IType) {
        const ts = currentEpoch();
        const message = ts + channel + product_ids.join(',');
        const signature = generateSignature(this.secret, message);

        const topic = {
            type: type,
            product_ids: product_ids,
            channel: channel,
            api_key: this.key,
            timestamp: ts,
            signature: signature,
        };

        return topic;
    }
}

type IType = 'subscribe' | 'unsubscribe';
