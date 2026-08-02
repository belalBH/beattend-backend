<?php
/**
 * Tenant and Feature Flags Configuration
 */
return [
    'features' => [
        'complete_v2_sync' => [
            'enabled' => true,
            'maintenanceMode' => false,
            'minimumAppVersion' => '2.0.0',
        ],
        'leave_management' => [
            'enabled' => true,
            'readOnly' => false,
            'roles' => ['employee', 'manager', 'hr'],
            'minimumAppVersion' => '2.0.0',
            'maintenanceMode' => false,
        ],
        'payroll_payslips' => [
            'enabled' => true,
            'readOnly' => true,
            'roles' => ['employee', 'manager', 'hr'],
            'minimumAppVersion' => '2.0.0',
            'maintenanceMode' => false,
        ],
        'document_viewer' => [
            'enabled' => true,
            'readOnly' => false,
            'roles' => ['employee', 'manager', 'hr'],
            'minimumAppVersion' => '2.0.0',
            'maintenanceMode' => false,
        ]
    ]
];
