import { sharpConfig } from './config.js';

import express from 'express';
import fs from 'fs';
import httpServer from 'http';
import sqlite3 from 'sqlite3';
sqlite3.verbose();

const dbPath = "./public/db/main.db";
const db = new sqlite3.Database(dbPath);

import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const expressApp = express();
const serverPort = 3003;

const __dirname = dirname(fileURLToPath(import.meta.url));

httpServer.createServer(expressApp);

expressApp.use(express.urlencoded({ extended: true }));
expressApp.use(express.static(join(__dirname, 'public'), { extensions: ['html'] }));
expressApp.use(express.json());

expressApp.get('/', (req, res) => {
  const filePath = join(__dirname, 'public');
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading HTML file:', err);
      res.status(500).send('Error reading HTML file c====3');
      return;
    }
    res.send(data);
  });
});

expressApp.post("/registerUser", (req, res) => {
  const { username, password } = req.body;

  const checkQuery = "SELECT COUNT(*) AS count FROM users WHERE username = ?";
  db.get(checkQuery, [username.toLowerCase()], (err, row) => {
      if (err) {
          return res.send("Ошибка при проверке имени пользователя");
      }

      if (row.count > 0) {
          return res.send("Такое имя пользователя уже занято");
      }

              const insertQuery = "INSERT INTO users (username, password) VALUES (?, ?)";
              db.run(insertQuery, [username.toLowerCase(), password], (err) => {
                  if (err) {
                      return res.send("Ошибка при добавлении пользователя");
                  }

                  console.log("User added successfully");
                  return res.send("Пользователь успешно добавлен");
              });
          })
});

expressApp.post("/login/:username", (req, res) => {
  const username = req.params.username;
  const { password } = req.body;

  const query = "SELECT * FROM users WHERE username = ?";
  db.get(query, [username.toLowerCase()], (err, row) => {
    if (err) {
      return res.json({ success: false, message: "Ошибка сервера" });
    }

    if (!row) {
      return res.json({ success: false, message: "Пользователь не найден" });
    }

const userInfo = {
  username: row.username,
  avatar: row.avatar
}

    if (row.password == password) {
      return res.json({ success: true, message: "Пользователь успешно вошел", userInfo });
    } else {
      return res.json({ success: false, message: "Неправильный пароль" });
    }
  });
});

expressApp.get("/getnotes/:username", (req, res) => {
  const username = req.params.username;

  const query = "SELECT * FROM notes WHERE username = ?";
  db.all(query, [username], (err, rows) => {
      if (err) {
          console.error("Error fetching notes:", err);
          return res.status(500).json({ error: "Internal Server Error" });
      }

      if (rows.length === 0) {
        return res.status(404).json({ message: "No notes found for the username " });
    }
    res.json(rows);
});
});

expressApp.post("/createnote", (req, res) => {
    const { title, name, type } = req.body;

    const checkQuery = "SELECT COUNT(*) AS count FROM notes WHERE title = ? AND username = ? AND type = ?";
    db.get(checkQuery, [title.toLowerCase(), name.toLowerCase(), type], (err, row) => {
        if (err) {
            return res.send("Ошибка при проверке заметок");
        }

        if (row.count > 0) {
            return res.send("Такое название уже существует");
        }

        const insertQuery = "INSERT INTO notes (title, username, type) VALUES (?, ?, ?)";
        db.run(insertQuery, [title.toLowerCase(), name.toLowerCase(), type], (err) => {
            if (err) {
                return res.send("Ошибка при добавлении заметки");
            }

            return res.send("Заметка успешно добавлена");
        });
    })
})

expressApp.delete("/deletenote", (req, res) => {
  const { type, title } = req.body;

  const deleteQuery = "DELETE FROM notes WHERE type = ? AND title = ?";
  db.run(deleteQuery, [type, title], (err) => {
    if (err) {
      console.log("Error deleting note:", err);
      return res.json({ success: false, message: "Error deleting note" });
    }

    console.log("Note deleted successfully");
    return res.json({ success: true, message: "Note deleted successfully" });
  });
});

expressApp.post("/savenote", (req, res) => {
  const { type, title, username, note } = req.body;

  const updateQuery = "UPDATE notes SET text = ? WHERE type = ? AND title = ? AND username = ?";
  db.run(updateQuery, [note, type, title, username], (err) => {

    if (err) {
      console.log("Error updating note:", err);
      return res.json({ error: false, message: "Error updating note" });
    }

    console.log("Note updated successfully");
    return res.json({ success: true, message: "Note updated successfully" });
  });
});

expressApp.get('*', function(req, res){
  res.sendFile(join(__dirname, 'public', 'error.html'));
});

expressApp.listen(serverPort, () =>
  console.log(`App listening on port ${serverPort}!`),
);