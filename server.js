const express = require('express');
const path = require('path');
const AWS = require('aws-sdk');
const bodyParser = require('body-parser');
const uuid = require('uuid');  // To generate unique file names

const app = express();
const port = process.env.PORT || 3000;

// AWS S3 and SNS configuration
AWS.config.update({
  region: 'us-east-1', // Replace with your AWS region
});

const s3 = new AWS.S3();  // S3 client
const sns = new AWS.SNS(); // SNS client

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

// API route to save expenses to S3 and send SNS notification
app.post('/api/save-expenses', (req, res) => {
  const expenses = req.body;

  if (!expenses || !Array.isArray(expenses)) {
    return res.status(400).send('Invalid expenses data');
  }

  const bucketName = 'my-expense-tracker'; // Name of your S3 bucket
  const fileName = `expenses-${uuid.v4()}.json`; // Generate unique file name

  // Create an object with all expenses
  const expensesData = JSON.stringify(expenses);

  // S3 upload params
  const params = {
    Bucket: bucketName,
    Key: fileName,
    Body: expensesData,
    ContentType: 'application/json', // Specify content type as JSON
  };

  // Upload to S3
  s3.upload(params, (err, data) => {
    if (err) {
      console.error('Error uploading expenses to S3:', err);
      return res.status(500).send('Error saving expenses');
    }

    console.log('Expenses saved to S3 successfully:', data);

    // Send SNS notification after successfully uploading to S3
    const snsParams = {
      Message: `New expenses file has been uploaded to S3: ${data.Location}`, // Message body
      TopicArn: 'arn:aws:sns:us-east-1:123456789012:ExpenseTrackerNotification', // Replace with your SNS Topic ARN
    };

    sns.publish(snsParams, (snsErr, snsData) => {
      if (snsErr) {
        console.error('Error sending SNS notification:', snsErr);
      } else {
        console.log('SNS notification sent:', snsData);
      }
    });

    res.status(200).send('Expenses saved to S3 and SNS notification sent successfully');
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
