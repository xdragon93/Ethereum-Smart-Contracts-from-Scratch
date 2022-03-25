const { ec } = require('../util');
const { STARTING_BALANCE } = require('../config');

class Account {
    constructor() {
        this.keyPair = ec.genKeyPair();
        this.address = this.keyPair.getPublic().encode('hex');
        this.balance = STARTING_BALANCE;
    }
}

module.exports = Account;
