<?php
require_once 'database.php';

try {
    $db = Database::getInstance()->getConnection();
    $driver = $db->getAttribute(PDO::ATTR_DRIVER_NAME);

    if ($driver === 'mysql') {
        // Run v5_provisioning_migration.sql on MySQL database
        $v5Sql = file_get_contents(__DIR__ . '/../v5_provisioning_migration.sql');
        if ($v5Sql) {
            $db->exec($v5Sql);
            echo "✓ Executed v5_provisioning_migration.sql on MySQL successfully.\n";
        }
    } else {
        echo "✓ SQLite local database is active and auto-initialized via Database PDO fallback.\n";
    }

} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
