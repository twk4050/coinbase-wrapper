import BaseRestClient from './util/BaseRestClient';

import {
    SubmitOrderParams,
    OrderConfiguration,
    SubmitOrderResponse,
    CancelOrdersParams,
    SubmitOrderFailureResponse,
    CancelOrderResponse,
    ListOrdersResponse,
    GetOrderResponse,
    LimitGTCOrderConfiguration,
} from './types/order';
import { GetAccountResponse, ListAccountsResponse } from './types/accounts';

import {
    SendMoneyParams,
    ListTransactionResponse,
    GetTransactionResponse,
    WithdrawCoinsResponse,
} from './types/transaction';

import {
    CandleParams,
    Granularity,
    ListProductResponse,
    ListProductsParams,
    MarketTradesParams,
    MarketTradesResponse,
    Product,
    ProductBookParams,
    ProductBookResponse,
    ProductCandleResponse,
} from './types/products';

import { currentEpoch, granularityToSeconds } from './util';
import fs from 'fs';
import crypto from 'crypto';

import { AxiosRequestConfig } from 'axios';
import { IClientOptions } from './types/client';
import { UnixTimeResponse } from './types/public';

export class MainClient extends BaseRestClient {
    public assetUuidMappings: any;

    constructor(
        _clientOptions: IClientOptions,
        _axiosConfig: AxiosRequestConfig,
        assetUuidMappings: any = {}
    ) {
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
    public listAccounts(): Promise<ListAccountsResponse> {
        return this.get('/api/v3/brokerage/accounts');
    }

    public getAccount(account_uuid: string): Promise<GetAccountResponse> {
        return this.get(`/api/v3/brokerage/accounts/${account_uuid}`);
    }

    // Products
    public getProductBook(params: ProductBookParams): Promise<ProductBookResponse> {
        return this.get(`/api/v3/brokerage/product_book`, params);
    }

    private listProducts(params: ListProductsParams): Promise<ListProductResponse> {
        // TODO: include new product type futures
        return this.get(`/api/v3/brokerage/products`, params);
    }

    public listSpotProducts() {
        const params: ListProductsParams = {
            product_type: 'SPOT',
        };
        return this.listProducts(params);
    }

    public getProduct(product_id: string): Promise<Product> {
        return this.get(`/api/v3/brokerage/products/${product_id}`);
    }

    public getProductCandles(
        product_id: string,
        params: CandleParams
    ): Promise<ProductCandleResponse> {
        return this.get(`/api/v3/brokerage/products/${product_id}/candles`, params);
    }

    public getLatest300ProductCandles(product_id: string, granularity: Granularity) {
        const granularitySeconds = granularityToSeconds(granularity);
        const candleDelta = 300 * granularitySeconds;

        const now = currentEpoch();
        const start = (Number(now) - candleDelta).toString();

        const params: CandleParams = {
            start: start,
            end: now,
            granularity: granularity,
        };

        return this.getProductCandles(product_id, params);
    }

    public getMarketTrades(
        product_id: string,
        params: MarketTradesParams
    ): Promise<MarketTradesResponse> {
        return this.get(`/api/v3/brokerage/products/${product_id}/ticker`, params);
    }

    // Orders
    public submitNewOrder(params: SubmitOrderParams): Promise<SubmitOrderResponse> {
        if (!('client_order_id' in params)) {
            params['client_order_id'] = crypto.randomUUID();
        }

        return this.post('/api/v3/brokerage/orders', params);
    }
    public cancelOrders(params: CancelOrdersParams): Promise<CancelOrderResponse> {
        return this.post('/api/v3/brokerage/orders/batch_cancel', params);
    }
    public getOpenOrders(): Promise<ListOrdersResponse> {
        const params = {
            order_status: 'OPEN',
        };

        return this.get('/api/v3/brokerage/orders/historical/batch', params);
    }
    public getOrder(orderId: string): Promise<GetOrderResponse> {
        return this.get(`/api/v3/brokerage/orders/historical/${orderId}`);
    }

    // Common
    public getUnixTime(): Promise<UnixTimeResponse> {
        return this.get('/api/v3/brokerage/time');
    }

    /* 
        SIWC APIs
    */

    // 'ETH' asset -> accountId 'a7e...'
    public listAddresses(asset: string) {
        // TODO: search up .HasOwnProperty vs 'in'
        if (!(asset in this.assetUuidMappings)) {
            throw 'asset not in uuid mapping';
        }
        const accountId = this.assetUuidMappings[asset];

        return this.get(`/v2/accounts/${accountId}/addresses`);
    }

    // Transactions tab
    // TODO: handle errors in WithdrawCoinsResponse type
    public withdrawCoins(asset: string, params: SendMoneyParams): Promise<WithdrawCoinsResponse> {
        // Transactions.sendMoney on coinbase
        if (!(asset in this.assetUuidMappings)) {
            throw 'asset not in uuid mapping';
        }
        const accountId = this.assetUuidMappings[asset];

        params['type'] = 'send';

        return this.post(`/v2/accounts/${accountId}/transactions`, params);
    }

    public listTransactions(asset: string): Promise<ListTransactionResponse> {
        if (!(asset in this.assetUuidMappings)) {
            throw 'asset not in uuid mapping';
        }
        const accountId = this.assetUuidMappings[asset];

        return this.get(`/v2/accounts/${accountId}/transactions`);
    }

    // impractical api
    public getTransaction(asset: string, transactionId: string): Promise<GetTransactionResponse> {
        if (!(asset in this.assetUuidMappings)) {
            throw 'asset not in uuid mapping';
        }
        const accountId = this.assetUuidMappings[asset];

        return this.get(`/v2/accounts/${accountId}/transactions/${transactionId}`);
    }

    // custom functions
    // TODO: cater to new perp uuid which is not default account
    public async initAssetUuidMapping() {
        const accounts = (await this.listAccounts())['accounts']; //

        for (let account of accounts) {
            let uuid = account['uuid']; // "a123-1234-...."
            let currency = account['currency']; // "ETH"
            let defaultAccount = account['default']; // assets like USDC can have multiple accounts

            if (!defaultAccount) {
                continue;
            }

            this.assetUuidMappings[currency] = uuid;
        }
    }
    public async getAvailBalance(asset?: string) {
        /* 
        1. .initAssetUuidMapping = { usdc: '8ee8' ...}
        2. .listAccounts => returns all accounts in coinbase
        3. 
        */
        await this.initAssetUuidMapping();
        const accounts = await this.listAccounts();

        // if getAvailBalance('usdc') -> returns 100
        if (asset && asset in this.assetUuidMappings) {
            const assetUuid = this.assetUuidMappings[asset];
            const assetAccount = accounts.accounts.find((a) => a.uuid === assetUuid);
            return assetAccount?.available_balance.value;
        }

        // if getAvailBalance() -> return { usdc: 100, btc: 1, eth: 10, ...}
        const allAssetBalance = accounts.accounts.reduce((acc: any, cur) => {
            const balanceObj = cur.available_balance;
            const balanceVal = balanceObj.value;
            const balanceCur = balanceObj.currency;

            if (+balanceVal) {
                acc[balanceCur] = balanceVal;
            }

            return acc;
        }, {});

        return allAssetBalance;
    }

    public getResourcePath(resourcePath: string) {
        return this.get(resourcePath);
    }
}
