const express = require('express');
const path = require('path');
const AWS = require('aws-sdk');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT || 3000;

// AWS DynamoDB configuration
AWS.config.update({
  region: 'us-east-1',
  accessKeyId: 'AKIAST6S7CZ3H5UYUBL5', // Replace with your AWS access key ID
  secretAccessKey: 'Rk4BwvcbICasICcGheDVzmL/VL9w53h2KR5LHeP8', // Replace with your AWS secret access key
});

const dynamoDB = new AWS.DynamoDB.DocumentClient(); // Create DynamoDB client

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());

// API route to get static expenses (for demonstration purposes)
app.get('/api/expenses', (req, res) => {
  const expenses = [
    { id: 1, name: 'Food', amount: 100 },
    { id: 2, name: 'Transport', amount: 50 },
    { id: 3, name: 'Entertainment', amount: 150 },
    { id: 4, name: 'Utilities', amount: 75 },
  ];
  res.json(expenses);
});

// API route to save expenses to DynamoDB
app.post('/api/save-expenses', (req, res) => {
  const expenses = req.body;

  if (!expenses || !Array.isArray(expenses)) {
    return res.status(400).send('Invalid expenses data');
  }

  // Loop through each expense and save it to DynamoDB
  const tableName = 'Expenses'; // Replace with your DynamoDB table name
  const promises = expenses.map(expense => {
    const params = {
      TableName: Expenses,
      Item: {
        id: `${new Date().toISOString()}-${expense.description}`, // Unique ID for each expense
        date: expense.date,
        description: expense.description,
        amount: expense.amount,
      },
    };

    return dynamoDB.put(params).promise(); // PutItem request
  });

  // Run all put operations concurrently
  Promise.all(promises)
    .then(() => {
      console.log('Expenses saved to DynamoDB successfully');
      res.status(200).send('Expenses saved to DynamoDB successfully');
    })
    .catch(err => {
      console.error('Error saving expenses to DynamoDB:', err);
      res.status(500).send('Error saving expenses');
    });
});

// Handle all other routes by serving index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
app.listen(port, () => {
  console.log(`Expense Tracker app listening at http://localhost:${port}`);
});
