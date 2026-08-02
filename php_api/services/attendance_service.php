<?php
/**
 * Attendance Service Class
 */
require_once __DIR__ . '/../repositories/attendance_repository.php';

class AttendanceService {
    private $repo;

    public function __construct($dbConnection) {
        $this->repo = new AttendanceRepository($dbConnection);
    }

    public function processPunchEvent($input, $tenantId) {
        $employeeId = $input['employeeId'];
        $eventType = $input['eventType'];
        $timestamp = $input['eventTimestamp'] ?? date('Y-m-d H:i:s');
        $date = substr($timestamp, 0, 10);

        // Fetch or create logical attendance session for the shiftInstanceDate
        $session = $this->repo->findSessionForDate($employeeId, $date);

        if (!$session) {
            $sessionId = $this->repo->createSession([
                'tenantId' => $tenantId,
                'companyId' => $input['companyId'] ?? 1,
                'employeeId' => $employeeId,
                'shiftInstanceDate' => $date,
                'status' => 'present',
                'actualCheckIn' => ($eventType === 'check_in') ? $timestamp : null
            ]);
            $session = $this->repo->getSessionById($sessionId);
        } else {
            $sessionId = $session['sessionId'];
        }

        // Add the individual event record
        $input['sessionId'] = $sessionId;
        $input['tenantId'] = $tenantId;
        $this->repo->createEvent($input);

        // Trigger session recalculation
        $this->recalculateSession($sessionId);

        return $this->repo->getSessionById($sessionId);
    }

    public function recalculateSession($sessionId) {
        $session = $this->repo->getSessionById($sessionId);
        if (!$session) return;

        $events = $this->repo->getSessionEvents($sessionId);

        $checkIn = null;
        $checkOut = null;
        $breakStart = null;
        $totalBreakMinutes = 0;
        $workedMinutes = 0;

        foreach ($events as $event) {
            $type = $event['eventType'];
            $time = strtotime($event['eventTimestamp']);

            if ($type === 'check_in') {
                $checkIn = $event['eventTimestamp'];
            } elseif ($type === 'check_out') {
                $checkOut = $event['eventTimestamp'];
            } elseif ($type === 'break_start') {
                $breakStart = $time;
            } elseif ($type === 'break_end') {
                if ($breakStart) {
                    $totalBreakMinutes += round(($time - $breakStart) / 60);
                    $breakStart = null;
                }
            }
        }

        // Calculate worked minutes (actualCheckOut - actualCheckIn - breaks)
        if ($checkIn && $checkOut) {
            $totalWorked = round((strtotime($checkOut) - strtotime($checkIn)) / 60) - $totalBreakMinutes;
            $workedMinutes = max(0, $totalWorked);
        }

        // Apply updates
        $updates = [
            'breakMinutes' => $totalBreakMinutes,
            'workedMinutes' => $workedMinutes,
        ];
        if ($checkIn) {
            $updates['actualCheckIn'] = $checkIn;
        }
        if ($checkOut) {
            $updates['actualCheckOut'] = $checkOut;
        }

        $this->repo->updateSession($sessionId, $updates);
    }
}
