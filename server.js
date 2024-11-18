const express = require('express');
const path = require('path');
const AWS = require('aws-sdk');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT || 3000;

// AWS DynamoDB configuration
AWS.config.update({
  region: 'us-east-1', // Replace with your AWS region
});

const dynamoDB = new AWS.DynamoDB.DocumentClient();  // Using DocumentClient to interact with DynamoDB

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

  const tableName = 'ExpenseTracker'; // Name of your DynamoDB table

  // Iterate over the expenses and store them in DynamoDB
  const promises = expenses.map((expense) => {
    const params = {
      TableName: tableName,
      Item: {
        ExpenseId: ${new Date().getTime()}-${Math.floor(Math.random() * 1000)}, // Generate unique ID
        Date: expense.date,
        Description: expense.description,
        Amount: expense.amount,
      },
    };

    // Insert each expense into DynamoDB
    return dynamoDB.put(params).promise();
  });

  // Execute all the put requests simultaneously
  Promise.all(promises)
    .then(() => {
      console.log('Expenses saved to DynamoDB successfully');
      res.status(200).send('Expenses saved to DynamoDB successfully');
    })
    .catch((err) => {
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
  console.log(Expense Tracker app listening at http://localhost:${port});
});
