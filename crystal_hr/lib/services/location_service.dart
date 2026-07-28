import 'package:geolocator/geolocator.dart';
import 'package:permission_handler/permission_handler.dart';
import '../models/types.dart';

class LocationPermissionDeniedException implements Exception {}
class LocationPermissionPermanentlyDeniedException implements Exception {}
class LocationServiceDisabledException implements Exception {}

/// Service for handling location operations
abstract class LocationService {
  Future<AttendanceLocation?> getCurrentLocation();
  Future<bool> requestLocationPermission();
  Future<bool> isLocationPermissionGranted();
}

class LocationServiceImpl implements LocationService {
  @override
  Future<AttendanceLocation?> getCurrentLocation() async {
    // Check if location permission is granted
    final permissionStatus = await Permission.location.status;
    if (permissionStatus == PermissionStatus.permanentlyDenied) {
      throw LocationPermissionPermanentlyDeniedException();
    }
    if (permissionStatus != PermissionStatus.granted) {
      final requestedStatus = await Permission.location.request();
      if (requestedStatus == PermissionStatus.permanentlyDenied) {
        throw LocationPermissionPermanentlyDeniedException();
      }
      if (requestedStatus != PermissionStatus.granted) {
        throw LocationPermissionDeniedException();
      }
    }

    // Check if location services are enabled
    bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
    if (!serviceEnabled) {
      throw LocationServiceDisabledException();
    }

    // Get current position
    Position position = await Geolocator.getCurrentPosition(
      desiredAccuracy: LocationAccuracy.high,
      timeLimit: const Duration(seconds: 10),
    );

    return AttendanceLocation(
      latitude: position.latitude,
      longitude: position.longitude,
      address: null,
    );
  }

  @override
  Future<bool> requestLocationPermission() async {
    try {
      final status = await Permission.location.request();
      return status == PermissionStatus.granted;
    } catch (e) {
      return false;
    }
  }

  @override
  Future<bool> isLocationPermissionGranted() async {
    try {
      final status = await Permission.location.status;
      return status == PermissionStatus.granted;
    } catch (e) {
      return false;
    }
  }
}
