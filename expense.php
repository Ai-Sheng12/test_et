<?php
require_once __DIR__ . '/database.php';

class Expense {

    public static function getAll(array $filters = []): array {
        $db  = getDB();
        $sql = "SELECT * FROM expenses WHERE 1=1";
        $params = [];

        if (!empty($filters['category'])) {
            $sql .= " AND category = :category";
            $params[':category'] = $filters['category'];
        }
        if (!empty($filters['month'])) {
            $sql .= " AND DATE_FORMAT(date, '%Y-%m') = :month";
            $params[':month'] = $filters['month'];
        }
        if (!empty($filters['search'])) {
            $sql .= " AND description LIKE :search";
            $params[':search'] = '%' . $filters['search'] . '%';
        }

        $sql .= " ORDER BY date DESC, id DESC";

        $stmt = $db->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll();
    }

    public static function getById(int $id): ?array {
        $stmt = getDB()->prepare("SELECT * FROM expenses WHERE id = ?");
        $stmt->execute([$id]);
        return $stmt->fetch() ?: null;
    }

    public static function create(array $data): int {
        $stmt = getDB()->prepare(
            "INSERT INTO expenses (amount, category, date, description)
             VALUES (:amount, :category, :date, :description)"
        );
        $stmt->execute([
            ':amount'      => $data['amount'],
            ':category'    => $data['category'],
            ':date'        => $data['date'],
            ':description' => $data['description'],
        ]);
        return (int) getDB()->lastInsertId();
    }

    public static function update(int $id, array $data): bool {
        $stmt = getDB()->prepare(
            "UPDATE expenses
             SET amount = :amount, category = :category,
                 date = :date, description = :description
             WHERE id = :id"
        );
        return $stmt->execute([
            ':amount'      => $data['amount'],
            ':category'    => $data['category'],
            ':date'        => $data['date'],
            ':description' => $data['description'],
            ':id'          => $id,
        ]);
    }

    public static function delete(int $id): bool {
        $stmt = getDB()->prepare("DELETE FROM expenses WHERE id = ?");
        return $stmt->execute([$id]);
    }

    // Insights 

    public static function getInsights(string $month = ''): array {
        $db     = getDB();
        $where  = $month ? "WHERE DATE_FORMAT(date,'%Y-%m') = ?" : "";
        $params = $month ? [$month] : [];

        // Totals
        $stmt = $db->prepare("SELECT COALESCE(SUM(amount), 0) AS total, COUNT(*) AS count FROM expenses $where");
        $stmt->execute($params);
        $totals = $stmt->fetch();

        // By category
        $stmt = $db->prepare(
            "SELECT category, SUM(amount) AS total, COUNT(*) AS count
             FROM expenses $where
             GROUP BY category ORDER BY total DESC"
        );
        $stmt->execute($params);
        $byCategory = $stmt->fetchAll();

        // Daily trend (last 30 days)
        $stmt = $db->prepare(
            "SELECT date, SUM(amount) AS total
             FROM expenses
             WHERE date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
             GROUP BY date ORDER BY date ASC"
        );
        $stmt->execute();
        $daily = $stmt->fetchAll();

        // Monthly totals (last 6 months)
        $stmt = $db->prepare(
            "SELECT DATE_FORMAT(date,'%Y-%m') AS month, SUM(amount) AS total
             FROM expenses
             WHERE date >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
             GROUP BY month ORDER BY month ASC"
        );
        $stmt->execute();
        $monthly = $stmt->fetchAll();

        return [
            'total'       => (float) $totals['total'],
            'count'       => (int)   $totals['count'],
            'byCategory'  => $byCategory,
            'daily'       => $daily,
            'monthly'     => $monthly,
        ];
    }

    public static function getCategories(): array {
        return ['Food', 'Transport', 'Education', 'Entertainment', 'Health', 'Rent', 'Shopping', 'Other'];
    }
}
