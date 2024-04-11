import { MainClient } from '../src';

describe('Public Spot REST API endpoints', () => {
    const c = new MainClient('key', 'secret');

    beforeAll(() => {});
    beforeEach(() => {});

    describe('Common Public APIs', () => {
        it('getUnixTime() coinbase', async () => {
            const exchangeUnixTime = await c.getUnixTime();

            expect(exchangeUnixTime).toStrictEqual(expect.any(Object));
            expect(exchangeUnixTime.epochSeconds).toStrictEqual(expect.any(String));
        });
    });
});
