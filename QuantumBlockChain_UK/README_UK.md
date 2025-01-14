# QuantumBlockChian
[![English](https://img.shields.io/badge/Language-English-brightgreen)](https://github.com/QuantumCipherMaster/QuantumBlockChain/QuantumBlockChain_EN/README_EN.md)
[![Русский](https://img.shields.io/badge/Язык-Русский-blue)](https://github.com/QuantumCipherMaster/QuantumBlockChain/QuantumBlockChain_RU/README_RU.md)
[![Українська](https://img.shields.io/badge/Мова-Українська-yellow)](https://github.com/QuantumCipherMaster/QuantumBlockChain/QuantumBlockChain_UK/README_UK.md)
## Зміст
- [QuantumBlockChian](#quantumblockchian)
  - [Зміст](#зміст)
  - [Огляд](#огляд)
  - [Запуск на вашому пристрої](#запуск-на-вашому-пристрої)
    - [Для Linux / MacOS](#для-linux--macos)
    - [Для Windows PowerShell](#для-windows-powershell)
  - [Структура класів](#структура-класів)
    - [Block](#block)
    - [Chain](#chain)
    - [Transaction](#transaction)
    - [MiningTimer](#miningtimer)
  - [Використання](#використання)
  - [Логування](#логування)
  - [Тестування](#тестування)
- [Висновок](#висновок)

---

## Огляд

Цей документ надає пояснення простої реалізації блокчейну на JavaScript. Блокчейн складається з блоків, які зберігають транзакції та пов'язані між собою для утворення ланцюга. Кожен блок містить часову позначку, посилання на хеш попереднього блоку, список транзакцій, власний хеш та nonce, що використовується для майнінгу.

---

## Запуск на вашому пристрої
### Для Linux / MacOS
```zsh
git clone https://github.com/QuantumCipherMaster/QuantumBlockChain
cd QuantumBlockChain/QuantumBlockChain_UK
npm install
npm start
```

### Для Windows PowerShell
```powershell
git clone https://github.com/QuantumCipherMaster/QuantumBlockChain
cd QuantumBlockChain\QuantumBlockChain_UK
npm install
npm start
```

## Структура класів

### Block

Представляє один блок у блокчейні.

**Властивості:**
- `timestamp` (string): Час створення блоку у форматі ISO.
- `previousHash` (string): Хеш попереднього блоку в ланцюзі.
- `transactions` (array): Масив об'єктів транзакцій, включених до блоку.
- `hash` (string): Хеш поточного блоку.
- `nonce` (number): Число, що використовується для зміни хешу блоку під час майнінгу.

**Методи:**
- `constructor(previousHash, transactions)`: Ініціалізує новий блок з заданим хешем попереднього блоку та транзакціями.
- `calculateHash()`: Обчислює хеш блоку на основі його вмісту.
- `getAnswer(difficulty)`: Створює рядок нулів, що відповідає складності майнінгу.
- `addBlock(newBlock)`: Додає новий блок до ланцюга після майнінгу.
- `validateBlockTransactions()`: Перевіряє валідність всіх транзакцій у блоці.
- `mine(difficulty)`: Майнить блок, знаходячи хеш, що відповідає вимогам складності.

### Chain

Представляє блокчейн, керуючи послідовністю блоків і транзакцій.

**Властивості:**
- `chain` (array): Масив блоків у блокчейні.
- `difficulty` (number): Рівень складності для майнінгу нових блоків.
- `transactionPool` (array): Пул очікуючих транзакцій, які будуть включені до наступного блоку.
- `minerReward` (number): Винагорода, що надається майнеру за успішний майнінг блоку.

**Методи:**
- `constructor()`: Ініціалізує блокчейн з генезисним блоком.
- `createGenesisBlock()`: Створює перший блок у ланцюзі без попереднього хешу.
- `getLatestBlock()`: Отримує найостанніший блок у ланцюзі.
- `addTransaction(transaction)`: Додає нову транзакцію до пулу транзакцій.
- `addBlock(newBlock)`: Додає видобутий блок до ланцюга та записує час майнінгу.
- `mineTransactionPool(minerAddress)`: Майнить усі транзакції в пулі, винагороджує майнера та додає новий блок до ланцюга.
- `verification()`: Перевіряє цілісність всього блокчейну.

### Transaction

Представляє транзакцію між двома адресами.

**Властивості:**
- `fromAddress` (string): Публічна адреса відправника.
- `toAddress` (string): Публічна адреса отримувача.
- `amount` (number): Сума для переказу.
- `timestamp` (string): Час створення транзакції.

**Методи:**
- `constructor(fromAddress, toAddress, amount)`: Ініціалізує нову транзакцію.
- `computeHash()`: Обчислює хеш транзакції.
- `sign(key)`: Підписує транзакцію приватним ключем відправника.
- `isValid()`: Перевіряє, чи є транзакція валідною, перевіряючи підпис.

### MiningTimer

Обробляє хронометраж та логування процесу майнінгу.

**Властивості:**
- `startTime` (Date): Час початку майнінгу.
- `endTime` (Date): Час закінчення майнінгу.
- `spentTime` (number): Час, витрачений на майнінг, у секундах.
- `csvPath` (string): Шлях до файлу для логування даних майнінгу.

**Методи:**
- `constructor()`: Ініціалізує таймер майнінгу.
- `start()`: Записує час початку.
- `stop(blockCount, minedHash)`: Записує час закінчення, обчислює витрачений час і записує дані.
- `logToCSV(blockCount, minedHash)`: Записує деталі майнінгу в CSV-файл.

---

## Використання

1. **Ініціалізуйте блокчейн:**
   ```javascript
   const chain = new Chain();
   ```

2. **Згенеруйте пари ключів:**
   ```javascript
   const keyPairSender = ec.genKeyPair();
   const privateKeySender = keyPairSender.getPrivate("hex");
   const publicKeySender = keyPairSender.getPublic("hex");

   const keyPairReceiver = ec.genKeyPair();
   const privateKeyReceiver = keyPairReceiver.getPrivate("hex");
   const publicKeyReceiver = keyPairReceiver.getPublic("hex");
   ```

3. **Створіть і підпишіть транзакцію:**
   ```javascript
   const t1 = new Transaction(publicKeySender, publicKeyReceiver, 100);
   t1.sign(keyPairSender);
   ```

4. **Додайте транзакцію до пулу:**
   ```javascript
   chain.addTransaction(t1);
   ```

5. **Видобудьте пул транзакцій:**
   ```javascript
   chain.mineTransactionPool(publicKeyReceiver);
   ```

6. **Перевірте блокчейн:**
   ```javascript
   chain.verification();
   ```

---
## Логування

Клас `MiningTimer` записує деталі майнінгу в CSV-файл, розташований за адресою `./mining_logs.csv`. Кожен запис включає:

- **Час початку (ISO):** Коли майнінг почався.
- **Час закінчення (ISO):** Коли майнінг закінчився.
- **Витрачений час (секунди):** Тривалість майнінгу.
- **Кількість блоків:** Номер видобутого блоку.
- **Видобутий хеш:** Хеш видобутого блоку.

Якщо CSV-файлу не існує, він створюється з відповідними заголовками. Наступні записи додаються до файлу.

---

## Тестування

Скрипт містить розділ тестування, який вимірює продуктивність майнінгу на різних рівнях складності. Він налаштовує складність і записує час, необхідний для видобутку блоку, обчислюючи кількість транзакцій за секунду.

**Етапи тестування:**

1. **Визначте складності тестування:**
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

2. **Функція тестування майнінгу:**
   ```javascript
   function testMining(difficulty) {
     // Реалізація функції
   }
   ```

3. **Відображення результатів:**
   ```javascript
   console.log(colors.cyan + "Складність | Час (мс) | Транзакцій/сек" + colors.reset);
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
   
   console.log("\n" + colors.bright + "Тестування завершено!" + colors.reset + "\n");
   ```

Тест виводить таблицю, яка показує рівень складності, час, витрачений у мілісекундах, та кількість транзакцій, оброблених за секунду.

---

# Висновок

Ця реалізація блокчейну забезпечує фундаментальну структуру для розуміння того, як блоки, ланцюги, транзакції та майнінг працюють разом для формування захищеного та перевіреного реєстру. Додані коментарі та документація мають на меті прояснити роль і функціональність кожного компонента, роблячи його доступним для студентів, що вивчають комп'ютерні науки, та розробників, зацікавлених у технології блокчейн.