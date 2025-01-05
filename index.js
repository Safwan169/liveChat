const express = require('express');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = 5000;

// SQLite ডাটাবেস কানেকশন সেটআপ
const dbPath = 'dua_main.sqlite'; // আপনার ডাটাবেসের পাথ
const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
        console.error('ডাটাবেস সংযোগ ব্যর্থ:', err.message);
    } else {
        console.log('ডাটাবেস সংযোগ সফল হয়েছে।');
    }
});

// API তৈরি: ডেটা ফেচ করার জন্য
app.get('/api/categories', (req, res) => {
    const query = 'SELECT * FROM category';
    db.all(query, [], (err, rows) => {
        if (err) {
            console.error('ডেটা ফেচ করার ত্রুটি:', err.message);
            res.status(500).json({ error: 'ডেটা ফেচ করতে সমস্যা হয়েছে।' });
        } else {
            res.status(200).json(rows); // ডেটা JSON ফরম্যাটে পাঠানো হচ্ছে
        }
    });
});

// সার্ভার চালু
app.get("/", (req, res) => {
    res.send(`Yeah baby you are connected`);
  });
  
  app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}`);
  });