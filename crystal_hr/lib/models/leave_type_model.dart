class LeaveTypeModel {
  final int leaveTypeId;
  final String tenantId;
  final int companyId;
  final String name;
  final String nameAr;
  final String code;
  final bool isActive;
  final bool isPaid;
  final bool deductsFromBalance;
  final bool attachmentRequired;
  final bool medicalReportRequired;
  final int minDuration;
  final int maxDuration;
  final String color;
  final String icon;
  final bool visibleInMobile;

  LeaveTypeModel({
    required this.leaveTypeId,
    required this.tenantId,
    required this.companyId,
    required this.name,
    required this.nameAr,
    required this.code,
    required this.isActive,
    required this.isPaid,
    required this.deductsFromBalance,
    required this.attachmentRequired,
    required this.medicalReportRequired,
    required this.minDuration,
    required this.maxDuration,
    required this.color,
    required this.icon,
    required this.visibleInMobile,
  });

  factory LeaveTypeModel.fromJson(Map<String, dynamic> json) {
    return LeaveTypeModel(
      leaveTypeId: json['leaveTypeId'] ?? 0,
      tenantId: json['tenantId'] ?? '',
      companyId: json['companyId'] ?? 0,
      name: json['name'] ?? '',
      nameAr: json['name_ar'] ?? json['nameAr'] ?? '',
      code: json['code'] ?? '',
      isActive: json['isActive'] == 1 || json['isActive'] == true,
      isPaid: json['isPaid'] == 1 || json['isPaid'] == true,
      deductsFromBalance: json['deductsFromBalance'] == 1 || json['deductsFromBalance'] == true,
      attachmentRequired: json['attachmentRequired'] == 1 || json['attachmentRequired'] == true,
      medicalReportRequired: json['medicalReportRequired'] == 1 || json['medicalReportRequired'] == true,
      minDuration: json['minDuration'] ?? 1,
      maxDuration: json['maxDuration'] ?? 90,
      color: json['color'] ?? '#00B6D4',
      icon: json['icon'] ?? 'calendar_today',
      visibleInMobile: json['visibleInMobile'] == 1 || json['visibleInMobile'] == true,
    );
  }

  Map<String, dynamic> toJson() => {
        'leaveTypeId': leaveTypeId,
        'tenantId': tenantId,
        'companyId': companyId,
        'name': name,
        'name_ar': nameAr,
        'code': code,
        'isActive': isActive,
        'isPaid': isPaid,
        'deductsFromBalance': deductsFromBalance,
        'attachmentRequired': attachmentRequired,
        'medicalReportRequired': medicalReportRequired,
        'minDuration': minDuration,
        'maxDuration': maxDuration,
        'color': color,
        'icon': icon,
        'visibleInMobile': visibleInMobile,
      };
}
