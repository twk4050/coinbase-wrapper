export interface SendMoneyParams {
    to: string;
    amount: string;
    currency: string;
    to_financial_institution?: boolean;
    financial_institution_website?: string;
    destination_tag?: string;
}
export interface ListTransactionResponse {
    pagination: {
        ending_before: string | null;
        starting_after: string | null;
        previous_ending_before: string | null;
        next_starting_after: string | null;
        limit: number;
        order: string;
        previous_uri: string | null;
        next_uri: string;
    };
    data: Transaction[];
}
export interface GetTransactionResponse {
    data: Transaction;
}
export interface Transaction {
    id: string;
    type: string;
    status: string;
    amount: Amount;
    native_amount: Amount;
    description: string | null;
    created_at: string;
    updated_at: string;
    resource: string;
    resource_path: string;
}
export interface Amount {
    amount: string;
    currency: string;
}
export interface WithdrawCoinsResponse {
    data: WithdrawCoinTransaction;
}
interface WithdrawCoinTransaction {
    id: string;
    type: 'send';
    status: string;
    amount: Amount;
    native_amount: Amount;
    description: string | null;
    created_at: string;
    updated_at: string;
    resource: string;
    resource_path: string;
    instant_exchange: boolean;
    network: {
        status: string;
        status_description: string;
        hash?: string;
        transaction_url?: string;
        transaction_fee: Amount;
        transaction_amount: Amount;
        confirmations: number;
    };
    to: {
        resource: string;
        address: string;
        currency: string;
        address_info: {
            address: string;
        };
        address_url: string;
    };
    idem: string;
    details: {
        title: string;
        subtitle: string;
        header: string;
        health: string;
    };
    hide_native_amount: boolean;
}
export {};
