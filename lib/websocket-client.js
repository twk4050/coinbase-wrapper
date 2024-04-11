"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebSocketClient = exports.Event = void 0;
// import WebSocket from 'ws'; ??
const isomorphic_ws_1 = __importDefault(require("isomorphic-ws"));
const reconnecting_websocket_1 = __importDefault(require("reconnecting-websocket"));
const events_1 = require("events");
const util_1 = require("./util");
const websocket_1 = require("./types/websocket");
var Event;
(function (Event) {
    Event["OPEN"] = "OPEN";
    Event["CLOSE"] = "CLOSE";
    Event["ERROR"] = "ERROR";
    Event["MESSAGE"] = "MESSAGE";
    Event["SUBSCRIPTIONS"] = "subscriptions";
    //
    Event["MESSAGE_CANDLES"] = "MESSAGE_CANDLES";
    Event["MESSAGE_HEARTBEAT"] = "MESSAGE_HEARTBEAT";
    Event["MESSAGE_LEVEL2"] = "MESSAGE_LEVEL2";
    Event["MESSAGE_MARKET_TRADES"] = "MESSAGE_MARKET_TRADES";
    Event["MESSAGE_STATUS"] = "MESSAGE_STATUS";
    Event["MESSAGE_TICKER"] = "MESSAGE_TICKER";
    Event["MESSAGE_TICKER_BATCH"] = "MESSAGE_TICKER_BATCH";
    Event["MESSAGE_USER"] = "MESSAGE_USER";
})(Event || (exports.Event = Event = {}));
class WebSocketClient extends events_1.EventEmitter {
    constructor(
    //
    key, secret) {
        if (!key || !secret) {
            throw Error('require API Key and Secret to continue');
        }
        super();
        this.baseURL = 'wss://advanced-trade-ws.coinbase.com';
        this.key = '';
        this.secret = '';
        this.key = key;
        this.secret = secret;
    }
    connect() {
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
        const rcOptions = {
            WebSocket: isomorphic_ws_1.default,
            connectionTimeout: 2000,
            debug: false,
            maxReconnectionDelay: 4000,
        };
        this.ws = new reconnecting_websocket_1.default(this.baseURL, [], rcOptions);
        this.ws.onopen = () => {
            this.emit(Event.OPEN);
        };
        this.ws.onclose = (event) => {
            this.emit(Event.CLOSE, event);
        };
        this.ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            // { type: 'error', message: 'authentication failure' }
            if ('type' in data && data['type'] == 'error') {
                // TODO: emit('ERROR') ?
            }
            const channel = data.channel;
            switch (channel) {
                // case 'subscriptions'
                case websocket_1.WebSocketResponseChannel.SUBSCRIPTIONS:
                    this.emit(Event.SUBSCRIPTIONS, data);
                    break;
                case websocket_1.WebSocketResponseChannel.CANDLES:
                    this.emit(Event.MESSAGE_CANDLES, data);
                    break;
                case websocket_1.WebSocketResponseChannel.HEARTBEAT:
                    this.emit(Event.MESSAGE_HEARTBEAT, data);
                    break;
                case websocket_1.WebSocketResponseChannel.LEVEL2:
                    this.emit(Event.MESSAGE_LEVEL2, data);
                    break;
                case websocket_1.WebSocketResponseChannel.MARKET_TRADES:
                    this.emit(Event.MESSAGE_MARKET_TRADES, data);
                    break;
                case websocket_1.WebSocketResponseChannel.STATUS:
                    this.emit(Event.MESSAGE_STATUS, data);
                    break;
                case websocket_1.WebSocketResponseChannel.TICKER:
                    this.emit(Event.MESSAGE_TICKER, data);
                    break;
                case websocket_1.WebSocketResponseChannel.TICKER_BATCH:
                    this.emit(Event.MESSAGE_TICKER_BATCH, data);
                    break;
                case websocket_1.WebSocketResponseChannel.USER:
                    this.emit(Event.MESSAGE_USER, data);
                    break;
                default:
                    console.log('not in any channel, printing channel:', channel);
                    break;
            }
        };
    }
    disconnect() {
        this.ws.close();
    }
    send(message) {
        this.ws.send(message);
    }
    subscribe(channel, product_ids) {
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
    unsubscribe(channel, product_ids) {
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
    generateTopic(channel, product_ids, type) {
        const ts = (0, util_1.currentEpoch)();
        const message = ts + channel + product_ids.join(',');
        const signature = (0, util_1.generateSignature)(this.secret, message);
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
exports.WebSocketClient = WebSocketClient;
//# sourceMappingURL=websocket-client.js.map