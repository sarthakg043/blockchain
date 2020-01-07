const {Blockchain, Transaction} = require('./blockchain');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

const myKey = ec.keyFromPrivate('bb8dbb0cbba04e5864f76c6aa5685a9007159e0429573095eb5eb76a6c3a6dcf')
const myWalletAddress = myKey.getPublic('hex');
//Headline
console.log('\n                                 _____________ \n                                  Block Chain \n                                 _____________');

//Chain declaration
const SGCoin = new Blockchain();

//Making First Transactions and signing
const tx1 = new Transaction(myWalletAddress, 'public key goes here', 10);
tx1.signTransaction(myKey);
SGCoin.addTransaction(tx1);

//Mining Block
console.log('\nStarting the miner.......');
SGCoin.minePendingTransaction(myWalletAddress);

console.log('\nBalance of Miner is: ', SGCoin.getBalanceOfAddress(myWalletAddress));

// Uncomment this line if you want to test tampering with the chain
//SGCoin.chain[1].transaction[0].amount = 10;

console.log('Is the Chain Valid:', SGCoin.isChainValid() ? 'Yes' : 'No');
//console.log(JSON.stringify(SGCoin.chain, null, 4));