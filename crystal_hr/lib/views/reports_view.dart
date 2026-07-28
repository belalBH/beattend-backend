import 'package:flutter/material.dart';
import '../models/types.dart';
import '../widgets/glass_card.dart';

class ReportsView extends StatefulWidget {
  final Profile profile;
  final List<CheckInLog> logs;
  final VoidCallback? onExportReceipt;

  const ReportsView({
    super.key,
    required this.profile,
    required this.logs,
    this.onExportReceipt,
  });

  @override
  State<ReportsView> createState() => _ReportsViewState();
}

class _ReportsViewState extends State<ReportsView> {
  // Periods: Day, Week, Month, Year, Custom
  String _selectedPeriod = "Month";
  String _searchQuery = "";
  String _filterType = "ALL"; // ALL, LATE, PRESENT, ABSENT

  // Selected session for detailed drawer breakdown
  Map<String, dynamic>? _selectedSessionDetail;

  // Helper: map a date to daily status map (mock based on common layout logic)
  Map<String, dynamic> _getDayStatus(String dateStr) {
    try {
      final date = DateTime.parse(dateStr);
      final isWeekend = date.weekday == DateTime.friday || date.weekday == DateTime.saturday;

      if (isWeekend) {
        return {
          "status": "weekend",
          "label": "عطلة أسبوعية",
          "labelEn": "Weekend",
          "color": Colors.white24,
        };
      }

      final day = date.day;
      if (date.month == 7 && date.year == 2026) {
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
    } catch (_) {}

    return {
      "status": "present",
      "label": "حضور",
      "labelEn": "Present",
      "color": const Color(0xFF10B981),
    };
  }

  // Prepares the dynamic list of sessions mapped to dates
  List<Map<String, dynamic>> _getSessions() {
    final dates = widget.logs.map((l) => l.date).toSet().toList();
    dates.sort((a, b) => b.compareTo(a));

    final List<Map<String, dynamic>> list = [];
    final monthsEn = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    for (final dateStr in dates) {
      final dayLogs = widget.logs.where((l) => l.date == dateStr).toList();
      final checkIn = dayLogs.firstWhere((l) => l.type == "check-in",
          orElse: () => CheckInLog(id: '', timestamp: '', date: '', type: '', method: ''));
      final checkOut = dayLogs.firstWhere((l) => l.type == "check-out",
          orElse: () => CheckInLog(id: '', timestamp: '', date: '', type: '', method: ''));

      String duration = "---";
      if (checkIn.timestamp.isNotEmpty && checkOut.timestamp.isNotEmpty) {
        duration = widget.profile.language == "ar" ? "8.2 ساعة" : "8.2 hrs";
      } else if (checkIn.timestamp.isNotEmpty) {
        duration = widget.profile.language == "ar" ? "جلسة نشطة" : "Active Session";
      }

      String labelEn = dateStr;
      String labelAr = dateStr;
      try {
        final d = DateTime.parse(dateStr);
        final weekdaysEn = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
        final weekdaysAr = ["الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت", "الأحد"];
        final monthsAr = [
          "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
          "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"
        ];
        labelEn = "${weekdaysEn[d.weekday - 1]}, ${monthsEn[d.month - 1]} ${d.day}, ${d.year}";
        labelAr = "${weekdaysAr[d.weekday - 1]}، ${d.day} ${monthsAr[d.month - 1]} ${d.year}";
      } catch (_) {}

      final dayStatus = _getDayStatus(dateStr);

      list.add({
        "date": dateStr,
        "labelEn": labelEn,
        "labelAr": labelAr,
        "checkIn": checkIn,
        "checkOut": checkOut,
        "duration": duration,
        "status": dayStatus["status"],
        "statusLabel": dayStatus["label"],
        "statusLabelEn": dayStatus["labelEn"],
        "statusColor": dayStatus["color"],
      });
    }

    return list;
  }

  @override
  Widget build(BuildContext context) {
    final double target = widget.profile.weeklyTargetHours;
    final double completed = widget.profile.completedHours;
    final double pacingScore = target > 0 ? (completed / target * 100) : 0.0;
    final int percentage = pacingScore.clamp(0.0, 100.0).round();

    final sessions = _getSessions();

    // Filtering logic based on type and query
    final displaySessions = sessions.where((sess) {
      final q = _searchQuery.toLowerCase();
      final matchesSearch = q.isEmpty ||
          sess["date"].toString().toLowerCase().contains(q) ||
          sess["labelEn"].toString().toLowerCase().contains(q) ||
          sess["labelAr"].toString().toLowerCase().contains(q);

      bool matchesFilter = true;
      if (_filterType == "LATE") {
        matchesFilter = sess["status"] == "late";
      } else if (_filterType == "PRESENT") {
        matchesFilter = sess["status"] == "present" || sess["status"] == "late";
      } else if (_filterType == "ABSENT") {
        matchesFilter = sess["status"] == "absent";
      }

      return matchesSearch && matchesFilter;
    }).toList();

    final isLight = widget.profile.themeMode == "light";
    final titleColor = isLight ? const Color(0xFF0F172A) : Colors.white;
    final subColor = isLight ? const Color(0xFF2563EB) : const Color(0xFF4CD7F6);

    final isManagerOrHR = widget.profile.role == "Manager" || widget.profile.role == "HR";

    return Stack(
      children: [
        SingleChildScrollView(
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
                        widget.profile.language == "ar" ? "لوحة الإحصائيات الذكية" : "HR ANALYTICS & INSIGHTS",
                        style: TextStyle(
                          fontFamily: 'monospace',
                          fontSize: 9,
                          fontWeight: FontWeight.bold,
                          color: subColor,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        widget.profile.language == "ar" ? "تقارير حضور الموظف" : "Analytics Dashboard",
                        style: TextStyle(
                          fontSize: 20,
                          fontWeight: FontWeight.w900,
                          color: titleColor,
                        ),
                      ),
                    ],
                  ),
                  ElevatedButton.icon(
                    onPressed: widget.onExportReceipt,
                    icon: const Icon(Icons.receipt, size: 14),
                    label: const Text("RECEIPT", style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold)),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.white10,
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 15),

              // Time period selector banner
              SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                child: Row(
                  children: ["Day", "Week", "Month", "Year", "Custom"].map((period) {
                    final isSelected = _selectedPeriod == period;
                    return GestureDetector(
                      onTap: () => setState(() => _selectedPeriod = period),
                      child: Container(
                        margin: const EdgeInsets.only(right: 6, bottom: 8),
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                        decoration: BoxDecoration(
                          color: isSelected ? const Color(0xFF4CD7F6) : Colors.white.withOpacity(0.03),
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(color: isSelected ? Colors.transparent : Colors.white10),
                        ),
                        child: Text(
                          _translatePeriod(period, widget.profile.language),
                          style: TextStyle(
                            color: isSelected ? Colors.black : Colors.grey,
                            fontSize: 9,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    );
                  }).toList(),
                ),
              ),
              const SizedBox(height: 10),

              // Manager Team Dashboard Metrics Section
              if (isManagerOrHR) ...[
                GlassCard(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          const Icon(Icons.group, size: 16, color: Color(0xFF4CD7F6)),
                          const SizedBox(width: 8),
                          Text(
                            widget.profile.language == "ar" ? "مؤشرات أداء فريقي" : "TEAM PERFORMANCE METRICS",
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
                      Row(
                        children: [
                          Expanded(
                            child: _buildTeamCard(
                              label: widget.profile.language == "ar" ? "متوسط الحضور" : "Avg Attendance",
                              value: "94.8%",
                              sub: widget.profile.language == "ar" ? "أداء مستقر" : "Stable Perform",
                              color: const Color(0xFF10B981),
                            ),
                          ),
                          const SizedBox(width: 8),
                          Expanded(
                            child: _buildTeamCard(
                              label: widget.profile.language == "ar" ? "المتأخرين اليوم" : "Late Today",
                              value: "2",
                              sub: widget.profile.language == "ar" ? "تنبيه معلق" : "Pending Alert",
                              color: Colors.amber,
                            ),
                          ),
                          const SizedBox(width: 8),
                          Expanded(
                            child: _buildTeamCard(
                              label: widget.profile.language == "ar" ? "أفضل أداء" : "Top Performer",
                              value: "أحمد علي",
                              sub: "99.2%",
                              color: const Color(0xFF4CD7F6),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 16),
              ],

              // Pacing Dial Card (Scheduled vs Actual Hours)
              GlassCard(
                child: Column(
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          widget.profile.language == "ar" ? "مؤشر العمل الفعلي" : "ACTUAL VS SCHEDULED HOURS",
                          style: const TextStyle(
                            fontFamily: 'monospace',
                            fontSize: 10,
                            fontWeight: FontWeight.bold,
                            color: Colors.grey,
                          ),
                        ),
                        const Icon(Icons.query_stats, color: Color(0xFF4CD7F6), size: 16),
                      ],
                    ),
                    const SizedBox(height: 20),

                    // Radial circle gauge
                    SizedBox(
                      width: 140,
                      height: 140,
                      child: Stack(
                        alignment: Alignment.center,
                        children: [
                          Positioned.fill(
                            child: CircularProgressIndicator(
                              value: pacingScore / 100,
                              backgroundColor: Colors.white.withOpacity(0.04),
                              color: const Color(0xFF4CD7F6),
                              strokeWidth: 8,
                            ),
                          ),
                          Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Text(
                                "$percentage%",
                                style: const TextStyle(
                                  fontFamily: 'monospace',
                                  fontSize: 24,
                                  fontWeight: FontWeight.w900,
                                  color: Colors.white,
                                ),
                              ),
                              Text(
                                widget.profile.language == "ar" ? "التزام الدوام" : "COMMITMENT",
                                style: const TextStyle(
                                  fontSize: 8,
                                  fontWeight: FontWeight.bold,
                                  color: Colors.grey,
                                ),
                              ),
                            ],
                          )
                        ],
                      ),
                    ),
                    const SizedBox(height: 20),

                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(widget.profile.language == "ar" ? "الساعات الفعلية" : "Actual Worked Hours", style: const TextStyle(color: Colors.grey, fontSize: 11)),
                        Text("${completed.toStringAsFixed(1)} hrs",
                            style: const TextStyle(
                                color: Color(0xFF4CD7F6),
                                fontSize: 11,
                                fontWeight: FontWeight.bold,
                                fontFamily: 'monospace')),
                      ],
                    ),
                    const SizedBox(height: 6),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(widget.profile.language == "ar" ? "الساعات المجدولة المطلوبة" : "Scheduled Required Target", style: const TextStyle(color: Colors.grey, fontSize: 11)),
                        Text("${target.toStringAsFixed(0)} hrs",
                            style: const TextStyle(
                                color: Colors.white,
                                fontSize: 11,
                                fontWeight: FontWeight.bold,
                                fontFamily: 'monospace')),
                      ],
                    ),
                    const SizedBox(height: 10),
                    const Divider(color: Colors.white10),
                    const SizedBox(height: 6),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(Icons.workspace_premium, size: 14, color: Color(0xFF4CD7F6)),
                        const SizedBox(width: 6),
                        Text(
                          widget.profile.language == "ar" ? "معدل الحضور ملتزم للمستهدف تماماً" : "Paced perfectly to target. No deficits.",
                          style: const TextStyle(color: Colors.grey, fontSize: 10),
                        )
                      ],
                    )
                  ],
                ),
              ),
              const SizedBox(height: 16),

              // Dynamic diagnostic Grid instead of technical secure keys
              GridView.count(
                crossAxisCount: 2,
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                mainAxisSpacing: 8,
                crossAxisSpacing: 8,
                childAspectRatio: 1.5,
                children: [
                  _buildMetricCard(
                    title: widget.profile.language == "ar" ? "الحضور الفعلي" : "Presence",
                    value: widget.profile.language == "ar" ? "19 يوم" : "19 Days",
                    subtitle: widget.profile.language == "ar" ? "أيام التحضير" : "Present days logged",
                    icon: Icons.check_circle_outline,
                    color: const Color(0xFF10B981),
                  ),
                  _buildMetricCard(
                    title: widget.profile.language == "ar" ? "الغياب غير المبرر" : "Absences",
                    value: widget.profile.language == "ar" ? "1 يوم" : "1 Day",
                    subtitle: widget.profile.language == "ar" ? "بدون عذر" : "Unexcused days",
                    icon: Icons.cancel_outlined,
                    color: const Color(0xFFF43F5E),
                  ),
                  _buildMetricCard(
                    title: widget.profile.language == "ar" ? "الإجازات والسنوي" : "Leaves Used",
                    value: widget.profile.language == "ar" ? "1 يوم" : "1 Day",
                    subtitle: widget.profile.language == "ar" ? "رصيد متبقي 24.5 يوم" : "Bal: 24.5 Days rem",
                    icon: Icons.calendar_today,
                    color: Colors.blue,
                  ),
                  _buildMetricCard(
                    title: widget.profile.language == "ar" ? "التأخير والإنذارات" : "Late Arrivals",
                    value: widget.profile.language == "ar" ? "2 حركتين (30 د)" : "2 Times (30m)",
                    subtitle: widget.profile.language == "ar" ? "متوسط تأخير 15د" : "Avg late 15m",
                    icon: Icons.hourglass_top,
                    color: Colors.amber,
                  ),
                ],
              ),
              const SizedBox(height: 16),

              // Weekly & Monthly comparison chart (simulated via simple widgets)
              GlassCard(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          widget.profile.language == "ar" ? "مقارنة حضور الأسابيع" : "WEEKLY WORKED HOURS COMPARISON",
                          style: const TextStyle(
                            fontFamily: 'monospace',
                            fontSize: 10,
                            fontWeight: FontWeight.bold,
                            color: Colors.grey,
                          ),
                        ),
                        const Icon(Icons.bar_chart, size: 16, color: Color(0xFF4CD7F6)),
                      ],
                    ),
                    const SizedBox(height: 15),

                    // Column bars
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        _buildChartBar("W27", 38.5, false),
                        _buildChartBar("W28", 40.0, false),
                        _buildChartBar("W29", 42.5, true),
                        _buildChartBar("W30", 37.4, false),
                      ],
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),

              // Ledger Search & Filter Row
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    widget.profile.language == "ar" ? "سجل الحضور التاريخي" : "ATTENDANCE RECORDS",
                    style: const TextStyle(
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                      letterSpacing: 1.0,
                    ),
                  ),
                  DropdownButton<String>(
                    value: _filterType,
                    dropdownColor: const Color(0xFF121414),
                    underline: const SizedBox(),
                    style: const TextStyle(
                        color: Color(0xFF4CD7F6), fontSize: 9, fontWeight: FontWeight.bold),
                    items: ["ALL", "PRESENT", "LATE", "ABSENT"]
                        .map((f) {
                          String label = f;
                          if (widget.profile.language == "ar") {
                            if (f == "ALL") label = "الكل";
                            if (f == "PRESENT") label = "حاضر";
                            if (f == "LATE") label = "متأخر";
                            if (f == "ABSENT") label = "غائب";
                          }
                          return DropdownMenuItem(value: f, child: Text(label));
                        })
                        .toList(),
                    onChanged: (val) {
                      if (val != null) setState(() => _filterType = val);
                    },
                  )
                ],
              ),
              const SizedBox(height: 10),

              // Search Bar
              TextField(
                onChanged: (val) => setState(() => _searchQuery = val),
                style: const TextStyle(color: Colors.white, fontSize: 11),
                decoration: InputDecoration(
                  hintText: widget.profile.language == "ar" ? "ابحث باليوم، التاريخ..." : "Search by date, label...",
                  hintStyle: const TextStyle(color: Colors.grey, fontSize: 10),
                  prefixIcon: const Icon(Icons.search, size: 14, color: Colors.grey),
                  filled: true,
                  fillColor: Colors.white.withOpacity(0.01),
                  contentPadding: const EdgeInsets.symmetric(vertical: 8),
                  enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(10),
                    borderSide: BorderSide(color: Colors.white.withOpacity(0.06)),
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(10),
                    borderSide: const BorderSide(color: Color(0xFF4CD7F6)),
                  ),
                ),
              ),
              const SizedBox(height: 12),

              // Sessions list
              displaySessions.isEmpty
                  ? Center(
                      child: Padding(
                        padding: const EdgeInsets.symmetric(vertical: 30),
                        child: Text(
                          widget.profile.language == "ar" ? "لا توجد معاملات مطابقة." : "No records found matching search.",
                          style: const TextStyle(color: Colors.grey, fontSize: 11),
                        ),
                      ),
                    )
                  : Column(
                      children: displaySessions.map((sess) {
                        final CheckInLog checkIn = sess["checkIn"];
                        final CheckInLog checkOut = sess["checkOut"];

                        return GlassCard(
                          margin: const EdgeInsets.only(bottom: 10),
                          padding: const EdgeInsets.all(12),
                          borderRadius: 16,
                          child: InkWell(
                            onTap: () {
                              setState(() {
                                _selectedSessionDetail = sess;
                              });
                            },
                            child: Row(
                              children: [
                                Container(
                                  padding: const EdgeInsets.all(8),
                                  decoration: BoxDecoration(
                                    color: Colors.black26,
                                    borderRadius: BorderRadius.circular(10),
                                  ),
                                  child: Icon(Icons.date_range,
                                      size: 14, color: sess["statusColor"] as Color),
                                ),
                                const SizedBox(width: 12),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        widget.profile.language == "ar" ? sess["labelAr"] : sess["labelEn"],
                                        style: const TextStyle(
                                            color: Colors.white,
                                            fontSize: 11,
                                            fontWeight: FontWeight.bold),
                                      ),
                                      const SizedBox(height: 4),
                                      Row(
                                        children: [
                                          Text(
                                            checkIn.timestamp.isNotEmpty
                                                ? "${widget.profile.language == "ar" ? "حضور: " : "In: "}${checkIn.timestamp}"
                                                : "${widget.profile.language == "ar" ? "حضور: " : "In: "}---",
                                            style: TextStyle(
                                                color: checkIn.timestamp.isNotEmpty
                                                    ? const Color(0xFF10B981)
                                                    : Colors.grey,
                                                fontSize: 9,
                                                fontFamily: 'monospace'),
                                          ),
                                          const SizedBox(width: 10),
                                          Text(
                                            checkOut.timestamp.isNotEmpty
                                                ? "${widget.profile.language == "ar" ? "انصراف: " : "Out: "}${checkOut.timestamp}"
                                                : "${widget.profile.language == "ar" ? "انصراف: " : "Out: "}---",
                                            style: TextStyle(
                                                color: checkOut.timestamp.isNotEmpty
                                                    ? const Color(0xFFF43F5E)
                                                    : Colors.grey,
                                                fontSize: 9,
                                                fontFamily: 'monospace'),
                                          ),
                                          const SizedBox(width: 10),
                                          Text(
                                            "${widget.profile.language == "ar" ? "المدة: " : "Dur: "}${sess['duration']}",
                                            style: const TextStyle(
                                                color: Color(0xFF4CD7F6),
                                                fontSize: 9,
                                                fontFamily: 'monospace',
                                                fontWeight: FontWeight.bold),
                                          ),
                                        ],
                                      )
                                    ],
                                  ),
                                ),
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                  decoration: BoxDecoration(
                                    color: (sess["statusColor"] as Color).withOpacity(0.1),
                                    borderRadius: BorderRadius.circular(6),
                                  ),
                                  child: Text(
                                    widget.profile.language == "ar" ? sess["statusLabel"]! : sess["statusLabelEn"]!,
                                    style: TextStyle(
                                        color: sess["statusColor"] as Color,
                                        fontSize: 8,
                                        fontWeight: FontWeight.bold),
                                  ),
                                )
                              ],
                            ),
                          ),
                        );
                      }).toList(),
                    ),
              const SizedBox(height: 100),
            ],
          ),
        ),

        // Session Detail Drawer overlay
        if (_selectedSessionDetail != null) _buildSessionDetailOverlay(_selectedSessionDetail!),
      ],
    );
  }

  Widget _buildTeamCard({
    required String label,
    required String value,
    required String sub,
    required Color color,
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
        children: [
          Text(label, style: const TextStyle(color: Colors.grey, fontSize: 8), maxLines: 1, overflow: TextOverflow.ellipsis),
          const SizedBox(height: 2),
          Text(
            value,
            style: TextStyle(color: color, fontSize: 11, fontWeight: FontWeight.bold),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
          Text(sub, style: const TextStyle(color: Colors.grey, fontSize: 8), maxLines: 1, overflow: TextOverflow.ellipsis),
        ],
      ),
    );
  }

  Widget _buildChartBar(String label, double val, bool highlight) {
    // scale max hours (e.g. 45 hours)
    final double maxVal = 45.0;
    final double percent = (val / maxVal).clamp(0.1, 1.0);

    return Column(
      children: [
        Text("${val.toStringAsFixed(1)}h", style: TextStyle(color: highlight ? const Color(0xFF4CD7F6) : Colors.grey, fontSize: 8, fontFamily: 'monospace')),
        const SizedBox(height: 4),
        Container(
          width: 25,
          height: percent * 80,
          decoration: BoxDecoration(
            color: highlight ? const Color(0xFF4CD7F6) : Colors.white10,
            borderRadius: const BorderRadius.vertical(top: Radius.circular(6)),
          ),
        ),
        const SizedBox(height: 6),
        Text(label, style: const TextStyle(color: Colors.grey, fontSize: 9, fontFamily: 'monospace')),
      ],
    );
  }

  Widget _buildMetricCard({
    required String title,
    required String value,
    required String subtitle,
    required IconData icon,
    Color? color,
  }) {
    return GlassCard(
      padding: const EdgeInsets.all(12),
      borderRadius: 16,
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(
                  title.toUpperCase(),
                  style: const TextStyle(color: Colors.grey, fontSize: 8, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 4),
                Text(
                  value,
                  style: TextStyle(
                    fontFamily: 'monospace',
                    fontSize: 14,
                    fontWeight: FontWeight.w900,
                    color: color ?? Colors.white,
                  ),
                ),
                Text(
                  subtitle,
                  style: const TextStyle(color: Colors.grey, fontSize: 8),
                ),
              ],
            ),
          ),
          Icon(icon, size: 18, color: color ?? const Color(0xFF4CD7F6)),
        ],
      ),
    );
  }

  // Session Detail Overlay Drawer
  Widget _buildSessionDetailOverlay(Map<String, dynamic> sess) {
    final CheckInLog checkIn = sess["checkIn"];
    final CheckInLog checkOut = sess["checkOut"];

    return Positioned.fill(
      child: Container(
        color: Colors.black.withOpacity(0.85),
        padding: const EdgeInsets.all(20),
        child: Center(
          child: SingleChildScrollView(
            child: GlassCard(
              backgroundColor: const Color(0xFC0A0E1A),
              padding: const EdgeInsets.all(16),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(
                        children: [
                          Icon(Icons.event, size: 16, color: sess["statusColor"] as Color),
                          const SizedBox(width: 8),
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                widget.profile.language == "ar" ? "تفاصيل حركة البصمة" : "CLOCK SESSION DETAILED BREAKDOWN",
                                style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold),
                              ),
                              Text(
                                sess["date"],
                                style: const TextStyle(color: Colors.grey, fontSize: 8, fontFamily: 'monospace'),
                              ),
                            ],
                          ),
                        ],
                      ),
                      IconButton(
                        onPressed: () => setState(() => _selectedSessionDetail = null),
                        icon: const Icon(Icons.close, size: 18, color: Colors.grey),
                      )
                    ],
                  ),
                  const Divider(color: Colors.white10),
                  const SizedBox(height: 10),

                  _buildDetailRow(
                    widget.profile.language == "ar" ? "اليوم والتاريخ" : "Day / Date",
                    widget.profile.language == "ar" ? sess["labelAr"] : sess["labelEn"],
                  ),
                  _buildDetailRow(
                    widget.profile.language == "ar" ? "الدوام المجدول" : "Scheduled Target",
                    sess["status"] == "weekend" || sess["status"] == "holiday" ? "--:--" : "08:30 AM - 05:30 PM",
                  ),
                  _buildDetailRow(
                    widget.profile.language == "ar" ? "تسجيل الحضور" : "Actual Clock In",
                    checkIn.timestamp.isNotEmpty ? checkIn.timestamp : "--:--",
                  ),
                  _buildDetailRow(
                    widget.profile.language == "ar" ? "تسجيل الانصراف" : "Actual Clock Out",
                    checkOut.timestamp.isNotEmpty ? checkOut.timestamp : "--:--",
                  ),
                  _buildDetailRow(
                    widget.profile.language == "ar" ? "ساعات العمل الفعلية" : "Total Worked Duration",
                    sess["duration"],
                  ),
                  _buildDetailRow(
                    widget.profile.language == "ar" ? "حالة اليوم" : "Day Status Type",
                    widget.profile.language == "ar" ? sess["statusLabel"]! : sess["statusLabelEn"]!,
                  ),
                  _buildDetailRow(
                    widget.profile.language == "ar" ? "الموقع الجغرافي" : "Geographical Office",
                    checkIn.timestamp.isNotEmpty ? "Crystal HQ / المقر الرئيسي" : "--",
                  ),
                  _buildDetailRow(
                    widget.profile.language == "ar" ? "طريقة تسجيل الدخول" : "Check-in Punch Method",
                    checkIn.timestamp.isNotEmpty ? checkIn.method : "--",
                  ),
                  const SizedBox(height: 15),

                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: () => setState(() => _selectedSessionDetail = null),
                      style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF4CD7F6)),
                      child: Text(
                        widget.profile.language == "ar" ? "إغلاق" : "CLOSE",
                        style: const TextStyle(fontSize: 10, color: Colors.black, fontWeight: FontWeight.bold),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildDetailRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(color: Colors.grey, fontSize: 10)),
          Text(value, style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold)),
        ],
      ),
    );
  }

  String _translatePeriod(String p, String lang) {
    if (lang == "ar") {
      if (p == "Day") return "اليوم";
      if (p == "Week") return "الأسبوع";
      if (p == "Month") return "الشهر";
      if (p == "Year") return "السنة";
      if (p == "Custom") return "فترة مخصصة";
    }
    return p;
  }
}
