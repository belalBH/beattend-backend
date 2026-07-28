class RequestFieldModel {
  final int fieldId;
  final int requestTypeId;
  final String fieldKey;
  final String nameAr;
  final String nameEn;
  final String fieldType;
  final int displayOrder;
  final bool isRequired;
  final bool isReadonly;
  final String? defaultValue;
  final String? placeholder;
  final String? validationRules;
  final String? optionsJson;

  RequestFieldModel({
    required this.fieldId,
    required this.requestTypeId,
    required this.fieldKey,
    required this.nameAr,
    required this.nameEn,
    required this.fieldType,
    required this.displayOrder,
    required this.isRequired,
    required this.isReadonly,
    this.defaultValue,
    this.placeholder,
    this.validationRules,
    this.optionsJson,
  });

  factory RequestFieldModel.fromJson(Map<String, dynamic> json) {
    return RequestFieldModel(
      fieldId: json['fieldId'] ?? 0,
      requestTypeId: json['requestTypeId'] ?? 0,
      fieldKey: json['fieldKey'] ?? '',
      nameAr: json['nameAr'] ?? '',
      nameEn: json['nameEn'] ?? '',
      fieldType: json['fieldType'] ?? 'text',
      displayOrder: json['displayOrder'] ?? 0,
      isRequired: json['isRequired'] == 1 || json['isRequired'] == true,
      isReadonly: json['isReadonly'] == 1 || json['isReadonly'] == true,
      defaultValue: json['defaultValue'],
      placeholder: json['placeholder'],
      validationRules: json['validationRules'],
      optionsJson: json['optionsJson'],
    );
  }

  Map<String, dynamic> toJson() => {
        'fieldId': fieldId,
        'requestTypeId': requestTypeId,
        'fieldKey': fieldKey,
        'nameAr': nameAr,
        'nameEn': nameEn,
        'fieldType': fieldType,
        'displayOrder': displayOrder,
        'isRequired': isRequired,
        'isReadonly': isReadonly,
        'defaultValue': defaultValue,
        'placeholder': placeholder,
        'validationRules': validationRules,
        'optionsJson': optionsJson,
      };
}
