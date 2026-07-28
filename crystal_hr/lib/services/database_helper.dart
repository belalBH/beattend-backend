import 'dart:convert';
import 'package:sqflite/sqflite.dart';
import 'package:path/path.dart';

/// Helper class for managing SQLite database operations
class DatabaseHelper {
  static final DatabaseHelper instance = DatabaseHelper._init();
  static Database? _database;

  DatabaseHelper._init();

  /// Get database instance (singleton pattern)
  Future<Database> get database async {
    if (_database != null) return _database!;
    _database = await _initDB('time_attendance.db');
    return _database!;
  }

  /// Initialize database
  Future<Database> _initDB(String filePath) async {
    final dbPath = await getDatabasesPath();
    final path = join(dbPath, filePath);

    final db = await openDatabase(
      path,
      version: 3,
      onCreate: _createDB,
      onUpgrade: _upgradeDB,
    );

    try {
      await db.execute('ALTER TABLE user_profile ADD COLUMN allowed_locations TEXT');
    } catch (_) {
      // Column already exists, ignore
    }
    
    // Seed default locations if table is empty
    try {
      final count = Sqflite.firstIntValue(await db.rawQuery('SELECT COUNT(*) FROM work_locations')) ?? 0;
      if (count == 0) {
        final now = DateTime.now().toIso8601String();
        await db.insert('work_locations', {
          'id': 'main_office',
          'name': 'Main Office',
          'latitude': 37.7749,
          'longitude': -122.4194,
          'radius_meters': 100.0,
          'is_active': 1,
          'created_at': now,
          'updated_at': now,
        });
        await db.insert('work_locations', {
          'id': 'branch_office',
          'name': 'Branch Office',
          'latitude': 37.7849,
          'longitude': -122.4094,
          'radius_meters': 50.0,
          'is_active': 1,
          'created_at': now,
          'updated_at': now,
        });
        print('✅ Seeded default work locations into existing database.');
      }
    } catch (e) {
      print('⚠️ Error seeding default work locations: $e');
    }

    return db;
  }

  /// Create database tables
  Future<void> _createDB(Database db, int version) async {
    // Attendance Records Table
    await db.execute('''
      CREATE TABLE attendance_records (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT NOT NULL UNIQUE,
        clock_in_time TEXT,
        clock_out_time TEXT,
        status TEXT NOT NULL,
        working_hours REAL,
        clock_in_latitude REAL,
        clock_in_longitude REAL,
        clock_in_address TEXT,
        location_name TEXT,
        clock_out_latitude REAL,
        clock_out_longitude REAL,
        clock_out_address TEXT,
        clock_in_device_name TEXT,
        clock_in_device_id TEXT,
        clock_in_platform TEXT,
        clock_out_device_name TEXT,
        clock_out_device_id TEXT,
        clock_out_platform TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    ''');

    // Create index on date for faster queries
    await db.execute('''
      CREATE INDEX idx_attendance_date ON attendance_records(date)
    ''');

    // Vacation Requests Table
    await db.execute('''
      CREATE TABLE vacation_requests (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type TEXT NOT NULL,
        start_date TEXT NOT NULL,
        end_date TEXT NOT NULL,
        days INTEGER NOT NULL,
        reason TEXT NOT NULL,
        delegate_name TEXT,
        status TEXT NOT NULL DEFAULT 'pending',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    ''');

    // Mandate Requests Table
    await db.execute('''
      CREATE TABLE mandate_requests (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT NOT NULL,
        time TEXT NOT NULL,
        location TEXT NOT NULL,
        reason TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    ''');

    // Attendance Correction Requests Table
    await db.execute('''
      CREATE TABLE attendance_correction_requests (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        attendance_date TEXT NOT NULL,
        correction_type TEXT NOT NULL,
        clock_in_time TEXT,
        clock_out_time TEXT,
        reason TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    ''');

    // Work Locations Table
    await db.execute('''
      CREATE TABLE work_locations (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        latitude REAL NOT NULL,
        longitude REAL NOT NULL,
        radius_meters REAL NOT NULL,
        is_active INTEGER NOT NULL DEFAULT 1,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    ''');

    // User Profile Table (for future use)
    await db.execute('''
      CREATE TABLE user_profile (
        id INTEGER PRIMARY KEY,
        job_number TEXT,
        first_name TEXT,
        last_name TEXT,
        email TEXT,
        phone TEXT,
        department TEXT,
        position TEXT,
        allowed_locations TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    ''');

    // App Settings Table
    await db.execute('''
      CREATE TABLE app_settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    ''');

    // Company Config Table [NEW]
    await db.execute('''
      CREATE TABLE company_config (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        tenant_id TEXT UNIQUE NOT NULL,
        company_name TEXT NOT NULL,
        company_logo TEXT,
        theme_colors TEXT,
        time_zone TEXT,
        working_week TEXT,
        weekend_days TEXT,
        attendance_rules TEXT,
        feature_flags TEXT,
        maintenance_mode INTEGER DEFAULT 0,
        minimum_app_version TEXT,
        updated_at TEXT NOT NULL
      )
    ''');

    // Leave Types Table [NEW]
    await db.execute('''
      CREATE TABLE leave_types (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        tenant_id TEXT NOT NULL,
        name TEXT NOT NULL,
        name_ar TEXT NOT NULL,
        description TEXT,
        requires_attachment INTEGER DEFAULT 0,
        max_days REAL
      )
    ''');

    // Request Types Table [NEW]
    await db.execute('''
      CREATE TABLE request_types (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        tenant_id TEXT NOT NULL,
        name TEXT NOT NULL,
        name_ar TEXT NOT NULL,
        fields_config TEXT,
        approval_workflow TEXT,
        icon TEXT,
        color TEXT
      )
    ''');

    // Offline Queue Table [NEW]
    await db.execute('''
      CREATE TABLE offline_queue (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        tenantId TEXT NOT NULL,
        companyId INTEGER NOT NULL,
        userId INTEGER NOT NULL,
        employeeId INTEGER NOT NULL,
        eventType TEXT NOT NULL,
        payload TEXT NOT NULL,
        idempotencyUuid TEXT UNIQUE NOT NULL,
        createdAt TEXT NOT NULL,
        retryCount INTEGER DEFAULT 0,
        lastAttemptAt TEXT,
        lastError TEXT,
        status TEXT DEFAULT 'pending'
      )
    ''');

    // Insert default work locations
    await _insertDefaultLocations(db);
  }

  /// Upgrade database schema
  Future<void> _upgradeDB(Database db, int oldVersion, int newVersion) async {
    if (oldVersion < 2) {
      try {
        await db.execute('ALTER TABLE attendance_records ADD COLUMN location_name TEXT');
      } catch (_) {}
    }
    if (oldVersion < 3) {
      try {
        await db.execute('''
          CREATE TABLE IF NOT EXISTS company_config (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            tenant_id TEXT UNIQUE NOT NULL,
            company_name TEXT NOT NULL,
            company_logo TEXT,
            theme_colors TEXT,
            time_zone TEXT,
            working_week TEXT,
            weekend_days TEXT,
            attendance_rules TEXT,
            feature_flags TEXT,
            maintenance_mode INTEGER DEFAULT 0,
            minimum_app_version TEXT,
            updated_at TEXT NOT NULL
          )
        ''');
        await db.execute('''
          CREATE TABLE IF NOT EXISTS leave_types (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            tenant_id TEXT NOT NULL,
            name TEXT NOT NULL,
            name_ar TEXT NOT NULL,
            description TEXT,
            requires_attachment INTEGER DEFAULT 0,
            max_days REAL
          )
        ''');
        await db.execute('''
          CREATE TABLE IF NOT EXISTS request_types (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            tenant_id TEXT NOT NULL,
            name TEXT NOT NULL,
            name_ar TEXT NOT NULL,
            fields_config TEXT,
            approval_workflow TEXT,
            icon TEXT,
            color TEXT
          )
        ''');
        await db.execute('''
          CREATE TABLE IF NOT EXISTS offline_queue (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            tenantId TEXT NOT NULL,
            companyId INTEGER NOT NULL,
            userId INTEGER NOT NULL,
            employeeId INTEGER NOT NULL,
            eventType TEXT NOT NULL,
            payload TEXT NOT NULL,
            idempotencyUuid TEXT UNIQUE NOT NULL,
            createdAt TEXT NOT NULL,
            retryCount INTEGER DEFAULT 0,
            lastAttemptAt TEXT,
            lastError TEXT,
            status TEXT DEFAULT 'pending'
          )
        ''');
      } catch (_) {}
    }
  }

  /// Insert default work locations
  Future<void> _insertDefaultLocations(Database db) async {
    final now = DateTime.now().toIso8601String();

    await db.insert('work_locations', {
      'id': 'main_office',
      'name': 'Main Office',
      'latitude': 37.7749,
      'longitude': -122.4194,
      'radius_meters': 100.0,
      'is_active': 1,
      'created_at': now,
      'updated_at': now,
    });

    await db.insert('work_locations', {
      'id': 'branch_office',
      'name': 'Branch Office',
      'latitude': 37.7849,
      'longitude': -122.4094,
      'radius_meters': 50.0,
      'is_active': 1,
      'created_at': now,
      'updated_at': now,
    });
  }

  /// Close database connection
  Future<void> close() async {
    final db = await instance.database;
    await db.close();
    _database = null;
  }

  /// Delete database (for testing or reset)
  Future<void> deleteDatabase() async {
    final dbPath = await getDatabasesPath();
    final path = join(dbPath, 'time_attendance.db');
    await databaseFactory.deleteDatabase(path);
    _database = null;
  }

  /// Clear all data from tables (but keep schema)
  Future<void> clearAllData() async {
    final db = await database;
    await db.transaction((txn) async {
      await txn.delete('attendance_records');
      await txn.delete('vacation_requests');
      await txn.delete('mandate_requests');
      await txn.delete('attendance_correction_requests');
      await txn.delete('user_profile');
    });
  }

  /// Save user profile
  Future<void> saveUserProfile(Map<String, dynamic> profile) async {
    final db = await database;
    await db.delete('user_profile');
    
    final Map<String, dynamic> dbProfile = {
      'id': profile['id'],
      'job_number': profile['employee_number'] ?? profile['job_number'],
      'first_name': profile['first_name'],
      'last_name': profile['last_name'],
      'email': profile['email'],
      'phone': profile['phone'],
      'department': profile['department'],
      'position': profile['position'] ?? profile['title'] ?? profile['position'],
      'allowed_locations': profile['allowedLocations'] != null 
          ? json.encode(profile['allowedLocations']) 
          : (profile['allowed_locations'] != null ? json.encode(profile['allowed_locations']) : null),
      'created_at': profile['created_at'] ?? DateTime.now().toIso8601String(),
      'updated_at': profile['updated_at'] ?? DateTime.now().toIso8601String(),
    };

    await db.insert(
      'user_profile',
      dbProfile,
      conflictAlgorithm: ConflictAlgorithm.replace,
    );
  }

  /// Save office locations from server to SQLite work_locations table
  Future<void> saveOfficeLocations(List<dynamic> locations) async {
    final db = await database;
    await db.transaction((txn) async {
      await txn.delete('work_locations');
      final now = DateTime.now().toIso8601String();
      for (final loc in locations) {
        await txn.insert('work_locations', {
          'id': loc['id'].toString(),
          'name': loc['name'] ?? '',
          'latitude': double.tryParse((loc['latitude'] ?? loc['lat'] ?? 0.0).toString()) ?? 0.0,
          'longitude': double.tryParse((loc['longitude'] ?? loc['lng'] ?? 0.0).toString()) ?? 0.0,
          'radius_meters': double.tryParse((loc['radius_meters'] ?? loc['radius'] ?? 100.0).toString()) ?? 100.0,
          'is_active': (loc['isActive'] == false || loc['is_active'] == false || loc['isActive'] == 0 || loc['is_active'] == 0) ? 0 : 1,
          'created_at': loc['created_at'] ?? now,
          'updated_at': loc['updated_at'] ?? now,
        });
      }
    });
  }

  /// Get user profile
  Future<Map<String, dynamic>?> getUserProfile() async {
    final db = await database;
    final List<Map<String, dynamic>> maps = await db.query('user_profile', limit: 1);
    if (maps.isNotEmpty) {
      return maps.first;
    }
    return null;
  }

  /// Clear user profile
  Future<void> clearUserProfile() async {
    final db = await database;
    await db.delete('user_profile');
  }

  /// Get pending offline events from queue
  Future<List<Map<String, dynamic>>> getPendingOfflineEvents() async {
    final db = await database;
    return await db.query(
      'offline_queue',
      where: "status = 'pending' OR status = 'failed'",
      orderBy: 'createdAt ASC',
    );
  }

  /// Save new event to offline queue
  Future<void> insertOfflineEvent(Map<String, dynamic> event) async {
    final db = await database;
    await db.insert(
      'offline_queue',
      {
        'tenantId': event['tenantId'],
        'companyId': event['companyId'] ?? 1,
        'userId': event['userId'] ?? 0,
        'employeeId': event['employeeId'],
        'eventType': event['eventType'],
        'payload': event['payload'],
        'idempotencyUuid': event['idempotencyUuid'],
        'createdAt': event['createdAt'] ?? DateTime.now().toIso8601String(),
        'retryCount': 0,
        'status': 'pending',
      },
      conflictAlgorithm: ConflictAlgorithm.replace,
    );
  }

  /// Update offline event status
  Future<void> updateOfflineEventStatus(String uuid, String status, {String? error}) async {
    final db = await database;
    await db.update(
      'offline_queue',
      {
        'status': status,
        'lastAttemptAt': DateTime.now().toIso8601String(),
        'lastError': error,
        'retryCount': Sqflite.firstIntValue(await db.rawQuery(
              "SELECT retryCount FROM offline_queue WHERE idempotencyUuid = ?",
              [uuid],
            )) ?? 0 + 1,
      },
      where: 'idempotencyUuid = ?',
      whereArgs: [uuid],
    );
  }

  /// Remove offline event from queue (on success or permanent conflict)
  Future<void> deleteOfflineEvent(String uuid) async {
    final db = await database;
    await db.delete(
      'offline_queue',
      where: 'idempotencyUuid = ?',
      whereArgs: [uuid],
    );
  }
}
