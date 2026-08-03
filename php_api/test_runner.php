<?php
require_once __DIR__ . '/controllers/payroll_engine_controller.php';

$controller = new PayrollEngineController();
$controller->runPhase1RefinedTests();
