/// <reference types="node" />
import { EventEmitter } from 'events';
import { WebSocketChannel, WebSocketResponse, SubscriptionEvent, CandlesEvent, HeartBeatsEvent, Level2Event, MarketTradesEvent, StatusEvent, TickerEvent, TickerBatchEvent, UserEvent } from './types/websocket';
export declare enum Event {
    OPEN = "OPEN",
    CLOSE = "CLOSE",
    ERROR = "ERROR",
    MESSAGE = "MESSAGE",
    SUBSCRIPTIONS = "subscriptions",// emits when user subscribe to channel
    MESSAGE_CANDLES = "MESSAGE_CANDLES",
    MESSAGE_HEARTBEAT = "MESSAGE_HEARTBEAT",
    MESSAGE_LEVEL2 = "MESSAGE_LEVEL2",
    MESSAGE_MARKET_TRADES = "MESSAGE_MARKET_TRADES",
    MESSAGE_STATUS = "MESSAGE_STATUS",
    MESSAGE_TICKER = "MESSAGE_TICKER",
    MESSAGE_TICKER_BATCH = "MESSAGE_TICKER_BATCH",
    MESSAGE_USER = "MESSAGE_USER"
}
export interface WebSocketClient {
    on(event: Event.CLOSE, listener: (event: CloseEvent) => void): this;
    on(event: Event.ERROR, listener: (event: ErrorEvent) => void): this;
    on(event: Event.OPEN, listener: (event: Event) => void): this;
    on(event: Event.MESSAGE_CANDLES, listener: (msg: WebSocketResponse<CandlesEvent>) => void): this;
    on(event: Event.MESSAGE_HEARTBEAT, listener: (msg: WebSocketResponse<HeartBeatsEvent>) => void): this;
    on(event: Event.MESSAGE_LEVEL2, listener: (msg: WebSocketResponse<Level2Event>) => void): this;
    on(event: Event.MESSAGE_MARKET_TRADES, listener: (msg: WebSocketResponse<MarketTradesEvent>) => void): this;
    on(event: Event.MESSAGE_STATUS, listener: (msg: WebSocketResponse<StatusEvent>) => void): this;
    on(event: Event.MESSAGE_TICKER, listener: (msg: WebSocketResponse<TickerEvent>) => void): this;
    on(event: Event.MESSAGE_TICKER_BATCH, listener: (msg: WebSocketResponse<TickerBatchEvent>) => void): this;
    on(event: Event.MESSAGE_USER, listener: (msg: WebSocketResponse<UserEvent>) => void): this;
    on(event: Event.SUBSCRIPTIONS, listener: (msg: WebSocketResponse<SubscriptionEvent>) => void): this;
}
export declare class WebSocketClient extends EventEmitter {
    baseURL: string;
    private key;
    private secret;
    private ws;
    constructor(key: string, secret: string);
    connect(): void;
    disconnect(): void;
    send(message: string): void;
    subscribe(channel: WebSocketChannel, product_ids: string[]): void;
    unsubscribe(channel: WebSocketChannel, product_ids: string[]): void;
    generateTopic(channel: WebSocketChannel, product_ids: string[], type: IType): {
        type: IType;
        product_ids: string[];
        channel: WebSocketChannel;
        api_key: string;
        timestamp: string;
        signature: string;
    };
}
type IType = 'subscribe' | 'unsubscribe';
export {};
