import '../services/api_service.dart';
import '../services/database_helper.dart';
import '../models/company_model.dart';

class CompanyRepository {
  final ApiService _apiService;
  final DatabaseHelper _dbHelper;

  CompanyRepository({ApiService? apiService, DatabaseHelper? dbHelper})
      : _apiService = apiService ?? ApiService(),
        _dbHelper = dbHelper ?? DatabaseHelper.instance;

  Future<List<Map<String, dynamic>>> getOfficeLocations() async {
    final response = await _apiService.get('/attendance/work-locations', version: 'v2');
    if (response.success && response.data != null) {
      final List<dynamic> list = response.data;
      await _dbHelper.saveOfficeLocations(list);
    }
    // Return from SQLite
    final db = await _dbHelper.database;
    return await db.query('work_locations');
  }
}
