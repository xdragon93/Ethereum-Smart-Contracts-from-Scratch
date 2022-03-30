const { v4: uuidv4 } = require('uuid');
const Account = require('../account');

const TRANSACTION_TYPE_MAP = {
    CREATE_ACCOUNT: 'CREATE_ACCOUNT',
    TRANSACT: 'TRANSACT'
};

class Transaction {
    constructor({ id, from, to, value, data, signature }) {
        this.id = id || uuidv4();
        this.from = from || '-';
        this.to = to || '-';
        this.value = value || 0;
        this.data = data || '-';
        this.signature = signature || '-';
    }

    static createTransaction({ account, to, value }) {
        if (to) {
            const transactionData = {
                id: uuidv4(),
                from: account.address,
                to,
                value,
                data: { type: TRANSACTION_TYPE_MAP.TRANSACT }
            };

            return new this({
                ...transactionData,
                signature: account.sign(transactionData)
            });
        }

        return new this({
            data: {
                type: TRANSACTION_TYPE_MAP.CREATE_ACCOUNT,
                accountData: account.toJSON()
            }
        });
    }

    static validateStandardTransaction({ transaction }) {
        return new Promise((resolve, reject) => {
            const { id, from, signature } = transaction;
            const transactionData = { ...transaction };
            delete transactionData.signature;

            if (!Account.verifySignature({
                publicKey: from,
                data: transactionData,
                signature
            })) {
                return reject(new Error(`Transaction ${id} signature is invalid`));
            }

            return resolve();
        });
    }

    static validateCreateAccountTransaction({ transaction }) {
        return new Promise((resolve, reject) => {
            const expectedAccountDataFields = Object.keys(new Account().toJSON());
            const fields = Object.keys(transaction.data.accountData);

            if (fields.length !== expectedAccountDataFields.length) {
                return reject(new Error(
                    `The transaction: ${transaction.id}, account data has an incorrect number of fields`
                ));
            }

            fields.forEach(field => {
                if (!expectedAccountDataFields.includes(field)) {
                    return reject(new Error(
                        `The field: ${field}, is unexpected for account data`
                    ));
                }
            });

            return resolve();
        });
    }

    static runTransaction({ transaction, state }) {
        switch (transaction.data.type) {
            case TRANSACTION_TYPE_MAP.TRANSACT:
                Transaction.runStandardTransaction({ transaction, state });
                console.log(' -- Updated account data to reflect the standard transaction');
                break;
            case TRANSACTION_TYPE_MAP.CREATE_ACCOUNT:
                Transaction.runCreateAccountTransaction({ transaction, state });
                console.log(' -- Stored the account data');
                break;
            default:
                break;
        }
    }

    static runStandardTransaction({ transaction, state }) {
        const fromAccount = state.getAccount({ address: transaction.from });
        const toAccount = state.getAccount({ address: transaction.to });
        const value = transaction.value;

        fromAccount.balance -= value;
        toAccount.balance += value;

        state.putAccount({ address: transaction.from, accountData: fromAccount });
        state.putAccount({ address: transaction.to, accountData: toAccount });
    }

    static runCreateAccountTransaction({ transaction, state }) {
        const { accountData } = transaction.data;
        const { address } = accountData;

        state.putAccount({ address, accountData });
    }
}

module.exports = Transaction;
