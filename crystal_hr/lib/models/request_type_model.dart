class RequestTypeModel {
  final int requestTypeId;
  final String tenantId;
  final int companyId;
  final String code;
  final String nameAr;
  final String nameEn;
  final String icon;
  final String color;
  final String category;
  final bool isActive;
  final bool mobileVisible;
  final bool webVisible;
  final bool requiresAttachment;
  final int version;

  RequestTypeModel({
    required this.requestTypeId,
    required this.tenantId,
    required this.companyId,
    required this.code,
    required this.nameAr,
    required this.nameEn,
    required this.icon,
    required this.color,
    required this.category,
    required this.isActive,
    required this.mobileVisible,
    required this.webVisible,
    required this.requiresAttachment,
    required this.version,
  });

  factory RequestTypeModel.fromJson(Map<String, dynamic> json) {
    return RequestTypeModel(
      requestTypeId: json['requestTypeId'] ?? 0,
      tenantId: json['tenantId'] ?? '',
      companyId: json['companyId'] ?? 0,
      code: json['code'] ?? '',
      nameAr: json['nameAr'] ?? '',
      nameEn: json['nameEn'] ?? '',
      icon: json['icon'] ?? 'description',
      color: json['color'] ?? '#00B6D4',
      category: json['category'] ?? '',
      isActive: json['isActive'] == 1 || json['isActive'] == true,
      mobileVisible: json['mobileVisible'] == 1 || json['mobileVisible'] == true,
      webVisible: json['webVisible'] == 1 || json['webVisible'] == true,
      requiresAttachment: json['requiresAttachment'] == 1 || json['requiresAttachment'] == true,
      version: json['version'] ?? 1,
    );
  }

  Map<String, dynamic> toJson() => {
        'requestTypeId': requestTypeId,
        'tenantId': tenantId,
        'companyId': companyId,
        'code': code,
        'nameAr': nameAr,
        'nameEn': nameEn,
        'icon': icon,
        'color': color,
        'category': category,
        'isActive': isActive,
        'mobileVisible': mobileVisible,
        'webVisible': webVisible,
        'requiresAttachment': requiresAttachment,
        'version': version,
      };
}
