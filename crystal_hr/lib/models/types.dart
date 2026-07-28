class Engagement {
  final String id;
  final String title;
  final String date; // "YYYY-MM-DD"
  final String rawDate; // "14 OCT"
  final String time; // "10:30 AM"
  final String location;
  final String type; // "INTERNAL" | "CLIENT" | "STRATEGIC" | "OTHER"
  final String status; // "active" | "warning" | "error"
  final List<String> attendees;
  final String description;

  Engagement({
    required this.id,
    required this.title,
    required this.date,
    required this.rawDate,
    required this.time,
    required this.location,
    required this.type,
    required this.status,
    required this.attendees,
    required this.description,
  });

  factory Engagement.fromJson(Map<String, dynamic> json) {
    return Engagement(
      id: json['id'] ?? '',
      title: json['title'] ?? '',
      date: json['date'] ?? '',
      rawDate: json['rawDate'] ?? '',
      time: json['time'] ?? '',
      location: json['location'] ?? '',
      type: json['type'] ?? 'INTERNAL',
      status: json['status'] ?? 'active',
      attendees: List<String>.from(json['attendees'] ?? []),
      description: json['description'] ?? '',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'date': date,
      'rawDate': rawDate,
      'time': time,
      'location': location,
      'type': type,
      'status': status,
      'attendees': attendees,
      'description': description,
    };
  }
}

class CheckInLog {
  final String id;
  final String timestamp; // "08:45 AM"
  final String date; // "2026-07-12"
  final String type; // "check-in" | "check-out"
  final String method; // "Fingerprint" | "NFC" | "Manual Override"

  CheckInLog({
    required this.id,
    required this.timestamp,
    required this.date,
    required this.type,
    required this.method,
  });

  factory CheckInLog.fromJson(Map<String, dynamic> json) {
    return CheckInLog(
      id: json['id'] ?? '',
      timestamp: json['timestamp'] ?? '',
      date: json['date'] ?? '',
      type: json['type'] ?? 'check-in',
      method: json['method'] ?? 'Fingerprint',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'timestamp': timestamp,
      'date': date,
      'type': type,
      'method': method,
    };
  }
}

class Profile {
  final int? id;
  final String name;
  final String role;
  final String avatarUrl;
  final String officeStatus; // "ACTIVE" | "REMOTE" | "OUT_OF_OFFICE"
  final double weeklyTargetHours;
  final double completedHours;
  final String themeMode; // "dark" | "light"
  final String language; // "ar" | "en"
  final String? jobNumber;
  final String? email;
  final String? phone;
  final String? department;

  Profile({
    this.id,
    required this.name,
    required this.role,
    required this.avatarUrl,
    required this.officeStatus,
    required this.weeklyTargetHours,
    required this.completedHours,
    required this.themeMode,
    required this.language,
    this.jobNumber,
    this.email,
    this.phone,
    this.department,
  });

  Profile copyWith({
    int? id,
    String? name,
    String? role,
    String? avatarUrl,
    String? officeStatus,
    double? weeklyTargetHours,
    double? completedHours,
    String? themeMode,
    String? language,
    String? jobNumber,
    String? email,
    String? phone,
    String? department,
  }) {
    return Profile(
      id: id ?? this.id,
      name: name ?? this.name,
      role: role ?? this.role,
      avatarUrl: avatarUrl ?? this.avatarUrl,
      officeStatus: officeStatus ?? this.officeStatus,
      weeklyTargetHours: weeklyTargetHours ?? this.weeklyTargetHours,
      completedHours: completedHours ?? this.completedHours,
      themeMode: themeMode ?? this.themeMode,
      language: language ?? this.language,
      jobNumber: jobNumber ?? this.jobNumber,
      email: email ?? this.email,
      phone: phone ?? this.phone,
      department: department ?? this.department,
    );
  }

  factory Profile.fromJson(Map<String, dynamic> json) {
    return Profile(
      id: json['id'],
      name: json['name'] ?? '',
      role: json['role'] ?? '',
      avatarUrl: json['avatarUrl'] ?? '',
      officeStatus: json['officeStatus'] ?? 'ACTIVE',
      weeklyTargetHours: (json['weeklyTargetHours'] as num?)?.toDouble() ?? 40.0,
      completedHours: (json['completedHours'] as num?)?.toDouble() ?? 0.0,
      themeMode: json['themeMode'] ?? 'light',
      language: json['language'] ?? 'ar',
      jobNumber: json['jobNumber'],
      email: json['email'],
      phone: json['phone'],
      department: json['department'],
    );
  }

  factory Profile.fromSqlite(Map<String, dynamic> map) {
    final firstName = map['first_name'] ?? '';
    final lastName = map['last_name'] ?? '';
    return Profile(
      id: map['id'],
      name: '$firstName $lastName'.trim(),
      role: map['position'] ?? '',
      avatarUrl: '',
      officeStatus: 'ACTIVE',
      weeklyTargetHours: 40.0,
      completedHours: 0.0,
      themeMode: 'light',
      language: 'ar',
      jobNumber: map['job_number'],
      email: map['email'],
      phone: map['phone'],
      department: map['department'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'role': role,
      'avatarUrl': avatarUrl,
      'officeStatus': officeStatus,
      'weeklyTargetHours': weeklyTargetHours,
      'completedHours': completedHours,
      'themeMode': themeMode,
      'language': language,
      'jobNumber': jobNumber,
      'email': email,
      'phone': phone,
      'department': department,
    };
  }
}

class RequestDetails {
  final String? startDate;
  final String? endDate;
  final String? leaveType;
  final double? amount;
  final int? repaymentMonths;
  final String? destination;
  final String? purpose;
  final double? hoursRequested;
  final String? overtimeDate;
  final String? language; // "Arabic" | "English" | "Both"
  final String? notes;
  final String? timeStart;
  final String? timeEnd;
  final String? firstInstallmentMonth;
  final int? installmentsCount;
  final String? correctionType;
  final String? correctTime;
  final String? delegateName;
  final String? attachments; // comma separated file names/paths
  final String? currentReviewer;
  final String? rejectionReason;
  final String? project;

  RequestDetails({
    this.startDate,
    this.endDate,
    this.leaveType,
    this.amount,
    this.repaymentMonths,
    this.destination,
    this.purpose,
    this.hoursRequested,
    this.overtimeDate,
    this.language,
    this.notes,
    this.timeStart,
    this.timeEnd,
    this.firstInstallmentMonth,
    this.installmentsCount,
    this.correctionType,
    this.correctTime,
    this.delegateName,
    this.attachments,
    this.currentReviewer,
    this.rejectionReason,
    this.project,
  });

  factory RequestDetails.fromJson(Map<String, dynamic> json) {
    return RequestDetails(
      startDate: json['startDate'],
      endDate: json['endDate'],
      leaveType: json['leaveType'],
      amount: (json['amount'] as num?)?.toDouble(),
      repaymentMonths: json['repaymentMonths'] as int?,
      destination: json['destination'],
      purpose: json['purpose'],
      hoursRequested: (json['hoursRequested'] as num?)?.toDouble(),
      overtimeDate: json['overtimeDate'],
      language: json['language'],
      notes: json['notes'],
      timeStart: json['timeStart'],
      timeEnd: json['timeEnd'],
      firstInstallmentMonth: json['firstInstallmentMonth'],
      installmentsCount: json['installmentsCount'] as int?,
      correctionType: json['correctionType'],
      correctTime: json['correctTime'],
      delegateName: json['delegateName'],
      attachments: json['attachments'],
      currentReviewer: json['currentReviewer'],
      rejectionReason: json['rejectionReason'],
      project: json['project'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      if (startDate != null) 'startDate': startDate,
      if (endDate != null) 'endDate': endDate,
      if (leaveType != null) 'leaveType': leaveType,
      if (amount != null) 'amount': amount,
      if (repaymentMonths != null) 'repaymentMonths': repaymentMonths,
      if (destination != null) 'destination': destination,
      if (purpose != null) 'purpose': purpose,
      if (hoursRequested != null) 'hoursRequested': hoursRequested,
      if (overtimeDate != null) 'overtimeDate': overtimeDate,
      if (language != null) 'language': language,
      if (notes != null) 'notes': notes,
      if (timeStart != null) 'timeStart': timeStart,
      if (timeEnd != null) 'timeEnd': timeEnd,
      if (firstInstallmentMonth != null) 'firstInstallmentMonth': firstInstallmentMonth,
      if (installmentsCount != null) 'installmentsCount': installmentsCount,
      if (correctionType != null) 'correctionType': correctionType,
      if (correctTime != null) 'correctTime': correctTime,
      if (delegateName != null) 'delegateName': delegateName,
      if (attachments != null) 'attachments': attachments,
      if (currentReviewer != null) 'currentReviewer': currentReviewer,
      if (rejectionReason != null) 'rejectionReason': rejectionReason,
      if (project != null) 'project': project,
    };
  }
}

class HRRequest {
  final String id;
  final String type; // "leave" | "loan" | "deputation" | "overtime" | "salary-certificate"
  final String typeNameAr;
  final String typeNameEn;
  final String dateSubmitted; // YYYY-MM-DD
  final String status; // "pending" | "approved" | "rejected"
  final RequestDetails details;

  HRRequest({
    required this.id,
    required this.type,
    required this.typeNameAr,
    required this.typeNameEn,
    required this.dateSubmitted,
    required this.status,
    required this.details,
  });

  HRRequest copyWith({
    String? id,
    String? type,
    String? typeNameAr,
    String? typeNameEn,
    String? dateSubmitted,
    String? status,
    RequestDetails? details,
  }) {
    return HRRequest(
      id: id ?? this.id,
      type: type ?? this.type,
      typeNameAr: typeNameAr ?? this.typeNameAr,
      typeNameEn: typeNameEn ?? this.typeNameEn,
      dateSubmitted: dateSubmitted ?? this.dateSubmitted,
      status: status ?? this.status,
      details: details ?? this.details,
    );
  }

  factory HRRequest.fromJson(Map<String, dynamic> json) {
    return HRRequest(
      id: json['id'] ?? '',
      type: json['type'] ?? 'leave',
      typeNameAr: json['typeNameAr'] ?? '',
      typeNameEn: json['typeNameEn'] ?? '',
      dateSubmitted: json['dateSubmitted'] ?? '',
      status: json['status'] ?? 'pending',
      details: RequestDetails.fromJson(json['details'] ?? {}),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'type': type,
      'typeNameAr': typeNameAr,
      'typeNameEn': typeNameEn,
      'dateSubmitted': dateSubmitted,
      'status': status,
      'details': details.toJson(),
    };
  }
}

class SentimentReport {
  final String timestamp;
  final int score;
  final String status;
  final String analysis;

  SentimentReport({
    required this.timestamp,
    required this.score,
    required this.status,
    required this.analysis,
  });

  factory SentimentReport.fromJson(Map<String, dynamic> json) {
    return SentimentReport(
      timestamp: json['timestamp'] ?? '',
      score: json['score'] as int? ?? 50,
      status: json['status'] ?? '',
      analysis: json['analysis'] ?? '',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'timestamp': timestamp,
      'score': score,
      'status': status,
      'analysis': analysis,
    };
  }
}

class AttendanceLocation {
  final double latitude;
  final double longitude;
  final String? address;

  const AttendanceLocation({
    required this.latitude,
    required this.longitude,
    this.address,
  });
}

class AttendanceDevice {
  final String deviceName;
  final String deviceId;
  final String platform;

  const AttendanceDevice({
    required this.deviceName,
    required this.deviceId,
    required this.platform,
  });
}
