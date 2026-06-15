# Smart Expense Tracker

A simple PHP + MySQL expense tracker, with a clean frontend dashboard for:
- adding and managing expenses,
- setting monthly category budgets,
- viewing insights/charts,
- exporting transactions to CSV.

## Tech Stack

- Frontend: Vanilla JavaScript, HTML, CSS, Chart.js
- Backend: PHP (REST-style API)
- Database: MySQL (via PDO)
- Local environment: XAMPP (Apache + MySQL)

## Project Structure

- `index.php` - main UI page
- `app.js` - frontend logic and API integration
- `app.css` - styles
- `api/index.php` - API router/controller
- `Expense.php` - expense data operations
- `Budget.php` - budget data operations
- `database.php` - DB connection config
- `setup.sql` - DB schema + sample data

## Prerequisites

- XAMPP installed
- Apache running
- MySQL running
- PHP PDO MySQL extension enabled (`pdo_mysql`)

## Setup Instructions

1. Place project in your XAMPP web root:
   - `c:\xampp\htdocs\expense_tracker2`

2. Configure database credentials in `database.php`:
   - `DB_HOST` (default: `localhost`)
   - `DB_USER` (default XAMPP: `root`)
   - `DB_PASS` (default XAMPP: empty string)
   - `DB_NAME` (default: `expense_tracker2`)

3. Create the database and tables:
   - Open phpMyAdmin
   - Import `setup.sql`

4. Ensure PHP extensions are enabled in Apache `php.ini`:
   - `extension=pdo_mysql`
   - `extension=mysqli` (recommended)

5. Restart Apache (and MySQL) after changing `php.ini`.

6. Open app in browser:
   - `http://localhost/expense_tracker2/`

## API Endpoints

Base URL:
- `http://localhost/expense_tracker2/api/index.php`

Query parameter:
- `resource` is required

