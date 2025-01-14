# QuantumBlockChian
[![English](https://img.shields.io/badge/Language-English-brightgreen)](https://github.com/QuantumCipherMaster/QuantumBlockChain/blob/main/README.md)
[![Русский](https://img.shields.io/badge/Язык-Русский-blue)](https://github.com/QuantumCipherMaster/QuantumBlockChain/blob/main/QuantumBlockChain_RU/README_RU.md)
[![Українська](https://img.shields.io/badge/Мова-Українська-yellow)](https://github.com/QuantumCipherMaster/QuantumBlockChain/blob/main/QuantumBlockChain_UK/README_UK.md)
## Table of Contents
- [QuantumBlockChian](#quantumblockchian)
  - [Table of Contents](#table-of-contents)
  - [Overview](#overview)
  - [Run on your device](#run-on-your-device)
    - [For Linux / MacOS](#for-linux--macos)
    - [For Windows PowerShell](#for-windows-powershell)
  - [Design of Classes](#design-of-classes)
    - [Block](#block)
    - [Chain](#chain)
    - [Transaction](#transaction)
    - [MiningTimer](#miningtimer)
  - [Usage](#usage)
  - [Logging](#logging)
  - [Testing](#testing)
- [Conclusion](#conclusion)

---

## Overview

This document provides an explanation of a simple Blockchain implementation in JavaScript. The blockchain consists of blocks that store transactions and are linked together to form a chain. Each block contains a timestamp, a reference to the previous block's hash, a list of transactions, its own hash, and a nonce used for mining.

---

## Run on your device
### For Linux / MacOS
```zsh
git clone https://github.com/QuantumCipherMaster/QuantumBlockChain
cd QuantumBlockChain/QuantumBlockChain_EN
npm install
npm start
```

### For Windows PowerShell
```powershell
git clone https://github.com/QuantumCipherMaster/QuantumBlockChain
cd QuantumBlockChain\QuantumBlockChain_EN
npm install
npm start
```

## Design of Classes

### Block

Represents a single block in the blockchain.

**Properties:**
- `timestamp` (string): The creation time of the block in ISO format.
- `previousHash` (string): The hash of the previous block in the chain.
- `transactions` (array): An array of transaction objects included in the block.
- `hash` (string): The hash of the current block.
- `nonce` (number): A number used to vary the block's hash during mining.

**Methods:**
- `constructor(previousHash, transactions)`: Initializes a new block with the given previous hash and transactions.
- `calculateHash()`: Computes the hash of the block based on its contents.
- `getAnswer(difficulty)`: Generates a string of zeros corresponding to the mining difficulty.
- `addBlock(newBlock)`: Adds a new block to the chain after mining.
- `validateBlockTransactions()`: Checks the validity of all transactions in the block.
- `mine(difficulty)`: Mines the block by finding a hash that meets the difficulty requirement.

### Chain

Represents the blockchain, managing the sequence of blocks and transactions.

**Properties:**
- `chain` (array): The array of blocks in the blockchain.
- `difficulty` (number): The difficulty level for mining new blocks.
- `transactionPool` (array): A pool of pending transactions to be included in the next block.
- `minerReward` (number): The reward given to a miner for successfully mining a block.

**Methods:**
- `constructor()`: Initializes the blockchain with a genesis block.
- `createGenesisBlock()`: Creates the first block in the chain with no previous hash.
- `getLatestBlock()`: Retrieves the most recent block in the chain.
- `addTransaction(transaction)`: Adds a new transaction to the transaction pool.
- `addBlock(newBlock)`: Adds a mined block to the chain and logs the mining time.
- `mineTransactionPool(minerAddress)`: Mines all transactions in the pool, rewards the miner, and adds the new block to the chain.
- `verification()`: Validates the integrity of the entire blockchain.

### Transaction

Represents a transaction between two addresses.

**Properties:**
- `fromAddress` (string): The sender's public address.
- `toAddress` (string): The receiver's public address.
- `amount` (number): The amount to transfer.
- `timestamp` (string): The time the transaction was created.

**Methods:**
- `constructor(fromAddress, toAddress, amount)`: Initializes a new transaction.
- `computeHash()`: Computes the hash of the transaction.
- `sign(key)`: Signs the transaction with the sender's private key.
- `isValid()`: Checks if the transaction is valid by verifying the signature.

### MiningTimer

Handles timing and logging of the mining process.

**Properties:**
- `startTime` (Date): The start time of mining.
- `endTime` (Date): The end time of mining.
- `spentTime` (number): The time spent mining in seconds.
- `csvPath` (string): The file path for logging mining data.

**Methods:**
- `constructor()`: Initializes the mining timer.
- `start()`: Records the start time.
- `stop(blockCount, minedHash)`: Records the end time, calculates spent time, and logs the data.
- `logToCSV(blockCount, minedHash)`: Logs mining details to a CSV file.

---

## Usage

1. **Initialize the Blockchain:**
   ```javascript
   const chain = new Chain();
   ```

2. **Generate Key Pairs:**
   ```javascript
   const keyPairSender = ec.genKeyPair();
   const privateKeySender = keyPairSender.getPrivate("hex");
   const publicKeySender = keyPairSender.getPublic("hex");

   const keyPairReceiver = ec.genKeyPair();
   const privateKeyReceiver = keyPairReceiver.getPrivate("hex");
   const publicKeyReceiver = keyPairReceiver.getPublic("hex");
   ```

3. **Create and Sign a Transaction:**
   ```javascript
   const t1 = new Transaction(publicKeySender, publicKeyReceiver, 100);
   t1.sign(keyPairSender);
   ```

4. **Add Transaction to the Pool:**
   ```javascript
   chain.addTransaction(t1);
   ```

5. **Mine the Transaction Pool:**
   ```javascript
   chain.mineTransactionPool(publicKeyReceiver);
   ```

6. **Verify the Blockchain:**
   ```javascript
   chain.verification();
   ```

---
## Logging

The `MiningTimer` class logs mining details to a CSV file located at `./mining_logs.csv`. Each entry includes:

- **Start Time (ISO):** When mining started.
- **End Time (ISO):** When mining ended.
- **Spent Time (seconds):** Duration of mining.
- **Block Count:** The number of the block mined.
- **Mined Hash:** The hash of the mined block.

If the CSV file does not exist, it is created with appropriate headers. Subsequent logs are appended to the file.

---

## Testing

The script includes a testing section that measures mining performance at different difficulty levels. It adjusts the difficulty and records the time taken to mine a block, calculating transactions per second.

**Testing Steps:**

1. **Define Test Difficulties:**
   ```javascript
   const testDifficulties = {
     1: 10,
     2: 8,
     3: 6,
     4: 4,
     5: 4,
     6: 2,
     7: 1,
     8: 1,
     9: 1,
     10: 1
   };
   ```

2. **Test Mining Function:**
   ```javascript
   function testMining(difficulty) {
     // Function implementation
   }
   ```

3. **Display Results:**
   ```javascript
   console.log(colors.cyan + "Difficulty | Time (ms) | Transactions/sec" + colors.reset);
   console.log(colors.cyan + "-----------|-----------|-----------------" + colors.reset);
   
   Object.entries(testDifficulties).forEach(([difficulty, iterations]) => {
     const timeElapsed = testMining(parseInt(difficulty));
     
     if (timeElapsed !== null) {
       const transPerSec = (1000 / timeElapsed).toFixed(2);
       console.log(
         `${colors.yellow}${difficulty.padStart(10)}${colors.reset} | ` +
         `${colors.green}${timeElapsed.toString().padStart(9)}${colors.reset} | ` +
         `${colors.blue}${transPerSec.padStart(15)}${colors.reset}`
       );
     }
   });
   
   console.log("\n" + colors.bright + "Test completed!" + colors.reset + "\n");
   ```

The test outputs a table showing the difficulty level, time taken in milliseconds, and transactions processed per second.

---

# Conclusion

This blockchain implementation provides a foundational structure for understanding how blocks, chains, transactions, and mining work together to form a secure and verifiable ledger. The added comments and documentation aim to clarify each component's role and functionality, making it accessible for computer science students and developers interested in blockchain technology.