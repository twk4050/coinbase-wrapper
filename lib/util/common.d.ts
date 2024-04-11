import { Granularity } from 'src/types/products';
export declare function currentEpoch(): string;
export declare function generateSignature(secret: string, message: string): string;
export declare function granularityToSeconds(granularity: Granularity): number;
