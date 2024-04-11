export interface ProductBookParams {
    product_id: string;
    limit?: number;
}
export interface ProductBookResponse {
    pricebook: Pricebook;
}
export interface Pricebook {
    product_id: string;
    bids: Quote[];
    asks: Quote[];
    time: string;
}
export interface Quote {
    price: string;
    size: string;
}
export interface ListProductsParams {
    product_type: string;
}
export interface ListProductResponse {
    products: Product[];
    num_products: number;
}
export interface Product {
    product_id: string;
    price: string;
    price_percentage_change_24h: string;
    volume_24h: string;
    volume_percentage_change_24h: string;
    base_increment: string;
    quote_increment: string;
    quote_min_size: string;
    quote_max_size: string;
    base_min_size: string;
    base_max_size: string;
    base_name: string;
    quote_name: string;
    watched: boolean;
    is_disabled: boolean;
    new: boolean;
    status: string;
    cancel_only: boolean;
    limit_only: boolean;
    post_only: boolean;
    trading_disabled: boolean;
    auction_mode: boolean;
    product_type: string;
    quote_currency_id: string;
    base_currency_id: string;
    fcm_trading_session_details?: any;
    mid_market_price: string;
    alias: string;
    alias_to: any[];
    base_display_symbol: string;
    quote_display_symbol: string;
    view_only: boolean;
    price_increment: string;
    display_name: string;
    product_venue: string;
}
export interface CandleParams {
    start: string;
    end: string;
    granularity: Granularity;
}
export interface ProductCandleResponse {
    candles: Candle[];
}
export interface Candle {
    start: string;
    low: string;
    high: string;
    open: string;
    close: string;
    volume: string;
}
export type Granularity = 'ONE_MINUTE' | 'FIVE_MINUTE' | 'FIFTEEN_MINUTE' | 'THIRTY_MINUTE' | 'ONE_HOUR' | 'TWO_HOUR' | 'SIX_HOUR' | 'ONE_DAY';
export interface MarketTradesParams {
    limit: number;
    start?: string;
    end?: string;
}
export interface MarketTradesResponse {
    trades: Trade[];
    best_bid: string;
    best_ask: string;
}
export interface Trade {
    trade_id: string;
    product_id: string;
    price: string;
    size: string;
    time: string;
    side: string;
    bid: string;
    ask: string;
}
