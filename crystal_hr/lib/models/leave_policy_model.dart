class LeavePolicyModel {
  final int policyId;
  final int leaveTypeId;
  final String tenantId;
  final int annualEntitlement;
  final String accrualMethod;
  final String accrualFrequency;
  final bool carryForwardEnabled;
  final int maxCarryForward;
  final bool excludeWeekends;
  final bool excludeHolidays;
  final int minNoticePeriod;
  final int maxConsecutiveDays;
  final bool probationRestrictions;
  final String workflowSteps;

  LeavePolicyModel({
    required this.policyId,
    required this.leaveTypeId,
    required this.tenantId,
    required this.annualEntitlement,
    required this.accrualMethod,
    required this.accrualFrequency,
    required this.carryForwardEnabled,
    required this.maxCarryForward,
    required this.excludeWeekends,
    required this.excludeHolidays,
    required this.minNoticePeriod,
    required this.maxConsecutiveDays,
    required this.probationRestrictions,
    required this.workflowSteps,
  });

  factory LeavePolicyModel.fromJson(Map<String, dynamic> json) {
    return LeavePolicyModel(
      policyId: json['policyId'] ?? 0,
      leaveTypeId: json['leaveTypeId'] ?? 0,
      tenantId: json['tenantId'] ?? '',
      annualEntitlement: json['annualEntitlement'] ?? 30,
      accrualMethod: json['accrualMethod'] ?? 'frontloaded',
      accrualFrequency: json['accrualFrequency'] ?? 'yearly',
      carryForwardEnabled: json['carryForwardEnabled'] == 1 || json['carryForwardEnabled'] == true,
      maxCarryForward: json['maxCarryForward'] ?? 15,
      excludeWeekends: json['excludeWeekends'] == 1 || json['excludeWeekends'] == true,
      excludeHolidays: json['excludeHolidays'] == 1 || json['excludeHolidays'] == true,
      minNoticePeriod: json['minNoticePeriod'] ?? 7,
      maxConsecutiveDays: json['maxConsecutiveDays'] ?? 30,
      probationRestrictions: json['probationRestrictions'] == 1 || json['probationRestrictions'] == true,
      workflowSteps: json['workflowSteps'] ?? 'manager_then_hr',
    );
  }

  Map<String, dynamic> toJson() => {
        'policyId': policyId,
        'leaveTypeId': leaveTypeId,
        'tenantId': tenantId,
        'annualEntitlement': annualEntitlement,
        'accrualMethod': accrualMethod,
        'accrualFrequency': accrualFrequency,
        'carryForwardEnabled': carryForwardEnabled,
        'maxCarryForward': maxCarryForward,
        'excludeWeekends': excludeWeekends,
        'excludeHolidays': excludeHolidays,
        'minNoticePeriod': minNoticePeriod,
        'maxConsecutiveDays': maxConsecutiveDays,
        'probationRestrictions': probationRestrictions,
        'workflowSteps': workflowSteps,
      };
}
