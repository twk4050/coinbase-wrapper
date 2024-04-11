"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MainClient = void 0;
const BaseRestClient_1 = __importDefault(require("./util/BaseRestClient"));
const util_1 = require("./util");
const crypto_1 = __importDefault(require("crypto"));
class MainClient extends BaseRestClient_1.default {
    constructor(_clientOptions, _axiosConfig, assetUuidMappings = {}) {
        if (!_clientOptions.apiKey || !_clientOptions.apiSecret) {
            throw Error('require API Key and Secret to continue');
        }
        super(_clientOptions, _axiosConfig);
        this.assetUuidMappings = assetUuidMappings; // {"ETH": "a1234-555-..."}
    }
    /*
        Advance Trade APIs
        https://docs.cloud.coinbase.com/advanced-trade-api/reference/retailbrokerageapi_getaccounts
    */
    // Accounts
    listAccounts() {
        return this.get('/api/v3/brokerage/accounts');
    }
    getAccount(account_uuid) {
        return this.get(`/api/v3/brokerage/accounts/${account_uuid}`);
    }
    // Products
    getProductBook(params) {
        return this.get(`/api/v3/brokerage/product_book`, params);
    }
    listProducts(params) {
        // TODO: include new product type futures
        return this.get(`/api/v3/brokerage/products`, params);
    }
    listSpotProducts() {
        const params = {
            product_type: 'SPOT',
        };
        return this.listProducts(params);
    }
    getProduct(product_id) {
        return this.get(`/api/v3/brokerage/products/${product_id}`);
    }
    getProductCandles(product_id, params) {
        return this.get(`/api/v3/brokerage/products/${product_id}/candles`, params);
    }
    getLatest300ProductCandles(product_id, granularity) {
        const granularitySeconds = (0, util_1.granularityToSeconds)(granularity);
        const candleDelta = 300 * granularitySeconds;
        const now = (0, util_1.currentEpoch)();
        const start = (Number(now) - candleDelta).toString();
        const params = {
            start: start,
            end: now,
            granularity: granularity,
        };
        return this.getProductCandles(product_id, params);
    }
    getMarketTrades(product_id, params) {
        return this.get(`/api/v3/brokerage/products/${product_id}/ticker`, params);
    }
    // Orders
    submitNewOrder(params) {
        if (!('client_order_id' in params)) {
            params['client_order_id'] = crypto_1.default.randomUUID();
        }
        return this.post('/api/v3/brokerage/orders', params);
    }
    cancelOrders(params) {
        return this.post('/api/v3/brokerage/orders/batch_cancel', params);
    }
    getOpenOrders() {
        const params = {
            order_status: 'OPEN',
        };
        return this.get('/api/v3/brokerage/orders/historical/batch', params);
    }
    getOrder(orderId) {
        return this.get(`/api/v3/brokerage/orders/historical/${orderId}`);
    }
    // Common
    getUnixTime() {
        return this.get('/api/v3/brokerage/time');
    }
    /*
        SIWC APIs
    */
    // 'ETH' asset -> accountId 'a7e...'
    listAddresses(asset) {
        // TODO: search up .HasOwnProperty vs 'in'
        if (!(asset in this.assetUuidMappings)) {
            throw 'asset not in uuid mapping';
        }
        const accountId = this.assetUuidMappings[asset];
        return this.get(`/v2/accounts/${accountId}/addresses`);
    }
    // Transactions tab
    // TODO: handle errors in WithdrawCoinsResponse type
    withdrawCoins(asset, params) {
        // Transactions.sendMoney on coinbase
        if (!(asset in this.assetUuidMappings)) {
            throw 'asset not in uuid mapping';
        }
        const accountId = this.assetUuidMappings[asset];
        params['type'] = 'send';
        return this.post(`/v2/accounts/${accountId}/transactions`, params);
    }
    listTransactions(asset) {
        if (!(asset in this.assetUuidMappings)) {
            throw 'asset not in uuid mapping';
        }
        const accountId = this.assetUuidMappings[asset];
        return this.get(`/v2/accounts/${accountId}/transactions`);
    }
    // impractical api
    getTransaction(asset, transactionId) {
        if (!(asset in this.assetUuidMappings)) {
            throw 'asset not in uuid mapping';
        }
        const accountId = this.assetUuidMappings[asset];
        return this.get(`/v2/accounts/${accountId}/transactions/${transactionId}`);
    }
    // custom functions
    // TODO: cater to new perp uuid which is not default account
    initAssetUuidMapping() {
        return __awaiter(this, void 0, void 0, function* () {
            const accounts = (yield this.listAccounts())['accounts']; //
            for (let account of accounts) {
                let uuid = account['uuid']; // "a123-1234-...."
                let currency = account['currency']; // "ETH"
                let defaultAccount = account['default']; // assets like USDC can have multiple accounts
                if (!defaultAccount) {
                    continue;
                }
                this.assetUuidMappings[currency] = uuid;
            }
        });
    }
    getAvailBalance(asset) {
        return __awaiter(this, void 0, void 0, function* () {
            /*
            1. .initAssetUuidMapping = { usdc: '8ee8' ...}
            2. .listAccounts => returns all accounts in coinbase
            3.
            */
            yield this.initAssetUuidMapping();
            const accounts = yield this.listAccounts();
            // if getAvailBalance('usdc') -> returns 100
            if (asset && asset in this.assetUuidMappings) {
                const assetUuid = this.assetUuidMappings[asset];
                const assetAccount = accounts.accounts.find((a) => a.uuid === assetUuid);
                return assetAccount === null || assetAccount === void 0 ? void 0 : assetAccount.available_balance.value;
            }
            // if getAvailBalance() -> return { usdc: 100, btc: 1, eth: 10, ...}
            const allAssetBalance = accounts.accounts.reduce((acc, cur) => {
                const balanceObj = cur.available_balance;
                const balanceVal = balanceObj.value;
                const balanceCur = balanceObj.currency;
                if (+balanceVal) {
                    acc[balanceCur] = balanceVal;
                }
                return acc;
            }, {});
            return allAssetBalance;
        });
    }
    getResourcePath(resourcePath) {
        return this.get(resourcePath);
    }
}
exports.MainClient = MainClient;
//# sourceMappingURL=main-client.js.map