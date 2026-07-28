class WorkConfigurationModel {
  final String scheduleName;
  final String shiftName;
  final List<String> workingDays;
  final String shiftStartTime;
  final String shiftEndTime;
  final double dailyHoursRequired;
  final double weeklyHoursRequired;
  final String locationName;
  final double latitude;
  final double longitude;
  final double geofenceRadius;
  final bool remoteWorkAllowed;

  WorkConfigurationModel({
    required this.scheduleName,
    required this.shiftName,
    required this.workingDays,
    required this.shiftStartTime,
    required this.shiftEndTime,
    required this.dailyHoursRequired,
    required this.weeklyHoursRequired,
    required this.locationName,
    required this.latitude,
    required this.longitude,
    required this.geofenceRadius,
    required this.remoteWorkAllowed,
  });

  factory WorkConfigurationModel.fromJson(Map<String, dynamic> json) {
    List<String> days = [];
    if (json['working_days'] is List) {
      days = (json['working_days'] as List).map((e) => e.toString()).toList();
    }
    return WorkConfigurationModel(
      scheduleName: json['schedule_name'] ?? '',
      shiftName: json['shift_name'] ?? '',
      workingDays: days,
      shiftStartTime: json['shift_start_time'] ?? '08:00:00',
      shiftEndTime: json['shift_end_time'] ?? '17:00:00',
      dailyHoursRequired: (json['daily_hours_required'] ?? 8.0).toDouble(),
      weeklyHoursRequired: (json['weekly_hours_required'] ?? 40.0).toDouble(),
      locationName: json['location_name'] ?? '',
      latitude: (json['latitude'] ?? 0.0).toDouble(),
      longitude: (json['longitude'] ?? 0.0).toDouble(),
      geofenceRadius: (json['geofence_radius'] ?? 100.0).toDouble(),
      remoteWorkAllowed: json['remote_work_allowed'] ?? false,
    );
  }

  Map<String, dynamic> toJson() => {
        'schedule_name': scheduleName,
        'shift_name': shiftName,
        'working_days': workingDays,
        'shift_start_time': shiftStartTime,
        'shift_end_time': shiftEndTime,
        'daily_hours_required': dailyHoursRequired,
        'weekly_hours_required': weeklyHoursRequired,
        'location_name': locationName,
        'latitude': latitude,
        'longitude': longitude,
        'geofence_radius': geofenceRadius,
        'remote_work_allowed': remoteWorkAllowed,
      };
}
