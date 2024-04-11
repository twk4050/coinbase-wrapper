export declare enum WebSocketChannel {
    /** Subscribe to the candles channel to receive candles messages for specific products with updates every second. Candles are grouped into buckets (granularities) of five minutes. */
    CANDLES = "candles",
    /** Real-time server pings to keep all connections open */
    HEARTBEAT = "heartbeats",
    /** The easiest way to keep a snapshot of the order book is to use the level2 channel. It guarantees delivery of all updates, which reduce a lot of the overhead required when consuming the full channel. */
    LEVEL2 = "level2",
    /** The market_trades channel sends market trades for a specified product on a preset interval. */
    MARKET_TRADES = "market_trades",
    /** The status channel will send all products and currencies on a preset interval. */
    STATUS = "status",
    /** The ticker channel provides real-time price updates every time a match happens. It batches updates in case of cascading matches, greatly reducing bandwidth requirements. */
    TICKER = "ticker",
    /** A special version of the ticker channel that only provides a ticker update about every 5 seconds. */
    TICKER_BATCH = "ticker_batch",
    /** The user channel sends updates on all of a user's open orders, including all subsequent updates of those orders. */
    USER = "user"
}
export interface WebSocketResponse<Event> {
    channel: WebSocketResponseChannel;
    client_id: string;
    timestamp: string;
    sequence_num: number;
    events: Event[];
}
export declare enum WebSocketResponseChannel {
    CANDLES = "candles",
    HEARTBEAT = "heartbeats",
    LEVEL2 = "l2_data",
    MARKET_TRADES = "market_trades",
    STATUS = "status",
    TICKER = "ticker",
    TICKER_BATCH = "ticker_batch",
    USER = "user",
    SUBSCRIPTIONS = "subscriptions"
}
export declare enum MessageEventType {
    SNAPSHOT = "snapshot",
    UPDATE = "update"
}
export interface SubscriptionEvent {
    subscriptions: Record<WebSocketChannel, string[]>;
}
export interface HeartBeatsEvent {
    current_time: string;
    heartbeat_counter: string;
}
export interface CandlesEvent {
    type: MessageEventType;
    candles: Candles[];
}
export interface MarketTradesEvent {
    type: MessageEventType;
    trades: Trade[];
}
export interface StatusEvent {
    type: MessageEventType;
    products: Product[];
}
export interface TickerEvent {
    type: MessageEventType;
    tickers: Ticker[];
}
export interface TickerBatchEvent extends TickerEvent {
}
export interface Level2Event {
    type: MessageEventType;
    product_id: string;
    updates: Level2Update[];
}
export interface UserEvent {
    type: MessageEventType;
    orders: UserOrder[];
}
interface UserOrder {
    order_id: string;
    client_order_id: string;
    cumulative_quantity: string;
    leaves_quantity: string;
    avg_price: string;
    total_fees: string;
    status: string;
    product_id: string;
    creation_time: string;
    order_side: string;
    order_type: string;
}
interface Level2Update {
    side: string;
    event_time: string;
    price_level: string;
    new_quantity: string;
}
interface Ticker {
    type: string;
    product_id: string;
    price: string;
    volume_24_h: string;
    low_24_h: string;
    high_24_h: string;
    low_52_w: string;
    high_52_w: string;
    price_percent_chg_24_h: string;
}
interface Product {
    product_type: string;
    id: string;
    base_currency: string;
    quote_currency: string;
    base_increment: string;
    quote_increment: string;
    display_name: string;
    status: string;
    status_message: string;
    min_market_funds: string;
}
interface Candles {
    start: string;
    high: string;
    low: string;
    open: string;
    close: string;
    volume: 'string';
    product_id: string;
}
interface Trade {
    trade_id: string;
    product_id: string;
    price: string;
    size: string;
    side: string;
    time: string;
}
export {};
