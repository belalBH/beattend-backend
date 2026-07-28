class Employee {
  final String id;
  final String name;
  final String role;
  final String email;
  final String avatarUrl;
  final String managerName;
  final double leaveBalance;
  final double latestPayslipAmount;
  final String latestPayslipMonth;

  Employee({
    required this.id,
    required this.name,
    required this.role,
    required this.email,
    required this.avatarUrl,
    required this.managerName,
    required this.leaveBalance,
    required this.latestPayslipAmount,
    required this.latestPayslipMonth,
  });

  factory Employee.fromJson(Map<String, dynamic> json) {
    return Employee(
      id: json['id'] ?? '',
      name: json['name'] ?? '',
      role: json['role'] ?? '',
      email: json['email'] ?? '',
      avatarUrl: json['avatarUrl'] ?? '',
      managerName: json['managerName'] ?? '',
      leaveBalance: (json['leaveBalance'] as num?)?.toDouble() ?? 30.0,
      latestPayslipAmount: (json['latestPayslipAmount'] as num?)?.toDouble() ?? 0.0,
      latestPayslipMonth: json['latestPayslipMonth'] ?? '',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'role': role,
      'email': email,
      'avatarUrl': avatarUrl,
      'managerName': managerName,
      'leaveBalance': leaveBalance,
      'latestPayslipAmount': latestPayslipAmount,
      'latestPayslipMonth': latestPayslipMonth,
    };
  }
}

class AttendanceSession {
  final String id;
  final String date;
  final String? clockInTime;
  final String? clockOutTime;
  final bool isInsideGeofence;
  final double breakDurationMinutes;
  final double workingHours;
  final double overtimeHours;
  final String status; // "Working" | "Checked In" | "Checked Out" | "On Break" | "Outside Geofence" | "Remote Work" | "Business Trip" | "Leave" | "Weekend"
  final String shiftName;
  final String shiftStartTime;
  final String workLocationName;

  AttendanceSession({
    required this.id,
    required this.date,
    this.clockInTime,
    this.clockOutTime,
    required this.isInsideGeofence,
    required this.breakDurationMinutes,
    required this.workingHours,
    required this.overtimeHours,
    required this.status,
    required this.shiftName,
    required this.shiftStartTime,
    required this.workLocationName,
  });

  factory AttendanceSession.fromJson(Map<String, dynamic> json) {
    return AttendanceSession(
      id: json['id'] ?? '',
      date: json['date'] ?? '',
      clockInTime: json['clockInTime'],
      clockOutTime: json['clockOutTime'],
      isInsideGeofence: json['isInsideGeofence'] ?? true,
      breakDurationMinutes: (json['breakDurationMinutes'] as num?)?.toDouble() ?? 0.0,
      workingHours: (json['workingHours'] as num?)?.toDouble() ?? 0.0,
      overtimeHours: (json['overtimeHours'] as num?)?.toDouble() ?? 0.0,
      status: json['status'] ?? 'Checked Out',
      shiftName: json['shiftName'] ?? 'Regular Shift',
      shiftStartTime: json['shiftStartTime'] ?? '08:30 AM',
      workLocationName: json['workLocationName'] ?? 'Headquarters',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'date': date,
      if (clockInTime != null) 'clockInTime': clockInTime,
      if (clockOutTime != null) 'clockOutTime': clockOutTime,
      'isInsideGeofence': isInsideGeofence,
      'breakDurationMinutes': breakDurationMinutes,
      'workingHours': workingHours,
      'overtimeHours': overtimeHours,
      'status': status,
      'shiftName': shiftName,
      'shiftStartTime': shiftStartTime,
      'workLocationName': workLocationName,
    };
  }
}

class HRNotification {
  final String id;
  final String titleAr;
  final String titleEn;
  final String type; // "leave_approved" | "leave_rejected" | "payroll_processed" | "hr_announcement" | "pending_approval" | "company_announcement"
  final String date;
  final String messageAr;
  final String messageEn;

  HRNotification({
    required this.id,
    required this.titleAr,
    required this.titleEn,
    required this.type,
    required this.date,
    required this.messageAr,
    required this.messageEn,
  });

  factory HRNotification.fromJson(Map<String, dynamic> json) {
    return HRNotification(
      id: json['id'] ?? '',
      titleAr: json['titleAr'] ?? '',
      titleEn: json['titleEn'] ?? '',
      type: json['type'] ?? 'hr_announcement',
      date: json['date'] ?? '',
      messageAr: json['messageAr'] ?? '',
      messageEn: json['messageEn'] ?? '',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'titleAr': titleAr,
      'titleEn': titleEn,
      'type': type,
      'date': date,
      'messageAr': messageAr,
      'messageEn': messageEn,
    };
  }
}

class HREvent {
  final String id;
  final String titleAr;
  final String titleEn;
  final String time;
  final String type; // "Team Meeting" | "HR Meeting" | "Performance Review" | "Training Session" | "Interview" | "Company Event"
  final String locationAr;
  final String locationEn;
  final String descriptionAr;
  final String descriptionEn;

  HREvent({
    required this.id,
    required this.titleAr,
    required this.titleEn,
    required this.time,
    required this.type,
    required this.locationAr,
    required this.locationEn,
    required this.descriptionAr,
    required this.descriptionEn,
  });

  factory HREvent.fromJson(Map<String, dynamic> json) {
    return HREvent(
      id: json['id'] ?? '',
      titleAr: json['titleAr'] ?? '',
      titleEn: json['titleEn'] ?? '',
      time: json['time'] ?? '',
      type: json['type'] ?? 'Team Meeting',
      locationAr: json['locationAr'] ?? '',
      locationEn: json['locationEn'] ?? '',
      descriptionAr: json['descriptionAr'] ?? '',
      descriptionEn: json['descriptionEn'] ?? '',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'titleAr': titleAr,
      'titleEn': titleEn,
      'time': time,
      'type': type,
      'locationAr': locationAr,
      'locationEn': locationEn,
      'descriptionAr': descriptionAr,
      'descriptionEn': descriptionEn,
    };
  }
}
