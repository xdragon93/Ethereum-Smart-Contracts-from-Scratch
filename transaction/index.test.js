const Transaction = require('./index');
const Account = require('../account');
const State = require('../store/state');

describe('Transaction', () => {
    let account, standardTransaction, createAccountTransaction, state, toAccount;

    beforeEach(() => {
        account = new Account();
        toAccount = new Account();
        state = new State();

        state.putAccount({ address: account.address, accountDate: account });
        state.putAccount({ address: toAccount.address, accountData: toAccount });

        createAccountTransaction = Transaction.createTransaction({
            account
        });
        standardTransaction = Transaction.createTransaction({
            account,
            to: toAccount,
            value: 50
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
});
