const Trie = require('./trie');

describe('Trie', () => {
    let trie;

    beforeEach(() => {
        trie = new Trie();
    });

    it('has a rootHash', () => {
        expect(trie.rootHash).not.toBe(undefined);
    });

    describe('put()', () => {
        const key = 'foo';
        const value = 'bar';

        it('stores a value under a key', () => {
            trie.put({key, value});

            expect(trie.get({ key })).toEqual(value);
        });

        it('genrates a new root hash after entering the value', () => {
            const originalRootHash = trie.rootHash;
            trie.put({key, value});

            expect(trie.rootHash).not.toEqual(originalRootHash);
        });
    });

    describe('get()', () => {
        it('returns a copy of the stored value', () => {
            const key = 'foo';
            const value = { one: 1 };
            trie.put({ key, value });
            const gottenValue = trie.get({ key })
            value.one = 2;

            expect(gottenValue).toEqual({ one: 1 });
        });
    });
});
