import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'providers/auth_provider.dart';
import 'providers/employee_profile_provider.dart';
import 'models/types.dart';
import 'services/storage_service.dart';
import 'widgets/mesh_background.dart';
import 'views/dashboard_view.dart';
import 'views/requests_view.dart';
import 'views/attendance_view.dart';
import 'views/reports_view.dart';
import 'views/profile_view.dart';
import 'views/onboarding_view.dart';
import 'services/database_helper.dart';
import 'services/location_service.dart';
import 'services/geofencing_service.dart';
import 'services/device_info_service.dart';
import 'services/api_constants.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:sqflite/sqflite.dart';
import 'package:permission_handler/permission_handler.dart';

import 'providers/company_configuration_provider.dart';
import 'providers/attendance_provider.dart';
import 'providers/leave_provider.dart';
import 'providers/dynamic_request_provider.dart';

void main() {
  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthProvider()),
        ChangeNotifierProvider(create: (_) => EmployeeProfileProvider()),
        ChangeNotifierProvider(create: (_) => CompanyConfigurationProvider()),
        ChangeNotifierProvider(create: (_) => AttendanceProvider()),
        ChangeNotifierProvider(create: (_) => LeaveProvider()),
        ChangeNotifierProvider(create: (_) => DynamicRequestProvider()),
      ],
      child: const CrystalHrApp(),
    ),
  );
}

class CrystalHrApp extends StatelessWidget {
  const CrystalHrApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'CrystalHR',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        brightness: Brightness.dark,
        primaryColor: const Color(0xFFC5C6CA),
        scaffoldBackgroundColor: Colors.transparent,
        fontFamily: 'Inter',
        useMaterial3: true,
      ),
      home: const MainScaffold(),
    );
  }
}

class MainScaffold extends StatefulWidget {
  const MainScaffold({super.key});

  @override
  State<MainScaffold> createState() => _MainScaffoldState();
}

class _MainScaffoldState extends State<MainScaffold> {
  final StorageService _storageService = StorageService();

  int _activeTab = 0; // 0: Dashboard, 1: Requests, 2: Attendance, 3: Reports, 4: Profile
  bool _loading = true;

  // Global app states
  late Profile _profile;
  late List<HRRequest> _requests;
  late List<Engagement> _engagements;
  late List<CheckInLog> _logs;
  late bool _checkedIn;
  String? _checkInTime;
  bool _isLoggedIn = false;
  String? _domain;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<AuthProvider>().checkSession().then((loggedIn) {
        setState(() {
          _isLoggedIn = loggedIn;
        });
        _loadState();
      });
    });
  }

  Future<void> _loadState() async {
    final dbHelper = DatabaseHelper.instance;
    final sqliteProfile = await dbHelper.getUserProfile();
    
    Profile profile;
    bool isLoggedIn = false;
    
    if (sqliteProfile != null) {
      profile = Profile.fromSqlite(sqliteProfile);
      isLoggedIn = true;
    } else {
      profile = await _storageService.getProfile();
      isLoggedIn = await _storageService.isLoggedIn();
    }

    if (isLoggedIn) {
      // Sync latest profile and location geofences dynamically in the background
      Future.delayed(Duration.zero, () async {
        try {
          final prefs = await SharedPreferences.getInstance();
          final token = prefs.getString('auth_token');
          final tenantId = prefs.getString('tenant_id') ?? 'tenant-sol-102';
          
          final Map<String, String> headers = {
            'Content-Type': 'application/json; charset=UTF-8',
            'Accept': 'application/json',
          };
          if (token != null && token.isNotEmpty) {
            headers['Authorization'] = 'Bearer $token';
          }
          if (tenantId.isNotEmpty) {
            headers['X-Tenant-ID'] = tenantId;
          }

          final employeeId = profile.id ?? 1;
          final url = Uri.parse('${ApiConstants.baseUrl}/employees/me');
          final response = await http.get(url, headers: headers);
          if (response.statusCode == 200) {
            final responseBody = jsonDecode(response.body);
            final updatedProfileData = responseBody['data'] ?? responseBody['employee'];
            if (updatedProfileData != null) {
              await dbHelper.saveUserProfile(updatedProfileData);
              
              // Sync locations list
              final locUrl = Uri.parse('${ApiConstants.baseUrl}/attendance/work-locations');
              final locResponse = await http.get(locUrl, headers: headers);
              if (locResponse.statusCode == 200) {
                final List<dynamic> locationsData = json.decode(locResponse.body);
                await dbHelper.saveOfficeLocations(locationsData);
              }

              // Update app profile state
              final sqliteProfile = await dbHelper.getUserProfile();
              if (sqliteProfile != null && mounted) {
                setState(() {
                  _profile = Profile.fromSqlite(sqliteProfile);
                });
              }
            }
          }
        } catch (e) {
          print('⚠️ Background profile and locations sync failed: $e');
        }
      });
    }

    final requests = await _storageService.getRequests();
    final engagements = await _storageService.getEngagements();
    
    List<CheckInLog> logs = [];
    if (isLoggedIn) {
      try {
        final db = await dbHelper.database;
        final maps = await db.query('attendance_records', orderBy: 'date DESC');
        logs = maps.map((map) {
          final date = map['date'] as String;
          final clockIn = map['clock_in_time'] as String?;
          final clockOut = map['clock_out_time'] as String?;
          final List<CheckInLog> list = [];
          if (clockOut != null && clockOut.isNotEmpty) {
            list.add(CheckInLog(
              id: 'out-${map['id']}',
              timestamp: clockOut,
              date: date,
              type: 'check-out',
              method: (map['clock_out_platform'] ?? 'Fingerprint').toString(),
            ));
          }
          if (clockIn != null && clockIn.isNotEmpty) {
            list.add(CheckInLog(
              id: 'in-${map['id']}',
              timestamp: clockIn,
              date: date,
              type: 'check-in',
              method: (map['clock_in_platform'] ?? 'Fingerprint').toString(),
            ));
          }
          return list;
        }).expand((x) => x).toList();
      } catch (e) {
        print('⚠️ Error loading logs from SQLite: $e');
      }
    }
    
    if (logs.isEmpty && !isLoggedIn) {
      logs = await _storageService.getLogs();
    }

    bool checkedIn = false;
    String? checkInTime;
    
    if (logs.isNotEmpty && logs.first.type == "check-in") {
      checkedIn = true;
      checkInTime = logs.first.timestamp;
    }

    final domain = await _storageService.getSavedDomain();

    if (mounted) {
      setState(() {
        _profile = profile;
        _requests = requests;
        _engagements = engagements;
        _logs = logs;
        _checkedIn = checkedIn;
        _checkInTime = checkInTime;
        _isLoggedIn = isLoggedIn;
        _domain = domain;
        _loading = false;
      });
    }
  }

  void _onLoginComplete(String domain) {
    setState(() {
      _isLoggedIn = true;
      _domain = domain;
    });
    _storageService.saveLoggedIn(true);
    _storageService.saveSavedDomain(domain);
    _loadState();
  }

  void _logout() async {
    final authProvider = context.read<AuthProvider>();
    final hasPending = await authProvider.hasPendingSyncs();
    if (hasPending) {
      if (!mounted) return;
      showDialog(
        context: context,
        builder: (context) => AlertDialog(
          title: Text(_profile.language == "ar" ? "عمليات غير متزامنة" : "Pending Operations"),
          content: Text(_profile.language == "ar"
              ? "يوجد عمليات معلقة (تبصيم أو طلبات إجازة) لم يتم رفعها للسيرفر بعد. تسجيل الخروج سيحذفها نهائياً. هل أنت متأكد؟"
              : "You have unsynced offline records. Logging out now will clear them. Are you sure you want to proceed?"),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: Text(_profile.language == "ar" ? "إلغاء" : "Cancel"),
            ),
            TextButton(
              onPressed: () {
                Navigator.pop(context);
                _performLogout();
              },
              child: Text(_profile.language == "ar" ? "تسجيل الخروج على أي حال" : "Logout Anyway", style: const TextStyle(color: Colors.red)),
            ),
          ],
        ),
      );
    } else {
      _performLogout();
    }
  }

  void _performLogout() async {
    setState(() {
      _isLoggedIn = false;
      _domain = null;
      _activeTab = 0;
      _checkedIn = false;
      _checkInTime = null;
    });
    await context.read<AuthProvider>().logout();
    _loadState();
  }

  // State update helpers & sync to storage
  void _updateProfile(Profile updated) {
    setState(() {
      _profile = updated;
    });
    _storageService.saveProfile(updated);
  }

  void _updateCompletedHours(double hours) {
    final updated = _profile.copyWith(completedHours: hours);
    _updateProfile(updated);
  }

  void _updateTargetHours(double hours) {
    final updated = _profile.copyWith(weeklyTargetHours: hours);
    _updateProfile(updated);
  }

  void _toggleCheckIn(String method) async {
    final locService = LocationServiceImpl();
    final geofenceService = GeofencingServiceImpl();
    final deviceService = DeviceInfoServiceImpl();

    try {
      final loc = await locService.getCurrentLocation();
      if (loc == null) {
        _showToast(
          _profile.language == "ar"
              ? "تعذر تحديد الموقع الجغرافي. يرجى تفعيل الـ GPS."
              : "Unable to retrieve current location. Please enable GPS.",
        );
        return;
      }

      final isInside = await geofenceService.isWithinAllowedArea(loc);
      if (!isInside) {
        _showToast(
          _profile.language == "ar"
              ? "عذراً! أنت خارج النطاق الجغرافي المسموح به للبصمة."
              : "You are outside the permitted geofence range.",
        );
        return;
      }

      final nearestLocation = await geofenceService.getNearestWorkLocation(loc);
      final locationName = nearestLocation?.name ?? 'Main Office';
      final device = await deviceService.getDeviceInfo();

      final now = DateTime.now();
      final hour = now.hour % 12 == 0 ? 12 : now.hour % 12;
      final min = now.minute.toString().padLeft(2, '0');
      final ampm = now.hour >= 12 ? "PM" : "AM";
      final timeString = "${hour.toString().padLeft(2, '0')}:$min $ampm";
      final dateString = now.toString().split(" ")[0];

      final db = await DatabaseHelper.instance.database;

      if (_checkedIn) {
        await db.update(
          'attendance_records',
          {
            'clock_out_time': timeString,
            'clock_out_latitude': loc.latitude,
            'clock_out_longitude': loc.longitude,
            'clock_out_device_name': device.deviceName,
            'clock_out_device_id': device.deviceId,
            'clock_out_platform': device.platform,
            'updated_at': now.toIso8601String(),
          },
          where: 'date = ?',
          whereArgs: [dateString],
        );

        try {
          final syncUrl = Uri.parse('${ApiConstants.baseUrl}${ApiConstants.clockOut}');
          await http.post(
            syncUrl,
            headers: ApiConstants.headers,
            body: jsonEncode({
              'employee_id': _profile.id ?? 1,
              'latitude': loc.latitude,
              'longitude': loc.longitude,
              'address': locationName,
            }),
          );
        } catch (e) {
          print('⚠️ Failed to sync clock-out: $e');
        }

        setState(() {
          _checkedIn = false;
          _checkInTime = null;
          _profile = _profile.copyWith(officeStatus: "OUT_OF_OFFICE");
        });
      } else {
        await db.insert(
          'attendance_records',
          {
            'date': dateString,
            'clock_in_time': timeString,
            'status': 'present',
            'clock_in_latitude': loc.latitude,
            'clock_in_longitude': loc.longitude,
            'location_name': locationName,
            'clock_in_device_name': device.deviceName,
            'clock_in_device_id': device.deviceId,
            'clock_in_platform': device.platform,
            'created_at': now.toIso8601String(),
            'updated_at': now.toIso8601String(),
          },
          conflictAlgorithm: ConflictAlgorithm.replace,
        );

        try {
          final syncUrl = Uri.parse('${ApiConstants.baseUrl}${ApiConstants.clockIn}');
          await http.post(
            syncUrl,
            headers: ApiConstants.headers,
            body: jsonEncode({
              'employee_id': _profile.id ?? 1,
              'latitude': loc.latitude,
              'longitude': loc.longitude,
              'address': locationName,
              'location_id': nearestLocation?.id,
            }),
          );
        } catch (e) {
          print('⚠️ Failed to sync clock-in: $e');
        }

        setState(() {
          _checkedIn = true;
          _checkInTime = timeString;
          _profile = _profile.copyWith(officeStatus: "ACTIVE");
        });
      }

      _loadState();
      
      _showToast(
        _profile.language == "ar"
            ? "تم تسجيل العملية بنجاح!"
            : "Operation recorded successfully!",
      );
    } on LocationPermissionDeniedException {
      _showToast(
        _profile.language == "ar"
            ? "تم رفض إذن الوصول للموقع الجغرافي. يرجى إعطاء الصلاحية للتطبيق لتسجيل البصمة."
            : "Location permission denied. Please grant permission to record attendance.",
      );
    } on LocationPermissionPermanentlyDeniedException {
      _showToast(
        _profile.language == "ar"
            ? "تم رفض صلاحية الموقع بشكل دائم. يرجى تفعيلها من إعدادات الهاتف لتسجيل البصمة."
            : "Location permission permanently denied. Please enable it from app settings to record attendance.",
      );
      // Wait for SnackBar display, then open settings
      Future.delayed(const Duration(seconds: 2), () {
        openAppSettings();
      });
    } on LocationServiceDisabledException {
      _showToast(
        _profile.language == "ar"
            ? "خدمات الموقع الجغرافي (GPS) معطلة. يرجى تفعيل الـ GPS من الهاتف."
            : "Location services (GPS) are disabled. Please enable GPS in device settings.",
      );
    } catch (e) {
      _showToast(
        _profile.language == "ar"
            ? "حدث خطأ غير متوقع: $e"
            : "An unexpected error occurred: $e",
      );
    }
  }

  void _showToast(String msg) {
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(msg),
        backgroundColor: const Color(0xFF4CD7F6),
        behavior: SnackBarBehavior.floating,
      ),
    );
  }

  void _addEngagement(Engagement newEng) {
    setState(() {
      _engagements.insert(0, newEng);
    });
    _storageService.saveEngagements(_engagements);
  }

  void _deleteEngagement(String id) {
    setState(() {
      _engagements.removeWhere((e) => e.id == id);
    });
    _storageService.saveEngagements(_engagements);
  }

  void _addRequest(HRRequest newReq) {
    setState(() {
      _requests.insert(0, newReq);
    });
    _storageService.saveRequests(_requests);
  }

  void _updateRequestStatus(String id, String status) {
    setState(() {
      _requests = _requests.map((r) => r.id == id ? r.copyWith(status: status) : r).toList();
    });
    _storageService.saveRequests(_requests);
  }

  void _deleteRequest(String id) {
    setState(() {
      _requests.removeWhere((r) => r.id == id);
    });
    _storageService.saveRequests(_requests);
  }

  void _addCustomLog(String date, String time, String type, String method) {
    final newId = "log-${DateTime.now().millisecondsSinceEpoch}";
    final newLog = CheckInLog(
      id: newId,
      timestamp: time,
      date: date,
      type: type,
      method: method,
    );
    setState(() {
      _logs.insert(0, newLog);
    });
    _storageService.saveLogs(_logs);
  }

  void _deleteLog(String id) {
    setState(() {
      _logs.removeWhere((l) => l.id == id);
    });
    _storageService.saveLogs(_logs);
  }

  void _showReceiptOverlay() {
    final double target = _profile.weeklyTargetHours;
    final double completed = _profile.completedHours;
    final int percentage = target > 0 ? (completed / target * 100).clamp(0.0, 100.0).round() : 0;

    showDialog(
      context: context,
      builder: (context) {
        return Dialog(
          backgroundColor: Colors.white,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: SingleChildScrollView(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  const Text(
                    "CRYSTAL LEDGER INC.",
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      fontFamily: 'monospace',
                      fontSize: 16,
                      fontWeight: FontWeight.w900,
                      color: Colors.black,
                    ),
                  ),
                  const Text(
                    "Secure Biometric Presence Receipt",
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      fontFamily: 'monospace',
                      fontSize: 9,
                      color: Colors.grey,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    "Date: ${DateTime.now().toString().split(".")[0]}",
                    textAlign: TextAlign.center,
                    style: const TextStyle(
                      fontFamily: 'monospace',
                      fontSize: 9,
                      color: Colors.grey,
                    ),
                  ),
                  const SizedBox(height: 12),
                  const Divider(color: Colors.black26, thickness: 1.5, height: 1),
                  const SizedBox(height: 12),
                  _buildReceiptRow("EMPLOYEE:", _profile.name),
                  _buildReceiptRow("ASSIGNED ROLE:", _profile.role),
                  _buildReceiptRow("PACING PROGRESS:", "$percentage% Complete"),
                  const SizedBox(height: 12),
                  const Divider(color: Colors.black26, thickness: 1.5, height: 1),
                  const SizedBox(height: 12),
                  const Text(
                    "WEEKLY PRESENCE CORRIDORS",
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      fontFamily: 'monospace',
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
                      color: Colors.black,
                    ),
                  ),
                  const SizedBox(height: 8),
                  // Group sessions by date
                  ..._logs.map((l) => Padding(
                        padding: const EdgeInsets.symmetric(vertical: 2.0),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              l.date,
                              style: const TextStyle(
                                  fontFamily: 'monospace', fontSize: 9, color: Colors.black87),
                            ),
                            Text(
                              "[${l.type.toUpperCase()}] ${l.timestamp}",
                              style: const TextStyle(
                                  fontFamily: 'monospace', fontSize: 9, color: Colors.black87),
                            ),
                          ],
                        ),
                      )),
                  const SizedBox(height: 12),
                  const Divider(color: Colors.black26, thickness: 1.5, height: 1),
                  const SizedBox(height: 12),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text(
                        "TOTAL LOGGED:",
                        style: TextStyle(
                          fontFamily: 'monospace',
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                          color: Colors.black,
                        ),
                      ),
                      Text(
                        "${completed.toStringAsFixed(1)} hrs",
                        style: const TextStyle(
                          fontFamily: 'monospace',
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                          color: Colors.black,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  const Text(
                    "CRYSTAL SECURE BLOCK ID: 0x98A19000C12\nTHANK YOU FOR YOUR DEDICATED PRESENCE.",
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      fontFamily: 'monospace',
                      fontSize: 8,
                      color: Colors.grey,
                    ),
                  ),
                  const SizedBox(height: 20),
                  ElevatedButton(
                    onPressed: () => Navigator.pop(context),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.black,
                      foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                    child: const Text(
                      "CLOSE RECEIPT",
                      style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold),
                    ),
                  )
                ],
              ),
            ),
          ),
        );
      },
    );
  }

  Widget _buildReceiptRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(fontFamily: 'monospace', fontSize: 10, color: Colors.black)),
          Text(value, style: const TextStyle(fontFamily: 'monospace', fontSize: 10, fontWeight: FontWeight.bold, color: Colors.black)),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) {
      return const Scaffold(
        backgroundColor: Color(0xFF121414),
        body: Center(
          child: CircularProgressIndicator(color: Color(0xFF4CD7F6)),
        ),
      );
    }

    final List<Widget> views = [
      DashboardView(
        profile: _profile,
        logs: _logs,
        engagements: _engagements,
        checkedIn: _checkedIn,
        checkInTime: _checkInTime,
        onToggleCheckIn: _toggleCheckIn,
        onAddEngagement: _addEngagement,
        onDeleteEngagement: _deleteEngagement,
        onUpdateCompletedHours: _updateCompletedHours,
        onUpdateTargetHours: _updateTargetHours,
        onOpenProfile: () => setState(() => _activeTab = 4),
        onProfileRefreshed: (updated) => setState(() => _profile = updated),
      ),
      RequestsView(
        profile: _profile,
        requests: _requests,
        onAddRequest: _addRequest,
        onUpdateRequestStatus: _updateRequestStatus,
        onDeleteRequest: _deleteRequest,
      ),
      AttendanceView(
        logs: _logs,
        onAddCustomLog: _addCustomLog,
        onDeleteLog: _deleteLog,
        profile: _profile,
      ),
      ReportsView(
        profile: _profile,
        logs: _logs,
        onExportReceipt: _showReceiptOverlay,
      ),
      ProfileView(
        profile: _profile,
        onUpdateProfile: _updateProfile,
        onLogout: _logout,
      ),
    ];

    final isAr = _profile.language == "ar";
    return MeshBackground(
      themeMode: _profile.themeMode,
      child: Directionality(
        textDirection: isAr ? TextDirection.rtl : TextDirection.ltr,
        child: !_isLoggedIn
            ? OnboardingView(
                profile: _profile,
                onUpdateProfile: _updateProfile,
                onLoginComplete: _onLoginComplete,
              )
            : Scaffold(
                extendBody: true,
          // Header AppBar with dynamic status bar padding
          appBar: PreferredSize(
            preferredSize: Size.fromHeight(56 + MediaQuery.of(context).padding.top),
            child: Container(
              padding: EdgeInsets.only(
              top: MediaQuery.of(context).padding.top + 6,
              bottom: 10,
              left: 20,
              right: 20,
            ),
            decoration: BoxDecoration(
              color: Colors.black.withOpacity(0.3),
              border: const Border(bottom: BorderSide(color: Colors.white10)),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Row(
                  children: [
                    Icon(Icons.diamond, color: Color(0xFF4CD7F6), size: 24),
                    SizedBox(width: 8),
                    Text(
                      "CrystalHR",
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.w900,
                        color: Colors.white,
                        letterSpacing: -0.5,
                      ),
                    ),
                  ],
                ),
                GestureDetector(
                  onTap: () {
                    setState(() {
                      _activeTab = 4;
                    });
                  },
                  child: Container(
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      border: Border.all(color: const Color(0xFF4CD7F6), width: 1.5),
                    ),
                    child: CircleAvatar(
                      radius: 18,
                      backgroundImage: NetworkImage(_profile.avatarUrl),
                      backgroundColor: Colors.grey.shade900,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),

        // Body Content Viewport wrapped in top-only SafeArea
        body: SafeArea(
          bottom: false,
          child: views[_activeTab],
        ),

        // Floating Bottom Glassmorphic Navigation Bar wrapped in bottom-only SafeArea
        bottomNavigationBar: SafeArea(
          top: false,
          child: Container(
            margin: const EdgeInsets.only(left: 20, right: 20, bottom: 8),
            height: 64,
            decoration: BoxDecoration(
              color: const Color(0x990A0E1A),
              borderRadius: BorderRadius.circular(32),
              border: Border.all(color: Colors.white.withOpacity(0.15), width: 1.0),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.4),
                  blurRadius: 20,
                  offset: const Offset(0, 8),
                ),
              ],
            ),
            clipBehavior: Clip.antiAlias,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                _buildNavItem(Icons.dashboard_outlined, 0),
                _buildNavItem(Icons.assignment_outlined, 1),
                _buildNavItem(Icons.calendar_month_outlined, 2),
                _buildNavItem(Icons.bar_chart_outlined, 3),
                _buildNavItem(Icons.person_outline, 4),
              ],
            ),
          ),
        ),

        // Floating printable receipt handler button from reports view
        floatingActionButton: _activeTab == 3
            ? FloatingActionButton(
                onPressed: _showReceiptOverlay,
                backgroundColor: const Color(0xFF4CD7F6),
                foregroundColor: Colors.black,
                shape: const CircleBorder(),
                child: const Icon(Icons.print),
              )
            : null,
      ),
    ),);
  }

  Widget _buildNavItem(IconData icon, int index) {
    final isSelected = _activeTab == index;
    return GestureDetector(
      onTap: () {
        setState(() {
          _activeTab = index;
        });
      },
      behavior: HitTestBehavior.opaque,
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            icon,
            color: isSelected ? const Color(0xFF4CD7F6) : Colors.grey,
            size: 24,
          ),
          if (isSelected) ...[
            const SizedBox(height: 4),
            Container(
              width: 4,
              height: 4,
              decoration: const BoxDecoration(
                shape: BoxShape.circle,
                color: Color(0xFF4CD7F6),
              ),
            )
          ]
        ],
      ),
    );
  }
}
