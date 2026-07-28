class EmployeeModel {
  final int id;
  final String employeeNumber;
  final String firstName;
  final String lastName;
  final String email;
  final String phone;
  final String department;
  final String position;
  final String officeStatus;
  final List<String> allowedLocations;

  EmployeeModel({
    required this.id,
    required this.employeeNumber,
    required this.firstName,
    required this.lastName,
    required this.email,
    required this.phone,
    required this.department,
    required this.position,
    required this.officeStatus,
    required this.allowedLocations,
  });

  factory EmployeeModel.fromJson(Map<String, dynamic> json) {
    List<String> locs = [];
    if (json['allowedLocations'] is List) {
      locs = (json['allowedLocations'] as List).map((e) => e.toString()).toList();
    } else if (json['allowed_locations'] is List) {
      locs = (json['allowed_locations'] as List).map((e) => e.toString()).toList();
    }
    return EmployeeModel(
      id: json['id'] ?? 0,
      employeeNumber: json['employee_number'] ?? json['job_number'] ?? '',
      firstName: json['first_name'] ?? '',
      lastName: json['last_name'] ?? '',
      email: json['email'] ?? '',
      phone: json['phone'] ?? '',
      department: json['department_name'] ?? json['department'] ?? '',
      position: json['position_title'] ?? json['position'] ?? '',
      officeStatus: json['officeStatus'] ?? json['employment_status'] ?? 'active',
      allowedLocations: locs,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'employee_number': employeeNumber,
        'first_name': firstName,
        'last_name': lastName,
        'email': email,
        'phone': phone,
        'department': department,
        'position': position,
        'officeStatus': officeStatus,
        'allowed_locations': allowedLocations,
      };
}
