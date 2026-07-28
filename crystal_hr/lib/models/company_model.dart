class CompanyModel {
  final int id;
  final String tenantId;
  final String name;
  final String domain;
  final String logo;
  final String status;
  final String minimumAppVersion;
  final bool geofencingEnabled;

  CompanyModel({
    required this.id,
    required this.tenantId,
    required this.name,
    required this.domain,
    required this.logo,
    required this.status,
    required this.minimumAppVersion,
    required this.geofencingEnabled,
  });

  factory CompanyModel.fromJson(Map<String, dynamic> json) {
    final settings = json['settings'] ?? {};
    return CompanyModel(
      id: json['companyId'] ?? json['id'] ?? 0,
      tenantId: json['tenantId'] ?? '',
      name: json['companyName'] ?? json['name'] ?? '',
      domain: json['companyDomain'] ?? json['domain'] ?? json['tenantId'] ?? '',
      logo: json['logoUrl'] ?? json['logo'] ?? '',
      status: json['companyStatus'] ?? json['status'] ?? 'active',
      minimumAppVersion: json['minimumAppVersion'] ?? '1.0.0',
      geofencingEnabled: settings['geofencing_enabled'] ?? true,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'tenantId': tenantId,
        'name': name,
        'domain': domain,
        'logo': logo,
        'status': status,
        'minimumAppVersion': minimumAppVersion,
        'geofencing_enabled': geofencingEnabled,
      };
}
