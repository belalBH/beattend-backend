class AttendanceSessionModel {
  final int sessionId;
  final String tenantId;
  final int companyId;
  final int employeeId;
  final int? scheduleId;
  final int? shiftId;
  final String shiftInstanceDate;
  final int? workLocationId;
  final String status;
  final String? actualCheckIn;
  final String? actualCheckOut;
  final int workedMinutes;
  final int breakMinutes;
  final int lateMinutes;
  final int earlyLeaveMinutes;
  final int overtimeMinutes;

  AttendanceSessionModel({
    required this.sessionId,
    required this.tenantId,
    required this.companyId,
    required this.employeeId,
    this.scheduleId,
    this.shiftId,
    required this.shiftInstanceDate,
    this.workLocationId,
    required this.status,
    this.actualCheckIn,
    this.actualCheckOut,
    required this.workedMinutes,
    required this.breakMinutes,
    required this.lateMinutes,
    required this.earlyLeaveMinutes,
    required this.overtimeMinutes,
  });

  factory AttendanceSessionModel.fromJson(Map<String, dynamic> json) {
    return AttendanceSessionModel(
      sessionId: json['sessionId'] ?? 0,
      tenantId: json['tenantId'] ?? '',
      companyId: json['companyId'] ?? 0,
      employeeId: json['employeeId'] ?? 0,
      scheduleId: json['scheduleId'],
      shiftId: json['shiftId'],
      shiftInstanceDate: json['shiftInstanceDate'] ?? '',
      workLocationId: json['workLocationId'],
      status: json['status'] ?? 'present',
      actualCheckIn: json['actualCheckIn'],
      actualCheckOut: json['actualCheckOut'],
      workedMinutes: json['workedMinutes'] ?? 0,
      breakMinutes: json['breakMinutes'] ?? 0,
      lateMinutes: json['lateMinutes'] ?? 0,
      earlyLeaveMinutes: json['earlyLeaveMinutes'] ?? 0,
      overtimeMinutes: json['overtimeMinutes'] ?? 0,
    );
  }

  Map<String, dynamic> toJson() => {
        'sessionId': sessionId,
        'tenantId': tenantId,
        'companyId': companyId,
        'employeeId': employeeId,
        'scheduleId': scheduleId,
        'shiftId': shiftId,
        'shiftInstanceDate': shiftInstanceDate,
        'workLocationId': workLocationId,
        'status': status,
        'actualCheckIn': actualCheckIn,
        'actualCheckOut': actualCheckOut,
        'workedMinutes': workedMinutes,
        'breakMinutes': breakMinutes,
        'lateMinutes': lateMinutes,
        'earlyLeaveMinutes': earlyLeaveMinutes,
        'overtimeMinutes': overtimeMinutes,
      };
}

class AttendanceEventModel {
  final int eventId;
  final int? sessionId;
  final String tenantId;
  final int employeeId;
  final String eventType;
  final String eventTimestamp;
  final double? latitude;
  final double? longitude;
  final double? accuracy;
  final String? deviceId;
  final String? platform;
  final String? appVersion;
  final String idempotencyKey;

  AttendanceEventModel({
    required this.eventId,
    this.sessionId,
    required this.tenantId,
    required this.employeeId,
    required this.eventType,
    required this.eventTimestamp,
    this.latitude,
    this.longitude,
    this.accuracy,
    this.deviceId,
    this.platform,
    this.appVersion,
    required this.idempotencyKey,
  });

  factory AttendanceEventModel.fromJson(Map<String, dynamic> json) {
    return AttendanceEventModel(
      eventId: json['eventId'] ?? 0,
      sessionId: json['sessionId'],
      tenantId: json['tenantId'] ?? '',
      employeeId: json['employeeId'] ?? 0,
      eventType: json['eventType'] ?? 'check_in',
      eventTimestamp: json['eventTimestamp'] ?? '',
      latitude: json['latitude'] != null ? double.tryParse(json['latitude'].toString()) : null,
      longitude: json['longitude'] != null ? double.tryParse(json['longitude'].toString()) : null,
      accuracy: json['accuracy'] != null ? double.tryParse(json['accuracy'].toString()) : null,
      deviceId: json['deviceId'],
      platform: json['platform'],
      appVersion: json['appVersion'],
      idempotencyKey: json['idempotencyKey'] ?? '',
    );
  }

  Map<String, dynamic> toJson() => {
        'eventId': eventId,
        'sessionId': sessionId,
        'tenantId': tenantId,
        'employeeId': employeeId,
        'eventType': eventType,
        'eventTimestamp': eventTimestamp,
        'latitude': latitude,
        'longitude': longitude,
        'accuracy': accuracy,
        'deviceId': deviceId,
        'platform': platform,
        'appVersion': appVersion,
        'idempotencyKey': idempotencyKey,
      };
}
