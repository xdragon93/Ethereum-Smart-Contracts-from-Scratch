const Transaction = require('./index');
const Account = require('../account');
const State = require('../store/state');

describe('Transaction', () => {
    let account, state, toAccount;
    let standardTransaction, createAccountTransaction, miningRewardTransaction;

    beforeEach(() => {
        account = new Account();
        toAccount = new Account();
        state = new State();

        state.putAccount({ address: account.address, accountData: account });
        state.putAccount({ address: toAccount.address, accountData: toAccount });

        createAccountTransaction = Transaction.createTransaction({
            account
        });
        standardTransaction = Transaction.createTransaction({
            account,
            to: toAccount.address,
            value: 50
        });
        miningRewardTransaction = Transaction.createTransaction({
            beneficiary: account.address
        });
    });

    describe('validateStrandardTransaction()', () => {
        it('validates a valid standard transaction', () => {
            expect(Transaction.validateStandardTransaction({
                transaction: standardTransaction,
                state
            })).resolves;
        });

        it('does not validate a malformed standard transaction', () => {
            standardTransaction.to = 'different-recipient';

            expect(Transaction.validateStandardTransaction({
                transaction: standardTransaction,
                state
            })).rejects.toMatchObject({ message: /invalid/ });
        });

        it('does not validate when the value exceeds the balance', () => {
            standardTransaction = Transaction.createTransaction({
                account,
                to: toAccount.address,
                value: 9001
            });

            expect(Transaction.validateStandardTransaction({
                transaction: standardTransaction,
                state
            })).rejects.toMatchObject({ message: /exceeds/ });
        });

        it('does not validate when the `to` address does not exist', () => {
            standardTransaction = Transaction.createTransaction({
                account,
                to: 'foo-recipient',
                value: 50
            });

            expect(Transaction.validateStandardTransaction({
                transaction: standardTransaction,
                state
            })).rejects.toMatchObject({ message: /does not exist/ });
        });

        it('does not validate when the gasLimit exceeds the balance', () => {
            standardTransaction = Transaction.createTransaction({
                account,
                to: 'foo-recipient',
                gasLimit: 9001
            });

            expect(Transaction.validateStandardTransaction({
                transaction: standardTransaction,
                state
            })).rejects.toMatchObject({ message: /exceeds/ });
        });

        it('does not validate when the gasUsed for the code exceeds the gasLimit', () => {
            const codeHash = 'foo-codeHash';
            const code = ['PUSH', 1, 'PUSH', 2, 'ADD', 'STOP'];

            state.putAccount({
                address: codeHash,
                accountData: { code, codeHash }
            });

            standardTransaction = Transaction.createTransaction({
                account,
                to: codeHash,
                gasLimit: 0
            });

            expect(Transaction.validateStandardTransaction({
                transaction: standardTransaction,
                state
            })).rejects.toMatchObject({ message: /Transaction needs more gas/ });
        });
    });

    describe('validateCreateAccountTransaction()', () => {
        it('validates a create account transaction', () => {
            expect(Transaction.validateCreateAccountTransaction({
                transaction: createAccountTransaction
            })).resolves;
        });

        it('does not validate a non create account transaction', () => {
            expect(Transaction.validateCreateAccountTransaction({
                transaction: standardTransaction
            })).rejects.toMatchObject({ message: /incorrect/ });
        });

        it('does not validate a malformed create account transaction', () => {
            delete createAccountTransaction.data.accountData.balance;
            createAccountTransaction.data.accountData.fakeBalance = 1000;

            expect(Transaction.validateCreateAccountTransaction({
                transaction: createAccountTransaction
            })).rejects.toMatchObject({ message: /unexpected/ });
        });
    });

    describe('validateMiningRewardTransaction()', () => {
        it('validates a mining reward transaction', () => {
            expect(Transaction.validateMiningRewardTransaction({
                transaction: miningRewardTransaction
            })).resolves;
        });

        it('does not validate a tampered with mining reward transaction', () => {
            miningRewardTransaction.value = 9001;

            expect(Transaction.validateMiningRewardTransaction({
                transaction: miningRewardTransaction
            })).rejects.toMatchObject({ message: /does not equal the official value/ });
        });
    });
});
