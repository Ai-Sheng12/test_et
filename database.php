<?php
define('DB_HOST', 'localhost:3377');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_NAME', 'expense_tracker');

function getDB(): PDO {
    static $pdo = null;
    if ($pdo === null) {
        if (!extension_loaded('pdo_mysql')) {
            throw new RuntimeException('Missing PHP extension: pdo_mysql. Enable extension=pdo_mysql in php.ini, then restart Apache.');
        }

        $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4";
        try {
            $pdo = new PDO($dsn, DB_USER, DB_PASS, [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES   => false,
            ]);
        } catch (PDOException $e) {
            throw new RuntimeException(
                'Database connection failed. Check MySQL is running, credentials in database.php, and that database "expense_tracker2" exists.',
                0,
                $e
            );
        }
    }
    return $pdo;
}
