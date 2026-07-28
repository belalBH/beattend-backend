import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../models/types.dart';
import '../widgets/glass_card.dart';
import '../providers/leave_provider.dart';

class RequestsView extends StatefulWidget {
  final Profile profile;
  final List<HRRequest> requests;
  final Function(HRRequest newReq) onAddRequest;
  final Function(String id, String status) onUpdateRequestStatus;
  final Function(String id) onDeleteRequest;

  const RequestsView({
    super.key,
    required this.profile,
    required this.requests,
    required this.onAddRequest,
    required this.onUpdateRequestStatus,
    required this.onDeleteRequest,
  });

  @override
  State<RequestsView> createState() => _RequestsViewState();
}

class _RequestsViewState extends State<RequestsView> {
  // ESS Configuration & Tabs
  String _currentTab = "My Requests"; // "My Requests" | "Approvals"
  String _selectedType = "leave";
  String _searchQuery = "";
  String _selectedFilter = "All"; // "All", "Pending", "Approved", "Rejected", "Canceled", "Finished"

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<LeaveProvider>().fetchTypes();
      context.read<LeaveProvider>().fetchBalances();
    });
  }

  // Dialog and Preview states
  HRRequest? _selectedRequestDetails;
  String? _previewingFilePath;

  // Form State indicators
  bool _formSuccess = false;

  // Form Input Controllers
  final _notesController = TextEditingController();
  final _loanAmountController = TextEditingController(text: "5000");
  final _projectController = TextEditingController(text: "Al-Rajhi Integration");
  final _delegateController = TextEditingController();
  final _managerNotesController = TextEditingController();

  // Dynamic values
  DateTime _startDate = DateTime.now().add(const Duration(days: 3));
  DateTime _endDate = DateTime.now().add(const Duration(days: 8));
  
  DateTime _excuseDate = DateTime.now();
  TimeOfDay _excuseTimeStart = const TimeOfDay(hour: 9, minute: 0);
  TimeOfDay _excuseTimeEnd = const TimeOfDay(hour: 11, minute: 0);

  DateTime _overtimeDate = DateTime.now();
  TimeOfDay _overtimeTimeStart = const TimeOfDay(hour: 17, minute: 30);
  TimeOfDay _overtimeTimeEnd = const TimeOfDay(hour: 20, minute: 30);

  DateTime _correctionDate = DateTime.now();
  String _correctionType = "Check-in / دخول";
  TimeOfDay _correctionTime = const TimeOfDay(hour: 8, minute: 30);

  String _leaveClass = "Annual / سنوية";
  String _repaymentMonths = "6";
  String _firstMonth = "August 2026";
  String? _uploadedFileName;

  // Dynamic requests types list (fully expandable metadata)
  final List<Map<String, String>> _activeTypes = [
    {"id": "leave", "titleAr": "إجازة", "titleEn": "Leave", "icon": "🏖️"},
    {"id": "permission", "titleAr": "استئذان", "titleEn": "Excuse", "icon": "⏰"},
    {"id": "overtime", "titleAr": "عمل إضافي", "titleEn": "Overtime", "icon": "⏳"},
    {"id": "loan", "titleAr": "سلفة", "titleEn": "Loan", "icon": "💰"},
    {"id": "deputation", "titleAr": "مأمورية", "titleEn": "Mission", "icon": "✈️"},
    {"id": "correction", "titleAr": "تعديل حضور", "titleEn": "Correction", "icon": "📝"},
    {"id": "remote", "titleAr": "عمل عن بعد", "titleEn": "Remote Work", "icon": "🏠"},
    {"id": "external", "titleAr": "مهمة خارجية", "titleEn": "Ext. Mission", "icon": "🚗"},
    {"id": "salary-cert", "titleAr": "تعريف بالراتب", "titleEn": "Salary Cert", "icon": "📄"},
    {"id": "sick-leave", "titleAr": "إجازة مرضية", "titleEn": "Sick Leave", "icon": "🏥"},
    {"id": "doc-request", "titleAr": "طلب مستند", "titleEn": "Doc Request", "icon": "📑"},
    {"id": "custody", "titleAr": "عهدة", "titleEn": "Custody", "icon": "💳"},
    {"id": "equipment", "titleAr": "طلب معدات", "titleEn": "Equipment", "icon": "📦"},
    {"id": "training", "titleAr": "طلب تدريب", "titleEn": "Training", "icon": "🎓"},
    {"id": "shift-change", "titleAr": "تغيير شفت", "titleEn": "Shift Change", "icon": "📅"},
  ];

  @override
  void dispose() {
    _notesController.dispose();
    _loanAmountController.dispose();
    _projectController.dispose();
    _delegateController.dispose();
    _managerNotesController.dispose();
    super.dispose();
  }

  // Calculate leave days count
  int get _calculatedLeaveDays {
    return _endDate.difference(_startDate).inDays + 1;
  }

  // Calculate excuse hours
  double get _calculatedExcuseHours {
    final startMinutes = _excuseTimeStart.hour * 60 + _excuseTimeStart.minute;
    final endMinutes = _excuseTimeEnd.hour * 60 + _excuseTimeEnd.minute;
    final diff = endMinutes - startMinutes;
    return diff > 0 ? diff / 60.0 : 0.0;
  }

  // Calculate overtime hours
  double get _calculatedOvertimeHours {
    final startMinutes = _overtimeTimeStart.hour * 60 + _overtimeTimeStart.minute;
    final endMinutes = _overtimeTimeEnd.hour * 60 + _overtimeTimeEnd.minute;
    final diff = endMinutes - startMinutes;
    return diff > 0 ? diff / 60.0 : 0.0;
  }

  // Submits the new dynamically constructed request
  void _submitForm() {
    String typeNameAr = "";
    String typeNameEn = "";
    RequestDetails details;

    final String dateString = DateTime.now().toString().split(" ")[0];

    // Find request type metadata
    final typeMeta = _activeTypes.firstWhere((t) => t["id"] == _selectedType);
    typeNameAr = typeMeta["titleAr"]!;
    typeNameEn = typeMeta["titleEn"]!;

    // Build specific details payload
    switch (_selectedType) {
      case "leave":
        details = RequestDetails(
          startDate: _startDate.toString().split(" ")[0],
          endDate: _endDate.toString().split(" ")[0],
          leaveType: _leaveClass,
          notes: _notesController.text,
          delegateName: _delegateController.text,
          attachments: _uploadedFileName,
        );
        context.read<LeaveProvider>().submitRequest(
          leaveTypeId: 1,
          startDate: _startDate.toString().split(" ")[0],
          endDate: _endDate.toString().split(" ")[0],
          reason: _notesController.text,
        );
        break;
      case "permission":
        details = RequestDetails(
          startDate: _excuseDate.toString().split(" ")[0],
          timeStart: _formatTimeOfDay(_excuseTimeStart),
          timeEnd: _formatTimeOfDay(_excuseTimeEnd),
          hoursRequested: _calculatedExcuseHours,
          notes: _notesController.text,
          attachments: _uploadedFileName,
        );
        break;
      case "overtime":
        details = RequestDetails(
          overtimeDate: _overtimeDate.toString().split(" ")[0],
          timeStart: _formatTimeOfDay(_overtimeTimeStart),
          timeEnd: _formatTimeOfDay(_overtimeTimeEnd),
          hoursRequested: _calculatedOvertimeHours,
          project: _projectController.text,
          notes: _notesController.text,
        );
        break;
      case "loan":
        details = RequestDetails(
          amount: double.tryParse(_loanAmountController.text) ?? 5000.0,
          repaymentMonths: int.tryParse(_repaymentMonths) ?? 6,
          firstInstallmentMonth: _firstMonth,
          notes: _notesController.text,
          attachments: _uploadedFileName,
        );
        break;
      case "correction":
        details = RequestDetails(
          startDate: _correctionDate.toString().split(" ")[0],
          correctionType: _correctionType,
          correctTime: _formatTimeOfDay(_correctionTime),
          notes: _notesController.text,
          attachments: _uploadedFileName,
        );
        break;
      default:
        // Generic metadata-driven request details
        details = RequestDetails(
          startDate: dateString,
          notes: _notesController.text,
          attachments: _uploadedFileName,
        );
        break;
    }

    final newId = "REQ-${(10000 + widget.requests.length + 1).toString().substring(1)}";

    final newRequest = HRRequest(
      id: newId,
      type: _selectedType,
      typeNameAr: typeNameAr,
      typeNameEn: typeNameEn,
      dateSubmitted: dateString,
      status: "pending",
      details: details,
    );

    widget.onAddRequest(newRequest);

    setState(() {
      _formSuccess = true;
    });

    Future.delayed(const Duration(seconds: 2), () {
      if (mounted) {
        setState(() {
          _formSuccess = false;
          _notesController.clear();
          _delegateController.clear();
          _uploadedFileName = null;
        });
      }
    });
  }

  String _formatTimeOfDay(TimeOfDay t) {
    final hour = t.hour == 0 ? 12 : (t.hour > 12 ? t.hour - 12 : t.hour);
    final period = t.hour >= 12 ? "PM" : "AM";
    final minuteStr = t.minute.toString().padLeft(2, '0');
    return "$hour:$minuteStr $period";
  }

  @override
  Widget build(BuildContext context) {
    final isLight = widget.profile.themeMode == "light";
    final titleColor = isLight ? const Color(0xFF0F172A) : Colors.white;
    final subColor = isLight ? const Color(0xFF2563EB) : const Color(0xFF4CD7F6);

    final isManagerOrHR = widget.profile.role == "Manager" || widget.profile.role == "HR";

    // Filtering & searching logic
    final List<HRRequest> displayList = widget.requests.where((req) {
      // 1. Search Query filter
      final q = _searchQuery.toLowerCase();
      final matchesSearch = q.isEmpty ||
          req.id.toLowerCase().contains(q) ||
          req.typeNameAr.toLowerCase().contains(q) ||
          req.typeNameEn.toLowerCase().contains(q) ||
          req.dateSubmitted.contains(q);

      // 2. Status Category filter
      bool matchesStatus = true;
      if (_selectedFilter == "Pending") {
        matchesStatus = req.status == "pending";
      } else if (_selectedFilter == "Approved") {
        matchesStatus = req.status == "approved";
      } else if (_selectedFilter == "Rejected") {
        matchesStatus = req.status == "rejected";
      } else if (_selectedFilter == "Canceled") {
        matchesStatus = req.status == "canceled";
      } else if (_selectedFilter == "Finished") {
        matchesStatus = req.status == "finished" || req.status == "approved";
      }

      return matchesSearch && matchesStatus;
    }).toList();

    return Stack(
      children: [
        SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 15),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // ESS Top Title & Tab Switcher
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        widget.profile.language == "ar" ? "بوابة الخدمات الذاتية" : "EMPLOYEE SELF-SERVICE",
                        style: TextStyle(
                          fontFamily: 'monospace',
                          fontSize: 9,
                          fontWeight: FontWeight.bold,
                          color: subColor,
                          letterSpacing: 1.5,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        widget.profile.language == "ar" ? "مركز تقديم المعاملات" : "Self-Service Portal",
                        style: TextStyle(
                          fontSize: 20,
                          fontWeight: FontWeight.w900,
                          color: titleColor,
                        ),
                      ),
                    ],
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: const Color(0xFF4CD7F6).withOpacity(0.1),
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: const Color(0xFF4CD7F6).withOpacity(0.3)),
                    ),
                    child: Text(
                      widget.profile.role.toUpperCase(),
                      style: const TextStyle(color: Color(0xFF4CD7F6), fontSize: 8, fontWeight: FontWeight.bold),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 20),

              // Portal Tabs Switcher (Role-aware)
              if (isManagerOrHR) ...[
                Container(
                  margin: const EdgeInsets.only(bottom: 20),
                  padding: const EdgeInsets.all(4),
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.03),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: Colors.white10),
                  ),
                  child: Row(
                    children: [
                      Expanded(
                        child: GestureDetector(
                          onTap: () => setState(() => _currentTab = "My Requests"),
                          child: Container(
                            padding: const EdgeInsets.symmetric(vertical: 8),
                            decoration: BoxDecoration(
                              color: _currentTab == "My Requests" ? const Color(0x154CD7F6) : Colors.transparent,
                              borderRadius: BorderRadius.circular(8),
                            ),
                            alignment: Alignment.center,
                            child: Text(
                              widget.profile.language == "ar" ? "طلباتي الشخصية" : "My Requests",
                              style: TextStyle(
                                color: _currentTab == "My Requests" ? const Color(0xFF4CD7F6) : Colors.grey,
                                fontSize: 11,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
                        ),
                      ),
                      Expanded(
                        child: GestureDetector(
                          onTap: () => setState(() => _currentTab = "Approvals"),
                          child: Container(
                            padding: const EdgeInsets.symmetric(vertical: 8),
                            decoration: BoxDecoration(
                              color: _currentTab == "Approvals" ? const Color(0x154CD7F6) : Colors.transparent,
                              borderRadius: BorderRadius.circular(8),
                            ),
                            alignment: Alignment.center,
                            child: Text(
                              widget.profile.role == "HR"
                                  ? (widget.profile.language == "ar" ? "موافقات الموارد البشرية" : "HR Approvals")
                                  : (widget.profile.language == "ar" ? "موافقات فريقي" : "Team Approvals"),
                              style: TextStyle(
                                color: _currentTab == "Approvals" ? const Color(0xFF4CD7F6) : Colors.grey,
                                fontSize: 11,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ],

              if (_currentTab == "My Requests") ...[
                // ESS Dynamic Create Request Card
                _buildSubmitRequestCard(titleColor, subColor),
                const SizedBox(height: 25),
              ],

              // History Section Header & Filters
              Row(
                children: [
                  const Icon(Icons.history, size: 16, color: Color(0xFF4CD7F6)),
                  const SizedBox(width: 8),
                  Text(
                    _currentTab == "Approvals"
                        ? (widget.profile.language == "ar" ? "قائمة طلبات الموافقات" : "APPROVALS LEDGER")
                        : (widget.profile.language == "ar" ? "سجل معاملاتي السابقة" : "MY REQUESTS HISTORY"),
                    style: const TextStyle(
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                      letterSpacing: 1.0,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 10),

              // Filters row
              SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                child: Row(
                  children: ["All", "Pending", "Approved", "Rejected", "Canceled", "Finished"].map((f) {
                    final isSelected = _selectedFilter == f;
                    return GestureDetector(
                      onTap: () => setState(() => _selectedFilter = f),
                      child: Container(
                        margin: const EdgeInsets.only(right: 6, bottom: 8),
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                        decoration: BoxDecoration(
                          color: isSelected ? const Color(0xFF4CD7F6) : Colors.white.withOpacity(0.03),
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(color: isSelected ? Colors.transparent : Colors.white10),
                        ),
                        child: Text(
                          _translateFilter(f, widget.profile.language),
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
              const SizedBox(height: 8),

              // Search Bar
              TextField(
                onChanged: (val) => setState(() => _searchQuery = val),
                style: const TextStyle(color: Colors.white, fontSize: 11),
                decoration: InputDecoration(
                  hintText: widget.profile.language == "ar" ? "ابحث برقم الطلب، النوع، أو التاريخ..." : "Search by ID, type, or date...",
                  hintStyle: const TextStyle(color: Colors.grey, fontSize: 10),
                  prefixIcon: const Icon(Icons.search, size: 14, color: Colors.grey),
                  filled: true,
                  fillColor: Colors.white.withOpacity(0.02),
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
              const SizedBox(height: 15),

              // Display List of Requests
              displayList.isEmpty
                  ? Padding(
                      padding: const EdgeInsets.symmetric(vertical: 40),
                      child: Center(
                        child: Text(
                          widget.profile.language == "ar" ? "لا توجد معاملات مطابقة." : "No matching requests found.",
                          style: const TextStyle(color: Colors.grey, fontSize: 11),
                        ),
                      ),
                    )
                  : ListView.builder(
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      itemCount: displayList.length,
                      itemBuilder: (context, index) {
                        final req = displayList[index];
                        return _buildRequestCard(req);
                      },
                    ),
              const SizedBox(height: 100),
            ],
          ),
        ),
        // Details Drawer/Popup overlay
        if (_selectedRequestDetails != null) _buildRequestDetailsDialog(_selectedRequestDetails!),

        // Document preview overlay
        if (_previewingFilePath != null) _buildDocumentPreviewOverlay(),
      ],
    );
  }

  // Builder for Submit request panel
  Widget _buildSubmitRequestCard(Color titleColor, Color subColor) {
    return GlassCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(Icons.post_add, size: 16, color: Color(0xFF4CD7F6)),
              const SizedBox(width: 8),
              Text(
                widget.profile.language == "ar" ? "تقديم طلب أو خدمة ذاتية" : "SUBMIT NEW REQUEST",
                style: const TextStyle(
                  fontSize: 10,
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                  letterSpacing: 1.0,
                ),
              ),
            ],
          ),
          const SizedBox(height: 15),

          // Horizontal scroll of active types (dynamically fetched, expandable)
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(
              children: _activeTypes.map((type) {
                final isSelected = _selectedType == type["id"];
                return GestureDetector(
                  onTap: () => setState(() {
                    _selectedType = type["id"]!;
                    _notesController.clear();
                    _delegateController.clear();
                    _uploadedFileName = null;
                  }),
                  child: Container(
                    margin: const EdgeInsets.only(right: 8, bottom: 8),
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                    decoration: BoxDecoration(
                      color: isSelected ? const Color(0x204CD7F6) : Colors.white.withOpacity(0.02),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(
                        color: isSelected ? const Color(0xFF4CD7F6) : Colors.white.withOpacity(0.06),
                        width: 1.5,
                      ),
                    ),
                    child: Row(
                      children: [
                        Text(type["icon"]!, style: const TextStyle(fontSize: 13)),
                        const SizedBox(width: 6),
                        Text(
                          widget.profile.language == "ar" ? type["titleAr"]! : type["titleEn"]!,
                          style: TextStyle(
                            color: isSelected ? const Color(0xFF4CD7F6) : Colors.white70,
                            fontSize: 10,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ],
                    ),
                  ),
                );
              }).toList(),
            ),
          ),
          const SizedBox(height: 12),
          const Divider(color: Colors.white10),
          const SizedBox(height: 10),

          // Contextual Dynamic Form Input Layout
          if (_selectedType == "leave") _buildLeaveForm(),
          if (_selectedType == "permission") _buildExcuseForm(),
          if (_selectedType == "overtime") _buildOvertimeForm(),
          if (_selectedType == "loan") _buildLoanForm(),
          if (_selectedType == "correction") _buildCorrectionForm(),
          if (_selectedType != "leave" &&
              _selectedType != "permission" &&
              _selectedType != "overtime" &&
              _selectedType != "loan" &&
              _selectedType != "correction")
            _buildGenericRequestForm(),

          const SizedBox(height: 12),

          // Attachment input
          _buildAttachmentSection(),

          const SizedBox(height: 12),
          // General notes
          TextField(
            controller: _notesController,
            style: const TextStyle(color: Colors.white, fontSize: 11),
            maxLines: 2,
            decoration: InputDecoration(
              labelText: widget.profile.language == "ar" ? "ملاحظات إضافية" : "Additional Notes / Comments",
              labelStyle: const TextStyle(color: Colors.grey, fontSize: 10),
              enabledBorder: UnderlineInputBorder(
                borderSide: BorderSide(color: Colors.white.withOpacity(0.06)),
              ),
              focusedBorder: const UnderlineInputBorder(
                borderSide: BorderSide(color: Color(0xFF4CD7F6)),
              ),
            ),
          ),
          const SizedBox(height: 20),

          // Submit action
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: _submitForm,
              style: ElevatedButton.styleFrom(
                backgroundColor: _formSuccess ? const Color(0xFF10B981) : const Color(0xFF4CD7F6),
                foregroundColor: Colors.black,
                padding: const EdgeInsets.symmetric(vertical: 12),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
              ),
              child: Text(
                _formSuccess
                    ? (widget.profile.language == "ar" ? "✓ تم التقديم بنجاح" : "✓ SUBMITTED SUCCESSFULLY")
                    : (widget.profile.language == "ar" ? "إرسال الطلب الآن" : "SUBMIT REQUEST NOW"),
                style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, letterSpacing: 0.5),
              ),
            ),
          ),
        ],
      ),
    );
  }

  // 1. Leave Form
  Widget _buildLeaveForm() {
    final leaveProvider = context.watch<LeaveProvider>();
    final double availableBalance = leaveProvider.leaveBalances.isNotEmpty
        ? leaveProvider.leaveBalances.first.remainingBalance
        : 25.0;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Balance Banner
        Container(
          padding: const EdgeInsets.all(10),
          margin: const EdgeInsets.only(bottom: 15),
          decoration: BoxDecoration(
            color: const Color(0xFF10B981).withOpacity(0.06),
            borderRadius: BorderRadius.circular(8),
            border: Border.all(color: const Color(0xFF10B981).withOpacity(0.2)),
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    widget.profile.language == "ar" ? "رصيد الإجازات المتاح" : "AVAILABLE LEAVE BALANCE",
                    style: const TextStyle(color: Colors.grey, fontSize: 8, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    widget.profile.language == "ar" ? "$availableBalance يوم" : "$availableBalance Days Available",
                    style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold),
                  ),
                ],
              ),
              const Icon(Icons.arrow_forward, size: 14, color: Colors.grey),
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Text(
                    widget.profile.language == "ar" ? "الرصيد بعد الطلب" : "BALANCE AFTER REQUEST",
                    style: const TextStyle(color: Colors.grey, fontSize: 8, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    "${availableBalance - _calculatedLeaveDays} ${widget.profile.language == "ar" ? "يوم" : "Days"}",
                    style: const TextStyle(color: Color(0xFF4CD7F6), fontSize: 11, fontWeight: FontWeight.bold),
                  ),
                ],
              ),
            ],
          ),
        ),

        // Leave type class
        DropdownButtonFormField<String>(
          value: _leaveClass,
          dropdownColor: const Color(0xFF121414),
          style: const TextStyle(color: Colors.white, fontSize: 11),
          decoration: InputDecoration(
            labelText: widget.profile.language == "ar" ? "نوع الإجازة" : "Leave Category",
            labelStyle: const TextStyle(color: Colors.grey, fontSize: 10),
          ),
          items: ["Annual / سنوية", "Sick / مرضية", "Emergency / اضطرارية", "Unpaid / بدون راتب"]
              .map((c) => DropdownMenuItem(value: c, child: Text(c)))
              .toList(),
          onChanged: (val) {
            if (val != null) setState(() => _leaveClass = val);
          },
        ),
        const SizedBox(height: 10),

        // Date selection row
        Row(
          children: [
            Expanded(
              child: ListTile(
                title: Text(widget.profile.language == "ar" ? "البداية" : "Start Date", style: const TextStyle(color: Colors.grey, fontSize: 9)),
                subtitle: Text("${_startDate.year}-${_startDate.month}-${_startDate.day}", style: const TextStyle(color: Colors.white, fontSize: 11)),
                onTap: () async {
                  final picked = await showDatePicker(
                    context: context,
                    initialDate: _startDate,
                    firstDate: DateTime(2026),
                    lastDate: DateTime(2028),
                  );
                  if (picked != null) setState(() => _startDate = picked);
                },
              ),
            ),
            Expanded(
              child: ListTile(
                title: Text(widget.profile.language == "ar" ? "النهاية" : "End Date", style: const TextStyle(color: Colors.grey, fontSize: 9)),
                subtitle: Text("${_endDate.year}-${_endDate.month}-${_endDate.day}", style: const TextStyle(color: Colors.white, fontSize: 11)),
                onTap: () async {
                  final picked = await showDatePicker(
                    context: context,
                    initialDate: _endDate,
                    firstDate: DateTime(2026),
                    lastDate: DateTime(2028),
                  );
                  if (picked != null) setState(() => _endDate = picked);
                },
              ),
            ),
          ],
        ),
        const SizedBox(height: 6),

        // Duration Info Label
        Text(
          "${widget.profile.language == "ar" ? "إجمالي الأيام المحسوبة: " : "Total Requested Days: "} $_calculatedLeaveDays ${widget.profile.language == "ar" ? "يوم" : "Days"}",
          style: const TextStyle(color: Color(0xFF4CD7F6), fontSize: 10, fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 10),

        // Delegate person (Optional)
        TextField(
          controller: _delegateController,
          style: const TextStyle(color: Colors.white, fontSize: 11),
          decoration: InputDecoration(
            labelText: widget.profile.language == "ar" ? "الموظف البديل لتغطية المهام (اختياري)" : "Delegate task cover person (Optional)",
            labelStyle: const TextStyle(color: Colors.grey, fontSize: 10),
            enabledBorder: UnderlineInputBorder(borderSide: BorderSide(color: Colors.white.withOpacity(0.06))),
          ),
        ),
      ],
    );
  }

  // 2. Excuse Form
  Widget _buildExcuseForm() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Expanded(
              child: ListTile(
                title: Text(widget.profile.language == "ar" ? "التاريخ" : "Excuse Date", style: const TextStyle(color: Colors.grey, fontSize: 9)),
                subtitle: Text("${_excuseDate.year}-${_excuseDate.month}-${_excuseDate.day}", style: const TextStyle(color: Colors.white, fontSize: 11)),
                onTap: () async {
                  final picked = await showDatePicker(
                    context: context,
                    initialDate: _excuseDate,
                    firstDate: DateTime(2026),
                    lastDate: DateTime(2028),
                  );
                  if (picked != null) setState(() => _excuseDate = picked);
                },
              ),
            ),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(widget.profile.language == "ar" ? "مدة الاستئذان" : "Excuse Duration", style: const TextStyle(color: Colors.grey, fontSize: 9)),
                  const SizedBox(height: 4),
                  Text(
                    "$_calculatedExcuseHours ${widget.profile.language == "ar" ? "ساعة" : "Hours"}",
                    style: const TextStyle(color: Color(0xFF4CD7F6), fontSize: 12, fontWeight: FontWeight.bold),
                  ),
                ],
              ),
            )
          ],
        ),
        Row(
          children: [
            Expanded(
              child: ListTile(
                title: Text(widget.profile.language == "ar" ? "من وقت" : "Start Time", style: const TextStyle(color: Colors.grey, fontSize: 9)),
                subtitle: Text(_formatTimeOfDay(_excuseTimeStart), style: const TextStyle(color: Colors.white, fontSize: 11)),
                onTap: () async {
                  final picked = await showTimePicker(context: context, initialTime: _excuseTimeStart);
                  if (picked != null) setState(() => _excuseTimeStart = picked);
                },
              ),
            ),
            Expanded(
              child: ListTile(
                title: Text(widget.profile.language == "ar" ? "إلى وقت" : "End Time", style: const TextStyle(color: Colors.grey, fontSize: 9)),
                subtitle: Text(_formatTimeOfDay(_excuseTimeEnd), style: const TextStyle(color: Colors.white, fontSize: 11)),
                onTap: () async {
                  final picked = await showTimePicker(context: context, initialTime: _excuseTimeEnd);
                  if (picked != null) setState(() => _excuseTimeEnd = picked);
                },
              ),
            ),
          ],
        ),
      ],
    );
  }

  // 3. Overtime Form
  Widget _buildOvertimeForm() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Expanded(
              child: ListTile(
                title: Text(widget.profile.language == "ar" ? "التاريخ" : "Overtime Date", style: const TextStyle(color: Colors.grey, fontSize: 9)),
                subtitle: Text("${_overtimeDate.year}-${_overtimeDate.month}-${_overtimeDate.day}", style: const TextStyle(color: Colors.white, fontSize: 11)),
                onTap: () async {
                  final picked = await showDatePicker(
                    context: context,
                    initialDate: _overtimeDate,
                    firstDate: DateTime(2026),
                    lastDate: DateTime(2028),
                  );
                  if (picked != null) setState(() => _overtimeDate = picked);
                },
              ),
            ),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(widget.profile.language == "ar" ? "الساعات المتوقعة" : "Expected Hours", style: const TextStyle(color: Colors.grey, fontSize: 9)),
                  const SizedBox(height: 4),
                  Text(
                    "$_calculatedOvertimeHours ${widget.profile.language == "ar" ? "ساعة" : "Hours"}",
                    style: const TextStyle(color: Color(0xFF4CD7F6), fontSize: 12, fontWeight: FontWeight.bold),
                  ),
                ],
              ),
            )
          ],
        ),
        Row(
          children: [
            Expanded(
              child: ListTile(
                title: Text(widget.profile.language == "ar" ? "البداية" : "Start Time", style: const TextStyle(color: Colors.grey, fontSize: 9)),
                subtitle: Text(_formatTimeOfDay(_overtimeTimeStart), style: const TextStyle(color: Colors.white, fontSize: 11)),
                onTap: () async {
                  final picked = await showTimePicker(context: context, initialTime: _overtimeTimeStart);
                  if (picked != null) setState(() => _overtimeTimeStart = picked);
                },
              ),
            ),
            Expanded(
              child: ListTile(
                title: Text(widget.profile.language == "ar" ? "النهاية" : "End Time", style: const TextStyle(color: Colors.grey, fontSize: 9)),
                subtitle: Text(_formatTimeOfDay(_overtimeTimeEnd), style: const TextStyle(color: Colors.white, fontSize: 11)),
                onTap: () async {
                  final picked = await showTimePicker(context: context, initialTime: _overtimeTimeEnd);
                  if (picked != null) setState(() => _overtimeTimeEnd = picked);
                },
              ),
            ),
          ],
        ),
        const SizedBox(height: 10),
        TextField(
          controller: _projectController,
          style: const TextStyle(color: Colors.white, fontSize: 11),
          decoration: InputDecoration(
            labelText: widget.profile.language == "ar" ? "المشروع / الإدارة المستفيدة" : "Project / Dept Beneficiary",
            labelStyle: const TextStyle(color: Colors.grey, fontSize: 10),
            enabledBorder: UnderlineInputBorder(borderSide: BorderSide(color: Colors.white.withOpacity(0.06))),
          ),
        ),
      ],
    );
  }

  // 4. Loan Form
  Widget _buildLoanForm() {
    return Column(
      children: [
        TextField(
          controller: _loanAmountController,
          keyboardType: TextInputType.number,
          style: const TextStyle(color: Colors.white, fontSize: 11),
          decoration: InputDecoration(
            labelText: widget.profile.language == "ar" ? "قيمة السلفة المطلوبة (SAR)" : "Loan Requested Value (SAR)",
            labelStyle: const TextStyle(color: Colors.grey, fontSize: 10),
            enabledBorder: UnderlineInputBorder(borderSide: BorderSide(color: Colors.white.withOpacity(0.06))),
          ),
        ),
        const SizedBox(height: 10),
        Row(
          children: [
            Expanded(
              child: DropdownButtonFormField<String>(
                value: _repaymentMonths,
                dropdownColor: const Color(0xFF121414),
                style: const TextStyle(color: Colors.white, fontSize: 11),
                decoration: InputDecoration(
                  labelText: widget.profile.language == "ar" ? "عدد الأقساط" : "Installments Count",
                  labelStyle: const TextStyle(color: Colors.grey, fontSize: 10),
                ),
                items: ["3", "6", "12", "18", "24"]
                    .map((m) => DropdownMenuItem(value: m, child: Text("$m ${widget.profile.language == "ar" ? "شهور" : "Months"}")))
                    .toList(),
                onChanged: (val) {
                  if (val != null) setState(() => _repaymentMonths = val);
                },
              ),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: DropdownButtonFormField<String>(
                value: _firstMonth,
                dropdownColor: const Color(0xFF121414),
                style: const TextStyle(color: Colors.white, fontSize: 11),
                decoration: InputDecoration(
                  labelText: widget.profile.language == "ar" ? "أول شهر خصم" : "First Deduction Month",
                  labelStyle: const TextStyle(color: Colors.grey, fontSize: 10),
                ),
                items: ["August 2026", "September 2026", "October 2026"]
                    .map((m) => DropdownMenuItem(value: m, child: Text(m)))
                    .toList(),
                onChanged: (val) {
                  if (val != null) setState(() => _firstMonth = val);
                },
              ),
            ),
          ],
        ),
      ],
    );
  }

  // 5. Attendance Correction Form
  Widget _buildCorrectionForm() {
    return Column(
      children: [
        Row(
          children: [
            Expanded(
              child: ListTile(
                title: Text(widget.profile.language == "ar" ? "تاريخ الحضور" : "Attendance Date", style: const TextStyle(color: Colors.grey, fontSize: 9)),
                subtitle: Text("${_correctionDate.year}-${_correctionDate.month}-${_correctionDate.day}", style: const TextStyle(color: Colors.white, fontSize: 11)),
                onTap: () async {
                  final picked = await showDatePicker(
                    context: context,
                    initialDate: _correctionDate,
                    firstDate: DateTime(2026),
                    lastDate: DateTime(2028),
                  );
                  if (picked != null) setState(() => _correctionDate = picked);
                },
              ),
            ),
            Expanded(
              child: DropdownButtonFormField<String>(
                value: _correctionType,
                dropdownColor: const Color(0xFF121414),
                style: const TextStyle(color: Colors.white, fontSize: 11),
                decoration: InputDecoration(
                  labelText: widget.profile.language == "ar" ? "نوع التعديل" : "Correction Type",
                  labelStyle: const TextStyle(color: Colors.grey, fontSize: 10),
                ),
                items: ["Check-in / دخول", "Check-out / خروج"]
                    .map((c) => DropdownMenuItem(value: c, child: Text(c)))
                    .toList(),
                onChanged: (val) {
                  if (val != null) setState(() => _correctionType = val);
                },
              ),
            ),
          ],
        ),
        ListTile(
          title: Text(widget.profile.language == "ar" ? "الوقت الصحيح المراد إثباته" : "Correct Clock Time to Apply", style: const TextStyle(color: Colors.grey, fontSize: 9)),
          subtitle: Text(_formatTimeOfDay(_correctionTime), style: const TextStyle(color: Colors.white, fontSize: 11)),
          onTap: () async {
            final picked = await showTimePicker(context: context, initialTime: _correctionTime);
            if (picked != null) setState(() => _correctionTime = picked);
          },
        ),
      ],
    );
  }

  // 6. Generic/Other Custom Expandable requests
  Widget _buildGenericRequestForm() {
    return Container(
      padding: const EdgeInsets.all(10),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.01),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: Colors.white10),
      ),
      child: Row(
        children: [
          const Icon(Icons.info_outline, size: 14, color: Color(0xFF4CD7F6)),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              widget.profile.language == "ar"
                  ? "سيتم إرسال هذا الطلب مباشرة للمراجعة. يرجى توضيح التفاصيل في الملاحظات وإرفاق أي مستندات ثبوتية أدناه."
                  : "This service will be directly routed. Please specify details in the notes field and upload reference files below.",
              style: const TextStyle(color: Colors.grey, fontSize: 9),
            ),
          )
        ],
      ),
    );
  }

  // Attachment Section Builder
  Widget _buildAttachmentSection() {
    return Container(
      padding: const EdgeInsets.all(10),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.02),
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: Colors.white.withOpacity(0.05)),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            children: [
              const Icon(Icons.attach_file, size: 14, color: Colors.grey),
              const SizedBox(width: 8),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    widget.profile.language == "ar" ? "المرفقات الثبوتية" : "SUPPORTING ATTACHMENTS",
                    style: const TextStyle(color: Colors.white, fontSize: 9, fontWeight: FontWeight.bold),
                  ),
                  Text(
                    _uploadedFileName ?? (widget.profile.language == "ar" ? "لم يتم تحديد ملف (PDF, Word, صور)" : "No file selected (PDF, Word, Image)"),
                    style: const TextStyle(color: Colors.grey, fontSize: 8),
                  ),
                ],
              ),
            ],
          ),
          if (_uploadedFileName == null) ...[
            TextButton(
              onPressed: () {
                // Simulate file picking
                setState(() {
                  _uploadedFileName = "medical_report_signed.pdf";
                });
              },
              child: Text(
                widget.profile.language == "ar" ? "إرفاق ملف" : "Add File",
                style: const TextStyle(color: Color(0xFF4CD7F6), fontSize: 9, fontWeight: FontWeight.bold),
              ),
            ),
          ] else ...[
            IconButton(
              onPressed: () => setState(() => _uploadedFileName = null),
              icon: const Icon(Icons.cancel, size: 14, color: Color(0xFFF43F5E)),
            )
          ],
        ],
      ),
    );
  }

  // Request History List Cards Builder
  Widget _buildRequestCard(HRRequest req) {
    final isPending = req.status == "pending";
    final isApproved = req.status == "approved" || req.status == "finished";
    final isRejected = req.status == "rejected";

    final statusColor = isPending
        ? Colors.amber
        : isApproved
            ? const Color(0xFF10B981)
            : isRejected
                ? const Color(0xFFF43F5E)
                : Colors.grey;

    final typeIcon = _getTypeIcon(req.type);

    return GlassCard(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(12),
      borderRadius: 12,
      child: InkWell(
        onTap: () {
          setState(() {
            _selectedRequestDetails = req;
            _managerNotesController.clear();
          });
        },
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    Text(typeIcon, style: const TextStyle(fontSize: 14)),
                    const SizedBox(width: 8),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          widget.profile.language == "ar" ? req.typeNameAr : req.typeNameEn,
                          style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold),
                        ),
                        Text(
                          req.id.toUpperCase(),
                          style: const TextStyle(color: Colors.grey, fontSize: 8, fontFamily: 'monospace'),
                        ),
                      ],
                    ),
                  ],
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 3),
                  decoration: BoxDecoration(
                    color: statusColor.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: statusColor.withOpacity(0.3)),
                  ),
                  child: Text(
                    req.status.toUpperCase(),
                    style: TextStyle(color: statusColor, fontSize: 8, fontWeight: FontWeight.bold),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),
            const Divider(color: Colors.white10, height: 1),
            const SizedBox(height: 8),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                _buildCardInfoSubItem(
                  widget.profile.language == "ar" ? "تاريخ التقديم" : "Created Date",
                  req.dateSubmitted,
                ),
                _buildCardInfoSubItem(
                  widget.profile.language == "ar" ? "آخر تحديث" : "Last Update",
                  "2h ago",
                ),
                _buildCardInfoSubItem(
                  widget.profile.language == "ar" ? "صاحب العهدة" : "Assignee",
                  req.details.currentReviewer ?? (widget.profile.language == "ar" ? "مدير الإدارة" : "Line Manager"),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildCardInfoSubItem(String label, String value) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: const TextStyle(color: Colors.grey, fontSize: 8)),
        const SizedBox(height: 2),
        Text(value, style: const TextStyle(color: Colors.white70, fontSize: 9, fontWeight: FontWeight.bold)),
      ],
    );
  }

  // Expanded request details dialog sheet (vertical workflow, approval tracking, file actions)
  Widget _buildRequestDetailsDialog(HRRequest req) {
    final isPending = req.status == "pending";
    final isApproved = req.status == "approved" || req.status == "finished";
    final isRejected = req.status == "rejected";

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
                          Text(_getTypeIcon(req.type), style: const TextStyle(fontSize: 16)),
                          const SizedBox(width: 8),
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                widget.profile.language == "ar" ? req.typeNameAr : req.typeNameEn,
                                style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold),
                              ),
                              Text(
                                req.id.toUpperCase(),
                                style: const TextStyle(color: Colors.grey, fontSize: 9, fontFamily: 'monospace'),
                              ),
                            ],
                          ),
                        ],
                      ),
                      IconButton(
                        onPressed: () => setState(() => _selectedRequestDetails = null),
                        icon: const Icon(Icons.close, size: 18, color: Colors.grey),
                      )
                    ],
                  ),
                  const Divider(color: Colors.white10),
                  const SizedBox(height: 10),

                  // Metadata list
                  _buildDetailRow(
                    widget.profile.language == "ar" ? "تاريخ التقديم" : "Submission Date",
                    req.dateSubmitted,
                  ),
                  if (req.details.startDate != null)
                    _buildDetailRow(
                      widget.profile.language == "ar" ? "تاريخ البدء" : "Start Date",
                      req.details.startDate!,
                    ),
                  if (req.details.endDate != null)
                    _buildDetailRow(
                      widget.profile.language == "ar" ? "تاريخ الانتهاء" : "End Date",
                      req.details.endDate!,
                    ),
                  if (req.details.leaveType != null)
                    _buildDetailRow(
                      widget.profile.language == "ar" ? "الفئة" : "Category",
                      req.details.leaveType!,
                    ),
                  if (req.details.amount != null)
                    _buildDetailRow(
                      widget.profile.language == "ar" ? "القيمة المالية" : "Financial Value",
                      "${req.details.amount} SAR",
                    ),
                  if (req.details.hoursRequested != null)
                    _buildDetailRow(
                      widget.profile.language == "ar" ? "الساعات المطلوبة" : "Requested Hours",
                      "${req.details.hoursRequested} Hours",
                    ),
                  if (req.details.project != null)
                    _buildDetailRow(
                      widget.profile.language == "ar" ? "المشروع" : "Project",
                      req.details.project!,
                    ),

                  // Rejection warning
                  if (isRejected && req.details.rejectionReason != null) ...[
                    const SizedBox(height: 10),
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(10),
                      decoration: BoxDecoration(
                        color: const Color(0xFFF43F5E).withOpacity(0.1),
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(color: const Color(0xFFF43F5E).withOpacity(0.3)),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            widget.profile.language == "ar" ? "سبب الرفض:" : "Rejection Reason:",
                            style: const TextStyle(color: Color(0xFFF43F5E), fontSize: 9, fontWeight: FontWeight.bold),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            req.details.rejectionReason!,
                            style: const TextStyle(color: Colors.white, fontSize: 10),
                          ),
                        ],
                      ),
                    ),
                  ],

                  // Attachments checker
                  if (req.details.attachments != null || req.type == "leave" || req.type == "loan") ...[
                    const SizedBox(height: 12),
                    const Text(
                      "ATTACHMENT FILE",
                      style: TextStyle(color: Colors.grey, fontSize: 8, fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: 4),
                    GestureDetector(
                      onTap: () {
                        setState(() {
                          _previewingFilePath = req.details.attachments ?? "medical_report_signed.pdf";
                        });
                      },
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                        decoration: BoxDecoration(
                          color: Colors.white.withOpacity(0.04),
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(color: Colors.white10),
                        ),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Row(
                              children: [
                                const Icon(Icons.picture_as_pdf, color: Color(0xFFF43F5E), size: 16),
                                const SizedBox(width: 8),
                                Text(
                                  req.details.attachments ?? "medical_report_signed.pdf",
                                  style: const TextStyle(color: Colors.white, fontSize: 10),
                                ),
                              ],
                            ),
                            const Text(
                              "VIEW",
                              style: TextStyle(color: Color(0xFF4CD7F6), fontSize: 9, fontWeight: FontWeight.bold),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                  const SizedBox(height: 15),

                  // Workflow approval path timeline
                  const Text(
                    "APPROVAL WORKFLOW PATH",
                    style: TextStyle(color: Colors.grey, fontSize: 8, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 8),
                  _buildTimelineItem(
                    step: "1",
                    title: widget.profile.language == "ar" ? "تقديم المعاملة" : "Submit Request",
                    subtitle: widget.profile.language == "ar" ? "بواسطة الموظف" : "By Employee",
                    status: "done",
                  ),
                  _buildTimelineLine(),
                  _buildTimelineItem(
                    step: "2",
                    title: widget.profile.language == "ar" ? "موافقة المدير المباشر" : "Line Manager Approval",
                    subtitle: isPending ? (widget.profile.language == "ar" ? "معلقة" : "Pending Action") : (widget.profile.language == "ar" ? "تم الاعتماد" : "Approved"),
                    status: isPending ? "pending" : (isRejected ? "rejected" : "done"),
                  ),
                  _buildTimelineLine(),
                  _buildTimelineItem(
                    step: "3",
                    title: widget.profile.language == "ar" ? "مراجعة الموارد البشرية" : "HR Verification",
                    subtitle: isApproved ? (widget.profile.language == "ar" ? "مكتمل" : "Finalized") : (isPending ? (widget.profile.language == "ar" ? "مجدولة" : "Queued") : "--"),
                    status: isApproved ? "done" : "queued",
                  ),
                  const SizedBox(height: 20),

                  // Contextual actions
                  // Case A: Manager reviewing team requests (currentTab is approvals)
                  if (_currentTab == "Approvals") ...[
                    TextField(
                      controller: _managerNotesController,
                      style: const TextStyle(color: Colors.white, fontSize: 11),
                      decoration: InputDecoration(
                        labelText: widget.profile.language == "ar" ? "إضافة ملاحظات أو أسباب" : "Review Notes / Comments",
                        labelStyle: const TextStyle(color: Colors.grey, fontSize: 9),
                      ),
                    ),
                    const SizedBox(height: 15),
                    Row(
                      children: [
                        Expanded(
                          child: ElevatedButton(
                            onPressed: () {
                              widget.onUpdateRequestStatus(req.id, "approved");
                              setState(() => _selectedRequestDetails = null);
                            },
                            style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF10B981)),
                            child: Text(
                              widget.profile.language == "ar" ? "اعتماد" : "APPROVE",
                              style: const TextStyle(fontSize: 10, color: Colors.black, fontWeight: FontWeight.bold),
                            ),
                          ),
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: ElevatedButton(
                            onPressed: () {
                              widget.onUpdateRequestStatus(req.id, "rejected");
                              setState(() => _selectedRequestDetails = null);
                            },
                            style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFFF43F5E)),
                            child: Text(
                              widget.profile.language == "ar" ? "رفض" : "REJECT",
                              style: const TextStyle(fontSize: 10, color: Colors.white, fontWeight: FontWeight.bold),
                            ),
                          ),
                        ),
                      ],
                    )
                  ] else ...[
                    // Case B: Employee reviewing own requests
                    if (isPending) ...[
                      Row(
                        children: [
                          Expanded(
                            child: ElevatedButton(
                              onPressed: () {
                                // Simulate editing: re-populate form and close dialog
                                setState(() {
                                  _selectedType = req.type;
                                  _notesController.text = req.details.notes ?? "";
                                  _selectedRequestDetails = null;
                                });
                              },
                              style: ElevatedButton.styleFrom(backgroundColor: Colors.white10),
                              child: Text(
                                widget.profile.language == "ar" ? "تعديل" : "EDIT",
                                style: const TextStyle(fontSize: 9, color: Colors.white),
                              ),
                            ),
                          ),
                          const SizedBox(width: 8),
                          Expanded(
                            child: ElevatedButton(
                              onPressed: () {
                                widget.onDeleteRequest(req.id);
                                setState(() => _selectedRequestDetails = null);
                              },
                              style: ElevatedButton.styleFrom(backgroundColor: const Color(0x30F43F5E)),
                              child: Text(
                                widget.profile.language == "ar" ? "إلغاء الطلب" : "CANCEL REQUEST",
                                style: const TextStyle(fontSize: 9, color: Color(0xFFF43F5E)),
                              ),
                            ),
                          ),
                        ],
                      )
                    ] else if (isApproved) ...[
                      SizedBox(
                        width: double.infinity,
                        child: ElevatedButton.icon(
                          onPressed: () {
                            // Simulate download
                          },
                          icon: const Icon(Icons.download, size: 14, color: Colors.black),
                          style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF4CD7F6)),
                          label: Text(
                            widget.profile.language == "ar" ? "تحميل نسخة PDF معتمدة" : "DOWNLOAD CERTIFIED PDF",
                            style: const TextStyle(fontSize: 9, color: Colors.black, fontWeight: FontWeight.bold),
                          ),
                        ),
                      )
                    ] else if (isRejected) ...[
                      SizedBox(
                        width: double.infinity,
                        child: ElevatedButton(
                          onPressed: () {
                            setState(() {
                              _selectedType = req.type;
                              _notesController.text = req.details.notes ?? "";
                              _selectedRequestDetails = null;
                            });
                          },
                          style: ElevatedButton.styleFrom(backgroundColor: const Color(0x154CD7F6)),
                          child: Text(
                            widget.profile.language == "ar" ? "إعادة إرسال المعاملة" : "RE-SUBMIT REQUEST",
                            style: const TextStyle(fontSize: 9, color: Color(0xFF4CD7F6), fontWeight: FontWeight.bold),
                          ),
                        ),
                      )
                    ]
                  ]
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  // Document preview mockup overlay
  Widget _buildDocumentPreviewOverlay() {
    return Positioned.fill(
      child: Container(
        color: Colors.black.withOpacity(0.9),
        padding: const EdgeInsets.all(30),
        child: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.end,
                children: [
                  IconButton(
                    onPressed: () => setState(() => _previewingFilePath = null),
                    icon: const Icon(Icons.close, size: 24, color: Colors.white),
                  )
                ],
              ),
              Expanded(
                child: Container(
                  width: double.infinity,
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(16),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(Icons.picture_as_pdf, color: Color(0xFFF43F5E), size: 48),
                        const SizedBox(height: 15),
                        Text(
                          _previewingFilePath ?? "medical_report_signed.pdf",
                          style: const TextStyle(color: Colors.black, fontSize: 13, fontWeight: FontWeight.bold),
                        ),
                        const SizedBox(height: 4),
                        const Text(
                          "Verified & Certified by Ministry of Health",
                          style: TextStyle(color: Colors.grey, fontSize: 10),
                        ),
                        const SizedBox(height: 30),
                        const Divider(color: Colors.black12),
                        Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 20),
                          child: Text(
                            "This is a simulated document view of $_previewingFilePath. Real system deployments sync via absolute URLs stored on AWS S3 or Firebase Cloud Storage buckets.",
                            textAlign: TextAlign.center,
                            style: const TextStyle(color: Colors.grey, fontSize: 9),
                          ),
                        )
                      ],
                    ),
                  ),
                ),
              ),
            ],
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

  Widget _buildTimelineItem({required String step, required String title, required String subtitle, required String status}) {
    Color indicatorColor = Colors.grey;
    IconData? icon;

    if (status == "done") {
      indicatorColor = const Color(0xFF10B981);
      icon = Icons.check;
    } else if (status == "rejected") {
      indicatorColor = const Color(0xFFF43F5E);
      icon = Icons.close;
    } else if (status == "pending") {
      indicatorColor = Colors.amber;
      icon = Icons.hourglass_empty;
    }

    return Row(
      children: [
        Container(
          width: 20,
          height: 20,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            color: indicatorColor.withOpacity(0.1),
            border: Border.all(color: indicatorColor, width: 1.5),
          ),
          alignment: Alignment.center,
          child: icon != null
              ? Icon(icon, size: 10, color: indicatorColor)
              : Text(step, style: const TextStyle(color: Colors.grey, fontSize: 9, fontWeight: FontWeight.bold)),
        ),
        const SizedBox(width: 12),
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(title, style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold)),
            Text(subtitle, style: const TextStyle(color: Colors.grey, fontSize: 8)),
          ],
        )
      ],
    );
  }

  Widget _buildTimelineLine() {
    return Container(
      width: 1.5,
      height: 15,
      margin: const EdgeInsets.only(left: 9),
      color: Colors.white10,
    );
  }

  String _translateFilter(String f, String lang) {
    if (lang == "ar") {
      if (f == "All") return "الكل";
      if (f == "Pending") return "قيد الانتظار";
      if (f == "Approved") return "تمت الموافقة";
      if (f == "Rejected") return "مرفوض";
      if (f == "Canceled") return "ملغي";
      if (f == "Finished") return "منتهي";
    }
    return f;
  }

  String _getTypeIcon(String type) {
    try {
      final match = _activeTypes.firstWhere((t) => t["id"] == type);
      return match["icon"]!;
    } catch (_) {
      return "📑";
    }
  }
}
