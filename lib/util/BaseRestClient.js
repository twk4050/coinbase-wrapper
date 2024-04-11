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
const axios_1 = __importDefault(require("axios"));
const common_1 = require("./common");
const node_http_1 = __importDefault(require("node:http"));
const node_https_1 = __importDefault(require("node:https"));
class BaseRestClient {
    constructor(_clientOptions, _axiosConfig) {
        const config = Object.assign(Object.assign({}, BaseRestClient.defaultConfig), _axiosConfig);
        if (_clientOptions.keepAlive) {
            config.httpAgent = new node_http_1.default.Agent({ keepAlive: true });
            config.httpsAgent = new node_https_1.default.Agent({ keepAlive: true });
        }
        this.clientOptions = _clientOptions;
        this.axiosInstance = axios_1.default.create(config);
        if (_clientOptions.timeRequest) {
            this.axiosInstance.interceptors.response.use((response) => {
                console.timeEnd(response.config.url);
                return response;
            }, (error) => {
                console.timeEnd(error.response.config.url);
                return Promise.reject(error);
            });
            this.axiosInstance.interceptors.request.use(function (config) {
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
            }, function (error) {
                return Promise.reject(error);
            });
        }
    }
    generateHeaders(ts, signature) {
        return {
            'CB-ACCESS-TIMESTAMP': ts,
            'CB-ACCESS-KEY': this.clientOptions.apiKey,
            'CB-ACCESS-SIGN': signature,
            'CB-VERSION': BaseRestClient.API_VERSION,
            'Content-Type': 'application/json',
        };
    }
    get(endpoint, params) {
        return this._call('GET', endpoint, params);
    }
    post(endpoint, params) {
        return this._call('POST', endpoint, params);
    }
    // 'Method' MethodType from Axios
    _call(method, endpoint, params) {
        return __awaiter(this, void 0, void 0, function* () {
            // jit_config for this specific request
            const jit_config = {
                url: endpoint,
                method: method,
            };
            // crafting 'message' -> 'signature' signed w apiSecret -> for request.Headers
            // 'params' either queryParam or body -> axios.params | axios.data
            const ts = (0, common_1.currentEpoch)();
            let message = ts + method + endpoint; // message = epoch_seconds + "GET|POST" + "/api/v3/..." + request.body? request.body
            if (method === 'GET') {
                jit_config.params = params;
            }
            if (method === 'POST') {
                const payload = JSON.stringify(params); // TODO: serialize params to prevent {k1: null}
                jit_config.data = payload;
                message += payload;
            }
            const signature = (0, common_1.generateSignature)(this.clientOptions.apiSecret, message);
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
                return this.parseException(e, jit_config.url);
            });
        });
    }
    parseException(e, url) {
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
BaseRestClient.BASE_URL = 'https://api.coinbase.com';
BaseRestClient.API_VERSION = '2023-12-21';
BaseRestClient.defaultConfig = {
    baseURL: BaseRestClient.BASE_URL,
    timeout: 5 * 1000, // 5 seconds for response time out
    responseType: 'json', // default json
    // signal: // TODO: next time for connection timeout
};
exports.default = BaseRestClient;
//# sourceMappingURL=BaseRestClient.js.map