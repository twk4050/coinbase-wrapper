export interface ListAccountsResponse {
    accounts: Account[];
    has_next: boolean;
    cursor: string;
    size: number;
}

export interface Account {
    uuid: string;
    name: string;
    currency: string;
    available_balance: Balance;
    default: boolean;
    active: boolean;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    type: string;
    ready: boolean;
    hold: Balance;
}

interface Balance {
    value: string;
    currency: string;
}

export interface GetAccountResponse {
    account: Account;
}
