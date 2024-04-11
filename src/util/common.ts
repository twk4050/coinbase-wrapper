import crypto from 'crypto';
import { Granularity } from 'src/types/products';

export function currentEpoch() {
    return Math.floor(Date.now() / 1000).toString();
}
export function generateSignature(secret: string, message: string) {
    return crypto.createHmac('sha256', secret).update(message).digest('hex');
}

export function granularityToSeconds(granularity: Granularity) {
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
