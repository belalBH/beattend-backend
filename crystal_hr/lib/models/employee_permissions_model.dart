class EmployeePermissionsModel {
  final List<String> editableFields;
  final List<String> readOnlyFields;
  final bool viewSalaryAllowed;
  final bool viewBankAllowed;

  EmployeePermissionsModel({
    required this.editableFields,
    required this.readOnlyFields,
    required this.viewSalaryAllowed,
    required this.viewBankAllowed,
  });

  factory EmployeePermissionsModel.fromJson(Map<String, dynamic> json) {
    List<String> editFields = [];
    if (json['editable_fields'] is List) {
      editFields = (json['editable_fields'] as List).map((e) => e.toString()).toList();
    }
    List<String> roFields = [];
    if (json['readonly_fields'] is List) {
      roFields = (json['readonly_fields'] as List).map((e) => e.toString()).toList();
    }
    return EmployeePermissionsModel(
      editableFields: editFields,
      readOnlyFields: roFields,
      viewSalaryAllowed: json['view_salary_allowed'] ?? false,
      viewBankAllowed: json['view_bank_allowed'] ?? false,
    );
  }

  Map<String, dynamic> toJson() => {
        'editable_fields': editableFields,
        'readonly_fields': readOnlyFields,
        'view_salary_allowed': viewSalaryAllowed,
        'view_bank_allowed': viewBankAllowed,
      };
}
