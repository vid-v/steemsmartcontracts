const { Base64 } = require('js-base64');
const fs = require('fs-extra');
const { Transaction } = require('../libs/Transaction');
const BP_CONSTANTS = require('../libs/BlockProduction.contants').CONSTANTS;

class Bootstrap {
  static async getBootstrapTransactions(genesisSteemBlock) {
    const transactions = [];

    let contractCode;
    let base64ContractCode;
    let contractPayload;

    const FORK_BLOCK_NUMBER = 30896500;
    const FORK_BLOCK_NUMBER_TWO = 30983000;
    const ACCOUNT_RECEIVING_FEES = 'steemsc';
    const STEEM_PEGGED_ACCOUNT = 'steemsc';
    const INITIAL_TOKEN_CREATION_FEE = '0';
    const SSC_STORE_PRICE = '0.001';
    const SSC_STORE_QTY = '1';

    // tokens contract
    contractCode = await fs.readFileSync('./contracts/tokens.js');
    contractCode = contractCode.toString();

    contractCode = contractCode.replace(/'\$\{BP_CONSTANTS.UTILITY_TOKEN_PRECISION\}\$'/g, BP_CONSTANTS.UTILITY_TOKEN_PRECISION);
    contractCode = contractCode.replace(/'\$\{BP_CONSTANTS.UTILITY_TOKEN_SYMBOL\}\$'/g, BP_CONSTANTS.UTILITY_TOKEN_SYMBOL);
    contractCode = contractCode.replace(/'\$\{FORK_BLOCK_NUMBER\}\$'/g, FORK_BLOCK_NUMBER);

    base64ContractCode = Base64.encode(contractCode);

    contractPayload = {
      name: 'tokens',
      params: '',
      code: base64ContractCode,
    };

    transactions.push(new Transaction(genesisSteemBlock, 0, 'steemsc', 'contract', 'deploy', JSON.stringify(contractPayload)));

    // sscstore contract
    contractCode = await fs.readFileSync('./contracts/sscstore.js');
    contractCode = contractCode.toString();

    contractCode = contractCode.replace(/'\$\{BP_CONSTANTS.UTILITY_TOKEN_PRECISION\}\$'/g, BP_CONSTANTS.UTILITY_TOKEN_PRECISION);
    contractCode = contractCode.replace(/'\$\{BP_CONSTANTS.UTILITY_TOKEN_SYMBOL\}\$'/g, BP_CONSTANTS.UTILITY_TOKEN_SYMBOL);
    contractCode = contractCode.replace(/'\$\{FORK_BLOCK_NUMBER\}\$'/g, FORK_BLOCK_NUMBER);
    contractCode = contractCode.replace(/'\$\{SSC_STORE_PRICE\}\$'/g, SSC_STORE_PRICE);
    contractCode = contractCode.replace(/'\$\{SSC_STORE_QTY\}\$'/g, SSC_STORE_QTY);

    base64ContractCode = Base64.encode(contractCode);

    contractPayload = {
      name: 'sscstore',
      params: '',
      code: base64ContractCode,
    };

    transactions.push(new Transaction(genesisSteemBlock, 0, 'steemsc', 'contract', 'deploy', JSON.stringify(contractPayload)));

    // steem-pegged asset contract
    contractCode = await fs.readFileSync('./contracts/steempegged.js');
    contractCode = contractCode.toString();

    contractCode = contractCode.replace(/'\$\{ACCOUNT_RECEIVING_FEES\}\$'/g, ACCOUNT_RECEIVING_FEES);

    base64ContractCode = Base64.encode(contractCode);

    contractPayload = {
      name: 'steempegged',
      params: '',
      code: base64ContractCode,
    };

    transactions.push(new Transaction(genesisSteemBlock, 0, STEEM_PEGGED_ACCOUNT, 'contract', 'deploy', JSON.stringify(contractPayload)));

    contractCode = await fs.readFileSync('./contracts/market.js');
    contractCode = contractCode.toString();

    contractCode = contractCode.replace(/'\$\{FORK_BLOCK_NUMBER_TWO\}\$'/g, FORK_BLOCK_NUMBER_TWO);

    base64ContractCode = Base64.encode(contractCode);

    contractPayload = {
      name: 'market',
      params: '',
      code: base64ContractCode,
    };

    transactions.push(new Transaction(genesisSteemBlock, 0, 'null', 'contract', 'deploy', JSON.stringify(contractPayload)));

    // dice contract
    contractCode = await fs.readFileSync('./contracts/dice.js');
    contractCode = contractCode.toString();

    base64ContractCode = Base64.encode(contractCode);

    contractPayload = {
      name: 'dice',
      params: '',
      code: base64ContractCode,
    };

    transactions.push(new Transaction(genesisSteemBlock, 0, 'steemsc', 'contract', 'deploy', JSON.stringify(contractPayload)));


    // bootstrap transactions
    transactions.push(new Transaction(genesisSteemBlock, 0, STEEM_PEGGED_ACCOUNT, 'tokens', 'create', '{ "name": "STEEM Pegged", "symbol": "STEEMP", "precision": 3, "maxSupply": 1000000000000 }'));
    transactions.push(new Transaction(genesisSteemBlock, 0, 'steemsc', 'tokens', 'updateParams', `{ "tokenCreationFee": "${INITIAL_TOKEN_CREATION_FEE}" }`));
    transactions.push(new Transaction(genesisSteemBlock, 0, STEEM_PEGGED_ACCOUNT, 'tokens', 'issue', `{ "symbol": "STEEMP", "to": "${STEEM_PEGGED_ACCOUNT}", "quantity": 1000000000000, "isSignedWithActiveKey": true }`));

    return transactions;
  }
}

module.exports.Bootstrap = Bootstrap;
