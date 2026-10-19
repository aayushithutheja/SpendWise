# SpendWise — Smart Expense Tracker

SpendWise is a simple, responsive expense-tracking web app for students and beginners. Record income and expenses, set a monthly budget, and see spending grouped by category.

## Features

- Add income and expense transactions
- Record a description, amount, category, and date
- Dashboard with balance, income, and expense totals for the current month
- Set a monthly spending budget and track remaining budget
- Category spending breakdown
- Search transactions and filter by type or category
- Delete transactions
- Browser localStorage saves transactions and budget between visits
- Responsive layout for desktop and mobile
- No framework, backend, or paid API needed

## Technology

- HTML5
- CSS3
- Vanilla JavaScript
- Browser `localStorage`

## Run locally

1. Download or clone this repository.
2. Keep `index.html`, `style.css`, and `script.js` in the same folder.
3. Open `index.html` in a browser, or open the folder in VS Code and use Live Server.

## Project structure

```text
SpendWise/
├── index.html
├── style.css
├── script.js
├── README.md
└── LICENSE
```

## How it works

1. The user submits a transaction using the form.
2. JavaScript validates the description and amount.
3. The transaction is added to an array and saved as JSON in localStorage.
4. Dashboard totals are calculated from current-month transactions.
5. Expense totals are grouped by category to show spending patterns.
6. Search and dropdown filters narrow the transaction history.

## Current limitations

- Data is stored only in the browser and device where it was entered.
- This is a learning project, not a banking or accounting service.
- There are no accounts, cloud backup, or automatic bank connections.

## Ideas for future improvements

- Monthly history and date-range filters
- Edit existing transactions
- Export transactions to CSV
- Charts using a charting library
- Dark mode
- Optional backend and database for multi-device use

## Learning outcomes

This project practices DOM manipulation, event listeners, form validation, arrays and objects, filtering and sorting, date handling, numeric calculations, and localStorage.

## License

Released under the MIT License. See [LICENSE](LICENSE).
