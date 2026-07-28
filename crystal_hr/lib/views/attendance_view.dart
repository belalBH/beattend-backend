import 'package:flutter/material.dart';
import '../models/types.dart';
import '../models/localization.dart';
import '../widgets/glass_card.dart';

class AttendanceView extends StatefulWidget {
  final List<CheckInLog> logs;
  final Function(String date, String time, String type, String method) onAddCustomLog;
  final Function(String id) onDeleteLog;
  final Profile profile;

  const AttendanceView({
    super.key,
    required this.logs,
    required this.onAddCustomLog,
    required this.onDeleteLog,
    required this.profile,
  });

  @override
  State<AttendanceView> createState() => _AttendanceViewState();
}

class _AttendanceViewState extends State<AttendanceView> {
  int _selectedDay = DateTime.now().day;
  int _currentMonth = 6; // July (0-indexed 6 is July)
  int _currentYear = 2026;

  bool _showAddModal = false;
  String _customType = "check-in";
  String _customMethod = "Fingerprint";
  TimeOfDay _customTime = const TimeOfDay(hour: 8, minute: 30);

  final List<String> _monthNamesEn = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  final List<String> _monthNamesAr = [
    "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
    "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"
  ];

  String _translateMethod(String method, String lang) {
    if (lang == "ar") {
      if (method == "Fingerprint") return "بصمة الإصبع";
      if (method == "NFC") return "NFC الرقمية";
      if (method == "Manual Override") return "تجاوز إداري";
    }
    return method.toUpperCase();
  }

  int _getDaysInMonth() {
    return DateTime(_currentYear, _currentMonth + 2, 0).day;
  }

  int _getStartDayOfWeek() {
    return DateTime(_currentYear, _currentMonth + 1, 1).weekday % 7; // 0 is Sun
  }

  String _formatDateString(int day) {
    final m = (_currentMonth + 1).toString().padLeft(2, '0');
    final d = day.toString().padLeft(2, '0');
    return "$_currentYear-$m-$d";
  }

  List<CheckInLog> _getLogsForDay(int day) {
    final dStr = _formatDateString(day);
    return widget.logs.where((l) => l.date == dStr).toList();
  }

  void _submitCustomPunch() {
    final dStr = _formatDateString(_selectedDay);

    final hour = _customTime.hour % 12 == 0 ? 12 : _customTime.hour % 12;
    final min = _customTime.minute.toString().padLeft(2, '0');
    final ampm = _customTime.hour >= 12 ? "PM" : "AM";
    final timeStr = "${hour.toString().padLeft(2, '0')}:$min $ampm";

    widget.onAddCustomLog(dStr, timeStr, _customType, _customMethod);
    setState(() {
      _showAddModal = false;
    });
  }

  // Dynamic day status helper
  Map<String, dynamic> _getDayStatus(int day) {
    final date = DateTime(_currentYear, _currentMonth + 1, day);
    final isWeekend = date.weekday == DateTime.friday || date.weekday == DateTime.saturday;

    if (isWeekend) {
      return {
        "status": "weekend",
        "label": "عطلة أسبوعية",
        "labelEn": "Weekend",
        "color": Colors.white24,
      };
    }

    // Fixed mock data for July 2026 (0-indexed month 6 is July)
    if (_currentMonth == 6 && _currentYear == 2026) {
      if (day == 5) {
        return {
          "status": "holiday",
          "label": "عطلة رسمية (تأسيس)",
          "labelEn": "Public Holiday",
          "color": Colors.deepPurpleAccent,
        };
      }
      if (day == 8) {
        return {
          "status": "leave",
          "label": "إجازة سنوية معتمدة",
          "labelEn": "Approved Annual Leave",
          "color": Colors.blue,
        };
      }
      if (day == 12) {
        return {
          "status": "excuse",
          "label": "استئذان مغادرة مبكر",
          "labelEn": "Approved Excuse",
          "color": Colors.purple,
        };
      }
      if (day == 15) {
        return {
          "status": "mission",
          "label": "مهمة عمل خارجية",
          "labelEn": "External Work Mission",
          "color": Colors.orange,
        };
      }
      if (day == 22) {
        return {
          "status": "overtime",
          "label": "عمل إضافي معتمد",
          "labelEn": "Approved Overtime",
          "color": Colors.brown,
        };
      }
      if (day == 24) {
        return {
          "status": "absent",
          "label": "غياب غير مبرر",
          "labelEn": "Unexcused Absence",
          "color": const Color(0xFFF43F5E),
        };
      }
      if (day == 10 || day == 18) {
        return {
          "status": "late",
          "label": "تأخير صباحي (15 دقيقة)",
          "labelEn": "Late Check-in (15m)",
          "color": Colors.amber,
        };
      }
    }

    // Dynamic check logs status
    final logs = _getLogsForDay(day);
    if (logs.isNotEmpty) {
      return {
        "status": "present",
        "label": "حضور",
        "labelEn": "Present",
        "color": const Color(0xFF10B981),
      };
    } else if (date.isBefore(DateTime.now())) {
      return {
        "status": "absent",
        "label": "غياب",
        "labelEn": "Absent",
        "color": const Color(0xFFF43F5E),
      };
    }

    return {
      "status": "scheduled",
      "label": "مجدول",
      "labelEn": "Scheduled",
      "color": Colors.white10,
    };
  }

  @override
  Widget build(BuildContext context) {
    final daysCount = _getDaysInMonth();
    final startOffset = _getStartDayOfWeek();
    final selectedDateStr = _formatDateString(_selectedDay);
    final dayLogs = _getLogsForDay(_selectedDay);

    final checkInLog = dayLogs.firstWhere((l) => l.type == "check-in",
        orElse: () => CheckInLog(id: '', timestamp: '', date: '', type: '', method: ''));
    final checkOutLog = dayLogs.firstWhere((l) => l.type == "check-out",
        orElse: () => CheckInLog(id: '', timestamp: '', date: '', type: '', method: ''));

    final isLight = widget.profile.themeMode == "light";
    final titleColor = isLight ? const Color(0xFF0F172A) : Colors.white;
    final subColor = isLight ? const Color(0xFF2563EB) : const Color(0xFF4CD7F6);

    // Compute monthly summary
    final presenceDays = List.generate(daysCount, (i) => _getDayStatus(i + 1))
        .where((status) => status["status"] == "present" || status["status"] == "late")
        .length;
    final leavesDays = List.generate(daysCount, (i) => _getDayStatus(i + 1))
        .where((status) => status["status"] == "leave")
        .length;
    final absencesDays = List.generate(daysCount, (i) => _getDayStatus(i + 1))
        .where((status) => status["status"] == "absent")
        .length;

    final selectedDayStatus = _getDayStatus(_selectedDay);

    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 15),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // View header
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    Localization.translate('attendance_calendar_subtitle', widget.profile.language),
                    style: TextStyle(
                      fontFamily: 'monospace',
                      fontSize: 9,
                      fontWeight: FontWeight.bold,
                      color: subColor,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    Localization.translate('attendance_calendar_title', widget.profile.language),
                    style: TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.w900,
                      color: titleColor,
                    ),
                  ),
                ],
              ),
              ElevatedButton.icon(
                onPressed: () => setState(() => _showAddModal = true),
                icon: const Icon(Icons.add, size: 14),
                label: const Text("PUNCH", style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold)),
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF4CD7F6),
                  foregroundColor: Colors.black,
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),

          // Active shift top notification banner
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.02),
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: Colors.white.withOpacity(0.04)),
            ),
            child: Row(
              children: [
                const Icon(Icons.info_outline, size: 14, color: Color(0xFF4CD7F6)),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    widget.profile.language == "ar"
                        ? "الوردية النشطة: الوردية الصباحية المعتادة (08:30 ص - 05:30 م)"
                        : "Active Shift: Regular Morning Shift (08:30 AM - 05:30 PM)",
                    style: const TextStyle(color: Colors.white70, fontSize: 9, fontWeight: FontWeight.bold),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 15),

          // Calendar Card
          GlassCard(
            child: Column(
              children: [
                // Month Selector Header
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          "${widget.profile.language == 'ar' ? _monthNamesAr[_currentMonth] : _monthNamesEn[_currentMonth]} $_currentYear",
                          style: const TextStyle(
                              color: Colors.white, fontSize: 14, fontWeight: FontWeight.bold),
                        ),
                        Text(
                          "${widget.profile.language == 'ar' ? _monthNamesEn[_currentMonth] : _monthNamesAr[_currentMonth]} $_currentYear",
                          style: const TextStyle(color: Colors.grey, fontSize: 10),
                        ),
                      ],
                    ),
                    Row(
                      children: [
                        IconButton(
                          onPressed: () {
                            setState(() {
                              if (_currentMonth == 0) {
                                _currentMonth = 11;
                                _currentYear--;
                              } else {
                                _currentMonth--;
                              }
                              _selectedDay = 1;
                            });
                          },
                          icon: const Icon(Icons.chevron_left, color: Colors.grey),
                        ),
                        IconButton(
                          onPressed: () {
                            setState(() {
                              if (_currentMonth == 11) {
                                _currentMonth = 0;
                                _currentYear++;
                              } else {
                                _currentMonth++;
                              }
                              _selectedDay = 1;
                            });
                          },
                          icon: const Icon(Icons.chevron_right, color: Colors.grey),
                        ),
                      ],
                    ),
                  ],
                ),
                const SizedBox(height: 15),

                // Week headers
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map((day) {
                    String label = day;
                    if (widget.profile.language == "ar") {
                      if (day == "SUN") label = "أحد";
                      if (day == "MON") label = "إثنين";
                      if (day == "TUE") label = "ثلاثاء";
                      if (day == "WED") label = "أربعاء";
                      if (day == "THU") label = "خميس";
                      if (day == "FRI") label = "جمعة";
                      if (day == "SAT") label = "سبت";
                    }
                    return Expanded(
                      child: Center(
                        child: Text(
                          label,
                          style: const TextStyle(
                            fontFamily: 'monospace',
                            fontSize: 9,
                            fontWeight: FontWeight.bold,
                            color: Colors.grey,
                          ),
                        ),
                      ),
                    );
                  }).toList(),
                ),
                const SizedBox(height: 10),

                // Calendar Grid
                GridView.builder(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount: 7,
                    mainAxisSpacing: 8,
                    crossAxisSpacing: 8,
                  ),
                  itemCount: daysCount + startOffset,
                  itemBuilder: (context, index) {
                    if (index < startOffset) {
                      return const SizedBox();
                    }
                    final day = index - startOffset + 1;
                    final isSelected = _selectedDay == day;
                    final dayStatus = _getDayStatus(day);

                    return GestureDetector(
                      onTap: () {
                        setState(() {
                          _selectedDay = day;
                        });
                      },
                      child: Container(
                        decoration: BoxDecoration(
                          color: isSelected
                              ? const Color(0x204CD7F6)
                              : Colors.white.withOpacity(0.02),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(
                            color: isSelected
                                ? const Color(0xFF4CD7F6)
                               : Colors.white.withOpacity(0.04),
                          ),
                        ),
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Text(
                              "$day",
                              style: TextStyle(
                                fontFamily: 'monospace',
                                fontSize: isSelected ? 12 : 11,
                                fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                                color: isSelected ? const Color(0xFF4CD7F6) : Colors.white,
                              ),
                            ),
                            const SizedBox(height: 3),
                            // Status Dot Indicator Row
                            Container(
                              width: 4,
                              height: 4,
                              decoration: BoxDecoration(
                                shape: BoxShape.circle,
                                color: dayStatus["color"] as Color,
                              ),
                            ),
                          ],
                        ),
                      ),
                    );
                  },
                )
              ],
            ),
          ),
          const SizedBox(height: 20),

          // Day ledger detail card (renovated with full shift & actual properties)
          GlassCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          Localization.translate('punch_log', widget.profile.language),
                          style: const TextStyle(
                            fontFamily: 'monospace',
                            fontSize: 9,
                            fontWeight: FontWeight.bold,
                            color: Color(0xFF4CD7F6),
                          ),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          "${widget.profile.language == 'ar' ? _monthNamesAr[_currentMonth] : _monthNamesEn[_currentMonth]} $_selectedDay, $_currentYear",
                          style: const TextStyle(
                              color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold),
                        ),
                      ],
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: (selectedDayStatus["color"] as Color).withOpacity(0.1),
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(color: (selectedDayStatus["color"] as Color).withOpacity(0.3)),
                      ),
                      child: Text(
                        widget.profile.language == "ar" ? selectedDayStatus["label"]! : selectedDayStatus["labelEn"]!,
                        style: TextStyle(
                          color: selectedDayStatus["color"] as Color,
                          fontSize: 9,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 15),

                // Core details grid
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    _buildSubDetailItem(
                      widget.profile.language == "ar" ? "الدوام المجدول" : "Scheduled Shift",
                      selectedDayStatus["status"] == "weekend" || selectedDayStatus["status"] == "holiday" ? "--:--" : "08:30 AM - 05:30 PM",
                    ),
                    _buildSubDetailItem(
                      widget.profile.language == "ar" ? "الساعات المنجزة" : "Worked Hours",
                      checkInLog.timestamp.isNotEmpty && checkOutLog.timestamp.isNotEmpty ? "8.2h" : "--",
                    ),
                    _buildSubDetailItem(
                      widget.profile.language == "ar" ? "موقع التسجيل" : "Registered Loc.",
                      checkInLog.timestamp.isNotEmpty ? "HQ / المقر الرئيسي" : "--",
                    ),
                  ],
                ),
                const SizedBox(height: 10),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    _buildSubDetailItem(
                      widget.profile.language == "ar" ? "التأخير" : "Late Arrival",
                      selectedDayStatus["status"] == "late" ? "15 mins" : "0 mins",
                    ),
                    _buildSubDetailItem(
                      widget.profile.language == "ar" ? "العمل الإضافي" : "Overtime Hours",
                      selectedDayStatus["status"] == "overtime" ? "2.5 hours" : "0 hours",
                    ),
                    _buildSubDetailItem(
                      widget.profile.language == "ar" ? "طريقة التسجيل" : "Punch Method",
                      checkInLog.timestamp.isNotEmpty ? checkInLog.method : "--",
                    ),
                  ],
                ),
                const SizedBox(height: 15),
                const Divider(color: Colors.white10),
                const SizedBox(height: 10),

                // Clock In Status
                _buildPunchRow(
                  title: Localization.translate('clock_in', widget.profile.language),
                  time: checkInLog.timestamp.isNotEmpty ? checkInLog.timestamp : null,
                  method: checkInLog.method.isNotEmpty ? checkInLog.method : null,
                  color: const Color(0xFF10B981),
                  icon: Icons.login,
                ),
                const SizedBox(height: 10),

                // Clock Out Status
                _buildPunchRow(
                  title: Localization.translate('clock_out', widget.profile.language),
                  time: checkOutLog.timestamp.isNotEmpty ? checkOutLog.timestamp : null,
                  method: checkOutLog.method.isNotEmpty ? checkOutLog.method : null,
                  color: const Color(0xFFF43F5E),
                  icon: Icons.logout,
                ),
                const SizedBox(height: 14),

                // Calculation Result
                if (checkInLog.timestamp.isNotEmpty && checkOutLog.timestamp.isNotEmpty)
                  Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: const Color(0x104CD7F6),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Row(
                          children: [
                            const Icon(Icons.schedule, size: 14, color: Color(0xFF4CD7F6)),
                            const SizedBox(width: 8),
                            Text(
                              widget.profile.language == "ar" ? "مدة الدوام الفعلي:" : "Session Duration:",
                              style: const TextStyle(color: Colors.grey, fontSize: 11),
                            ),
                          ],
                        ),
                        Text(
                          widget.profile.language == "ar" ? "8.2 ساعة (ممتاز)" : "8.2 hours (Optimal)",
                          style: const TextStyle(
                              color: Color(0xFF4CD7F6),
                              fontSize: 11,
                              fontWeight: FontWeight.bold),
                        ),
                      ],
                    ),
                  )
                else if (checkInLog.timestamp.isNotEmpty)
                  Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: Colors.amber.withOpacity(0.05),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Row(
                          children: [
                            const Icon(Icons.pending, size: 14, color: Colors.amber),
                            const SizedBox(width: 8),
                            Text(
                              widget.profile.language == "ar" ? "الدوام الحالي:" : "Active Session:",
                              style: const TextStyle(color: Colors.grey, fontSize: 11),
                            ),
                          ],
                        ),
                        const Text(
                          "Underway • قيد العمل",
                          style: TextStyle(
                              color: Colors.amber, fontSize: 11, fontWeight: FontWeight.bold),
                        ),
                      ],
                    ),
                  )
                else if (selectedDayStatus["status"] == "leave" ||
                    selectedDayStatus["status"] == "excuse" ||
                    selectedDayStatus["status"] == "mission" ||
                    selectedDayStatus["status"] == "holiday")
                  Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: (selectedDayStatus["color"] as Color).withOpacity(0.08),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: Row(
                      children: [
                        Icon(Icons.info_outline, size: 14, color: selectedDayStatus["color"] as Color),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            widget.profile.language == "ar"
                                ? "تفاصيل إضافية: ${selectedDayStatus["label"]} معتمد من شؤون الموظفين."
                                : "Details: ${selectedDayStatus["labelEn"]} verified by HR team.",
                            style: TextStyle(color: selectedDayStatus["color"] as Color, fontSize: 10, fontWeight: FontWeight.bold),
                          ),
                        ),
                      ],
                    ),
                  )
                else
                  Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: Colors.white.withOpacity(0.02),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: Row(
                      children: [
                        const Icon(Icons.info_outline, size: 14, color: Colors.grey),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            widget.profile.language == "ar"
                                ? "لم يتم العثور على حركات تحضير لهذا اليوم."
                                : "No active punch data found for this selection index.",
                            style: const TextStyle(color: Colors.grey, fontSize: 10),
                          ),
                        ),
                      ],
                    ),
                  ),

                // Raw logs sub-list
                if (dayLogs.isNotEmpty) ...[
                  const SizedBox(height: 15),
                  const Text(
                    "RAW LOGS DIRECTORY",
                    style: TextStyle(color: Colors.grey, fontSize: 9, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 6),
                  Column(
                    children: dayLogs.map((log) {
                      return Container(
                        margin: const EdgeInsets.only(bottom: 6),
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          color: Colors.white.withOpacity(0.03),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              "[${log.type.toUpperCase()}] ${log.timestamp}",
                              style: const TextStyle(
                                  fontFamily: 'monospace', color: Colors.white, fontSize: 10),
                            ),
                            Row(
                              children: [
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 2),
                                  decoration: BoxDecoration(
                                      color: Colors.black26, borderRadius: BorderRadius.circular(4)),
                                  child: Text(
                                    log.method,
                                    style: const TextStyle(color: Colors.grey, fontSize: 8),
                                  ),
                                ),
                                const SizedBox(width: 8),
                                InkWell(
                                  onTap: () => widget.onDeleteLog(log.id),
                                  child: const Icon(Icons.delete_outline,
                                      size: 14, color: Color(0xFFF43F5E)),
                                ),
                              ],
                            )
                          ],
                        ),
                      );
                    }).toList(),
                  ),
                ]
              ],
            ),
          ),
          const SizedBox(height: 16),

          // Overview monthly diagnostics card (renovated with complete metrics)
          GlassCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    const Icon(Icons.auto_awesome, size: 14, color: Color(0xFF4CD7F6)),
                    const SizedBox(width: 6),
                    Text(
                      widget.profile.language == "ar" ? "الإحصائيات الشهرية للحضور" : "MONTHLY ATTENDANCE SUMMARY",
                      style: const TextStyle(
                          color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                GridView.count(
                  crossAxisCount: 2,
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  crossAxisSpacing: 10,
                  mainAxisSpacing: 10,
                  childAspectRatio: 2.2,
                  children: [
                    _buildStatMiniCard(
                      label: widget.profile.language == "ar" ? "أيام الحضور" : "Present Days",
                      value: widget.profile.language == "ar" ? "$presenceDays أيام" : "$presenceDays Days",
                      sub: widget.profile.language == "ar" ? "تغطية كاملة" : "Full Coverage",
                    ),
                    _buildStatMiniCard(
                      label: widget.profile.language == "ar" ? "أيام الغياب" : "Absent Days",
                      value: widget.profile.language == "ar" ? "$absencesDays غياب" : "$absencesDays Days",
                      sub: widget.profile.language == "ar" ? "غير مبرر" : "Unexcused",
                      isAlert: absencesDays > 0,
                    ),
                    _buildStatMiniCard(
                      label: widget.profile.language == "ar" ? "الإجازات المستهلكة" : "Leaves Used",
                      value: widget.profile.language == "ar" ? "$leavesDays أيام" : "$leavesDays Days",
                      sub: widget.profile.language == "ar" ? "معتمدة" : "Approved",
                    ),
                    _buildStatMiniCard(
                      label: widget.profile.language == "ar" ? "ساعات العمل" : "Total Hours",
                      value: widget.profile.language == "ar" ? "158.4 ساعة" : "158.4 hrs",
                      sub: widget.profile.language == "ar" ? "مكتملة" : "Completed",
                    ),
                    _buildStatMiniCard(
                      label: widget.profile.language == "ar" ? "العمل الإضافي" : "Overtime Hours",
                      value: widget.profile.language == "ar" ? "4.5 ساعة" : "4.5 hrs",
                      sub: widget.profile.language == "ar" ? "موافقة مسبقة" : "Pre-approved",
                    ),
                    _buildStatMiniCard(
                      label: widget.profile.language == "ar" ? "نسبة الالتزام" : "Commitment Score",
                      value: "96.4%",
                      sub: widget.profile.language == "ar" ? "أداء ممتاز" : "Optimal Performance",
                      color: const Color(0xFF10B981),
                    ),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),

          // Short operations log feed (سجل مختصر لآخر الحركات)
          GlassCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    const Icon(Icons.history, size: 14, color: Color(0xFF4CD7F6)),
                    const SizedBox(width: 8),
                    Text(
                      widget.profile.language == "ar" ? "آخر العمليات" : "RECENT OPERATIONS LOG",
                      style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold),
                    ),
                  ],
                ),
                const SizedBox(height: 10),
                _buildActivityRow(
                  widget.profile.language == "ar" ? "تسجيل دخول - بصمة الإصبع" : "Clock In - Fingerprint",
                  widget.profile.language == "ar" ? "المقر الرئيسي • اليوم 08:28 ص" : "HQ Office • Today 08:28 AM",
                ),
                _buildActivityRow(
                  widget.profile.language == "ar" ? "طلب إجازة سنوية" : "Annual Leave Request",
                  widget.profile.language == "ar" ? "تمت الموافقة • قبل يومين" : "Approved by HR • 2d ago",
                ),
                _buildActivityRow(
                  widget.profile.language == "ar" ? "مهمة عمل خارجية" : "External Business Trip",
                  widget.profile.language == "ar" ? "تم التحقق • قبل 3 أيام" : "Verified by Manager • 3d ago",
                ),
              ],
            ),
          ),
          const SizedBox(height: 100),
        ],
      ),
    );
  }

  Widget _buildSubDetailItem(String label, String value) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: const TextStyle(color: Colors.grey, fontSize: 8)),
        const SizedBox(height: 3),
        Text(value, style: const TextStyle(color: Colors.white70, fontSize: 10, fontWeight: FontWeight.bold)),
      ],
    );
  }

  Widget _buildStatMiniCard({
    required String label,
    required String value,
    required String sub,
    bool isAlert = false,
    Color? color,
  }) {
    return Container(
      padding: const EdgeInsets.all(8),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.02),
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: Colors.white.withOpacity(0.04)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text(label, style: const TextStyle(color: Colors.grey, fontSize: 8)),
          const SizedBox(height: 2),
          Text(
            value,
            style: TextStyle(
              color: color ?? (isAlert ? const Color(0xFFF43F5E) : Colors.white),
              fontSize: 12,
              fontWeight: FontWeight.bold,
            ),
          ),
          Text(sub, style: const TextStyle(color: Colors.grey, fontSize: 8)),
        ],
      ),
    );
  }

  Widget _buildActivityRow(String title, String desc) {
    return Container(
      margin: const EdgeInsets.only(bottom: 6),
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.01),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(title, style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold)),
              Text(desc, style: const TextStyle(color: Colors.grey, fontSize: 8)),
            ],
          ),
          const Icon(Icons.arrow_forward_ios, size: 10, color: Colors.grey),
        ],
      ),
    );
  }

  Widget _buildPunchRow({
    required String title,
    String? time,
    String? method,
    required Color color,
    required IconData icon,
  }) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.02),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: Colors.white.withOpacity(0.04)),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(6),
                decoration: BoxDecoration(
                  color: color.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Icon(icon, size: 14, color: color),
              ),
              const SizedBox(width: 10),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: const TextStyle(color: Colors.grey, fontSize: 10),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    time ?? (widget.profile.language == 'ar' ? 'لم يسجل' : 'Not Recorded'),
                    style: TextStyle(
                      color: time != null ? Colors.white : Colors.grey.shade600,
                      fontSize: 12,
                      fontFamily: time != null ? 'monospace' : null,
                      fontWeight: time != null ? FontWeight.bold : FontWeight.normal,
                    ),
                  ),
                ],
              )
            ],
          ),
          if (method != null)
            Column(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                Text(widget.profile.language == 'ar' ? "الطريقة" : "METHOD", style: const TextStyle(color: Colors.grey, fontSize: 8)),
                Text(
                  _translateMethod(method, widget.profile.language),
                  style: const TextStyle(
                      color: Color(0xFF4CD7F6),
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
                      fontFamily: 'monospace'),
                ),
              ],
            )
        ],
      ),
    );
  }
}
