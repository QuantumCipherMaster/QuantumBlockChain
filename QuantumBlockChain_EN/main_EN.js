// Import elliptic library for ECDSA
const EC = require("elliptic").ec;

// Initialize an object for secp256k1 elliptic curve operations
const ec = new EC("secp256k1");

// Import library for sha256 function
const sha256 = require("crypto-js/sha256");

// Import custom database manager
const DatabaseManager = require("./db");

// Define colors for console output
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
  red: "\x1b[31m",
};

// Class representing a block in the chain
class Block {
  // Constructor takes the previous block hash and a list of transactions
  constructor(previousHash, transactions) {
    this.timestamp = new Date().toISOString();
    this.previousHash = previousHash;
    this.transactions = transactions;
    this.hash = this.calculateHash();
    this.nonce = 1;
  }

  // Function calculates the block hash
  calculateHash() {
    return sha256(
      this.timestamp +
        this.previousHash +
        JSON.stringify(this.transactions) +
        this.nonce
    ).toString();
  }

  // Generates the target string for the difficulty check
  getAnswer(difficulty) {
    let answer = "";
    for (let i = 0; i < difficulty; i++) {
      answer += "0";
    }
    return answer;
  }

  // Validate all transactions in the block
  validateBlockTransactions() {
    for (const transaction of this.transactions) {
      if (!transaction.isValid()) {
        console.log(
          `${colors.red}Invalid transaction found in this block. The block is invalid.${colors.reset}`
        );
        return false;
      }
    }
    return true;
  }

  // Mining process for the block with the given difficulty
  mine(difficulty) {
    this.validateBlockTransactions();
    const spinnerChars = ["🌑", "🌒", "🌓", "🌔", "🌕", "🌖", "🌗", "🌘"];
    let spinnerIndex = 0;

    while (true) {
      this.hash = this.calculateHash();
      process.stdout.write(
        `\rMining ${spinnerChars[spinnerIndex]} nonce: ${
          this.nonce
        }, partial hash: ${this.hash.substring(0, 16)}...`
      );

      spinnerIndex = (spinnerIndex + 1) % spinnerChars.length;
      if (this.hash.substring(0, difficulty) !== this.getAnswer(difficulty)) {
        this.nonce++;
      } else {
        break;
      }
    }
    console.log(
      `\n${colors.green}Block mined successfully!: ${this.hash}${colors.reset}`
    );
  }
}

// Class representing the blockchain
class Chain {
  // Constructor initializes the chain, difficulty, transaction pool, and reward
  constructor() {
    this.chain = [this.createGenesisBlock()];
    this.difficulty = 4;
    this.transactionPool = [];
    this.minerReward = 3.125;
  }

  // Creates the genesis block (the first block in the chain)
  createGenesisBlock() {
    return new Block("0", []);
  }

  // Returns the latest block in the chain
  getLatestBlock() {
    return this.chain[this.chain.length - 1];
  }

  // Calculates the balance of a given address
  getBalanceOfAddress(address) {
    let balance = 0; // Start with a balance of 0

    // Iterate over each block in the chain
    for (const block of this.chain) {
      // Iterate over each transaction in the current block
      for (const trans of block.transactions) {
        // If the address is the sender, decrease the balance
        if (trans.fromAddress === address) {
          balance -= trans.amount;
        }

        // If the address is the receiver, increase the balance
        if (trans.toAddress === address) {
          balance += trans.amount;
        }
      }
    }
    return balance; // Return the calculated balance
  }

  // Adds a transaction to the transaction pool after validation
  addTransaction(transaction) {
    // Basic validation: check if addresses and amount are valid
    if (
      !transaction.fromAddress ||
      !transaction.toAddress ||
      transaction.amount <= 0
    ) {
      throw new Error(
        "Transaction must include from/to address and a positive amount."
      );
    }

    // Validate the transaction signature
    if (!transaction.isValid()) {
      throw new Error(
        "Cannot add invalid transaction (signature check failed) to pool."
      );
    }

    // Check sender's balance (skip for reward transactions where fromAddress is empty)
    if (transaction.fromAddress !== "") {
      const balance = this.getBalanceOfAddress(transaction.fromAddress);
      if (balance < transaction.amount) {
        throw new Error(
          `Insufficient balance. Sender has ${balance}, needs ${transaction.amount}.`
        );
      }
    }

    // Check if the transaction already exists in the pool (based on signature)
    const existingTransaction = this.transactionPool.find(
      (tx) => tx.signature === transaction.signature
    );
    if (existingTransaction) {
      throw new Error("Transaction already exists in the pool.");
    }

    // If all checks pass, add to the pool
    this.transactionPool.push(transaction);
    console.log(
      `${colors.cyan}Transaction added to pool successfully.${colors.reset}`
    );
  }

  // Creates and adds a new block to the chain
  addBlock(newBlock) {
    const timer = new MiningTimer();
    newBlock.previousHash = this.getLatestBlock().hash;

    timer.start();
    newBlock.mine(this.difficulty);
    timer.stop(this.chain.length + 1, newBlock.hash);

    this.chain.push(newBlock);
  }

  // Mines all transactions in the pool and creates a block
  mineTransactionPool(minerAddress) {
    const timer = new MiningTimer();
    const rewardTransaction = new Transaction(
      "",
      minerAddress,
      this.minerReward
    );
    this.transactionPool.push(rewardTransaction);

    timer.start();
    const newBlock = new Block(
      this.getLatestBlock().hash,
      this.transactionPool
    );
    newBlock.mine(this.difficulty);
    timer.stop(this.chain.length + 1, newBlock.hash);

    this.chain.push(newBlock);
    this.transactionPool = [];
  }

  // Validation of the entire chain
  verification() {
    for (let i = 1; i < this.chain.length; i++) {
      const blockToValidate = this.chain[i];
      if (!blockToValidate.validateBlockTransactions()) {
        console.log(
          `${colors.red}An invalid block was found in the chain.${colors.reset}`
        );
        return false;
      }

      const currentBlock = this.chain[i];
      const previousBlock = this.chain[i - 1];

      if (currentBlock.hash !== currentBlock.calculateHash()) {
        console.log("\n");
        console.log(
          `${colors.red}At ${new Date().toISOString()}, the blockchain is invalid due to tampered data.${colors.reset}`
        );
        console.log("\n");
        return false;
      }

      if (currentBlock.previousHash !== previousBlock.hash) {
        console.log("\n");

        console.log(
          `${colors.red}At ${new Date().toISOString()}, the blockchain is invalid because the chain is broken.${colors.reset}`
        );
        console.log("\n");
        return false;
      }
    }
    console.log("\n");
    console.log(
      `${colors.green}At ${new Date().toISOString()}, the blockchain is valid.${colors.reset}`
    );
    console.log("\n");
    return true;
  }
}

// Class representing a transaction
class Transaction {
  // Transaction constructor takes the sender and receiver addresses, and an amount
  constructor(fromAddress, toAddress, amount) {
    this.fromAddress = fromAddress;
    this.toAddress = toAddress;
    this.amount = amount;
    this.timestamp = new Date().toUTCString();
  }

  // Compute the transaction hash
  computeHash() {
    return sha256(
      this.fromAddress + this.toAddress + this.amount + this.timestamp
    ).toString();
  }

  // Sign the transaction with a private key
  sign(key) {
    this.signature = key.sign(this.computeHash(), "base64").toDER("hex");
  }

  // Check if the transaction is valid
  isValid() {
    if (this.fromAddress === null || this.fromAddress === "") {
      return true; // Mining reward is valid
    }

    if (!this.signature) {
      return false;
    }

    const key = ec.keyFromPublic(this.fromAddress, "hex");
    return key.verify(this.computeHash(), this.signature);
  }
}

const fs = require("node:fs");
const path = require("node:path");

class MiningTimer {
  constructor() {
    this.csvPath = path.join(__dirname, "mining_logs.csv");
    this.startTime = null;
    this.endTime = null;
    this.spentTime = null;
  }

  // Starts the timer
  start() {
    this.startTime = new Date();
  }

  // Stops the timer and calls the CSV log function
  stop(blockCount, minedHash) {
    this.endTime = new Date();
    this.spentTime = (this.endTime - this.startTime) / 1000;
    this.logToCSV(blockCount, minedHash);
  }

  // Logs mining data to a CSV file
  logToCSV(blockCount, minedHash) {
    const directory = path.dirname(this.csvPath);

    // Create the directory if it doesn't exist
    if (!fs.existsSync(directory)) {
      fs.mkdirSync(directory, { recursive: true });
    }

    const fileExists = fs.existsSync(this.csvPath);
    const headers =
      "Start Time (ISO),End Time (ISO),Spent Time (seconds),Block Count,Mined Hash\n";

    if (fileExists) {
      const data = fs.readFileSync(this.csvPath, "utf-8");
      const lines = data.split("\n");
      const firstLine = lines[0].trim();

      if (firstLine !== headers.trim()) {
        fs.writeFileSync(this.csvPath, headers + data);
      }
    }

    const logData = `${this.startTime.toISOString()},${this.endTime.toISOString()},${this.spentTime},${blockCount},${minedHash}\n`;

    if (!fileExists) {
      fs.writeFileSync(this.csvPath, headers + logData);
    } else {
      fs.appendFileSync(this.csvPath, logData);
    }
  }
}

// Initialize a new chain instance
const chain = new Chain();

// Generate key pairs for sender and receiver
const keyPairSender = ec.genKeyPair();
const privateKeySender = keyPairSender.getPrivate("hex");
const publicKeySender = keyPairSender.getPublic("hex");

const keyPairReceiver = ec.genKeyPair();
const privateKeyReceiver = keyPairReceiver.getPrivate("hex");
const publicKeyReceiver = keyPairReceiver.getPublic("hex");

// ---- Initial Mining to Fund Sender Wallet ----
console.log(
  `\n${colors.yellow}Mining initial block to fund sender wallet...${colors.reset}`
);
// Mine the first block and reward the sender
chain.mineTransactionPool(publicKeySender);
console.log(
  `${colors.green}Sender wallet funded. Current balance: ${chain.getBalanceOfAddress(publicKeySender)}${colors.reset}\n`
);
// ---- End Initial Mining ----

// Create a new transaction, sign it, and display validation result
const t1 = new Transaction(publicKeySender, publicKeyReceiver, 1);
t1.sign(keyPairSender);

console.log(`${colors.green}Transaction details:${colors.reset}`, t1);
console.log(
  `${colors.green}Is the transaction valid?${colors.reset}`,
  t1.isValid()
);

// Add the transaction to the pool and mine it
chain.addTransaction(t1);
chain.mineTransactionPool(publicKeyReceiver);

// Display transactions in the newest block
console.log(
  `${colors.cyan}Transactions in the latest block:${colors.reset}`,
  chain.chain[chain.chain.length - 1].transactions
);

// Initialize and work with the database through the manager
const dbManager = new DatabaseManager(path.join(__dirname, "mydatabase.db"));

dbManager
  .initialize()
  .then(() => {
    return dbManager.createRecord("Hello blockchain database");
  })
  .then((id) => {
    console.log("Inserted record with ID:", id);
    return dbManager.readRecord(id);
  })
  .then((row) => {
    console.log("Read record:", row);
    return dbManager.updateRecord(row.id, "Updated data value");
  })
  .then((changes) => {
    console.log("Number of rows updated:", changes);
  })
  .then((changes) => {
    if (typeof changes !== "undefined") {
      console.log("Number of rows deleted:", changes);
    }
    dbManager.close();
  })
  .catch((error) => {
    console.error("Database error:", error);
  });
