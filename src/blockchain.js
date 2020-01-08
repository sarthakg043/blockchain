const sha256 = require("crypto-js/sha256.js");
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

class Transaction{
    constructor(fromAddress, toAddress, amount){
        this.fromAddress = fromAddress;
        this.toAddress = toAddress;
        this.amount = amount;
        this.timestamp = Date.now();
    }

    claculateHash(){
        return sha256(this.fromAddress + this.toAddress + this.amount).toString();
    }

    signTransaction(signingKey){
        if(signingKey.getPublic('hex') !== this.fromAddress){
            throw new Error('You cannot sign Transaction for other wallets: ')
        }

        const hashTx = this.claculateHash();
        const sig = signingKey.sign(hashTx, 'base64');
        this.signature = sig.toDER('hex');
    }

    isValid(){
         if(this.fromAddress === null)return true;

         if(!this.signature || this.signature.length === 0){
             throw new Error("No signature in this transaction");
         }

         const publicKey = ec.keyFromPublic(this.fromAddress, 'hex');
         return publicKey.verify(this.claculateHash(), this.signature);
    }
}

class Block{
    constructor(timestamp, transaction, previousHash = ''){
        this.previousHash = previousHash;
        this.timestamp = timestamp;
        this.transaction = transaction;
        this.nonce = 0;
        this.hash = this.claculateHash();
    }

    claculateHash(){
        return sha256(this.previousHash + this.timestamp + JSON.stringify(this.transaction) + this.nonce).toString();
    }

    mineBlock(difficulty){
        while(this.hash.substring(0, difficulty) !== Array(difficulty + 1).join("0")){
            this.nonce++;
            this.hash = this.claculateHash();
        }
        console.log('Block mined: ' + this.hash);
    }

    hasValidTransactions(){
        for(const tx of this.transaction){
            if(!tx.isValid()){
                return false;
            }
        }
        return true;
    }
}

class Blockchain{
    constructor(){
        this.chain = [this.createGenesisBlock()];
        this.difficulty = 2;
        this.pendingTransactions = [];
        this.miningReward = 100;
    }

    createGenesisBlock(){
        return new Block(Date.now(), "Genesis Block", "0");
    }

    getLatestBlock(){
        return this.chain[this.chain.length - 1];
    }

    minePendingTransaction(miningRewardAddress){
        const rewardTx = new Transaction(null, miningRewardAddress, this.miningReward);
        this.pendingTransactions.push(rewardTx);
    
        const block = new Block(Date.now(), this.pendingTransactions, this.getLatestBlock().hash);
        block.mineBlock(this.difficulty);
    
        console.log('Block successfully mined!');
        this.chain.push(block);
    
        this.pendingTransactions = [];
    }

    addTransaction(transaction){

        if(!transaction.fromAddress || !transaction.toAddress){
            throw new Error("Transaction must Include Sender's and Reciever's Address!");
        }

        //Verifying Transaction
        if(!transaction.isValid()){
            throw new Error("Cannot add invalid transactions to this chain");
        }
        
        if (transaction.amount <= 0) {
            throw new Error('Transaction amount should be higher than 0');
        }
          
        //Making sure that the amount sent is not greater than existing balance
        // if (this.getBalanceOfAddress(transaction.fromAddress) < transaction.amount) {
        //     throw new Error('Not enough balance');
        // }

        this.pendingTransactions.push(transaction);
    }

    getBalanceOfAddress(address){
        let balance = 0;

        for(const block of this.chain){
            for(const trans of block.transaction){
                if(trans.fromAddress === address){
                    balance -= trans.amount;
                }
                if(trans.toAddress === address){
                    balance += trans.amount;
                }
            }
        }

        return balance;
    }

    isChainValid(){
        // Check if the Genesis block hasn't been tampered with by comparing
        // the output of createGenesisBlock with the first block on our chain
        const realGenesis = JSON.stringify(this.createGenesisBlock());

        if (realGenesis !== JSON.stringify(this.chain[0])) {
            return false;
        }

        for(let i = 1; i < this.chain.length; i++){
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i-1];

            if(!currentBlock.hasValidTransactions()){
                return false;
            }

            if(currentBlock.hash !== currentBlock.claculateHash()){
                return false;
            }
            if(currentBlock.previousHash !== previousBlock.hash){
                return false;
            }
        }
        return true;
    }
}

module.exports.Blockchain = Blockchain;
module.exports.Block = Block;
module.exports.Transaction = Transaction;