<?php
require_once __DIR__ . '/database.php';

class Budget {

    public static function getAll(): array {
        $stmt = getDB()->query("SELECT * FROM budgets ORDER BY category ASC");
        return $stmt->fetchAll();
    }

    public static function upsert(string $category, float $limit): bool {
        $stmt = getDB()->prepare(
            "INSERT INTO budgets (category, monthly_limit)
             VALUES (:category, :limit)
             ON DUPLICATE KEY UPDATE monthly_limit = :limit2"
        );
        return $stmt->execute([
            ':category' => $category,
            ':limit'    => $limit,
            ':limit2'   => $limit,
        ]);
    }

    public static function delete(string $category): bool {
        $stmt = getDB()->prepare("DELETE FROM budgets WHERE category = ?");
        return $stmt->execute([$category]);
    }

    public static function getWithSpending(string $month): array {
        $stmt = getDB()->prepare(
            "SELECT b.category, b.monthly_limit,
                    COALESCE(SUM(e.amount), 0) AS spent
             FROM budgets b
             LEFT JOIN expenses e
               ON e.category = b.category
              AND DATE_FORMAT(e.date,'%Y-%m') = :month
             GROUP BY b.category, b.monthly_limit
             ORDER BY b.category"
        );
        $stmt->execute([':month' => $month]);
        return $stmt->fetchAll();
    }
}
