// Підключаємо бібліотеку elliptic для ECDSA
const EC = require("elliptic").ec;
// Ініціалізуємо об’єкт для роботи з еліптичною кривою secp256k1
const ec = new EC("secp256k1");
// Підключаємо бібліотеку для функції sha256
const sha256 = require("crypto-js/sha256");
// Підключаємо власний менеджер бази даних
const DatabaseManager = require("./db");
const fs = require('node:fs');
const path = require('node:path');

// Визначаємо кольори для виводу в консоль
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
  red: "\x1b[31m"
};

// Клас, що представляє блок у ланцюгу
class Block {
  // Конструктор блоку приймає хеш попереднього блоку та список транзакцій
  constructor(previousHash, transactions) {
    this.timestamp = new Date().toISOString();
    this.previousHash = previousHash;
    this.transactions = transactions;
    this.hash = this.calculateHash();
    this.nonce = 1;
  }

  // Функція обчислює хеш блоку
  calculateHash() {
    return sha256(
      this.timestamp +
        this.previousHash +
        JSON.stringify(this.transactions) +
        this.nonce
    ).toString();
  }

  // Генератор цільового рядка для перевірки складності (difficulty)
  getAnswer(difficulty) {
    let answer = "";
    for (let i = 0; i < difficulty; i++) {
      answer += "0";
    }
    return answer;
  }

  // Перевірка валідності всіх транзакцій у блоці
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

  // Процес майнінгу блоку з урахуванням заданої складності
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

// Клас, що представляє блокчейн
class Chain {
  // Конструктор ініціалізує ланцюг, складність, пул транзакцій та винагороду
  constructor() {
    this.chain = [this.createGenesisBlock()];
    this.difficulty = 4;
    this.transactionPool = [];
    this.minerReward = 3.125;
  }

  // Створює генезис-блок (перший блок ланцюга)
  createGenesisBlock() {
    return new Block("0", []);
  }

  // Повертає останній блок у ланцюгу
  getLatestBlock() {
    return this.chain[this.chain.length - 1];
  }

  // Додає транзакцію в пул транзакцій
  addTransaction(transaction) {
    this.transactionPool.push(transaction);
  }

  // Створює та додає новий блок у ланцюг
  addBlock(newBlock) {
    const timer = new MiningTimer();
    newBlock.previousHash = this.getLatestBlock().hash;

    timer.start();
    newBlock.mine(this.difficulty);
    timer.stop(this.chain.length + 1, newBlock.hash);

    this.chain.push(newBlock);
  }

  // Майнить усі транзакції у пулі та формує блок
  mineTransactionPool(minerAddress) {
    const timer = new MiningTimer();
    const rewardTransaction = new Transaction("", minerAddress, this.minerReward);
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

  // Перевірка коректності всього ланцюга
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

// Клас, що представляє транзакцію
class Transaction {
  // Конструктор транзакції приймає адреси відправника і одержувача, а також суму
  constructor(fromAddress, toAddress, amount) {
    this.fromAddress = fromAddress;
    this.toAddress = toAddress;
    this.amount = amount;
    this.timestamp = new Date().toUTCString();
  }

  // Розраховуємо хеш для транзакції
  computeHash() {
    return sha256(
      this.fromAddress + this.toAddress + this.amount + this.timestamp
    ).toString();
  }

  // Підписуємо транзакцію за допомогою приватного ключа
  sign(key) {
    this.signature = key.sign(this.computeHash(), "base64").toDER("hex");
  }

  // Перевіряємо валідність транзакції
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

// Клас таймера майнінгу для вимірювання часу та логування
class MiningTimer {
  constructor() {
    this.csvPath = path.join(__dirname, 'mining_logs.csv'); 
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
    const headers = "Start Time (ISO),End Time (ISO),Spent Time (seconds),Block Count,Mined Hash\n";

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


// Ініціалізуємо новий екземпляр ланцюга
const chain = new Chain();

// Генеруємо ключові пари для відправника та одержувача
const keyPairSender = ec.genKeyPair();
const privateKeySender = keyPairSender.getPrivate("hex");
const publicKeySender = keyPairSender.getPublic("hex");

const keyPairReceiver = ec.genKeyPair();
const privateKeyReceiver = keyPairReceiver.getPrivate("hex");
const publicKeyReceiver = keyPairReceiver.getPublic("hex");

// Створюємо нову транзакцію, підписуємо та виводимо результат перевірки
const t1 = new Transaction(publicKeySender, publicKeyReceiver, 100);
t1.sign(keyPairSender);

console.log(`${colors.green}Transaction details:${colors.reset}`, t1);
console.log(
  `${colors.green}Is the transaction valid?${colors.reset}`,
  t1.isValid()
);

// Додаємо транзакцію в пул та майнимо її
chain.addTransaction(t1);
chain.mineTransactionPool(publicKeyReceiver);

// Відображаємо транзакції в останньому доданому блоці
console.log(
  `${colors.cyan}Transactions in the latest block:${colors.reset}`,
  chain.chain[chain.chain.length - 1].transactions
);

// Ініціалізуємо та працюємо з базою даних через менеджер
const dbManager = new DatabaseManager("QuantumBlockChain_RU/mydatabase.db");

dbManager.initialize()
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
    // Если хотите сохранить данные — закомментируйте следующую строку
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
  
// Тестуємо різні рівні складності для майнінгу
console.log(`\n${colors.bright}=== Testing Mining Difficulties ===${colors.reset}\n`);

// Для різних складностей запускаємо майнінг кілька разів
const testDifficulties = {
  1: 10,
  2: 8,
  3: 6,
  4: 4,
  5: 4
  // Для сложности >= 6 майнинг может быть очень долгим
  // Для персонального компьютера это часто слишком большое время
};

function testMining(difficulty) {
  try {
    const startTime = Date.now();

    const testTransaction = new Transaction(publicKeySender, publicKeyReceiver, 100);
    testTransaction.sign(keyPairSender);

    const testChain = new Chain();
    testChain.difficulty = difficulty;
    testChain.addTransaction(testTransaction);

    // Тимчасово відключаємо вивід консолі під час майнінгу
    const originalLog = console.log;
    console.log = () => {};

    testChain.mineTransactionPool(publicKeyReceiver);

    // Відновлюємо вивід в консоль
    console.log = originalLog;

    const endTime = Date.now();
    return endTime - startTime;
  } catch (error) {
    console.error(`${colors.red}Error testing difficulty ${difficulty}:${colors.reset}`, error);
    return null;
  }
}

console.log(`${colors.cyan}Difficulty | Time (ms) | Transactions/sec${colors.reset}`);
console.log(`${colors.cyan}-----------|-----------|-----------------${colors.reset}`);

for (const [difficulty, iterations] of Object.entries(testDifficulties)) {
  const timeElapsed = testMining(Number.parseInt(difficulty));

  if (timeElapsed !== null) {
    const transPerSec = (1000 / timeElapsed).toFixed(2);
    console.log(
      `${colors.yellow}${difficulty.padStart(10)}${colors.reset} | ` +
      `${colors.green}${timeElapsed.toString().padStart(9)}${colors.reset} | ` +
      `${colors.blue}${transPerSec.padStart(15)}${colors.reset}`
    );
  }
}