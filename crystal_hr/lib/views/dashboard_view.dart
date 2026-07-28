import 'dart:async';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../models/types.dart';
import '../models/localization.dart';
import '../widgets/glass_card.dart';
import '../widgets/check_in_orb.dart';
import '../services/ai_service.dart';
import '../services/location_service.dart';
import '../services/geofencing_service.dart';
import '../services/database_helper.dart';
import '../repositories/employee_repository.dart';
import '../repositories/company_repository.dart';

class DashboardView extends StatefulWidget {
  final Profile profile;
  final List<CheckInLog> logs;
  final List<Engagement> engagements;
  final bool checkedIn;
  final String? checkInTime;
  final Function(String method) onToggleCheckIn;
  final Function(Engagement newEng) onAddEngagement;
  final Function(String id) onDeleteEngagement;
  final Function(double hours) onUpdateCompletedHours;
  final Function(double hours) onUpdateTargetHours;
  final VoidCallback onOpenProfile;
  final Function(Profile)? onProfileRefreshed;

  const DashboardView({
    super.key,
    required this.profile,
    required this.logs,
    required this.engagements,
    required this.checkedIn,
    this.checkInTime,
    required this.onToggleCheckIn,
    required this.onAddEngagement,
    required this.onDeleteEngagement,
    required this.onUpdateCompletedHours,
    required this.onUpdateTargetHours,
    required this.onOpenProfile,
    this.onProfileRefreshed,
  });

  @override
  State<DashboardView> createState() => _DashboardViewState();
}

class _DashboardViewState extends State<DashboardView> with WidgetsBindingObserver {
  // Timer states
  Timer? _timer;
  Duration _timeLeft = const Duration(hours: 7, minutes: 15, seconds: 30);
  String _method = "Fingerprint";
  bool _isInsideGeofence = true;
  String _geofenceLocationName = "";
  String _lastSyncTime = "-";
  String _assignedLocationId = "-";

  // Configuration overlays
  bool _logsOpen = false;
  bool _configureMatrixOpen = false;
  bool _addEngagementOpen = false;
  Engagement? _selectedEngagement;

  // Add Engagement form inputs
  final _engTitleController = TextEditingController();
  final _engLocationController = TextEditingController();
  final _engTimeController = TextEditingController();
  final _engDescController = TextEditingController();
  DateTime _engDate = DateTime(2026, 10, 16);
  String _engType = "INTERNAL";

  // AI Sentiment states
  final _aiService = AiService();
  bool _aiAnalysisOpen = false;
  bool _aiLoading = false;
  int _aiStage = 0;
  String? _aiReport;

  final List<String> _loadingStages = [
    "Synthesizing biometric access logs...",
    "Evaluating daily presence density...",
    "Querying agenda engagement matrices...",
    "Formulating executive advisory report..."
  ];

  final List<String> _loadingStagesAr = [
    "تحليل ومزامنة سجلات الدخول البيومترية...",
    "تقييم كثافة ونشاط الحضور اليومي...",
    "فحص مصفوفة الارتباطات والاجتماعات...",
    "صياغة مذكرة المستشار الذكي والتقرير التنفيذي..."
  ];

  String _translateDay(String day, String lang) {
    if (lang == "ar") {
      switch (day) {
        case "MON": return "الإثنين";
        case "TUE": return "الثلاثاء";
        case "WED": return "الأربعاء";
        case "THU": return "الخميس";
        case "FRI": return "الجمعة";
        default: return day;
      }
    }
    return day;
  }

  String _translateLocation(String location, String lang) {
    if (lang == "ar") {
      if (location.contains("Board Room")) return "غرفة الاجتماعات الرئيسية";
      if (location.contains("Workspace Lab A")) return "مختبر العمل أ";
      if (location.contains("Workspace Lab B")) return "مختبر العمل ب";
      if (location.contains("Workspace Lab C")) return "مختبر العمل ج";
      if (location.contains("Workspace Lab D")) return "مختبر العمل د";
      if (location.contains("Remote Secure")) return "اتصال آمن عن بعد";
    }
    return location;
  }

  // Weekday Presence states
  String _selectedWeekday = "THU";
  final List<Map<String, dynamic>> _weekdayBars = [
    {"day": "MON", "percent": 0.3, "active": false, "hours": "8.2 hrs", "location": "Board Room Crystal"},
    {"day": "TUE", "percent": 0.6, "active": false, "hours": "9.0 hrs", "location": "Workspace Lab A"},
    {"day": "WED", "percent": 0.5, "active": false, "hours": "8.5 hrs", "location": "Workspace Lab B"},
    {"day": "THU", "percent": 0.2, "active": true, "hours": "6.8 hrs", "location": "Main Headquarters"},
    {"day": "FRI", "percent": 0.0, "active": false, "hours": "0.0 hrs", "location": "Remote Standby"},
  ];

  Future<void> _checkGeofenceStatus() async {
    try {
      final locService = LocationServiceImpl();
      final geofenceService = GeofencingServiceImpl();
      
      // Perform synchronization before checking
      await EmployeeRepository().getMyProfile();
      await CompanyRepository().getOfficeLocations();

      final sqliteProfile = await DatabaseHelper.instance.getUserProfile();
      if (sqliteProfile != null && widget.onProfileRefreshed != null) {
        widget.onProfileRefreshed!(Profile.fromSqlite(sqliteProfile));
      }

      final hasPerm = await locService.isLocationPermissionGranted();
      if (!hasPerm) {
        final status = await locService.requestLocationPermission();
        if (!status) return;
      }
      final loc = await locService.getCurrentLocation();
      if (loc != null) {
        final inside = await geofenceService.isWithinAllowedArea(loc);
        final nearest = await geofenceService.getNearestWorkLocation(loc);
        final now = DateTime.now();
        if (mounted) {
          setState(() {
            _isInsideGeofence = inside;
            _geofenceLocationName = nearest?.name ?? "";
            _assignedLocationId = nearest?.id ?? "1";
            _lastSyncTime = "${now.hour.toString().padLeft(2, '0')}:${now.minute.toString().padLeft(2, '0')}:${now.second.toString().padLeft(2, '0')}";
          });
        }
      }
    } catch (e) {
      print('⚠️ Error checking geofence: $e');
    }
  }

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    _checkGeofenceStatus();
    _startTimer();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state == AppLifecycleState.resumed) {
      _checkGeofenceStatus();
    }
  }

  @override
  void didUpdateWidget(covariant DashboardView oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.checkedIn != oldWidget.checkedIn) {
      _startTimer();
    }
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    _timer?.cancel();
    _engTitleController.dispose();
    _engLocationController.dispose();
    _engTimeController.dispose();
    _engDescController.dispose();
    super.dispose();
  }

  int _ticks = 0;
  void _startTimer() {
    _timer?.cancel();
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      _ticks++;
      if (_ticks % 10 == 0) {
        _checkGeofenceStatus();
      }
      if (mounted) {
        setState(() {});
      }
    });
  }

  String _formatDuration(Duration d) {
    String h = d.inHours.toString().padLeft(2, '0');
    String m = (d.inMinutes % 60).toString().padLeft(2, '0');
    String s = (d.inSeconds % 60).toString().padLeft(2, '0');
    return "$h:$m:$s";
  }

  void _triggerAiAnalysis() async {
    setState(() {
      _aiAnalysisOpen = true;
      _aiLoading = true;
      _aiStage = 0;
      _aiReport = null;
    });

    for (int i = 0; i < _loadingStages.length; i++) {
      await Future.delayed(const Duration(milliseconds: 800));
      if (mounted) {
        setState(() {
          _aiStage = i;
        });
      }
    }

    try {
      final report = await _aiService.generateSentimentAnalysis(
        profile: widget.profile,
        engagements: widget.engagements,
        checkedIn: widget.checkedIn,
      );
      if (mounted) {
        setState(() {
          _aiReport = report;
          _aiLoading = false;
        });
      }
    } catch (_) {
      if (mounted) {
        setState(() {
          _aiLoading = false;
        });
      }
    }
  }

  void _submitEngagement() {
    if (_engTitleController.text.isEmpty) return;

    final months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
    final rawDate = "${_engDate.day} ${months[_engDate.month - 1]}";

    final id = "eng-${DateTime.now().millisecondsSinceEpoch}";
    final newEng = Engagement(
      id: id,
      title: _engTitleController.text,
      date: DateFormat('yyyy-MM-dd').format(_engDate),
      rawDate: rawDate,
      time: _engTimeController.text.isNotEmpty ? _engTimeController.text : "10:00 AM",
      location: _engLocationController.text.isNotEmpty ? _engLocationController.text : "Workspace Lab A",
      type: _engType,
      status: _engType == "STRATEGIC" ? "error" : "active",
      attendees: [widget.profile.avatarUrl],
      description: _engDescController.text.isNotEmpty
          ? _engDescController.text
          : "Corporate engagement, alignment and deliverables review.",
    );

    widget.onAddEngagement(newEng);
    _engTitleController.clear();
    _engDescController.clear();
    setState(() {
      _addEngagementOpen = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    final now = DateTime.now();
    final todayStr = now.toString().split(" ")[0];
    final todayLogs = widget.logs.where((l) => l.date == todayStr).toList();
    todayLogs.sort((a, b) => a.timestamp.compareTo(b.timestamp));

    final hasCheckedIn = widget.checkedIn || todayLogs.any((l) => l.type == "check-in");
    final hasCheckedOut = !widget.checkedIn && hasCheckedIn && todayLogs.any((l) => l.type == "check-out");

    String? checkInTimeText = widget.checkInTime;
    if (checkInTimeText == null && hasCheckedIn) {
      try {
        final inLog = todayLogs.firstWhere((l) => l.type == "check-in");
        checkInTimeText = inLog.timestamp;
      } catch (_) {
        checkInTimeText = "08:28 AM";
      }
    }

    String? checkOutTimeText;
    if (hasCheckedOut) {
      try {
        final outLog = todayLogs.firstWhere((l) => l.type == "check-out");
        checkOutTimeText = outLog.timestamp;
      } catch (_) {
        checkOutTimeText = "05:02 PM";
      }
    }

    final shiftStart = DateTime(now.year, now.month, now.day, 8, 30);
    final shiftEnd = DateTime(now.year, now.month, now.day, 17, 30);

    Duration countdownToShiftStart = Duration.zero;
    if (now.isBefore(shiftStart)) {
      countdownToShiftStart = shiftStart.difference(now);
    }

    Duration liveWorkingDuration = Duration.zero;
    if (widget.checkedIn && checkInTimeText != null) {
      try {
        final parts = checkInTimeText.split(" ");
        final timeParts = parts[0].split(":");
        int hour = int.parse(timeParts[0]);
        int minute = int.parse(timeParts[1]);
        final isPm = parts[1].toLowerCase() == "pm";
        if (isPm && hour < 12) hour += 12;
        if (!isPm && hour == 12) hour = 0;
        final checkInDateTime = DateTime(now.year, now.month, now.day, hour, minute);
        if (now.isAfter(checkInDateTime)) {
          liveWorkingDuration = now.difference(checkInDateTime);
        }
      } catch (_) {}
    }

    Duration remainingShiftTime = Duration.zero;
    if (widget.checkedIn) {
      if (now.isBefore(shiftEnd)) {
        remainingShiftTime = shiftEnd.difference(now);
      }
    }

    final Map<String, Map<String, String>> weekdayDetails = {
      "MON": {
        "checkIn": "08:28 AM",
        "breakStart": "12:00 PM",
        "breakEnd": "12:45 PM",
        "checkOut": "05:02 PM",
        "totalHours": "7.7 hrs",
        "totalHoursAr": "7.7 ساعة",
      },
      "TUE": {
        "checkIn": "08:15 AM",
        "breakStart": "12:00 PM",
        "breakEnd": "01:00 PM",
        "checkOut": "05:45 PM",
        "totalHours": "8.5 hrs",
        "totalHoursAr": "8.5 ساعة",
      },
      "WED": {
        "checkIn": "08:32 AM",
        "breakStart": "12:15 PM",
        "breakEnd": "01:05 PM",
        "checkOut": "05:00 PM",
        "totalHours": "7.6 hrs",
        "totalHoursAr": "7.6 ساعة",
      },
      "THU": {
        "checkIn": "08:25 AM",
        "breakStart": "12:00 PM",
        "breakEnd": "12:45 PM",
        "checkOut": "05:30 PM",
        "totalHours": "8.0 hrs",
        "totalHoursAr": "8.0 ساعة",
      },
      "FRI": {
        "checkIn": "--:--",
        "breakStart": "--:--",
        "breakEnd": "--:--",
        "checkOut": "--:--",
        "totalHours": "0.0 hrs",
        "totalHoursAr": "0.0 ساعة",
      },
    };

    final double pacingScore = widget.profile.weeklyTargetHours > 0
        ? (widget.profile.completedHours / widget.profile.weeklyTargetHours * 100)
        : 0.0;
    final int pacingPercent = pacingScore.clamp(0.0, 100.0).round();

    final isLight = widget.profile.themeMode == "light";
    final titleColor = isLight ? const Color(0xFF0F172A) : Colors.white;
    final subColor = isLight ? const Color(0xFF2563EB) : const Color(0xFF4CD7F6);
    final statusBadgeColor = isLight ? const Color(0x990A0E1A) : const Color(0x11FFFFFF);

    return RefreshIndicator(
      onRefresh: () => _checkGeofenceStatus(),
      color: const Color(0xFF4CD7F6),
      backgroundColor: const Color(0xFF1E293B),
      child: SingleChildScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 15),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Welcome Row
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    Localization.translate('welcome_back', widget.profile.language),
                    style: TextStyle(
                      fontFamily: 'monospace',
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
                      color: subColor,
                      letterSpacing: 2.0,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    widget.profile.name,
                    style: TextStyle(
                      fontSize: 22,
                      fontWeight: FontWeight.w900,
                      color: titleColor,
                    ),
                  ),
                ],
              ),
              // Status Badge
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                decoration: BoxDecoration(
                  color: statusBadgeColor,
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: Colors.white.withOpacity(0.08)),
                ),
                child: Row(
                  children: [
                    Container(
                      width: 8,
                      height: 8,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: widget.profile.officeStatus == "ACTIVE"
                            ? const Color(0xFF4CD7F6)
                            : widget.profile.officeStatus == "REMOTE"
                                ? const Color(0xFF10B981)
                                : const Color(0xFFF43F5E),
                        boxShadow: [
                          BoxShadow(
                            color: (widget.profile.officeStatus == "ACTIVE"
                                    ? const Color(0xFF4CD7F6)
                                    : widget.profile.officeStatus == "REMOTE"
                                        ? const Color(0xFF10B981)
                                        : const Color(0xFFF43F5E))
                                .withOpacity(0.5),
                            blurRadius: 6,
                          )
                        ],
                      ),
                    ),
                    const SizedBox(width: 8),
                    Text(
                      "STATUS: ${widget.profile.officeStatus}",
                      style: const TextStyle(
                        fontFamily: 'monospace',
                        fontSize: 9,
                        fontWeight: FontWeight.bold,
                        color: Colors.grey,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 20),

          // Main Layout Bento Box
          // Check-in Orb Glass Card
          Stack(
            children: [
              GlassCard(
                height: 425,
                child: Column(
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(Icons.access_time, size: 14, color: Color(0xFF4CD7F6)),
                        const SizedBox(width: 6),
                        Text(
                          hasCheckedOut
                              ? (widget.profile.language == "ar" ? "ملخص اليوم" : "DAILY SUMMARY")
                              : widget.checkedIn
                                  ? (widget.profile.language == "ar" ? "الدوام النشط" : "ACTIVE SHIFT")
                                  : (widget.profile.language == "ar" ? "قبل تسجيل الحضور" : "PRE-CHECK-IN STATUS"),
                          style: const TextStyle(
                            fontFamily: 'monospace',
                            fontSize: 10,
                            fontWeight: FontWeight.bold,
                            color: Colors.grey,
                            letterSpacing: 1.5,
                          ),
                        ),
                      ],
                    ),
                    const Spacer(),
                    CheckInOrb(
                      checkedIn: widget.checkedIn,
                      checkInTime: checkInTimeText,
                      language: widget.profile.language,
                      onTap: _isInsideGeofence ? () => widget.onToggleCheckIn(_method) : () {},
                    ),
                    const Spacer(),
                    if (!_isInsideGeofence) ...[
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                        decoration: BoxDecoration(
                          color: const Color(0xFFF43F5E).withOpacity(0.1),
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(color: const Color(0xFFF43F5E).withOpacity(0.3)),
                        ),
                        child: Text(
                          widget.profile.language == "ar"
                              ? "⚠️ خارج النطاق الجغرافي المسموح به"
                              : "⚠️ Outside Allowed Geofence Location",
                          style: const TextStyle(color: Color(0xFFF43F5E), fontSize: 10, fontWeight: FontWeight.bold),
                        ),
                      ),
                    ] else if (!hasCheckedIn) ...[
                      Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          _buildDetailLabel(
                            widget.profile.language == "ar" ? "الموقع: المقر" : "Location: HQ",
                          ),
                          const SizedBox(width: 8),
                          _buildDetailLabel(
                            widget.profile.language == "ar" ? "الوردية: عادية" : "Shift: Regular",
                          ),
                          const SizedBox(width: 8),
                          _buildDetailLabel(
                            countdownToShiftStart.inSeconds > 0
                                ? "${widget.profile.language == "ar" ? "يبدأ خلال: " : "Starts in: "}${_formatDuration(countdownToShiftStart)}"
                                : (widget.profile.language == "ar" ? "بدأ الدوام (08:30 ص)" : "Shift started (08:30 AM)"),
                          ),
                        ],
                      ),
                    ] else if (widget.checkedIn) ...[
                      Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          _buildDetailLabel(
                            "${widget.profile.language == "ar" ? "المدة: " : "Duration: "}${_formatDuration(liveWorkingDuration)}",
                          ),
                          const SizedBox(width: 8),
                          _buildDetailLabel(
                            "${widget.profile.language == "ar" ? "المتبقي: " : "Rem: "}${_formatDuration(remainingShiftTime)}",
                          ),
                          const SizedBox(width: 8),
                          _buildDetailLabel(
                            widget.profile.language == "ar" ? "المغادرة: 05:30 م" : "Checkout: 05:30 PM",
                          ),
                        ],
                      ),
                    ] else ...[
                      Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          _buildDetailLabel(
                            "${widget.profile.language == "ar" ? "المغادرة: " : "Out: "}$checkOutTimeText",
                          ),
                          const SizedBox(width: 8),
                          _buildDetailLabel(
                            "${widget.profile.language == "ar" ? "الساعات: 8.2 س" : "Worked: 8.2 hrs"}",
                          ),
                          const SizedBox(width: 8),
                          _buildDetailLabel(
                            widget.profile.language == "ar" ? "مكتمل" : "Completed",
                          ),
                        ],
                      ),
                    ],
                    const SizedBox(height: 20),
                    const Divider(color: Colors.white10),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Row(
                          children: [
                            Text(
                              Localization.translate('method', widget.profile.language),
                              style: const TextStyle(color: Colors.grey, fontSize: 8),
                            ),
                            DropdownButton<String>(
                              value: _method,
                              dropdownColor: const Color(0xFF121414),
                              underline: const SizedBox(),
                              style: const TextStyle(
                                  color: Colors.white,
                                  fontSize: 8,
                                  fontWeight: FontWeight.bold),
                              items: ["Fingerprint", "NFC", "Manual Override"]
                                  .map((m) {
                                    String label = m;
                                    if (m == "Fingerprint") label = Localization.translate('fingerprint', widget.profile.language);
                                    if (m == "NFC") label = Localization.translate('nfc', widget.profile.language);
                                    if (m == "Manual Override") label = Localization.translate('manual_override', widget.profile.language);
                                    return DropdownMenuItem(
                                      value: m,
                                      child: Text(label),
                                    );
                                  })
                                  .toList(),
                              onChanged: (val) {
                                if (val != null) setState(() => _method = val);
                              },
                            ),
                            const SizedBox(width: 4),
                            Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Container(
                                  width: 5,
                                  height: 5,
                                  decoration: BoxDecoration(
                                    shape: BoxShape.circle,
                                    color: _isInsideGeofence ? const Color(0xFF10B981) : const Color(0xFFEF4444),
                                  ),
                                ),
                                 const SizedBox(width: 4),
                                 Text(
                                   _isInsideGeofence
                                       ? (_geofenceLocationName.isNotEmpty
                                           ? "$_geofenceLocationName - ${widget.profile.language == "ar" ? "داخل النطاق" : "Inside Range"}"
                                           : (widget.profile.language == "ar" ? "داخل النطاق" : "Inside Range"))
                                       : (_geofenceLocationName.isNotEmpty
                                           ? "$_geofenceLocationName - ${widget.profile.language == "ar" ? "خارج النطاق" : "Outside Range"}"
                                           : (widget.profile.language == "ar" ? "خارج النطاق" : "Outside Range")),
                                   style: TextStyle(
                                     color: _isInsideGeofence ? const Color(0xFF10B981) : const Color(0xFFEF4444),
                                     fontSize: 8,
                                     fontWeight: FontWeight.bold,
                                   ),
                                 ),
                                 const SizedBox(width: 8),
                                 Text(
                                   "[Diag - Loc: $_geofenceLocationName, ID: $_assignedLocationId, Sync: $_lastSyncTime]",
                                   style: const TextStyle(color: Colors.grey, fontSize: 6, fontWeight: FontWeight.bold),
                                 ),
                              ],
                            ),
                          ],
                        ),
                        TextButton.icon(
                          onPressed: () => setState(() => _logsOpen = true),
                          icon: const Icon(Icons.history, size: 10, color: Color(0xFF4CD7F6)),
                          label: Text(
                            "${Localization.translate('logs', widget.profile.language)} (${widget.logs.length})",
                            style: const TextStyle(
                                color: Color(0xFF4CD7F6),
                                fontSize: 8,
                                fontWeight: FontWeight.bold),
                          ),
                        ),
                      ],
                    )
                  ],
                ),
              ),

              // Access Ledger Overlay Sheet
              if (_logsOpen)
                Positioned.fill(
                  child: GlassCard(
                    backgroundColor: const Color(0xFC0A0E1A),
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            const Row(
                              children: [
                                Icon(Icons.key, size: 16, color: Color(0xFF4CD7F6)),
                                SizedBox(width: 8),
                                Text(
                                  "ACCESS LOG LEDGER",
                                  style: TextStyle(
                                    fontSize: 12,
                                    fontWeight: FontWeight.bold,
                                    color: Colors.white,
                                    letterSpacing: 1.0,
                                  ),
                                ),
                              ],
                            ),
                            IconButton(
                              onPressed: () => setState(() => _logsOpen = false),
                              icon: const Icon(Icons.close, size: 16, color: Colors.grey),
                            ),
                          ],
                        ),
                        const Divider(color: Colors.white10),
                        Expanded(
                          child: widget.logs.isEmpty
                              ? const Center(
                                  child: Text(
                                    "No access logs found.",
                                    style: TextStyle(color: Colors.grey, fontSize: 12),
                                  ),
                                )
                              : ListView.builder(
                                  itemCount: widget.logs.length,
                                  itemBuilder: (context, index) {
                                    final log = widget.logs[index];
                                    final isCheckIn = log.type == "check-in";
                                    return Container(
                                      margin: const EdgeInsets.only(bottom: 8),
                                      padding: const EdgeInsets.all(10),
                                      decoration: BoxDecoration(
                                        color: Colors.white.withOpacity(0.03),
                                        borderRadius: BorderRadius.circular(12),
                                        border: Border.all(color: Colors.white10),
                                      ),
                                      child: Row(
                                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                        children: [
                                          Row(
                                            children: [
                                              Container(
                                                width: 8,
                                                height: 8,
                                                decoration: BoxDecoration(
                                                  shape: BoxShape.circle,
                                                  color: isCheckIn
                                                      ? const Color(0xFF4CD7F6)
                                                      : const Color(0xFFF43F5E),
                                                ),
                                              ),
                                              const SizedBox(width: 10),
                                              Column(
                                                crossAxisAlignment: CrossAxisAlignment.start,
                                                children: [
                                                  Text(
                                                    isCheckIn ? "Clock In" : "Clock Out",
                                                    style: const TextStyle(
                                                      color: Colors.white,
                                                      fontSize: 12,
                                                      fontWeight: FontWeight.bold,
                                                    ),
                                                  ),
                                                  Text(
                                                    "Via ${log.method}",
                                                    style: const TextStyle(
                                                        color: Colors.grey, fontSize: 9),
                                                  ),
                                                ],
                                              ),
                                            ],
                                          ),
                                          Column(
                                            crossAxisAlignment: CrossAxisAlignment.end,
                                            children: [
                                              Text(
                                                log.timestamp,
                                                style: const TextStyle(
                                                  color: Colors.white,
                                                  fontSize: 11,
                                                  fontFamily: 'monospace',
                                                  fontWeight: FontWeight.bold,
                                                ),
                                              ),
                                              Text(
                                                log.date,
                                                style: const TextStyle(
                                                    color: Colors.grey, fontSize: 9),
                                              ),
                                            ],
                                          )
                                        ],
                                      ),
                                    );
                                  },
                                ),
                        ),
                      ],
                    ),
                  ),
                ),
            ],
          ),
          const SizedBox(height: 16),

          // New compact Today's Summary card
          GlassCard(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      widget.profile.language == "ar" ? "ملخص اليوم" : "TODAY'S SUMMARY",
                      style: const TextStyle(
                        fontFamily: 'monospace',
                        fontSize: 10,
                        fontWeight: FontWeight.bold,
                        color: Color(0xFF4CD7F6),
                        letterSpacing: 1.0,
                      ),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                      decoration: BoxDecoration(
                        color: _isInsideGeofence
                            ? const Color(0xFF10B981).withOpacity(0.1)
                            : const Color(0xFFF59E0B).withOpacity(0.1),
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: Text(
                        _isInsideGeofence
                            ? (widget.profile.language == "ar" ? "داخل النطاق" : "Inside Geofence")
                            : (widget.profile.language == "ar" ? "خارج النطاق" : "Outside Geofence"),
                        style: TextStyle(
                          color: _isInsideGeofence ? const Color(0xFF10B981) : const Color(0xFFF59E0B),
                          fontSize: 8,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 10),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    _buildSummaryItem(
                      label: widget.profile.language == "ar" ? "تسجيل الحضور" : "Check-in",
                      value: checkInTimeText ?? "--:--",
                    ),
                    _buildSummaryItem(
                      label: widget.profile.language == "ar" ? "المغادرة المتوقعة" : "Expected Out",
                      value: hasCheckedIn ? "05:30 PM" : "--:--",
                    ),
                    _buildSummaryItem(
                      label: widget.profile.language == "ar" ? "ساعات العمل" : "Worked Hours",
                      value: hasCheckedOut
                          ? "8.2 hrs"
                          : widget.checkedIn
                              ? "${(liveWorkingDuration.inMinutes / 60.0).toStringAsFixed(1)} hrs"
                              : "0.0 hrs",
                    ),
                    _buildSummaryItem(
                      label: widget.profile.language == "ar" ? "مدة الاستراحة" : "Break",
                      value: hasCheckedIn ? "45 min" : "0 min",
                    ),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),

          // Stats Card
          // Stats Card
          GlassCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.all(8),
                          decoration: BoxDecoration(
                            color: const Color(0x15FFFFFF),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: const Icon(Icons.schedule, size: 18, color: Colors.white),
                        ),
                        const SizedBox(width: 10),
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              Localization.translate('time_matrix_label', widget.profile.language),
                              style: const TextStyle(
                                fontSize: 10,
                                fontWeight: FontWeight.bold,
                                color: Colors.grey,
                                letterSpacing: 1.5,
                              ),
                            ),
                            Text(
                              Localization.translate('weekly_pacing_desc', widget.profile.language),
                              style: const TextStyle(color: Color(0xFF4CD7F6), fontSize: 9),
                            ),
                          ],
                        ),
                      ],
                    ),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        Text(
                          Localization.translate('logged_hours_pacing', widget.profile.language),
                          style: const TextStyle(color: Colors.grey, fontSize: 9),
                        ),
                        Text(
                          "${widget.profile.completedHours.toStringAsFixed(1)} / ${widget.profile.weeklyTargetHours.toStringAsFixed(0)}",
                          style: const TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.w900,
                            color: Colors.white,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
                const SizedBox(height: 15),
                ClipRRect(
                  borderRadius: BorderRadius.circular(5),
                  child: LinearProgressIndicator(
                    value: (pacingScore / 100).clamp(0.0, 1.0),
                    backgroundColor: const Color(0xFF1A1C1C),
                    color: const Color(0xFF4CD7F6),
                    minHeight: 8,
                  ),
                ),
                const SizedBox(height: 10),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      "$pacingPercent% ${widget.profile.language == "ar" ? "مكتمل" : "COMPLETED"}",
                      style: const TextStyle(
                        fontFamily: 'monospace',
                        fontSize: 9,
                        fontWeight: FontWeight.bold,
                        color: Colors.grey,
                      ),
                    ),
                    Text(
                      "+2.4h vs LW",
                      style: const TextStyle(
                        fontFamily: 'monospace',
                        fontSize: 9,
                        fontWeight: FontWeight.bold,
                        color: Color(0xFF4CD7F6),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 15),
                const Divider(color: Colors.white10),
                const SizedBox(height: 10),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    _buildSummaryItem(
                      label: widget.profile.language == "ar" ? "الساعات المنجزة" : "Worked Hours",
                      value: "${widget.profile.completedHours.toStringAsFixed(1)}h",
                    ),
                    _buildSummaryItem(
                      label: widget.profile.language == "ar" ? "الساعات المطلوبة" : "Required Hours",
                      value: "${widget.profile.weeklyTargetHours.toStringAsFixed(0)}h",
                    ),
                    _buildSummaryItem(
                      label: widget.profile.language == "ar" ? "الساعات المتبقية" : "Remaining Hours",
                      value: "${(widget.profile.weeklyTargetHours - widget.profile.completedHours).clamp(0.0, 999.0).toStringAsFixed(1)}h",
                    ),
                    _buildSummaryItem(
                      label: widget.profile.language == "ar" ? "العمل الإضافي" : "Overtime",
                      value: "${(widget.profile.completedHours - widget.profile.weeklyTargetHours).clamp(0.0, 999.0).toStringAsFixed(1)}h",
                    ),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),

          // Presence Weekday Chart Card
          GlassCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.all(8),
                          decoration: BoxDecoration(
                            color: const Color(0x15FFFFFF),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: const Icon(Icons.location_on, size: 18, color: Color(0xFF4CD7F6)),
                        ),
                        const SizedBox(width: 10),
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              Localization.translate('office_presence', widget.profile.language),
                              style: const TextStyle(
                                fontSize: 10,
                                fontWeight: FontWeight.bold,
                                color: Colors.grey,
                                letterSpacing: 1.5,
                              ),
                            ),
                            Text(
                              Localization.translate('signal_intensity', widget.profile.language),
                              style: const TextStyle(color: Color(0xFF4CD7F6), fontSize: 9),
                            ),
                          ],
                        ),
                      ],
                    ),
                    const Column(
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        Text(
                          "ATTENDANCE",
                          style: TextStyle(color: Colors.grey, fontSize: 9),
                        ),
                        Text(
                          "94%",
                          style: TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.w900,
                            color: Colors.white,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
                const SizedBox(height: 20),

                // Weekday Columns
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: _weekdayBars.map((bar) {
                    final String day = bar["day"];
                    final double percent = bar["percent"];
                    final bool isSel = _selectedWeekday == day;
                    final bool disabled = percent == 0.0;

                    return Expanded(
                      child: GestureDetector(
                        onTap: () {
                          setState(() {
                            _selectedWeekday = day;
                          });
                        },
                        child: Container(
                          margin: const EdgeInsets.symmetric(horizontal: 4),
                          padding: const EdgeInsets.symmetric(vertical: 8),
                          decoration: BoxDecoration(
                            color: isSel
                                ? const Color(0x154CD7F6)
                                : Colors.white.withOpacity(0.02),
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(
                              color: isSel
                                  ? const Color(0xFF4CD7F6).withOpacity(0.4)
                                  : Colors.white.withOpacity(0.05),
                            ),
                          ),
                          child: Opacity(
                            opacity: disabled ? 0.3 : 1.0,
                            child: Column(
                              children: [
                                Text(
                                  _translateDay(day, widget.profile.language),
                                  style: TextStyle(
                                    fontFamily: 'monospace',
                                    fontSize: 9,
                                    fontWeight: FontWeight.bold,
                                    color: isSel ? const Color(0xFF4CD7F6) : Colors.grey,
                                  ),
                                ),
                                const SizedBox(height: 12),
                                Container(
                                  height: 35,
                                  alignment: Alignment.bottomCenter,
                                  child: Container(
                                    width: 4,
                                    height: (percent * 35).clamp(4.0, 35.0),
                                    decoration: BoxDecoration(
                                      color: isSel ? const Color(0xFF4CD7F6) : Colors.grey,
                                      borderRadius: BorderRadius.circular(2),
                                      boxShadow: isSel
                                          ? [
                                              const BoxShadow(
                                                  color: Color(0xFF4CD7F6), blurRadius: 4)
                                            ]
                                          : null,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ),
                    );
                  }).toList(),
                ),
                const SizedBox(height: 15),

                // Selected Weekday details
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.02),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: Colors.white.withOpacity(0.04)),
                  ),
                  child: Column(
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Row(
                            children: [
                              Container(
                                width: 6,
                                height: 6,
                                decoration: const BoxDecoration(
                                  shape: BoxShape.circle,
                                  color: Color(0xFF4CD7F6),
                                ),
                              ),
                              const SizedBox(width: 8),
                              Text(
                                "${_translateDay(_selectedWeekday, widget.profile.language)} ${widget.profile.language == 'ar' ? 'التفاصيل' : 'DETAILS'}",
                                style: const TextStyle(
                                  color: Colors.white,
                                  fontSize: 10,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ],
                          ),
                          Text(
                            widget.profile.language == "ar"
                                ? "ساعات الدوام: ${weekdayDetails[_selectedWeekday]?['totalHoursAr']}"
                                : "Hours: ${weekdayDetails[_selectedWeekday]?['totalHours']}",
                            style: const TextStyle(color: Color(0xFF4CD7F6), fontSize: 9, fontWeight: FontWeight.bold),
                          )
                        ],
                      ),
                      const SizedBox(height: 8),
                      const Divider(color: Colors.white10, height: 1),
                      const SizedBox(height: 8),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          _buildDetailItem(
                            widget.profile.language == "ar" ? "الحضور" : "Check-in",
                            weekdayDetails[_selectedWeekday]?["checkIn"] ?? "--:--",
                          ),
                          _buildDetailItem(
                            widget.profile.language == "ar" ? "بداية الاستراحة" : "Break Start",
                            weekdayDetails[_selectedWeekday]?["breakStart"] ?? "--:--",
                          ),
                          _buildDetailItem(
                            widget.profile.language == "ar" ? "نهاية الاستراحة" : "Break End",
                            weekdayDetails[_selectedWeekday]?["breakEnd"] ?? "--:--",
                          ),
                          _buildDetailItem(
                            widget.profile.language == "ar" ? "الانصراف" : "Check-out",
                            weekdayDetails[_selectedWeekday]?["checkOut"] ?? "--:--",
                          ),
                        ],
                      )
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),

          // Compact Employee Information Grid
          GridView.count(
            crossAxisCount: 2,
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            crossAxisSpacing: 8,
            mainAxisSpacing: 8,
            childAspectRatio: 2.3,
            children: [
              _buildCompactInfoCard(
                icon: Icons.calendar_today,
                label: widget.profile.language == "ar" ? "رصيد الإجازات" : "Leave Balance",
                value: widget.profile.language == "ar" ? "24.5 يوم" : "24.5 Days",
              ),
              _buildCompactInfoCard(
                icon: Icons.assignment_turned_in,
                label: widget.profile.language == "ar" ? "طلباتي" : "My Requests",
                value: widget.profile.language == "ar" ? "1 معلق" : "1 Pending",
              ),
              _buildCompactInfoCard(
                icon: Icons.payments,
                label: widget.profile.language == "ar" ? "آخر مسير رواتب" : "Latest Payslip",
                value: widget.profile.language == "ar" ? "يونيو 2026" : "June 2026",
              ),
              _buildCompactInfoCard(
                icon: Icons.supervisor_account,
                label: widget.profile.language == "ar" ? "المدير المباشر" : "Direct Manager",
                value: widget.profile.language == "ar" ? "سارة جينكينز" : "Sarah Jenkins",
              ),
            ],
          ),
          const SizedBox(height: 16),

          // HR Notifications Card
          GlassCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    const Icon(Icons.notifications, size: 16, color: Color(0xFF4CD7F6)),
                    const SizedBox(width: 8),
                    Text(
                      widget.profile.language == "ar" ? "الإشعارات الأخيرة" : "RECENT NOTIFICATIONS",
                      style: const TextStyle(
                        fontFamily: 'monospace',
                        fontSize: 10,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                        letterSpacing: 1.0,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                _buildNotificationItem(
                  icon: Icons.check_circle_outline,
                  color: const Color(0xFF10B981),
                  title: widget.profile.language == "ar" ? "تم قبول طلب الإجازة" : "Annual Leave Approved",
                  desc: widget.profile.language == "ar"
                      ? "تم قبول طلب إجازتك السنوية من 1 أغسطس إلى 10 أغسطس."
                      : "Your annual leave request from Aug 1 to Aug 10 has been approved.",
                  time: "1h ago",
                ),
                const SizedBox(height: 8),
                _buildNotificationItem(
                  icon: Icons.payments,
                  color: const Color(0xFF3B82F6),
                  title: widget.profile.language == "ar" ? "تم إيداع الراتب الشهري" : "Monthly Payroll Processed",
                  desc: widget.profile.language == "ar"
                      ? "تم تحويل راتب شهر يونيو بنجاح إلى حسابك البنكي."
                      : "Your salary for June has been successfully transferred to your bank account.",
                  time: "2d ago",
                ),
                const SizedBox(height: 8),
                _buildNotificationItem(
                  icon: Icons.campaign,
                  color: const Color(0xFFF59E0B),
                  title: widget.profile.language == "ar" ? "تنويه: بدء الدوام الرسمي" : "HR Announcement: Regular Shift",
                  desc: widget.profile.language == "ar"
                      ? "بدء الدوام الرسمي للوردية الصباحية في تمام الساعة 08:30 صباحاً."
                      : "Reminder: The regular morning shift begins promptly at 08:30 AM.",
                  time: "3d ago",
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),

          // Next Engagements Card
          Stack(
            children: [
              GlassCard(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Row(
                          children: [
                            const Icon(Icons.calendar_today, size: 16, color: Color(0xFF4CD7F6)),
                            const SizedBox(width: 8),
                            Text(
                              Localization.translate('next_engagements', widget.profile.language),
                              style: const TextStyle(
                                fontSize: 12,
                                fontWeight: FontWeight.bold,
                                color: Colors.white,
                              ),
                            ),
                          ],
                        ),
                        TextButton.icon(
                          onPressed: () => setState(() => _addEngagementOpen = true),
                          icon: const Icon(Icons.add, size: 14, color: Color(0xFF4CD7F6)),
                          label: Text(
                            Localization.translate('add_event', widget.profile.language),
                            style: const TextStyle(
                                color: Color(0xFF4CD7F6),
                                fontSize: 10,
                                fontWeight: FontWeight.bold),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    widget.engagements.isEmpty
                        ? Padding(
                            padding: const EdgeInsets.symmetric(vertical: 20),
                            child: Center(
                              child: Text(
                                Localization.translate('no_requests', widget.profile.language),
                                style: const TextStyle(color: Colors.grey, fontSize: 11),
                              ),
                            ),
                          )
                        : Column(
                            children: widget.engagements.map((item) {
                              final dayNum = item.rawDate.split(" ")[0];
                              final dayMonth = item.rawDate.split(" ")[1];
                              return GestureDetector(
                                onTap: () => setState(() => _selectedEngagement = item),
                                child: Container(
                                  margin: const EdgeInsets.only(bottom: 10),
                                  padding: const EdgeInsets.all(12),
                                  decoration: BoxDecoration(
                                    color: Colors.white.withOpacity(0.03),
                                    borderRadius: BorderRadius.circular(16),
                                    border: Border.all(color: Colors.white10),
                                  ),
                                  child: Row(
                                    children: [
                                      // Date badge
                                      Container(
                                        width: 44,
                                        height: 44,
                                        decoration: BoxDecoration(
                                          color: Colors.white.withOpacity(0.04),
                                          borderRadius: BorderRadius.circular(10),
                                          border: Border.all(color: Colors.white10),
                                        ),
                                        child: Column(
                                          mainAxisAlignment: MainAxisAlignment.center,
                                          children: [
                                            Text(
                                              dayNum,
                                              style: const TextStyle(
                                                fontSize: 13,
                                                fontWeight: FontWeight.w900,
                                                color: Colors.white,
                                              ),
                                            ),
                                            Text(
                                              dayMonth,
                                              style: const TextStyle(
                                                fontFamily: 'monospace',
                                                fontSize: 8,
                                                fontWeight: FontWeight.bold,
                                                color: Colors.grey,
                                              ),
                                            ),
                                          ],
                                        ),
                                      ),
                                      const SizedBox(width: 12),
                                      Expanded(
                                        child: Column(
                                          crossAxisAlignment: CrossAxisAlignment.start,
                                          children: [
                                            Text(
                                              item.title,
                                              style: const TextStyle(
                                                fontSize: 12,
                                                fontWeight: FontWeight.bold,
                                                color: Colors.white,
                                              ),
                                              maxLines: 1,
                                              overflow: TextOverflow.ellipsis,
                                            ),
                                            const SizedBox(height: 4),
                                            Text(
                                              "${item.time} • ${item.location}",
                                              style: const TextStyle(
                                                  color: Colors.grey, fontSize: 10),
                                              maxLines: 1,
                                              overflow: TextOverflow.ellipsis,
                                            ),
                                          ],
                                        ),
                                      ),
                                      Container(
                                        width: 8,
                                        height: 8,
                                        decoration: BoxDecoration(
                                          shape: BoxShape.circle,
                                          color: item.status == "error"
                                              ? const Color(0xFFF43F5E)
                                              : const Color(0xFF4CD7F6),
                                          boxShadow: [
                                            BoxShadow(
                                              color: (item.status == "error"
                                                      ? const Color(0xFFF43F5E)
                                                      : const Color(0xFF4CD7F6))
                                                  .withOpacity(0.5),
                                              blurRadius: 4,
                                            )
                                          ],
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              );
                            }).toList(),
                          )
                  ],
                ),
              ),

              // Add Engagement Sheet
              if (_addEngagementOpen)
                Positioned.fill(
                  child: GlassCard(
                    backgroundColor: const Color(0xFD0C0F0F),
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            const Text(
                              "SCHEDULE ENGAGEMENT",
                              style: TextStyle(
                                  color: Colors.white,
                                  fontSize: 12,
                                  fontWeight: FontWeight.bold),
                            ),
                            IconButton(
                              onPressed: () => setState(() => _addEngagementOpen = false),
                              icon: const Icon(Icons.close, size: 16, color: Colors.grey),
                            ),
                          ],
                        ),
                        Expanded(
                          child: SingleChildScrollView(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                TextField(
                                  controller: _engTitleController,
                                  style: const TextStyle(color: Colors.white, fontSize: 12),
                                  decoration: const InputDecoration(
                                    labelText: "Engagement Title",
                                    labelStyle: TextStyle(color: Colors.grey, fontSize: 10),
                                  ),
                                ),
                                const SizedBox(height: 10),
                                Row(
                                  children: [
                                    Expanded(
                                      child: TextButton.icon(
                                        onPressed: () async {
                                          final d = await showDatePicker(
                                            context: context,
                                            initialDate: _engDate,
                                            firstDate: DateTime.now(),
                                            lastDate: DateTime(2030),
                                          );
                                          if (d != null) {
                                            setState(() => _engDate = d);
                                          }
                                        },
                                        icon: const Icon(Icons.date_range, size: 14, color: Colors.white),
                                        label: Text(
                                          DateFormat('yyyy-MM-dd').format(_engDate),
                                          style: const TextStyle(color: Colors.white, fontSize: 11),
                                        ),
                                      ),
                                    ),
                                    Expanded(
                                      child: TextField(
                                        controller: _engTimeController,
                                        style: const TextStyle(color: Colors.white, fontSize: 12),
                                        decoration: const InputDecoration(
                                          labelText: "Time (e.g. 02:00 PM)",
                                          labelStyle: TextStyle(color: Colors.grey, fontSize: 10),
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 10),
                                TextField(
                                  controller: _engLocationController,
                                  style: const TextStyle(color: Colors.white, fontSize: 12),
                                  decoration: const InputDecoration(
                                    labelText: "Location Matrix",
                                    labelStyle: TextStyle(color: Colors.grey, fontSize: 10),
                                  ),
                                ),
                                const SizedBox(height: 10),
                                DropdownButtonFormField<String>(
                                  value: _engType,
                                  dropdownColor: const Color(0xFF121414),
                                  style: const TextStyle(color: Colors.white, fontSize: 12),
                                  decoration: const InputDecoration(
                                    labelText: "Engagement Mode",
                                    labelStyle: TextStyle(color: Colors.grey, fontSize: 10),
                                  ),
                                  items: ["INTERNAL", "CLIENT", "STRATEGIC", "OTHER"]
                                      .map((t) => DropdownMenuItem(value: t, child: Text(t)))
                                      .toList(),
                                  onChanged: (val) {
                                    if (val != null) setState(() => _engType = val);
                                  },
                                ),
                                const SizedBox(height: 10),
                                TextField(
                                  controller: _engDescController,
                                  maxLines: 2,
                                  style: const TextStyle(color: Colors.white, fontSize: 12),
                                  decoration: const InputDecoration(
                                    labelText: "Strategic Brief Description",
                                    labelStyle: TextStyle(color: Colors.grey, fontSize: 10),
                                  ),
                                ),
                                const SizedBox(height: 15),
                                SizedBox(
                                  width: double.infinity,
                                  child: ElevatedButton(
                                    onPressed: _submitEngagement,
                                    style: ElevatedButton.styleFrom(
                                      backgroundColor: const Color(0xFF4CD7F6),
                                      foregroundColor: Colors.black,
                                      textStyle: const TextStyle(
                                          fontSize: 11, fontWeight: FontWeight.bold),
                                    ),
                                    child: const Text("SCHEDULE EVENT"),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        )
                      ],
                    ),
                  ),
                ),

              // Engagement Details Popup
              if (_selectedEngagement != null)
                Positioned.fill(
                  child: GlassCard(
                    backgroundColor: const Color(0xFE0A0E1A),
                    padding: const EdgeInsets.all(20),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                              decoration: BoxDecoration(
                                color: const Color(0x15FFFFFF),
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: Text(
                                _selectedEngagement!.type,
                                style: const TextStyle(
                                    color: Color(0xFF4CD7F6),
                                    fontSize: 9,
                                    fontWeight: FontWeight.bold),
                              ),
                            ),
                            IconButton(
                              onPressed: () => setState(() => _selectedEngagement = null),
                              icon: const Icon(Icons.close, size: 16, color: Colors.grey),
                            ),
                          ],
                        ),
                        const Divider(color: Colors.white10),
                        const SizedBox(height: 8),
                        Text(
                          _selectedEngagement!.title,
                          style: const TextStyle(
                              color: Colors.white, fontSize: 15, fontWeight: FontWeight.bold),
                        ),
                        Text(
                          "ID Reference: ENG-${_selectedEngagement!.id}",
                          style: const TextStyle(color: Colors.grey, fontSize: 9),
                        ),
                        const SizedBox(height: 16),
                        Row(
                          children: [
                            const Icon(Icons.calendar_today, size: 13, color: Colors.grey),
                            const SizedBox(width: 6),
                            Text(
                              "Date: ${_selectedEngagement!.date} (${_selectedEngagement!.rawDate})",
                              style: const TextStyle(color: Colors.white70, fontSize: 11),
                            ),
                          ],
                        ),
                        const SizedBox(height: 6),
                        Row(
                          children: [
                            const Icon(Icons.access_time, size: 13, color: Colors.grey),
                            const SizedBox(width: 6),
                            Text(
                              "Time Duration: ${_selectedEngagement!.time}",
                              style: const TextStyle(color: Colors.white70, fontSize: 11),
                            ),
                          ],
                        ),
                        const SizedBox(height: 6),
                        Row(
                          children: [
                            const Icon(Icons.location_on, size: 13, color: Colors.grey),
                            const SizedBox(width: 6),
                            Text(
                              "Venue Matrix: ${_selectedEngagement!.location}",
                              style: const TextStyle(color: Colors.white70, fontSize: 11),
                            ),
                          ],
                        ),
                        const SizedBox(height: 16),
                        const Text(
                          "STRATEGIC OBJECTIVES",
                          style: TextStyle(color: Colors.grey, fontSize: 9, fontWeight: FontWeight.bold),
                        ),
                        const SizedBox(height: 4),
                        Container(
                          padding: const EdgeInsets.all(10),
                          width: double.infinity,
                          decoration: BoxDecoration(
                            color: Colors.white.withOpacity(0.04),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Text(
                            _selectedEngagement!.description,
                            style: const TextStyle(color: Colors.white70, fontSize: 11),
                          ),
                        ),
                        const Spacer(),
                        Row(
                          children: [
                            Expanded(
                              child: ElevatedButton.icon(
                                onPressed: () {
                                  widget.onDeleteEngagement(_selectedEngagement!.id);
                                  setState(() => _selectedEngagement = null);
                                },
                                style: ElevatedButton.styleFrom(
                                   backgroundColor: const Color(0xFFE11D48).withOpacity(0.1),
                                   foregroundColor: const Color(0xFFF43F5E),
                                   elevation: 0,
                                   side: const BorderSide(color: Colors.white10),
                                ),
                                icon: const Icon(Icons.delete, size: 14),
                                label: const Text("CANCEL EVENT", style: TextStyle(fontSize: 10)),
                              ),
                            ),
                            const SizedBox(width: 8),
                            Expanded(
                              child: ElevatedButton(
                                onPressed: () => setState(() => _selectedEngagement = null),
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: Colors.white10,
                                  foregroundColor: Colors.white,
                                ),
                                child: const Text("BACK", style: TextStyle(fontSize: 10)),
                              ),
                            ),
                          ],
                        )
                      ],
                    ),
                  ),
                )
            ],
          ),
          const SizedBox(height: 16),

          // Team Sentiment Card
          Stack(
            children: [
              GlassCard(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        const Icon(Icons.psychology, size: 18, color: Color(0xFF4CD7F6)),
                        const SizedBox(width: 10),
                        Text(
                          Localization.translate('hr_advisory', widget.profile.language),
                          style: const TextStyle(
                            fontSize: 10,
                            fontWeight: FontWeight.bold,
                            color: Colors.grey,
                            letterSpacing: 1.5,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    Text(
                      Localization.translate('sentiment_report', widget.profile.language),
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      Localization.translate('overall_productivity', widget.profile.language),
                      style: const TextStyle(color: Colors.white70, fontSize: 12),
                    ),
                    const SizedBox(height: 15),
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: Colors.white.withOpacity(0.03),
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: Colors.white10),
                      ),
                      child: Row(
                        children: [
                          const Icon(Icons.trending_up, color: Color(0xFF4CD7F6)),
                          const SizedBox(width: 10),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  Localization.translate('velocity_forecast', widget.profile.language),
                                  style: const TextStyle(color: Colors.grey, fontSize: 9, fontWeight: FontWeight.bold),
                                ),
                                Text(
                                  Localization.translate('velocity_desc', widget.profile.language),
                                  style: const TextStyle(color: Colors.white70, fontSize: 10),
                                ),
                              ],
                            ),
                          )
                        ],
                      ),
                    ),
                    const SizedBox(height: 15),
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton.icon(
                        onPressed: _triggerAiAnalysis,
                        icon: const Icon(Icons.bolt, size: 14),
                        label: Text(
                          Localization.translate('view_analysis', widget.profile.language),
                          style: const TextStyle(fontSize: 11),
                        ),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.white10,
                          foregroundColor: Colors.white,
                          side: const BorderSide(color: Colors.white10),
                          padding: const EdgeInsets.symmetric(vertical: 12),
                          shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(16)),
                        ),
                      ),
                    )
                  ],
                ),
              ),

              // Modal Sentiment report
              if (_aiAnalysisOpen)
                Positioned.fill(
                  child: GlassCard(
                    backgroundColor: const Color(0xFD0A0E1A),
                    padding: const EdgeInsets.all(20),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Row(
                              children: [
                                const Icon(Icons.memory, size: 16, color: Color(0xFF4CD7F6)),
                                const SizedBox(width: 8),
                                Text(
                                  Localization.translate('advisory_memo', widget.profile.language),
                                  style: const TextStyle(
                                    fontSize: 12,
                                    fontWeight: FontWeight.bold,
                                    color: Colors.white,
                                  ),
                                ),
                              ],
                            ),
                            if (!_aiLoading)
                              IconButton(
                                onPressed: () => setState(() => _aiAnalysisOpen = false),
                                icon: const Icon(Icons.close, size: 16, color: Colors.grey),
                              ),
                          ],
                        ),
                        const Divider(color: Colors.white10),
                        Expanded(
                          child: _aiLoading
                              ? Center(
                                  child: Column(
                                    mainAxisAlignment: MainAxisAlignment.center,
                                    children: [
                                      const CircularProgressIndicator(color: Color(0xFF4CD7F6)),
                                      const SizedBox(height: 20),
                                      Text(
                                        widget.profile.language == 'ar' ? _loadingStagesAr[_aiStage] : _loadingStages[_aiStage],
                                        style: const TextStyle(
                                            color: Colors.white,
                                            fontSize: 11,
                                            fontWeight: FontWeight.bold),
                                      ),
                                      const SizedBox(height: 4),
                                      Text(
                                        widget.profile.language == 'ar'
                                            ? "الخطوة ${_aiStage + 1} من ${_loadingStages.length}"
                                            : "Stage ${_aiStage + 1} of ${_loadingStages.length}",
                                        style:
                                            const TextStyle(color: Colors.grey, fontSize: 9),
                                      ),
                                    ],
                                  ),
                                )
                              : Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    // Pacing index box
                                    Container(
                                      padding: const EdgeInsets.all(12),
                                      decoration: BoxDecoration(
                                        color: Colors.white.withOpacity(0.04),
                                        borderRadius: BorderRadius.circular(16),
                                      ),
                                      child: Row(
                                        children: [
                                          Container(
                                            width: 44,
                                            height: 44,
                                            alignment: Alignment.center,
                                            decoration: BoxDecoration(
                                              shape: BoxShape.circle,
                                              border: Border.all(
                                                  color: const Color(0xFF4CD7F6)),
                                            ),
                                            child: const Text(
                                              "92",
                                              style: TextStyle(
                                                  color: Color(0xFF4CD7F6),
                                                  fontWeight: FontWeight.w900,
                                                  fontFamily: 'monospace'),
                                            ),
                                          ),
                                          const SizedBox(width: 12),
                                          const Column(
                                            crossAxisAlignment:
                                                CrossAxisAlignment.start,
                                            children: [
                                              Text(
                                                "Biometric Sentiment Index",
                                                style: TextStyle(
                                                    color: Colors.grey, fontSize: 9),
                                              ),
                                              Text(
                                                "High-Velocity Flow",
                                                style: TextStyle(
                                                    color: Colors.white,
                                                    fontSize: 11,
                                                    fontWeight: FontWeight.bold),
                                              ),
                                            ],
                                          )
                                        ],
                                      ),
                                    ),
                                    const SizedBox(height: 15),
                                    Expanded(
                                      child: SingleChildScrollView(
                                        child: Text(
                                          _aiReport ?? '',
                                          style: const TextStyle(
                                            color: Colors.white70,
                                            fontSize: 11.5,
                                            height: 1.5,
                                          ),
                                        ),
                                      ),
                                    ),
                                    const SizedBox(height: 10),
                                    Row(
                                      children: [
                                        Expanded(
                                          child: TextButton(
                                            onPressed: _triggerAiAnalysis,
                                            child: Text(
                                                Localization.translate('recalibrate', widget.profile.language),
                                                style: const TextStyle(
                                                    color: Colors.grey,
                                                    fontSize: 10,
                                                    fontWeight: FontWeight.bold)),
                                          ),
                                        ),
                                        const SizedBox(width: 8),
                                        Expanded(
                                          child: ElevatedButton(
                                            onPressed: () =>
                                                setState(() => _aiAnalysisOpen = false),
                                            style: ElevatedButton.styleFrom(
                                              backgroundColor: const Color(0xFF4CD7F6),
                                              foregroundColor: Colors.black,
                                              shape: RoundedRectangleBorder(
                                                  borderRadius: BorderRadius.circular(10)),
                                            ),
                                            child: Text(
                                                Localization.translate('acknowledge', widget.profile.language),
                                                style: const TextStyle(
                                                    fontSize: 10,
                                                    fontWeight: FontWeight.bold)),
                                          ),
                                        ),
                                      ],
                                    )
                                  ],
                                ),
                        ),
                      ],
                    ),
                  ),
                )
            ],
          ),
          const SizedBox(height: 100),
        ],
      ),
    ),
  );
}

  Widget _buildSummaryItem({required String label, required String value}) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: const TextStyle(color: Colors.grey, fontSize: 8),
        ),
        const SizedBox(height: 3),
        Text(
          value,
          style: const TextStyle(
            color: Colors.white,
            fontSize: 11,
            fontWeight: FontWeight.bold,
            fontFamily: 'monospace',
          ),
        ),
      ],
    );
  }

  Widget _buildCompactInfoCard({
    required IconData icon,
    required String label,
    required String value,
  }) {
    return GlassCard(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(6),
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.03),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Icon(icon, size: 14, color: const Color(0xFF4CD7F6)),
          ),
          const SizedBox(width: 8),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(
                  label,
                  style: const TextStyle(color: Colors.grey, fontSize: 8),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 2),
                Text(
                  value,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 10,
                    fontWeight: FontWeight.bold,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildNotificationItem({
    required IconData icon,
    required Color color,
    required String title,
    required String desc,
    required String time,
  }) {
    return Container(
      padding: const EdgeInsets.all(10),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.02),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.white.withOpacity(0.04)),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, size: 16, color: color),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      title,
                      style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold),
                    ),
                    Text(
                      time,
                      style: const TextStyle(color: Colors.grey, fontSize: 8),
                    ),
                  ],
                ),
                const SizedBox(height: 4),
                Text(
                  desc,
                  style: const TextStyle(color: Colors.white70, fontSize: 9),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDetailItem(String label, String value) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: const TextStyle(color: Colors.grey, fontSize: 8)),
        const SizedBox(height: 2),
        Text(
          value,
          style: const TextStyle(
            color: Colors.white70,
            fontSize: 10,
            fontWeight: FontWeight.bold,
            fontFamily: 'monospace',
          ),
        ),
      ],
    );
  }

  Widget _buildDetailLabel(String text) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.04),
        borderRadius: BorderRadius.circular(6),
        border: Border.all(color: Colors.white.withOpacity(0.08)),
      ),
      child: Text(
        text,
        style: const TextStyle(color: Colors.white70, fontSize: 9, fontWeight: FontWeight.bold),
      ),
    );
  }
}
