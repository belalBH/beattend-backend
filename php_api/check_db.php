<?php
require_once 'database.php';

try {
    $db = Database::getInstance()->getConnection();
    
    // 1. Get all employees
    $stmt = $db->prepare("SELECT id, employee_number, first_name, last_name, email, assigned_location_id, tenant_id, company_id FROM employees");
    $stmt->execute();
    $employees = $stmt->fetchAll();
    
    echo "=== EMPLOYEES ===\n";
    foreach ($employees as $emp) {
        print_r($emp);
    }
    
    // 2. Get all work locations
    $stmt = $db->prepare("SELECT id, location_id, name, latitude, longitude, radius_meters FROM work_locations");
    $stmt->execute();
    $locations = $stmt->fetchAll();
    
    echo "=== WORK LOCATIONS ===\n";
    foreach ($locations as $loc) {
        print_r($loc);
    }
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
