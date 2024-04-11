export interface SendMoneyParams {
    // type: 'send'; // declare in func
    to: string;
    amount: string;
    currency: string;
    to_financial_institution?: boolean;
    financial_institution_website?: string;
    destination_tag?: string; // aka 'memo'
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
    // TODO: advance_trade_fill / buy / sell / send / trade
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
    status: string; // 'pending' n many more statuses 'COMPLETED' ...
    amount: Amount;
    native_amount: Amount;
    description: string | null;
    created_at: string;
    updated_at: string;
    resource: string;
    resource_path: string; // '/v2/accounts/94a46f1d-328b-55cd-885e-0c8e54c8be73/transactions/7b87a20c-fe0c-5092-bdc8-a5b8afbcda68';
    instant_exchange: boolean;
    network: {
        status: string;
        status_description: string; //'Pending (less than a minute)';

        // only when coinbase successfully sent out coins on blockchain
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
