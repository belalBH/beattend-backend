import 'dart:io';
import 'package:device_info_plus/device_info_plus.dart';
import '../models/types.dart';

/// Service for handling device information
abstract class DeviceInfoService {
  Future<AttendanceDevice> getDeviceInfo();
}

class DeviceInfoServiceImpl implements DeviceInfoService {
  final DeviceInfoPlugin _deviceInfo = DeviceInfoPlugin();

  @override
  Future<AttendanceDevice> getDeviceInfo() async {
    try {
      if (Platform.isAndroid) {
        AndroidDeviceInfo androidInfo = await _deviceInfo.androidInfo;
        return AttendanceDevice(
          deviceName: androidInfo.model,
          deviceId: androidInfo.id,
          platform: 'Android ${androidInfo.version.release}',
        );
      } else if (Platform.isIOS) {
        IosDeviceInfo iosInfo = await _deviceInfo.iosInfo;
        return AttendanceDevice(
          deviceName: iosInfo.name,
          deviceId: iosInfo.identifierForVendor ?? 'unknown',
          platform: 'iOS ${iosInfo.systemVersion}',
        );
      } else if (Platform.isMacOS) {
        MacOsDeviceInfo macInfo = await _deviceInfo.macOsInfo;
        return AttendanceDevice(
          deviceName: macInfo.computerName,
          deviceId: macInfo.systemGUID ?? 'unknown',
          platform: 'macOS ${macInfo.osRelease}',
        );
      } else if (Platform.isWindows) {
        WindowsDeviceInfo windowsInfo = await _deviceInfo.windowsInfo;
        return AttendanceDevice(
          deviceName: windowsInfo.computerName,
          deviceId: windowsInfo.deviceId,
          platform: 'Windows',
        );
      } else if (Platform.isLinux) {
        LinuxDeviceInfo linuxInfo = await _deviceInfo.linuxInfo;
        return AttendanceDevice(
          deviceName: linuxInfo.name,
          deviceId: linuxInfo.machineId ?? 'unknown',
          platform: 'Linux ${linuxInfo.version ?? ''}',
        );
      } else {
        return AttendanceDevice(
          deviceName: Platform.operatingSystem,
          deviceId: 'unknown',
          platform: Platform.operatingSystem,
        );
      }
    } catch (e) {
      return AttendanceDevice(
        deviceName: Platform.operatingSystem,
        deviceId: 'unknown',
        platform: Platform.operatingSystem,
      );
    }
  }
}
