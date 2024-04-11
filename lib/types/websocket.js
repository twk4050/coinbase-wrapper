"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageEventType = exports.WebSocketResponseChannel = exports.WebSocketChannel = void 0;
// Channels to subscribe to
var WebSocketChannel;
(function (WebSocketChannel) {
    /** Subscribe to the candles channel to receive candles messages for specific products with updates every second. Candles are grouped into buckets (granularities) of five minutes. */
    WebSocketChannel["CANDLES"] = "candles";
    /** Real-time server pings to keep all connections open */
    WebSocketChannel["HEARTBEAT"] = "heartbeats";
    /** The easiest way to keep a snapshot of the order book is to use the level2 channel. It guarantees delivery of all updates, which reduce a lot of the overhead required when consuming the full channel. */
    WebSocketChannel["LEVEL2"] = "level2";
    /** The market_trades channel sends market trades for a specified product on a preset interval. */
    WebSocketChannel["MARKET_TRADES"] = "market_trades";
    /** The status channel will send all products and currencies on a preset interval. */
    WebSocketChannel["STATUS"] = "status";
    /** The ticker channel provides real-time price updates every time a match happens. It batches updates in case of cascading matches, greatly reducing bandwidth requirements. */
    WebSocketChannel["TICKER"] = "ticker";
    /** A special version of the ticker channel that only provides a ticker update about every 5 seconds. */
    WebSocketChannel["TICKER_BATCH"] = "ticker_batch";
    /** The user channel sends updates on all of a user's open orders, including all subsequent updates of those orders. */
    WebSocketChannel["USER"] = "user";
})(WebSocketChannel || (exports.WebSocketChannel = WebSocketChannel = {}));
var WebSocketResponseChannel;
(function (WebSocketResponseChannel) {
    WebSocketResponseChannel["CANDLES"] = "candles";
    WebSocketResponseChannel["HEARTBEAT"] = "heartbeats";
    WebSocketResponseChannel["LEVEL2"] = "l2_data";
    WebSocketResponseChannel["MARKET_TRADES"] = "market_trades";
    WebSocketResponseChannel["STATUS"] = "status";
    WebSocketResponseChannel["TICKER"] = "ticker";
    WebSocketResponseChannel["TICKER_BATCH"] = "ticker_batch";
    WebSocketResponseChannel["USER"] = "user";
    //
    WebSocketResponseChannel["SUBSCRIPTIONS"] = "subscriptions";
})(WebSocketResponseChannel || (exports.WebSocketResponseChannel = WebSocketResponseChannel = {}));
// Events
var MessageEventType;
(function (MessageEventType) {
    MessageEventType["SNAPSHOT"] = "snapshot";
    MessageEventType["UPDATE"] = "update";
})(MessageEventType || (exports.MessageEventType = MessageEventType = {}));
//# sourceMappingURL=websocket.js.map