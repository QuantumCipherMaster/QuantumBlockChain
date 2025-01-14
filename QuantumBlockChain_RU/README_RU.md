# QuantumBlockChian
[![English](https://img.shields.io/badge/Language-English-brightgreen)](https://github.com/QuantumCipherMaster/QuantumBlockChain/QuantumBlockChain_EN/README_EN.md)
[![Русский](https://img.shields.io/badge/Язык-Русский-blue)](https://github.com/QuantumCipherMaster/QuantumBlockChain/blob/main/QuantumBlockChain_RU/README_RU.md)
[![Українська](https://img.shields.io/badge/Мова-Українська-yellow)](https://github.com/QuantumCipherMaster/QuantumBlockChain/blob/main/QuantumBlockChain_UK/README_UK.md)
## Содержание
- [QuantumBlockChian](#quantumblockchian)
  - [Содержание](#содержание)
  - [Обзор](#обзор)
  - [Запуск на вашем устройстве](#запуск-на-вашем-устройстве)
    - [Для Linux / MacOS](#для-linux--macos)
    - [Для Windows PowerShell](#для-windows-powershell)
  - [Дизайн Классов](#дизайн-классов)
    - [Блок](#блок)
    - [Цепочка](#цепочка)
    - [Транзакция](#транзакция)
    - [Таймер Майнинга](#таймер-майнинга)
  - [Использование](#использование)
  - [Логирование](#логирование)
  - [Тестирование](#тестирование)
- [Заключение](#заключение)

---

## Обзор

Этот документ предоставляет объяснение простой реализации блокчейна на JavaScript. Блокчейн состоит из блоков, которые хранят транзакции и связаны вместе, образуя цепь. Каждый блок содержит метку времени, ссылку на хэш предыдущего блока, список транзакций, собственный хэш и nonce, используемый для майнинга.

---

## Запуск на вашем устройстве
### Для Linux / MacOS
```zsh
git clone https://github.com/QuantumCipherMaster/QuantumBlockChain
cd QuantumBlockChain/QuantumBlockChain_RU
npm install
npm start
```

### Для Windows PowerShell
```powershell
git clone https://github.com/QuantumCipherMaster/QuantumBlockChain
cd QuantumBlockChain\QuantumBlockChain_RU
npm install
npm start
```

## Дизайн Классов

### Блок

Представляет собой один блок в блокчейне.

**Свойства:**
- `timestamp` (string): Время создания блока в формате ISO.
- `previousHash` (string): Хэш предыдущего блока в цепи.
- `transactions` (array): Массив объектов транзакций, включенных в блок.
- `hash` (string): Хэш текущего блока.
- `nonce` (number): Число, используемое для изменения хэша блока во время майнинга.

**Методы:**
- `constructor(previousHash, transactions)`: Инициализирует новый блок с заданным хэшем предыдущего блока и транзакциями.
- `calculateHash()`: Вычисляет хэш блока на основе его содержимого.
- `getAnswer(difficulty)`: Генерирует строку нулей, соответствующих сложности майнинга.
- `addBlock(newBlock)`: Добавляет новый блок в цепь после майнинга.
- `validateBlockTransactions()`: Проверяет валидность всех транзакций в блоке.
- `mine(difficulty)`: Майнит блок, находя хэш, который соответствует требованию сложности.

### Цепочка

Представляет собой блокчейн, управляя последовательностью блоков и транзакций.

**Свойства:**
- `chain` (array): Массив блоков в блокчейне.
- `difficulty` (number): Уровень сложности для майнинга новых блоков.
- `transactionPool` (array): Пул ожидающих транзакций, которые будут включены в следующий блок.
- `minerReward` (number): Вознаграждение, выдаваемое майнеру за успешный майнинг блока.

**Методы:**
- `constructor()`: Инициализирует блокчейн с генезис-блоком.
- `createGenesisBlock()`: Создает первый блок в цепи без предыдущего хэша.
- `getLatestBlock()`: Извлекает самый последний блок в цепи.
- `addTransaction(transaction)`: Добавляет новую транзакцию в пул транзакций.
- `addBlock(newBlock)`: Добавляет добытый блок в цепь и записывает время майнинга.
- `mineTransactionPool(minerAddress)`: Майнит все транзакции в пуле, вознаграждает майнера и добавляет новый блок в цепь.
- `verification()`: Проверяет целостность всего блокчейна.

### Транзакция

Представляет собой транзакцию между двумя адресами.

**Свойства:**
- `fromAddress` (string): Публичный адрес отправителя.
- `toAddress` (string): Публичный адрес получателя.
- `amount` (number): Сумма для перевода.
- `timestamp` (string): Время создания транзакции.

**Методы:**
- `constructor(fromAddress, toAddress, amount)`: Инициализирует новую транзакцию.
- `computeHash()`: Вычисляет хэш транзакции.
- `sign(key)`: Подписывает транзакцию закрытым ключом отправителя.
- `isValid()`: Проверяет, является ли транзакция действительной, путем проверки подписи.

### Таймер Майнинга

Обрабатывает тайминг и логирование процесса майнинга.

**Свойства:**
- `startTime` (Date): Время начала майнинга.
- `endTime` (Date): Время окончания майнинга.
- `spentTime` (number): Время, затраченное на майнинг, в секундах.
- `csvPath` (string): Путь к файлу для логирования данных майнинга.

**Методы:**
- `constructor()`: Инициализирует таймер майнинга.
- `start()`: Записывает время начала.
- `stop(blockCount, minedHash)`: Записывает время окончания, вычисляет затраченное время и логирует данные.
- `logToCSV(blockCount, minedHash)`: Записывает детали майнинга в CSV-файл.

---

## Использование

1. **Инициализация блокчейна:**
   ```javascript
   const chain = new Chain();
   ```

2. **Генерация пар ключей:**
   ```javascript
   const keyPairSender = ec.genKeyPair();
   const privateKeySender = keyPairSender.getPrivate("hex");
   const publicKeySender = keyPairSender.getPublic("hex");

   const keyPairReceiver = ec.genKeyPair();
   const privateKeyReceiver = keyPairReceiver.getPrivate("hex");
   const publicKeyReceiver = keyPairReceiver.getPublic("hex");
   ```

3. **Создание и подпись транзакции:**
   ```javascript
   const t1 = new Transaction(publicKeySender, publicKeyReceiver, 100);
   t1.sign(keyPairSender);
   ```

4. **Добавление транзакции в пул:**
   ```javascript
   chain.addTransaction(t1);
   ```

5. **Майнинг пула транзакций:**
   ```javascript
   chain.mineTransactionPool(publicKeyReceiver);
   ```

6. **Верификация блокчейна:**
   ```javascript
   chain.verification();
   ```

---
## Логирование

Класс `MiningTimer` логирует детали майнинга в CSV-файл, расположенный по адресу `./mining_logs.csv`. Каждая запись включает:

- **Время начала (ISO):** Когда начался майнинг.
- **Время окончания (ISO):** Когда закончился майнинг.
- **Затраченное время (секунды):** Длительность майнинга.
- **Счетчик блоков:** Номер добытого блока.
- **Добытый хэш:** Хэш добытого блока.

Если CSV-файл не существует, он создается с соответствующими заголовками. Последующие записи добавляются в файл.

---

## Тестирование

Скрипт включает раздел тестирования, который измеряет производительность майнинга на различных уровнях сложности. Он регулирует сложность и записывает время, затраченное на майнинг блока, вычисляя количество транзакций в секунду.

**Этапы тестирования:**

1. **Определение тестовых сложностей:**
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

2. **Функция тестирования майнинга:**
   ```javascript
   function testMining(difficulty) {
     // Реализация функции
   }
   ```

3. **Отображение результатов:**
   ```javascript
   console.log(colors.cyan + "Сложность | Время (мс) | Транзакций/сек" + colors.reset);
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
   
   console.log("\n" + colors.bright + "Тест завершен!" + colors.reset + "\n");
   ```

Тест выводит таблицу, показывающую уровень сложности, время, затраченное в миллисекундах, и количество транзакций, обработанных в секунду.

---

# Заключение

Эта реализация блокчейна обеспечивает базовую структуру для понимания того, как блоки, цепи, транзакции и майнинг работают вместе, формируя безопасный и проверяемый реестр. Добавленные комментарии и документация предназначены для разъяснения роли и функциональности каждого компонента, делая его доступным для студентов-информатиков и разработчиков, интересующихся технологией блокчейн.