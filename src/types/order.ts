// types n interface

// for useful Orders api, create, cancel, list, get
// https://docs.cloud.coinbase.com/advanced-trade-api/reference/retailbrokerageapi_postorder
export interface SubmitOrderParams {
    client_order_id?: string;
    product_id: string;
    side: 'BUY' | 'SELL';
    order_configuration: OrderConfiguration;
    self_trade_prevention_id?: string;
    leverage?: string;
    margin_type?: string;
    retail_portfolio_id?: string;
}

// TODO: more orderConfig at https://docs.cloud.coinbase.com/advanced-trade-api/reference/retailbrokerageapi_postorder
export type OrderConfiguration = MarketOrderConfiguration | LimitGTCOrderConfiguration;

export interface MarketOrderConfiguration {
    market_market_ioc: {
        quote_size: string;
        base_size: string;
    };
}

export interface LimitGTCOrderConfiguration {
    limit_limit_gtc: {
        base_size: string;
        limit_price: string;
        post_only: boolean;
    };
}

// FIXME: intellisense not working as intended?
export type SubmitOrderResponse = SubmitOrderSuccessResponse & SubmitOrderFailureResponse;

export interface SubmitOrderSuccessResponse {
    success: boolean;
    failure_reason: string;
    order_id: string;
    success_response: {
        order_id: string;
        product_id: string;
        side: string;
        client_order_id: string;
    };
    order_configuration: OrderConfiguration;
}

export interface SubmitOrderFailureResponse {
    success: boolean;
    failure_reason: string;
    order_id: string;
    error_response: {
        error: string;
        message: string;
        error_details: string;
        preview_failure_reason: string;
    };
    order_configuration: OrderConfiguration;
}

export interface CancelOrdersParams {
    order_ids: string[];
}

export interface CancelOrderResults {
    success: boolean;
    failure_reason: string;
    order_id: string;
}

export interface CancelOrderResponse {
    results: CancelOrderResults[];
}

export interface Order {
    order_id: string;
    product_id: string;
    user_id: string;
    order_configuration: OrderConfiguration;
    side: string;
    client_order_id: string;
    status: string;
    time_in_force: string;
    created_time: string;
    completion_percentage: string;
    filled_size: string;
    average_filled_price: string;
    fee: string;
    number_of_fills: string;
    filled_value: string;
    pending_cancel: boolean;
    size_in_quote: boolean;
    total_fees: string;
    size_inclusive_of_fees: boolean;
    total_value_after_fees: string;
    trigger_status: string;
    order_type: string;
    reject_reason: string;
    settled: boolean;
    product_type: string;
    reject_message: string;
    cancel_message: string;
    order_placement_source: string;
    outstanding_hold_amount: string;
    is_liquidation: boolean;
    last_fill_time: string | null; // TODO: check type
    edit_history: any[]; // TODO: check type
    leverage: string;
    margin_type: string;
}
export interface ListOrdersResponse {
    orders: Order[];
    sequence: string;
    has_next: boolean;
    cursor: string;
}

export interface GetOrderResponse {
    order: Order;
}
