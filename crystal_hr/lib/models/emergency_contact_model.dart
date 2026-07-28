class EmergencyContactModel {
  final int id;
  final String name;
  final String relationship;
  final String primaryPhone;
  final String? secondaryPhone;
  final String? notes;

  EmergencyContactModel({
    required this.id,
    required this.name,
    required this.relationship,
    required this.primaryPhone,
    this.secondaryPhone,
    this.notes,
  });

  factory EmergencyContactModel.fromJson(Map<String, dynamic> json) {
    return EmergencyContactModel(
      id: json['id'] ?? 0,
      name: json['name'] ?? '',
      relationship: json['relationship'] ?? '',
      primaryPhone: json['primary_phone'] ?? json['phone'] ?? '',
      secondaryPhone: json['secondary_phone'],
      notes: json['notes'],
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'name': name,
        'relationship': relationship,
        'primary_phone': primaryPhone,
        'secondary_phone': secondaryPhone,
        'notes': notes,
      };
}
