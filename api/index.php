<?php
header('Content-Type: application/json');
header('X-Content-Type-Options: nosniff');

require_once __DIR__ . '/../expense.php';
require_once __DIR__ . '/../budget.php';

$method = $_SERVER['REQUEST_METHOD'];
$resource = isset($_GET['resource']) ? $_GET['resource'] : '';
$body = json_decode(file_get_contents('php://input'), true);
if (!is_array($body)) {
    $body = [];
}

function respond($data, $status = 200)
{
    http_response_code($status);
    echo json_encode($data);
    exit;
}

function validate($data, $rules)
{
    $errors = [];
    foreach ($rules as $field => $rule) {
        if ($rule === 'required' && empty($data[$field])) {
            $errors[] = $field . ' is required';
        }
    }
    return $errors;
}

try {
    if ($resource === 'expenses') {
        if ($method === 'GET') {
            respond(Expense::getAll([
                'category' => isset($_GET['category']) ? $_GET['category'] : '',
                'month' => isset($_GET['month']) ? $_GET['month'] : '',
                'search' => isset($_GET['search']) ? $_GET['search'] : '',
            ]));
        } elseif ($method === 'POST') {
            $err = validate($body, ['amount' => 'required', 'category' => 'required', 'date' => 'required', 'description' => 'required']);
            if (!empty($err)) {
                respond(['error' => implode(', ', $err)], 422);
            }
            if (!is_numeric($body['amount']) || $body['amount'] <= 0) {
                respond(['error' => 'Amount must be a positive number'], 422);
            }
            $id = Expense::create($body);
            respond(['id' => $id, 'message' => 'Expense added'], 201);
        } elseif ($method === 'PUT') {
            $id = isset($body['id']) ? (int)$body['id'] : 0;
            if (!$id) {
                respond(['error' => 'ID required'], 422);
            }
            $err = validate($body, ['amount' => 'required', 'category' => 'required', 'date' => 'required', 'description' => 'required']);
            if (!empty($err)) {
                respond(['error' => implode(', ', $err)], 422);
            }
            if (!is_numeric($body['amount']) || $body['amount'] <= 0) {
                respond(['error' => 'Amount must be a positive number'], 422);
            }
            Expense::update($id, $body);
            respond(['message' => 'Updated']);
        } elseif ($method === 'DELETE') {
            $id = isset($body['id']) ? (int)$body['id'] : (isset($_GET['id']) ? (int)$_GET['id'] : 0);
            if (!$id) {
                respond(['error' => 'ID required'], 422);
            }
            Expense::delete($id);
            respond(['message' => 'Deleted']);
        } else {
            respond(['error' => 'Method not allowed'], 405);
        }
    } elseif ($resource === 'insights') {
        if ($method !== 'GET') {
            respond(['error' => 'Method not allowed'], 405);
        }
        respond(Expense::getInsights(isset($_GET['month']) ? $_GET['month'] : ''));
    } elseif ($resource === 'categories') {
        if ($method !== 'GET') {
            respond(['error' => 'Method not allowed'], 405);
        }
        respond(Expense::getCategories());
    } elseif ($resource === 'budgets') {
        if ($method === 'GET') {
            respond(Budget::getWithSpending(isset($_GET['month']) ? $_GET['month'] : date('Y-m')));
        } elseif ($method === 'POST') {
            if (empty($body['category']) || !isset($body['monthly_limit']) || !is_numeric($body['monthly_limit'])) {
                respond(['error' => 'Category and limit required'], 422);
            }
            Budget::upsert($body['category'], (float)$body['monthly_limit']);
            respond(['message' => 'Budget saved']);
        } elseif ($method === 'DELETE') {
            if (empty($body['category'])) {
                respond(['error' => 'Category required'], 422);
            }
            Budget::delete($body['category']);
            respond(['message' => 'Budget removed']);
        } else {
            respond(['error' => 'Method not allowed'], 405);
        }
    } else {
        respond(['error' => 'Unknown resource'], 404);
    }
} catch (PDOException $e) {
    respond(['error' => 'Database error'], 500);
} catch (Exception $e) {
    respond(['error' => $e->getMessage()], 500);
}
