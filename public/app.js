// Fetch expenses from the backend
fetch('/api/expenses')
    .then(response => response.json())
    .then(data => {
        const expenseList = document.getElementById('expense-list');
        data.forEach(expense => {
            const listItem = document.createElement('li');
            listItem.textContent = `${expense.name}: $${expense.amount}`;
            expenseList.appendChild(listItem);
        });
    })
    .catch(error => console.error('Error fetching expenses:', error));
