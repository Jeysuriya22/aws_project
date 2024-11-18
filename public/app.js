import { Amplify } from 'aws-amplify';

// AWS SDK and Amplify configuration
Amplify.configure({
  Auth: {
    region: 'us-east-1', // Your region
    userPoolId: 'us-east-1_8nSK5yK3i', // Your User Pool ID
    userPoolWebClientId: '3rh79ufoi5bjopi76qeobktagf', // Your App Client ID
    authenticationFlowType: 'USER_PASSWORD_AUTH'
  }
});

// Expense tracker variables
let monthlyBudget = 0;
let expenses = [];
let totalExpenses = 0;

// Function to set the monthly budget
function setBudget() {
  const budget = document.getElementById("monthly-budget").value;
  if (budget && budget > 0) {
    monthlyBudget = parseFloat(budget);
    updateSummary();
    alert("Monthly budget set successfully!");
  } else {
    alert("Please enter a valid budget.");
  }
}

// Function to add an expense
function addExpense() {
  const date = document.getElementById("expense-date").value;
  const description = document.getElementById("expense-description").value;
  const amount = parseFloat(document.getElementById("expense-amount").value);

  if (!date || !description || !amount || amount <= 0) {
    alert("Please fill in all fields correctly.");
    return;
  }

  // Add expense to the list
  const expense = { date, description, amount };
  expenses.push(expense);
  totalExpenses += amount;

  // Add to expense list in UI
  const expenseList = document.getElementById("expense-list");
  const expenseItem = document.createElement("li");
  expenseItem.innerHTML = `${expense.date} - ${expense.description} - $${expense.amount.toFixed(2)}`;
  expenseList.appendChild(expenseItem);

  // Save expenses to the backend
  saveExpensesToBackend();

  // Update the summary
  updateSummary();

  // Clear the form fields
  document.getElementById("expense-date").value = "";
  document.getElementById("expense-description").value = "";
  document.getElementById("expense-amount").value = "";
}

// Function to update the summary (total expenses, savings, and remaining budget)
function updateSummary() {
  const remainingBudget = monthlyBudget - totalExpenses;
  const monthlySavings = remainingBudget > 0 ? remainingBudget : 0;

  document.getElementById("total-expenses").textContent = totalExpenses.toFixed(2);
  document.getElementById("remaining-budget").textContent = remainingBudget.toFixed(2);
  document.getElementById("monthly-savings").textContent = monthlySavings.toFixed(2);
}

// Function to save expenses data to the backend
function saveExpensesToBackend() {
  fetch('/api/save-expenses', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(expenses),  // Send expenses array to backend
  })
    .then(response => {
      if (response.ok) {
        console.log('Expenses saved to backend successfully');
      } else {
        console.error('Error saving expenses to backend');
      }
    })
    .catch(err => console.error('Error:', err));
}
