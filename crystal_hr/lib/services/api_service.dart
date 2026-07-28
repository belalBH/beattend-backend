import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'api_constants.dart';

class ApiResponse {
  final bool success;
  final String message;
  final dynamic data;
  final String? code;

  ApiResponse({
    required this.success,
    required this.message,
    this.data,
    this.code,
  });

  factory ApiResponse.fromJson(Map<String, dynamic> json) {
    return ApiResponse(
      success: json['success'] ?? false,
      message: json['message'] ?? '',
      data: json['data'] ?? json['employee'] ?? json['locations'] ?? json['records'] ?? json['requests'] ?? json['balances'],
      code: json['code'],
    );
  }
}

class ApiService {
  final http.Client _client;

  ApiService({http.Client? client}) : _client = client ?? http.Client();

  Future<Map<String, String>> _getHeaders() async {
    final prefs = await SharedPreferences.getInstance();
    const storage = FlutterSecureStorage();
    final token = await storage.read(key: 'access_token') ?? prefs.getString('auth_token');
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

    return headers;
  }

  Future<ApiResponse> post(String endpoint, Map<String, dynamic> body, {String version = 'v1'}) async {
    try {
      final url = Uri.parse('${ApiConstants.baseUrl}/$version$endpoint');
      final headers = await _getHeaders();

      final response = await _client
          .post(
            url,
            headers: headers,
            body: jsonEncode(body),
          )
          .timeout(ApiConstants.connectionTimeout);

      return _handleResponse(response);
    } catch (e) {
      return ApiResponse(
        success: false,
        message: 'خطأ في الاتصال بالسيرفر: ${e.toString()}',
        code: 'CONNECTION_ERROR',
      );
    }
  }

  Future<ApiResponse> get(String endpoint, {Map<String, String>? queryParams, String version = 'v1'}) async {
    try {
      var url = Uri.parse('${ApiConstants.baseUrl}/$version$endpoint');
      if (queryParams != null && queryParams.isNotEmpty) {
        url = url.replace(queryParameters: queryParams);
      }
      
      final headers = await _getHeaders();

      final response = await _client
          .get(
            url,
            headers: headers,
          )
          .timeout(ApiConstants.receiveTimeout);

      return _handleResponse(response);
    } catch (e) {
      return ApiResponse(
        success: false,
        message: 'خطأ في الاتصال بالسيرفر: ${e.toString()}',
        code: 'CONNECTION_ERROR',
      );
    }
  }

  ApiResponse _handleResponse(http.Response response) {
    try {
      final decoded = jsonDecode(response.body);
      if (decoded is Map<String, dynamic>) {
        return ApiResponse.fromJson(decoded);
      }
      return ApiResponse(
        success: response.statusCode == 200,
        message: '',
        data: decoded,
      );
    } catch (e) {
      return ApiResponse(
        success: response.statusCode == 200,
        message: 'خطأ في معالجة استجابة الخادم.',
        code: 'PARSE_ERROR',
      );
    }
  }

  void dispose() {
    _client.close();
  }
}
