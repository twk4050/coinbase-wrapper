"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.granularityToSeconds = exports.generateSignature = exports.currentEpoch = void 0;
const crypto_1 = __importDefault(require("crypto"));
function currentEpoch() {
    return Math.floor(Date.now() / 1000).toString();
}
exports.currentEpoch = currentEpoch;
function generateSignature(secret, message) {
    return crypto_1.default.createHmac('sha256', secret).update(message).digest('hex');
}
exports.generateSignature = generateSignature;
function granularityToSeconds(granularity) {
    const [num, interval] = granularity.split('_'); // ['ONE', 'MINUTE]
    const interval_to_seconds = {
        MINUTE: 60,
        HOUR: 60 * 60,
        DAY: 24 * 60 * 60,
    };
    const numString = {
        ONE: 1,
        FIVE: 5,
        FIFTEEN: 15,
        THIRTY: 30,
        TWO: 2,
        SIX: 6,
    };
    return numString[num] * interval_to_seconds[interval];
}
exports.granularityToSeconds = granularityToSeconds;
//# sourceMappingURL=common.js.map