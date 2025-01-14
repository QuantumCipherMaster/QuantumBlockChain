const sqlite3 = require("sqlite3").verbose();

class DatabaseManager {
  constructor(dbPath = "mydatabase.db") {
    this.db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error("Could not open database", err);
      } else {
        console.log("Connected to SQLite database.");
      }
    });
  }

  // In db.js
  initialize() {
    return new Promise((resolve, reject) => {
      const sqlCreate = `
      CREATE TABLE IF NOT EXISTS records (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        data TEXT NOT NULL,
        createdAt TEXT NOT NULL
      )
    `;
      this.db.run(sqlCreate, (err) => {
        if (err) {
          console.error("Could not create table", err);
          reject(err);
        } else {
          console.log("Table initialized successfully.");
          resolve();
        }
      });
    });
  }

  createRecord(data) {
    return new Promise((resolve, reject) => {
      const timestamp = new Date().toISOString();
      // biome-ignore lint/style/noUnusedTemplateLiteral: <explanation>
      const sqlInsert = `INSERT INTO records (data, createdAt) VALUES (?, ?)`;
      this.db.run(sqlInsert, [data, timestamp], function (err) {
        if (err) {
          return reject(err);
        }
        resolve(this.lastID);
      });
    });
  }

  readRecord(id) {
    return new Promise((resolve, reject) => {
      // biome-ignore lint/style/noUnusedTemplateLiteral: <explanation>
      const sqlSelect = `SELECT * FROM records WHERE id = ?`;
      this.db.get(sqlSelect, [id], (err, row) => {
        if (err) {
          return reject(err);
        }
        resolve(row);
      });
    });
  }

  updateRecord(id, newData) {
    return new Promise((resolve, reject) => {
      // biome-ignore lint/style/noUnusedTemplateLiteral: <explanation>
      const sqlUpdate = `UPDATE records SET data = ? WHERE id = ?`;
      this.db.run(sqlUpdate, [newData, id], function (err) {
        if (err) {
          return reject(err);
        }
        resolve(this.changes);
      });
    });
  }

  deleteRecord(id) {
    return new Promise((resolve, reject) => {
      // biome-ignore lint/style/noUnusedTemplateLiteral: <explanation>
      const sqlDelete = `DELETE FROM records WHERE id = ?`;
      this.db.run(sqlDelete, [id], function (err) {
        if (err) {
          return reject(err);
        }
        resolve(this.changes);
      });
    });
  }

  close() {
    this.db.close((err) => {
      if (err) {
        console.error("Error closing the database", err);
      } else {
        console.log("Closed the database connection.");
      }
    });
  }
}

module.exports = DatabaseManager;
