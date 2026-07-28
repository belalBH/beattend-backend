import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/types.dart';

class StorageService {
  static const String _keyProfile = 'crystal_profile';
  static const String _keyRequests = 'crystal_requests';
  static const String _keyEngagements = 'crystal_engagements';
  static const String _keyLogs = 'crystal_logs';
  static const String _keyCheckedIn = 'crystal_checked_in';
  static const String _keyCheckInTime = 'crystal_check_in_time';

  // Initial Mock Data
  static final Profile _initialProfile = Profile(
    name: "Alex Sterling",
    role: "VP of Product Engineering",
    avatarUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuB9ALvywzdH-a_z-tjjQMal7BjnkKufjEWf-x_WTFgoYZgkBMnzVx258INR1F00mknAUAdX4RmHA8I5uAVLaYPWU0ELFU8VOlePhS6CLO0eHtDF6jr7PoRbE7uRNm7eUcWWcKZhGA9IabRhKqs5NqOcG95PFvPpJdlr97EYXnc_w69yc512KygYumKfCDTX3GIHxmxFtMEgVgeCqOo4PENX6p7pUFZNWG8JGnnCK4GQZAF5IgUhiTxc2BapyvloRZ31lLl590J2QTU",
    officeStatus: "ACTIVE",
    weeklyTargetHours: 40.0,
    completedHours: 32.5,
    themeMode: "light",
    language: "ar",
  );

  static final List<Engagement> _initialEngagements = [
    Engagement(
      id: "eng-1",
      title: "Q4 Performance Review Meeting",
      date: "2026-10-14",
      rawDate: "14 OCT",
      time: "10:30 AM",
      location: "Board Room Crystal",
      type: "INTERNAL",
      status: "error", // red dot in design
      attendees: [
        "https://lh3.googleusercontent.com/aida-public/AB6AXuA_ZdZgN5CEo1LHsOgo4UmWW9oQdHAh7d7IOsTLOsX2_D0yRY0pIqXX7Msb3traRzEsGxz06Yn4aR5p-lwmASa5sD2ZpUT5P9b4Dx8-A7GCz9SRUg7No_GkPY-WriK6QAafiBQqY0waD5d4nvEfAIXCwBtLvIaetUx92i1IsIUFZAwr43jydgx8aY37Rj58MeKT4Ska7zNmwbSxK7329WVqPOvtL1qPt3X7P29bhCIkoXz7GdoV73JlUe55x4PzK5ewBdNpAo_JJIU",
        "https://lh3.googleusercontent.com/aida-public/AB6AXuDkx9S6YP1-jJ2BokfckqFuZYX7T_UWYIFbpm5gUv-BHG6anaWgLj9m6SJV5TCUpWZvmIew8mFkgL-flGYx9Q0X17mJ9q3694pNm43g2J7N9bFruQat7ePkpijluFrHa1rR6ByaqM_-rsK4WCRyFUlwGH9dSNbdtFYQ4_e8wB8soAHTpAtbZ5kSlbaji1CQ8bQN97qcsgTFvPv8wuepX36WWEIkQ36jF1gHs4MrjDNpNJ2P9_c5y3tJnD8Y-Tyub67hu3xU3b7lFys"
      ],
      description: "Quarterly performance audit with direct manager Sarah Jenkins.",
    ),
    Engagement(
      id: "eng-2",
      title: "Security Core Training Session",
      date: "2026-10-15",
      rawDate: "15 OCT",
      time: "02:00 PM",
      location: "Training Room B",
      type: "INTERNAL",
      status: "active", // cyan dot in design
      attendees: [
        "https://lh3.googleusercontent.com/aida-public/AB6AXuB9ALvywzdH-a_z-tjjQMal7BjnkKufjEWf-x_WTFgoYZgkBMnzVx258INR1F00mknAUAdX4RmHA8I5uAVLaYPWU0ELFU8VOlePhS6CLO0eHtDF6jr7PoRbE7uRNm7eUcWWcKZhGA9IabRhKqs5NqOcG95PFvPpJdlr97EYXnc_w69yc512KygYumKfCDTX3GIHxmxFtMEgVgeCqOo4PENX6p7pUFZNWG8JGnnCK4GQZAF5IgUhiTxc2BapyvloRZ31lLl590J2QTU"
      ],
      description: "Mandatory corporate data safety compliance and access log security audit workshop.",
    )
  ];

  static final List<CheckInLog> _initialLogs = [
    CheckInLog(id: "log-1", timestamp: "08:45 AM", date: "2026-07-12", type: "check-in", method: "Fingerprint"),
    CheckInLog(id: "log-2", timestamp: "08:30 AM", date: "2026-07-11", type: "check-in", method: "NFC"),
    CheckInLog(id: "log-3", timestamp: "05:15 PM", date: "2026-07-11", type: "check-out", method: "NFC"),
    CheckInLog(id: "log-4", timestamp: "08:40 AM", date: "2026-07-10", type: "check-in", method: "Fingerprint"),
    CheckInLog(id: "log-5", timestamp: "05:30 PM", date: "2026-07-10", type: "check-out", method: "Fingerprint"),
    CheckInLog(id: "log-6", timestamp: "08:55 AM", date: "2026-07-09", type: "check-in", method: "Manual Override"),
    CheckInLog(id: "log-7", timestamp: "05:05 PM", date: "2026-07-09", type: "check-out", method: "Manual Override"),
  ];

  static final List<HRRequest> _initialRequests = [
    HRRequest(
      id: "req-1",
      type: "leave",
      typeNameAr: "طلب إجازة",
      typeNameEn: "Leave Request",
      dateSubmitted: "2026-07-08",
      status: "approved",
      details: RequestDetails(
        startDate: "2026-08-01",
        endDate: "2026-08-10",
        leaveType: "Annual / سنوية",
        notes: "Annual family summer vacation."
      )
    ),
    HRRequest(
      id: "req-2",
      type: "loan",
      typeNameAr: "طلب سلفة",
      typeNameEn: "Loan Request",
      dateSubmitted: "2026-07-11",
      status: "pending",
      details: RequestDetails(
        amount: 15000.0,
        repaymentMonths: 12,
        notes: "Personal contingency fund allocation."
      )
    ),
    HRRequest(
      id: "req-3",
      type: "overtime",
      typeNameAr: "طلب عمل إضافي",
      typeNameEn: "Overtime Request",
      dateSubmitted: "2026-07-12",
      status: "pending",
      details: RequestDetails(
        hoursRequested: 4.0,
        overtimeDate: "2026-07-15",
        notes: "Additional hours for Q4 Portfolio documentation support."
      )
    )
  ];

  // Loaders
  Future<Profile> getProfile() async {
    final prefs = await SharedPreferences.getInstance();
    final jsonStr = prefs.getString(_keyProfile);
    if (jsonStr == null) return _initialProfile;
    try {
      return Profile.fromJson(json.decode(jsonStr));
    } catch (_) {
      return _initialProfile;
    }
  }

  Future<void> saveProfile(Profile profile) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_keyProfile, json.encode(profile.toJson()));
  }

  Future<List<HRRequest>> getRequests() async {
    final prefs = await SharedPreferences.getInstance();
    final jsonStr = prefs.getString(_keyRequests);
    if (jsonStr == null) return _initialRequests;
    try {
      final list = json.decode(jsonStr) as List;
      return list.map((item) => HRRequest.fromJson(item)).toList();
    } catch (_) {
      return _initialRequests;
    }
  }

  Future<void> saveRequests(List<HRRequest> requests) async {
    final prefs = await SharedPreferences.getInstance();
    final list = requests.map((item) => item.toJson()).toList();
    await prefs.setString(_keyRequests, json.encode(list));
  }

  Future<List<Engagement>> getEngagements() async {
    final prefs = await SharedPreferences.getInstance();
    final jsonStr = prefs.getString(_keyEngagements);
    if (jsonStr == null) return _initialEngagements;
    try {
      final list = json.decode(jsonStr) as List;
      return list.map((item) => Engagement.fromJson(item)).toList();
    } catch (_) {
      return _initialEngagements;
    }
  }

  Future<void> saveEngagements(List<Engagement> engagements) async {
    final prefs = await SharedPreferences.getInstance();
    final list = engagements.map((item) => item.toJson()).toList();
    await prefs.setString(_keyEngagements, json.encode(list));
  }

  Future<List<CheckInLog>> getLogs() async {
    final prefs = await SharedPreferences.getInstance();
    final jsonStr = prefs.getString(_keyLogs);
    if (jsonStr == null) return _initialLogs;
    try {
      final list = json.decode(jsonStr) as List;
      return list.map((item) => CheckInLog.fromJson(item)).toList();
    } catch (_) {
      return _initialLogs;
    }
  }

  Future<void> saveLogs(List<CheckInLog> logs) async {
    final prefs = await SharedPreferences.getInstance();
    final list = logs.map((item) => item.toJson()).toList();
    await prefs.setString(_keyLogs, json.encode(list));
  }

  Future<bool> getCheckedIn() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getBool(_keyCheckedIn) ?? true;
  }

  Future<void> saveCheckedIn(bool val) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool(_keyCheckedIn, val);
  }

  Future<String?> getCheckInTime() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_keyCheckInTime) ?? "08:45 AM";
  }

  static const String _keyLoggedIn = 'crystal_logged_in';
  static const String _keySavedDomain = 'crystal_saved_domain';

  Future<void> saveCheckInTime(String? time) async {
    final prefs = await SharedPreferences.getInstance();
    if (time == null) {
      await prefs.remove(_keyCheckInTime);
    } else {
      await prefs.setString(_keyCheckInTime, time);
    }
  }

  Future<bool> isLoggedIn() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getBool(_keyLoggedIn) ?? false;
  }

  Future<void> saveLoggedIn(bool val) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool(_keyLoggedIn, val);
  }

  Future<String?> getSavedDomain() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_keySavedDomain);
  }

  Future<void> saveSavedDomain(String? domain) async {
    final prefs = await SharedPreferences.getInstance();
    if (domain == null) {
      await prefs.remove(_keySavedDomain);
    } else {
      await prefs.setString(_keySavedDomain, domain);
    }
  }
}
