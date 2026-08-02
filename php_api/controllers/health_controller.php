<?php
/**
 * Health Controller
 */
class HealthController {
    private $db;

    public function __construct($dbConnection) {
        $this->db = $dbConnection;
    }

    public function check() {
        $dbStatus = 'offline';
        try {
            if ($this->db) {
                $stmt = $this->db->query("SELECT 1");
                if ($stmt) {
                    $dbStatus = 'healthy';
                }
            }
        } catch (Exception $e) {
            $dbStatus = 'unhealthy (' . $e->getMessage() . ')';
        }

        ApiResponse::success([
            'api' => 'healthy',
            'database' => $dbStatus,
            'firebase' => 'healthy',
            'storage' => 'healthy',
            'version' => '2.0.0',
            'timestamp' => date('Y-m-d H:i:s')
        ], 'API Health Report');
    }
}
