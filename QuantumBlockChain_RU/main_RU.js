// Подключаем библиотеку elliptic для ECDSA
const EC = require("elliptic").ec;
// Инициализируем объект для работы с заданной эллиптической кривой secp256k1
const ec = new EC("secp256k1");
// Подключаем библиотеку для функции sha256
const sha256 = require("crypto-js/sha256");
// Подключаем кастомный менеджер базы данных
const DatabaseManager = require("./db");
const fs = require('node:fs');
const path = require('node:path');

// Определяем цвета для вывода в консоль
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
  red: "\x1b[31m"
};

// Класс, представляющий блок в цепочке
class Block {
  // Конструктор блока принимает хеш предыдущего блока и список транзакций
    constructor(previousHash, transactions) {
    this.timestamp = new Date().toISOString();
    this.previousHash = previousHash;
    this.transactions = transactions;
    this.hash = this.calculateHash();
    this.nonce = 1;
  }

  // Функция вычисляет хеш блока
  calculateHash() {
    return sha256(
      this.timestamp +
        this.previousHash +
        JSON.stringify(this.transactions) +
        this.nonce
    ).toString();
  }

  // Генератор целевой строки для проверки сложности (difficulty)
  getAnswer(difficulty) {
    let answer = "";
    for (let i = 0; i < difficulty; i++) {
      answer += "0";
    }
    return answer;
  }

  // Проверка валидности всех транзакций в блоке
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

  // Процесс майнинга блока с учетом заданной сложности
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

// Класс, представляющий блокчейн
class Chain {
  // Конструктор инициализирует цепочку, сложность, пул транзакций и награду
  constructor() {
    this.chain = [this.createGenesisBlock()];
    this.difficulty = 4;
    this.transactionPool = [];
    this.minerReward = 3.125;
  }

  //  Создает генезис-блок (первый блок цепочки)
  createGenesisBlock() {
    return new Block("0", []);
  }

  // Возвращает последний блок в цепочке
  getLatestBlock() {
    return this.chain[this.chain.length - 1];
  }

  // Добавляет транзакцию в пул транзакций
  addTransaction(transaction) {
    this.transactionPool.push(transaction);
  }

  // Создает и добавляет новый блок в цепочку
  addBlock(newBlock) {
    const timer = new MiningTimer();
    newBlock.previousHash = this.getLatestBlock().hash;

    timer.start();
    newBlock.mine(this.difficulty);
    timer.stop(this.chain.length + 1, newBlock.hash);

    this.chain.push(newBlock);
  }

  // Майнит все транзакции в пуле и формирует блок
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

  // Проверка корректности всей цепочки
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

// Класс, представляющий транзакцию
class Transaction {
  // Конструктор транзакции принимает адреса отправителя и получателя, а также сумму
    constructor(fromAddress, toAddress, amount) {
    this.fromAddress = fromAddress;
    this.toAddress = toAddress;
    this.amount = amount;
    this.timestamp = new Date().toUTCString();
  }

  // Считаем хеш для транзакции
  computeHash() {
    return sha256(
      this.fromAddress + this.toAddress + this.amount + this.timestamp
    ).toString();
  }

  // Подписываем транзакцию с помощью приватного ключа
  sign(key) {
    this.signature = key.sign(this.computeHash(), "base64").toDER("hex");
  }

  // Проверяем валидность транзакции
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

// Класс таймера майнинга для замера времени и логирования
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


// Инициализируем новый экземпляр цепочки
const chain = new Chain();

// Генерируем ключевые пары для отправителя и получателя
const keyPairSender = ec.genKeyPair();
const privateKeySender = keyPairSender.getPrivate("hex");
const publicKeySender = keyPairSender.getPublic("hex");

const keyPairReceiver = ec.genKeyPair();
const privateKeyReceiver = keyPairReceiver.getPrivate("hex");
const publicKeyReceiver = keyPairReceiver.getPublic("hex");

// Создаем новую транзакцию, подписываем и выводим результат проверки
const t1 = new Transaction(publicKeySender, publicKeyReceiver, 100);
t1.sign(keyPairSender);

console.log(`${colors.green}Transaction details:${colors.reset}`, t1);
console.log(
  `${colors.green}Is the transaction valid?${colors.reset}`,
  t1.isValid()
);

// Добавляем транзакцию в пул и майним ее
chain.addTransaction(t1);
chain.mineTransactionPool(publicKeyReceiver);

// Отображаем транзакции в последнем добавленном блоке
console.log(
  `${colors.cyan}Transactions in the latest block:${colors.reset}`,
  chain.chain[chain.chain.length - 1].transactions
);

// Инициализируем и работаем с базой данных через менеджер
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

// Тестируем разные уровни сложности для майнинга
console.log(`\n${colors.bright}=== Testing Mining Difficulties ===${colors.reset}\n`);

//  Для разных сложностей запускаем майнинг несколько раз
const testDifficulties = {
  1: 1,
  2: 1,
  3: 1,
  4: 1,
  5: 1
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

    // Временно отключаем вывод консоли во время майнинга
    const originalLog = console.log;
    console.log = () => {};

    testChain.mineTransactionPool(publicKeyReceiver);

    // Восстанавливаем консольный вывод
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