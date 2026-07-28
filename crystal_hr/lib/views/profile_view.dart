import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../models/types.dart';
import '../widgets/glass_card.dart';
import '../providers/employee_profile_provider.dart';

class ProfileView extends StatefulWidget {
  final Profile profile;
  final Function(Profile updated) onUpdateProfile;
  final VoidCallback? onLogout;

  const ProfileView({
    super.key,
    required this.profile,
    required this.onUpdateProfile,
    this.onLogout,
  });

  @override
  State<ProfileView> createState() => _ProfileViewState();
}

class _ProfileViewState extends State<ProfileView> {
  late String _themeMode;
  late String _language;
  bool _notificationsEnabled = true;
  bool _faceIdEnabled = false;

  @override
  void initState() {
    super.initState();
    _themeMode = widget.profile.themeMode;
    _language = widget.profile.language;
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final provider = context.read<EmployeeProfileProvider>();
      provider.fetchProfile();
      provider.fetchWorkConfiguration();
      provider.fetchLeaveBalances();
      provider.fetchDocuments();
      provider.fetchEmergencyContacts();
    });
  }

  void _saveSettings() {
    final updated = widget.profile.copyWith(
      themeMode: _themeMode,
      language: _language,
    );
    widget.onUpdateProfile(updated);
  }

  @override
  Widget build(BuildContext context) {
    final isLight = widget.profile.themeMode == "light";
    final titleColor = isLight ? const Color(0xFF0F172A) : Colors.white;
    final subColor = isLight ? const Color(0xFF2563EB) : const Color(0xFF4CD7F6);
    final isAr = widget.profile.language == "ar";

    final profileProvider = context.watch<EmployeeProfileProvider>();
    final employee = profileProvider.profile;
    final config = profileProvider.workConfig;
    final emergencyContacts = profileProvider.emergencyContacts;
    final leaveBalances = profileProvider.leaveBalances;
    final docs = profileProvider.documents;

    final String displayName = employee != null ? '${employee.firstName} ${employee.lastName}' : widget.profile.name;
    final String displayRole = employee?.position ?? widget.profile.role;
    final String displayEmail = employee?.email ?? '---';
    final String displayPhone = employee?.phone ?? '---';
    final String displayEmpNo = employee?.employeeNumber ?? '---';
    final String displayDept = employee?.department ?? '---';

    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 15),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                isAr ? "الملف التعريفي والتحكم" : "EMPLOYEE PROFILE COCKPIT",
                style: TextStyle(
                  fontFamily: 'monospace',
                  fontSize: 9,
                  fontWeight: FontWeight.bold,
                  color: subColor,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                isAr ? "الملف الشخصي للموظف" : "Personal Profile",
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.w900,
                  color: titleColor,
                ),
              ),
            ],
          ),
          const SizedBox(height: 20),

          // 1. Personal Info Card
          GlassCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    const Icon(Icons.badge, size: 16, color: Color(0xFF4CD7F6)),
                    const SizedBox(width: 8),
                    Text(
                      isAr ? "البيانات الشخصية والوظيفية" : "PERSONAL & JOB IDENTITY",
                      style: const TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                        letterSpacing: 1.0,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 15),
                Row(
                  children: [
                    CircleAvatar(
                      radius: 30,
                      backgroundColor: Colors.white10,
                      child: Text(
                        displayName.isNotEmpty ? displayName[0].toUpperCase() : "E",
                        style: const TextStyle(color: Color(0xFF4CD7F6), fontSize: 24, fontWeight: FontWeight.bold),
                      ),
                    ),
                    const SizedBox(width: 15),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            displayName,
                            style: const TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.bold),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            displayRole,
                            style: const TextStyle(color: Colors.grey, fontSize: 10),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 15),
                const Divider(color: Colors.white10),
                const SizedBox(height: 10),
                _buildInfoRow(isAr ? "الرقم الوظيفي" : "Employee ID", displayEmpNo),
                _buildInfoRow(isAr ? "المسمى الوظيفي" : "Job Title", displayRole),
                _buildInfoRow(isAr ? "الشركة" : "Company", isAr ? "شركة بي اتند للحلول" : "Solutions Co"),
                _buildInfoRow(isAr ? "الإدارة" : "Department", displayDept),
                _buildInfoRow(isAr ? "الفرع" : "Branch", isAr ? "الفرع الرئيسي" : "Main HQ Branch"),
                _buildInfoRow(isAr ? "المدير المباشر" : "Direct Manager", isAr ? "المهندس خالد الفهد" : "Khalid Al-Fahad"),
              ],
            ),
          ),
          const SizedBox(height: 16),

          // 2. Contact Information
          GlassCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    const Icon(Icons.contact_phone, size: 16, color: Color(0xFF4CD7F6)),
                    const SizedBox(width: 8),
                    Text(
                      isAr ? "معلومات الاتصال والتواصل" : "CONTACT INFORMATION",
                      style: const TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                        letterSpacing: 1.0,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 15),
                _buildInfoRow(isAr ? "البريد الإلكتروني" : "Email Address", displayEmail),
                _buildInfoRow(isAr ? "رقم الجوال" : "Mobile Phone", displayPhone),
                if (emergencyContacts.isNotEmpty)
                  _buildInfoRow(
                    isAr ? "جهة اتصال الطوارئ" : "Emergency Contact",
                    '${emergencyContacts.first.relationship}: ${emergencyContacts.first.name} (${emergencyContacts.first.primaryPhone})',
                  )
                else
                  _buildInfoRow(isAr ? "جهة اتصال الطوارئ" : "Emergency Contact", '---'),
              ],
            ),
          ),
          const SizedBox(height: 16),

          // 3. Employment Data
          GlassCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    const Icon(Icons.work, size: 16, color: Color(0xFF4CD7F6)),
                    const SizedBox(width: 8),
                    Text(
                      isAr ? "تفاصيل عقد العمل والدوام" : "EMPLOYMENT CONTRACT & SCHEDULE",
                      style: const TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                        letterSpacing: 1.0,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 15),
                _buildInfoRow(isAr ? "نوع العقد" : "Contract Type", isAr ? "عقد عمل محدد المدة" : "Fixed-Term Contract"),
                _buildInfoRow(isAr ? "ساعات الدوام اليومي" : "Daily Required Hours", config != null ? '${config.dailyHoursRequired} hrs' : '8.0 hrs'),
                _buildInfoRow(
                  isAr ? "جدول العمل (الشفت)" : "Schedule Shift",
                  config != null ? '${config.shiftName} (${config.shiftStartTime} - ${config.shiftEndTime})' : 'Morning Shift (08:30 AM - 05:30 PM)',
                ),
                _buildInfoRow(
                  isAr ? "موقع العمل المعتمد" : "Work Location",
                  config != null ? config.locationName : (isAr ? "المقر الرئيسي" : "Main HQ Branch"),
                ),
                _buildInfoRow(
                  isAr ? "النطاق الجغرافي (Geofence)" : "Geofence Boundary",
                  config != null ? 'Within ${config.geofenceRadius} meters' : 'Within 100 meters',
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),

          // 4. Documents
          GlassCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    const Icon(Icons.folder_shared, size: 16, color: Color(0xFF4CD7F6)),
                    const SizedBox(width: 8),
                    Text(
                      isAr ? "المستندات والملفات المرفقة" : "PERSONAL DOCUMENTS & CONTRACTS",
                      style: const TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                        letterSpacing: 1.0,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 15),
                if (docs.isEmpty)
                  Padding(
                    padding: const EdgeInsets.symmetric(vertical: 10),
                    child: Center(
                      child: Text(
                        isAr ? "لا يوجد مستندات مرفقة حالياً" : "No attached documents found",
                        style: const TextStyle(color: Colors.grey, fontSize: 11),
                      ),
                    ),
                  )
                else
                  ...docs.map((doc) => _buildDocumentRow(doc.documentType, doc.name)),
              ],
            ),
          ),
          const SizedBox(height: 16),

          // 5. Application Settings
          GlassCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    const Icon(Icons.settings, size: 16, color: Color(0xFF4CD7F6)),
                    const SizedBox(width: 8),
                    Text(
                      isAr ? "إعدادات التطبيق والتفضيلات" : "APPLICATION PREFERENCES",
                      style: const TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                        letterSpacing: 1.0,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 15),

                // Language
                DropdownButtonFormField<String>(
                  value: _language,
                  dropdownColor: const Color(0xFF121414),
                  style: const TextStyle(color: Colors.white, fontSize: 12),
                  decoration: InputDecoration(
                    labelText: isAr ? "لغة الواجهة" : "Interface Language",
                    labelStyle: const TextStyle(color: Colors.grey, fontSize: 10),
                  ),
                  items: const [
                    DropdownMenuItem(value: "ar", child: Text("العربية (Arabic)")),
                    DropdownMenuItem(value: "en", child: Text("English (English)")),
                  ],
                  onChanged: (val) {
                    if (val != null) {
                      setState(() => _language = val);
                      _saveSettings();
                    }
                  },
                ),
                const SizedBox(height: 10),

                // Theme Mode
                DropdownButtonFormField<String>(
                  value: _themeMode,
                  dropdownColor: const Color(0xFF121414),
                  style: const TextStyle(color: Colors.white, fontSize: 12),
                  decoration: InputDecoration(
                    labelText: isAr ? "مظهر الخلفية" : "App Appearance Mode",
                    labelStyle: const TextStyle(color: Colors.grey, fontSize: 10),
                  ),
                  items: const [
                    DropdownMenuItem(value: "light", child: Text("LIGHT MESH • مظهر مضيء")),
                    DropdownMenuItem(value: "dark", child: Text("DARK GLOW • مظهر مظلم")),
                  ],
                  onChanged: (val) {
                    if (val != null) {
                      setState(() => _themeMode = val);
                      _saveSettings();
                    }
                  },
                ),
                const SizedBox(height: 15),

                // Notifications Toggle
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      isAr ? "تفعيل الإشعارات الفورية" : "Push Notifications",
                      style: const TextStyle(color: Colors.grey, fontSize: 11),
                    ),
                    Switch(
                      value: _notificationsEnabled,
                      activeColor: const Color(0xFF4CD7F6),
                      onChanged: (val) => setState(() => _notificationsEnabled = val),
                    ),
                  ],
                ),

                // FaceID Toggle
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      isAr ? "تسجيل الدخول بالبصمة الحيوية (Face ID)" : "Biometric Quick Login (Face ID)",
                      style: const TextStyle(color: Colors.grey, fontSize: 11),
                    ),
                    Switch(
                      value: _faceIdEnabled,
                      activeColor: const Color(0xFF4CD7F6),
                      onChanged: (val) => setState(() => _faceIdEnabled = val),
                    ),
                  ],
                ),
                const SizedBox(height: 10),

                // Change profile details triggers
                Wrap(
                  spacing: 10,
                  runSpacing: 10,
                  children: [
                    ElevatedButton(
                      onPressed: () {},
                      style: ElevatedButton.styleFrom(backgroundColor: Colors.white10),
                      child: Text(isAr ? "تغيير الصورة" : "CHANGE PHOTO", style: const TextStyle(fontSize: 9, color: Colors.white)),
                    ),
                    ElevatedButton(
                      onPressed: () {},
                      style: ElevatedButton.styleFrom(backgroundColor: Colors.white10),
                      child: Text(isAr ? "تغيير كلمة المرور" : "CHANGE PASSWORD", style: const TextStyle(fontSize: 9, color: Colors.white)),
                    ),
                    ElevatedButton(
                      onPressed: () {},
                      style: ElevatedButton.styleFrom(backgroundColor: Colors.white10),
                      child: Text(isAr ? "تغيير رمز PIN" : "CHANGE PIN CODE", style: const TextStyle(fontSize: 9, color: Colors.white)),
                    ),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),

          // 6. Security & Devices
          GlassCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    const Icon(Icons.devices, size: 16, color: Color(0xFF4CD7F6)),
                    const SizedBox(width: 8),
                    Text(
                      isAr ? "الأمان والأجهزة النشطة" : "SECURITY & ACTIVE DEVICES",
                      style: const TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                        letterSpacing: 1.0,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 15),
                _buildInfoRow(isAr ? "الأجهزة النشطة المسجلة" : "Active Devices Logged In", "iPhone 17 Simulator"),
                _buildInfoRow(isAr ? "آخر تسجيل دخول" : "Last Login Date/Time", "Today 08:24 AM (Riyadh IP)"),
                _buildInfoRow(isAr ? "آخر جهاز تم استخدامه" : "Last Device Used", "iPhone 17 (Current)"),
                const SizedBox(height: 15),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: () {},
                    style: ElevatedButton.styleFrom(backgroundColor: const Color(0x20F43F5E)),
                    child: Text(
                      isAr ? "تسجيل الخروج من كافة الأجهزة" : "TERMINATE ALL SESSIONS",
                      style: const TextStyle(color: Color(0xFFF43F5E), fontSize: 10, fontWeight: FontWeight.bold),
                    ),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),

          // 7. Logout Button
          if (widget.onLogout != null) ...[
            SizedBox(
              width: double.infinity,
              child: ElevatedButton.icon(
                onPressed: widget.onLogout,
                icon: const Icon(Icons.logout, size: 14, color: Colors.black),
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFFF43F5E),
                  foregroundColor: Colors.black,
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
                label: Text(
                  isAr ? "تسجيل الخروج النهائي" : "SECURE SYSTEM LOGOUT",
                  style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.black),
                ),
              ),
            ),
          ],
          const SizedBox(height: 100),
        ],
      ),
    );
  }

  Widget _buildInfoRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(color: Colors.grey, fontSize: 10)),
          Text(value, style: const TextStyle(color: Colors.white70, fontSize: 10, fontWeight: FontWeight.bold)),
        ],
      ),
    );
  }

  Widget _buildDocumentRow(String title, String fileName) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.all(10),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.02),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: Colors.white.withOpacity(0.04)),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            children: [
              const Icon(Icons.picture_as_pdf, color: Color(0xFFF43F5E), size: 16),
              const SizedBox(width: 8),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(title, style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold)),
                  Text(fileName, style: const TextStyle(color: Colors.grey, fontSize: 8)),
                ],
              ),
            ],
          ),
          const Row(
            children: [
              Icon(Icons.remove_red_eye_outlined, size: 14, color: Color(0xFF4CD7F6)),
              SizedBox(width: 10),
              Icon(Icons.download, size: 14, color: Colors.grey),
            ],
          ),
        ],
      ),
    );
  }
}
