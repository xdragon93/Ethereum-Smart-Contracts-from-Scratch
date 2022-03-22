const Block = require('./block');
const { keccakHash } = require('../util');

describe('Block', () => {
    describe('calculateBlockTargetHash()', () => {
        it('calculates the maximum hash when the last block difficulty is 1', () => {
            expect(
                Block.calculateBlockTargetHash({ lastBlock: { blockHeaders: { difficulty: 1 } } })
            ).toEqual('f'.repeat(64));
        });

        it('calculates a low hash value when the last block difficulty is high', () => {
            expect(
                Block.calculateBlockTargetHash({ lastBlock: { blockHeaders: { difficulty: 500 } } })
                < '1'
            ).toBe(true);
        });
    });

    describe('mineBlock()', () => {
        let lastBlock, minedBlock;

        beforeEach(() => {
            lastBlock = Block.genesis();
            minedBlock = Block.mineBlock({ lastBlock, beneficiary: 'beneficiary' });
        });

        it('mines a block', () => {
            expect(minedBlock).toBeInstanceOf(Block);
        });

        it('mines a block that meets the proof of work requirement', () => {
            const target = Block.calculateBlockTargetHash({ lastBlock });
            const { blockHeaders } = minedBlock;
            const { nonce } = blockHeaders;
            const truncatedBlockHeaders = { ...blockHeaders };
            delete truncatedBlockHeaders.nonce;
            const header = keccakHash(truncatedBlockHeaders);
            const underTargetHash = keccakHash(header + nonce);

            expect(underTargetHash < target).toBe(true);
        });
    });
});
