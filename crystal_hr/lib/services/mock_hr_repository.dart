import '../models/hr_entities.dart';
import '../models/hr_repository.dart';

class MockHRRepository implements IHRRepository {
  @override
  Future<Employee> getEmployeeProfile(String employeeId) async {
    return Employee(
      id: employeeId,
      name: "Alex Sterling",
      role: "VP of Product Engineering",
      email: "alex.sterling@crystalhr.com",
      avatarUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuB9ALvywzdH-a_z-tjjQMal7BjnkKufjEWf-x_WTFgoYZgkBMnzVx258INR1F00mknAUAdX4RmHA8I5uAVLaYPWU0ELFU8VOlePhS6CLO0eHtDF6jr7PoRbE7uRNm7eUcWWcKZhGA9IabRhKqs5NqOcG95PFvPpJdlr97EYXnc_w69yc512KygYumKfCDTX3GIHxmxFtMEgVgeCqOo4PENX6p7pUFZNWG8JGnnCK4GQZAF5IgUhiTxc2BapyvloRZ31lLl590J2QTU",
      managerName: "Sarah Jenkins",
      leaveBalance: 24.5,
      latestPayslipAmount: 18500.0,
      latestPayslipMonth: "June 2026",
    );
  }

  @override
  Future<List<AttendanceSession>> getAttendanceHistory(String employeeId) async {
    return [
      AttendanceSession(
        id: "att-1",
        date: "2026-07-13",
        clockInTime: "08:28 AM",
        clockOutTime: "05:02 PM",
        isInsideGeofence: true,
        breakDurationMinutes: 45,
        workingHours: 7.7,
        overtimeHours: 0.0,
        status: "Checked Out",
        shiftName: "Regular Shift",
        shiftStartTime: "08:30 AM",
        workLocationName: "Headquarters",
      ),
      AttendanceSession(
        id: "att-2",
        date: "2026-07-12",
        clockInTime: "08:15 AM",
        clockOutTime: "05:45 PM",
        isInsideGeofence: true,
        breakDurationMinutes: 60,
        workingHours: 8.5,
        overtimeHours: 0.5,
        status: "Checked Out",
        shiftName: "Regular Shift",
        shiftStartTime: "08:30 AM",
        workLocationName: "Headquarters",
      ),
      AttendanceSession(
        id: "att-3",
        date: "2026-07-11",
        clockInTime: "08:32 AM",
        clockOutTime: "05:00 PM",
        isInsideGeofence: true,
        breakDurationMinutes: 50,
        workingHours: 7.6,
        overtimeHours: 0.0,
        status: "Checked Out",
        shiftName: "Regular Shift",
        shiftStartTime: "08:30 AM",
        workLocationName: "Headquarters",
      ),
    ];
  }

  @override
  Future<AttendanceSession?> getTodayAttendance(String employeeId) async {
    return AttendanceSession(
      id: "att-today",
      date: "2026-07-14",
      isInsideGeofence: true,
      breakDurationMinutes: 45,
      workingHours: 0.0,
      overtimeHours: 0.0,
      status: "Checked Out", // Initially checked out until check-in
      shiftName: "Regular Shift",
      shiftStartTime: "08:30 AM",
      workLocationName: "Headquarters",
    );
  }

  @override
  Future<void> clockIn({
    required String employeeId,
    required String time,
    required String method,
    required bool isInsideGeofence,
    required String locationName,
  }) async {
    // Simulated Odoo ERP/Firebase post trigger
  }

  @override
  Future<void> clockOut({
    required String employeeId,
    required String time,
    required String method,
    required bool isInsideGeofence,
    required String locationName,
  }) async {
    // Simulated Odoo ERP/Firebase post trigger
  }

  @override
  Future<List<HRNotification>> getNotifications(String employeeId) async {
    return [
      HRNotification(
        id: "notif-1",
        titleAr: "تم قبول الإجازة سنوية",
        titleEn: "Annual Leave Approved",
        type: "leave_approved",
        date: "2026-07-13",
        messageAr: "تم قبول طلب إجازتك السنوية من 1 أغسطس إلى 10 أغسطس.",
        messageEn: "Your annual leave request from Aug 1 to Aug 10 has been approved.",
      ),
      HRNotification(
        id: "notif-2",
        titleAr: "تم إيداع الراتب الشهري",
        titleEn: "Monthly Payroll Processed",
        type: "payroll_processed",
        date: "2026-06-28",
        messageAr: "تم تحويل راتب شهر يونيو بنجاح إلى حسابك المصرفي المعتمد.",
        messageEn: "Your salary for June has been successfully transferred to your bank account.",
      ),
      HRNotification(
        id: "notif-3",
        titleAr: "تنويه: بدء الدوام الرسمي",
        titleEn: "HR Announcement: Regular Shift",
        type: "hr_announcement",
        date: "2026-07-12",
        messageAr: "نود تذكيركم ببدء الدوام الرسمي للوردية الصباحية في تمام الساعة 08:30 صباحاً.",
        messageEn: "Reminder: The regular morning shift begins promptly at 08:30 AM.",
      ),
    ];
  }

  @override
  Future<List<HREvent>> getHREvents(String employeeId) async {
    return [
      HREvent(
        id: "event-1",
        titleAr: "اجتماع مراجعة أداء الربع الرابع",
        titleEn: "Q4 Portfolio Performance Review",
        time: "10:30 AM",
        type: "Performance Review",
        locationAr: "غرفة اجتماعات الإدارة الرئيسية",
        locationEn: "Board Room Crystal",
        descriptionAr: "مراجعة تقارير الربع الرابع مع رئيس قطاع الهندسة.",
        descriptionEn: "Quarterly review with VP of Product Engineering and leads.",
      ),
      HREvent(
        id: "event-2",
        titleAr: "ورشة تدريبية: أمن البيانات والتحقق",
        titleEn: "Security Core Training Session",
        time: "02:00 PM",
        type: "Training Session",
        locationAr: "قاعة التدريب (ب)",
        locationEn: "Training Room B",
        descriptionAr: "جلسة مخصصة لتدريب الموظفين على نظام أمن البيانات والتوقيع الرقمي.",
        descriptionEn: "Training session covering local data security and digital signature.",
      ),
      HREvent(
        id: "event-3",
        titleAr: "مقابلة توظيف: مهندس برمجيات أول",
        titleEn: "Interview: Senior Software Engineer",
        time: "04:30 PM",
        type: "Interview",
        locationAr: "قناة زووم الافتراضية",
        locationEn: "Zoom Meeting Room",
        descriptionAr: "مقابلة تقنية لمرشح جديد لفريق الهندسة.",
        descriptionEn: "Technical evaluation interview with a potential lead engineer candidate.",
      ),
    ];
  }
}
