class EmployeeDocumentModel {
  final int id;
  final String name;
  final String documentType;
  final String documentNumber;
  final String issueDate;
  final String expiryDate;
  final String expirationStatus;
  final String? fileUrl;

  EmployeeDocumentModel({
    required this.id,
    required this.name,
    required this.documentType,
    required this.documentNumber,
    required this.issueDate,
    required this.expiryDate,
    required this.expirationStatus,
    this.fileUrl,
  });

  factory EmployeeDocumentModel.fromJson(Map<String, dynamic> json) {
    return EmployeeDocumentModel(
      id: json['id'] ?? 0,
      name: json['name'] ?? '',
      documentType: json['document_type'] ?? '',
      documentNumber: json['document_number'] ?? '',
      issueDate: json['issue_date'] ?? '',
      expiryDate: json['expiry_date'] ?? '',
      expirationStatus: json['expiration_status'] ?? 'valid',
      fileUrl: json['file_url'],
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'name': name,
        'document_type': documentType,
        'document_number': documentNumber,
        'issue_date': issueDate,
        'expiry_date': expiryDate,
        'expiration_status': expirationStatus,
        'file_url': fileUrl,
      };
}
