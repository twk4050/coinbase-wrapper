import { AxiosRequestConfig } from 'axios';
import { IClientOptions } from 'src/types/client';
type GenericAPIResponse<T = any> = Promise<T>;
export default class BaseRestClient {
    static BASE_URL: string;
    static API_VERSION: string;
    static defaultConfig: AxiosRequestConfig;
    private clientOptions;
    private axiosInstance;
    constructor(_clientOptions: IClientOptions, _axiosConfig: AxiosRequestConfig);
    private generateHeaders;
    protected get(endpoint: string, params?: any): GenericAPIResponse;
    protected post(endpoint: string, params?: any): GenericAPIResponse;
    private _call;
    private parseException;
}
export {};
