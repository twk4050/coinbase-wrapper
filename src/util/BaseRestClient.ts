import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, Method } from 'axios';
import { currentEpoch, generateSignature } from './common';
import { IClientOptions } from 'src/types/client';
import http from 'node:http';
import https from 'node:https';

type GenericAPIResponse<T = any> = Promise<T>;

export default class BaseRestClient {
    public static BASE_URL = 'https://api.coinbase.com';
    public static API_VERSION = '2023-12-21';

    public static defaultConfig: AxiosRequestConfig = {
        baseURL: BaseRestClient.BASE_URL,
        timeout: 5 * 1000, // 5 seconds for response time out
        responseType: 'json', // default json
        // signal: // TODO: next time for connection timeout
    };

    private clientOptions: IClientOptions;
    private axiosInstance: AxiosInstance;

    constructor(_clientOptions: IClientOptions, _axiosConfig: AxiosRequestConfig) {
        const config: AxiosRequestConfig = {
            ...BaseRestClient.defaultConfig,
            ..._axiosConfig,
        };

        if (_clientOptions.keepAlive) {
            config.httpAgent = new http.Agent({ keepAlive: true });
            config.httpsAgent = new https.Agent({ keepAlive: true });
        }

        this.clientOptions = _clientOptions;
        this.axiosInstance = axios.create(config);

        if (_clientOptions.timeRequest) {
            this.axiosInstance.interceptors.response.use(
                (response) => {
                    console.timeEnd(response.config.url);
                    return response;
                },
                (error) => {
                    console.timeEnd(error.response.config.url);
                    return Promise.reject(error);
                }
            );
            this.axiosInstance.interceptors.request.use(
                function (config) {
                    // console.log(' ----- start interceptor request -----');
                    // console.log('req headers:', config.headers);
                    // console.log(
                    //     `method: ${config.method?.toUpperCase()} ${config.baseURL} ${config.url}`
                    // );
                    // console.log('Query params:', config.params);
                    // console.log('payload', config.data);
                    // console.log(' ----- end interceptor request -----');

                    console.time(config.url);
                    return config;
                },
                function (error) {
                    return Promise.reject(error);
                }
            );
        }
    }

    private generateHeaders(ts: string, signature: string) {
        return {
            'CB-ACCESS-TIMESTAMP': ts,
            'CB-ACCESS-KEY': this.clientOptions.apiKey,
            'CB-ACCESS-SIGN': signature,
            'CB-VERSION': BaseRestClient.API_VERSION,
            'Content-Type': 'application/json',
        };
    }

    protected get(endpoint: string, params?: any): GenericAPIResponse {
        return this._call('GET', endpoint, params);
    }

    protected post(endpoint: string, params?: any): GenericAPIResponse {
        return this._call('POST', endpoint, params);
    }

    // 'Method' MethodType from Axios
    private async _call(method: Method, endpoint: string, params?: any): GenericAPIResponse {
        // jit_config for this specific request
        const jit_config: AxiosRequestConfig = {
            url: endpoint,
            method: method,
        };

        // crafting 'message' -> 'signature' signed w apiSecret -> for request.Headers
        // 'params' either queryParam or body -> axios.params | axios.data
        const ts = currentEpoch();
        let message = ts + method + endpoint; // message = epoch_seconds + "GET|POST" + "/api/v3/..." + request.body? request.body

        if (method === 'GET') {
            jit_config.params = params;
        }
        if (method === 'POST') {
            const payload = JSON.stringify(params); // TODO: serialize params to prevent {k1: null}
            jit_config.data = payload;
            message += payload;
        }

        const signature = generateSignature(this.clientOptions.apiSecret, message);
        jit_config.headers = this.generateHeaders(ts, signature);

        return this.axiosInstance(jit_config)
            .then((response) => {
                if (response.status == 200) {
                    return response.data;
                }

                throw response;
            })
            .then((response) => {
                // TODO: beautify response, axios does not print nested Objects
                return response;
            })
            .catch((e) => {
                // TODO: ways to handle error https://github.com/axios/axios/issues/3612
                // if (axios.isAxiosError(e)) {
                //     console.log(e.response?.data);
                //     throw e.message;
                // } else {
                //     throw e;
                // }
                return this.parseException(e, jit_config.url as string);
            });
    }

    private parseException(
        e: AxiosError<{ error: string; error_details: string; message: string }>,
        url: string
    ) {
        // coinbase response error example
        // {
        //     error: 'INVALID_ARGUMENT',
        //     error_details: 'granularity argument is invalid ',
        //     message: 'granularity argument is invalid '
        // }
        const { response, request, message } = e;

        // Something happened in setting up the request that triggered an Error
        if (!response) {
            if (!request) {
                throw message;
            }
            // request made but no response received
            throw e;
        }

        throw {
            code: response.status, // coinbase does not have custom error codes
            message: response.data.message,
            body: response.data,
            // headers: response.headers,
            requestUrl: url,
            requestBody: request.body,
        };
    }
}
