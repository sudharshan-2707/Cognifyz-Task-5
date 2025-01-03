const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
const port = 3000;

// CORS setup
const corsOptions = {
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true,
    optionSuccessStatus: 200,
};
app.use(cors(corsOptions));

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// MySQL database connection
const db = mysql.createConnection({
    host: 'localhost', 
    user: 'root',      
    password: '123@456', 
    database: 'feedbackdB',   
});

db.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        process.exit(1); // Exit if unable to connect
    }
    console.log('Connected to MySQL database');
});

// Ensure Feedback table exists
const createTableQuery = `
    CREATE TABLE IF NOT EXISTS Feedback (
        feedbackId INT AUTO_INCREMENT PRIMARY KEY,
        fullName VARCHAR(255) NOT NULL,
        content TEXT NOT NULL
    )
`;
db.query(createTableQuery, (err, result) => {
    if (err) throw err;
    console.log('Feedback table ensured in database');
});

// Handle form submissions
app.post('/', (req, res) => {
    const { feedbackId, fullName, content } = req.body;

    if (!feedbackId || !fullName || !content) {
        return res.status(400).json({ error: 'Full Name, Content, and Feedback ID are required' });
    }

    const insertQuery = 'INSERT INTO Feedback (feedbackId, fullName, content) VALUES (?, ?, ?)';
    db.query(insertQuery, [feedbackId, fullName, content], (err, result) => {
        if (err) {
            console.error('Error inserting feedback:', err);
            return res.status(500).json({ error: 'Failed to save feedback' });
        }

        const selectQuery = 'SELECT * FROM Feedback WHERE feedbackId = ?';
        db.query(selectQuery, [result.insertId], (err, rows) => {
            if (err) {
                console.error('Error retrieving feedback:', err);
                return res.status(500).json({ error: 'Failed to retrieve feedback' });
            }

            return res.status(201).json({ "created feedback": rows[0] });
        });
    });
});

// GET endpoint to fetch all feedback entries
app.get('/api/feedbackCollection', (req, res) => {
    const selectAllQuery = 'SELECT * FROM Feedback';
    db.query(selectAllQuery, (err, rows) => {
        if (err) {
            console.error('Error fetching feedback:', err);
            return res.status(500).json({ error: 'Failed to fetch feedback' });
        }

        res.status(200).json(rows);
    });
});

// Start server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
