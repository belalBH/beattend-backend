<?php
/**
 * Attendance Repository Class
 */
class AttendanceRepository {
    private $db;

    public function __construct($dbConnection) {
        $this->db = $dbConnection;
    }

    public function findSessionForDate($employeeId, $date) {
        $stmt = $this->db->prepare("
            SELECT * FROM attendance_sessions 
            WHERE employeeId = :empId AND shiftInstanceDate = :date 
            LIMIT 1
        ");
        $stmt->execute(['empId' => $employeeId, 'date' => $date]);
        return $stmt->fetch();
    }

    public function getSessionById($sessionId) {
        $stmt = $this->db->prepare("SELECT * FROM attendance_sessions WHERE sessionId = :id LIMIT 1");
        $stmt->execute(['id' => $sessionId]);
        return $stmt->fetch();
    }

    public function createSession($data) {
        $stmt = $this->db->prepare("
            INSERT INTO attendance_sessions (
                tenantId, companyId, employeeId, scheduleId, shiftId, 
                shiftInstanceDate, workLocationId, status, actualCheckIn, recordVersion
            ) VALUES (
                :tenantId, :companyId, :employeeId, :scheduleId, :shiftId, 
                :shiftInstanceDate, :workLocationId, :status, :actualCheckIn, 1
            )
        ");
        $stmt->execute([
            'tenantId' => $data['tenantId'],
            'companyId' => $data['companyId'],
            'employeeId' => $data['employeeId'],
            'scheduleId' => $data['scheduleId'] ?? null,
            'shiftId' => $data['shiftId'] ?? null,
            'shiftInstanceDate' => $data['shiftInstanceDate'],
            'workLocationId' => $data['workLocationId'] ?? null,
            'status' => $data['status'] ?? 'present',
            'actualCheckIn' => $data['actualCheckIn'] ?? null
        ]);
        return $this->db->lastInsertId();
    }

    public function updateSession($sessionId, $updates) {
        $fields = [];
        $params = ['sessionId' => $sessionId];
        foreach ($updates as $key => $val) {
            $fields[] = "$key = :$key";
            $params[$key] = $val;
        }
        $fieldsStr = implode(', ', $fields);
        $stmt = $this->db->prepare("UPDATE attendance_sessions SET $fieldsStr, recordVersion = recordVersion + 1 WHERE sessionId = :sessionId");
        $stmt->execute($params);
    }

    public function createEvent($data) {
        $stmt = $this->db->prepare("
            INSERT INTO attendance_events (
                sessionId, tenantId, employeeId, eventType, eventTimestamp, 
                latitude, longitude, accuracy, deviceId, platform, appVersion, 
                idempotencyKey, syncStatus
            ) VALUES (
                :sessionId, :tenantId, :employeeId, :eventType, :eventTimestamp, 
                :latitude, :longitude, :accuracy, :deviceId, :platform, :appVersion, 
                :idempotencyKey, :syncStatus
            )
        ");
        $stmt->execute([
            'sessionId' => $data['sessionId'],
            'tenantId' => $data['tenantId'],
            'employeeId' => $data['employeeId'],
            'eventType' => $data['eventType'],
            'eventTimestamp' => $data['eventTimestamp'],
            'latitude' => $data['latitude'] ?? null,
            'longitude' => $data['longitude'] ?? null,
            'accuracy' => $data['accuracy'] ?? null,
            'deviceId' => $data['deviceId'] ?? null,
            'platform' => $data['platform'] ?? null,
            'appVersion' => $data['appVersion'] ?? null,
            'idempotencyKey' => $data['idempotencyKey'],
            'syncStatus' => $data['syncStatus'] ?? 'completed'
        ]);
        return $this->db->lastInsertId();
    }

    public function getSessionEvents($sessionId) {
        $stmt = $this->db->prepare("SELECT * FROM attendance_events WHERE sessionId = :id ORDER BY eventTimestamp ASC");
        $stmt->execute(['id' => $sessionId]);
        return $stmt->fetchAll();
    }

    public function getCalendarStatus($employeeId, $startDate, $endDate) {
        $stmt = $this->db->prepare("
            SELECT shiftInstanceDate as date, status 
            FROM attendance_sessions 
            WHERE employeeId = :empId AND shiftInstanceDate BETWEEN :start AND :end
        ");
        $stmt->execute(['empId' => $employeeId, 'start' => $startDate, 'end' => $endDate]);
        return $stmt->fetchAll();
    }

    public function getSessionsFiltered($employeeId, $startDate, $endDate) {
        $stmt = $this->db->prepare("
            SELECT * FROM attendance_sessions 
            WHERE employeeId = :empId AND shiftInstanceDate BETWEEN :start AND :end
            ORDER BY shiftInstanceDate DESC
        ");
        $stmt->execute(['empId' => $employeeId, 'start' => $startDate, 'end' => $endDate]);
        return $stmt->fetchAll();
    }
}
