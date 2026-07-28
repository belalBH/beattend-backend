class EmploymentInfoModel {
  final String companyName;
  final String branchName;
  final String departmentName;
  final String sectionName;
  final String jobTitle;
  final String directManager;
  final String employmentType;
  final String contractType;
  final String hireDate;
  final String contractStartDate;
  final String contractEndDate;
  final String employeeStatus;
  final String probationEndDate;

  EmploymentInfoModel({
    required this.companyName,
    required this.branchName,
    required this.departmentName,
    required this.sectionName,
    required this.jobTitle,
    required this.directManager,
    required this.employmentType,
    required this.contractType,
    required this.hireDate,
    required this.contractStartDate,
    required this.contractEndDate,
    required this.employeeStatus,
    required this.probationEndDate,
  });

  factory EmploymentInfoModel.fromJson(Map<String, dynamic> json) {
    return EmploymentInfoModel(
      companyName: json['company_name'] ?? json['company'] ?? '',
      branchName: json['branch_name'] ?? json['branch'] ?? '',
      departmentName: json['department_name'] ?? json['department'] ?? '',
      sectionName: json['section_name'] ?? json['section'] ?? '',
      jobTitle: json['job_title'] ?? json['position'] ?? '',
      directManager: json['direct_manager'] ?? json['manager'] ?? '',
      employmentType: json['employment_type'] ?? 'full_time',
      contractType: json['contract_type'] ?? 'permanent',
      hireDate: json['hire_date'] ?? '',
      contractStartDate: json['contract_start_date'] ?? '',
      contractEndDate: json['contract_end_date'] ?? '',
      employeeStatus: json['employee_status'] ?? json['status'] ?? 'active',
      probationEndDate: json['probation_end_date'] ?? '',
    );
  }

  Map<String, dynamic> toJson() => {
        'company_name': companyName,
        'branch_name': branchName,
        'department_name': departmentName,
        'section_name': sectionName,
        'job_title': jobTitle,
        'direct_manager': directManager,
        'employment_type': employmentType,
        'contract_type': contractType,
        'hire_date': hireDate,
        'contract_start_date': contractStartDate,
        'contract_end_date': contractEndDate,
        'employee_status': employeeStatus,
        'probation_end_date': probationEndDate,
      };
}
