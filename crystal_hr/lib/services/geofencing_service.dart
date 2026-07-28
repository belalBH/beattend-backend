import 'dart:convert';
import 'dart:math';
import '../models/types.dart';
import 'database_helper.dart';

/// Represents a work location with geofencing
class WorkLocation {
  final String id;
  final String name;
  final double latitude;
  final double longitude;
  final double radiusInMeters;
  final bool isActive;

  const WorkLocation({
    required this.id,
    required this.name,
    required this.latitude,
    required this.longitude,
    required this.radiusInMeters,
    this.isActive = true,
  });
}

/// Service for handling geofencing operations
abstract class GeofencingService {
  Future<bool> isWithinAllowedArea(AttendanceLocation userLocation);
  Future<WorkLocation?> getNearestWorkLocation(AttendanceLocation userLocation);
  Future<List<WorkLocation>> getActiveWorkLocations();
  double calculateDistance(double lat1, double lon1, double lat2, double lon2);
}

class GeofencingServiceImpl implements GeofencingService {
  @override
  Future<bool> isWithinAllowedArea(AttendanceLocation userLocation) async {
    final activeLocations = await getActiveWorkLocations();
    print('🔍 Geofence Check: User coordinates: (${userLocation.latitude}, ${userLocation.longitude})');
    print('🔍 Active locations: ${activeLocations.length}');

    for (final workLocation in activeLocations) {
      final distance = calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        workLocation.latitude,
        workLocation.longitude,
      );
      print('📍 Comparing: ${workLocation.name} | Dist: ${distance.toStringAsFixed(2)}m | Allowed Radius: ${workLocation.radiusInMeters}m');

      if (distance <= workLocation.radiusInMeters) {
        print('✅ User is INSIDE geofence of: ${workLocation.name}');
        return true;
      }
    }

    print('❌ User is OUTSIDE all allowed location geofences');
    return false;
  }

  @override
  Future<WorkLocation?> getNearestWorkLocation(AttendanceLocation userLocation) async {
    final activeLocations = await getActiveWorkLocations();
    if (activeLocations.isEmpty) return null;

    WorkLocation? nearest;
    double minDistance = double.infinity;

    for (final workLocation in activeLocations) {
      final distance = calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        workLocation.latitude,
        workLocation.longitude,
      );

      if (distance < minDistance) {
        minDistance = distance;
        nearest = workLocation;
      }
    }

    return nearest;
  }

  @override
  Future<List<WorkLocation>> getActiveWorkLocations() async {
    try {
      final dbHelper = DatabaseHelper.instance;
      final db = await dbHelper.database;
      
      final profile = await dbHelper.getUserProfile();
      List<String> allowedLocationIds = [];
      if (profile != null && profile['allowed_locations'] != null && (profile['allowed_locations'] as String).isNotEmpty) {
        try {
          final decoded = json.decode(profile['allowed_locations'] as String);
          if (decoded is List) {
            allowedLocationIds = decoded.map((e) => e.toString()).toList();
          }
        } catch (e) {
          print('⚠️ Error parsing allowed_locations JSON: $e');
        }
      }
      
      final List<Map<String, dynamic>> maps = await db.query(
        'work_locations',
        where: 'is_active = 1',
      );
      
      final allLocations = maps.map((map) {
        return WorkLocation(
          id: map['id'].toString(),
          name: map['name'] as String,
          latitude: map['latitude'] != null ? (map['latitude'] as num).toDouble() : 0.0,
          longitude: map['longitude'] != null ? (map['longitude'] as num).toDouble() : 0.0,
          radiusInMeters: map['radius_meters'] != null ? (map['radius_meters'] as num).toDouble() : 100.0,
          isActive: map['is_active'] == 1,
        );
      }).toList();
      
      if (allowedLocationIds.isNotEmpty) {
        return allLocations.where((loc) => allowedLocationIds.contains(loc.id)).toList();
      }
      
      return allLocations; // Fallback to all active locations if no limit
    } catch (e) {
      print('⚠️ Error in getActiveWorkLocations: $e');
      return [];
    }
  }

  @override
  double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
    const double earthRadius = 6371000; // Earth's radius in meters

    final double dLat = _toRadians(lat2 - lat1);
    final double dLon = _toRadians(lon2 - lon1);

    final double a = sin(dLat / 2) * sin(dLat / 2) +
        cos(_toRadians(lat1)) *
            cos(_toRadians(lat2)) *
            sin(dLon / 2) *
            sin(dLon / 2);

    final double c = 2 * atan2(sqrt(a), sqrt(1 - a));
    return earthRadius * c;
  }

  double _toRadians(double degrees) {
    return degrees * pi / 180;
  }
}
