import 'dart:ui';
import 'package:flutter/material.dart';

class MeshBackground extends StatelessWidget {
  final Widget child;
  final String themeMode; // "dark" | "light"

  const MeshBackground({
    super.key,
    required this.child,
    this.themeMode = "light",
  });

  @override
  Widget build(BuildContext context) {
    final isLight = themeMode == "light";
    final baseColor = isLight ? const Color(0xFFF8FAFC) : const Color(0xFF121414);

    final topLeftColor = isLight ? const Color(0xFFE2E8F0) : const Color(0xFF0F131F);
    final topRightColor = isLight ? const Color(0xFFD0E3FF) : const Color(0xFF1B1F2C);
    final bottomLeftColor = isLight ? const Color(0xFFD1FAE5) : const Color(0xFF002E6A);
    final bottomRightColor = isLight ? const Color(0xFFEDE9FE) : const Color(0xFF004E5C);

    return Scaffold(
      backgroundColor: baseColor,
      body: Stack(
        children: [
          // Ambient Radial Gradient - Top Left
          Positioned.fill(
            child: Container(
              decoration: BoxDecoration(
                gradient: RadialGradient(
                  center: Alignment.topLeft,
                  radius: 1.2,
                  colors: [
                    topLeftColor,
                    Colors.transparent,
                  ],
                ),
              ),
            ),
          ),
          // Ambient Radial Gradient - Top Right
          Positioned.fill(
            child: Container(
              decoration: BoxDecoration(
                gradient: RadialGradient(
                  center: Alignment.topRight,
                  radius: 1.2,
                  colors: [
                    topRightColor,
                    Colors.transparent,
                  ],
                ),
              ),
            ),
          ),
          // Ambient Radial Gradient - Bottom Center/Left
          Positioned.fill(
            child: Container(
              decoration: BoxDecoration(
                gradient: RadialGradient(
                  center: const Alignment(0.0, 1.0),
                  radius: 1.2,
                  colors: [
                    bottomLeftColor,
                    Colors.transparent,
                  ],
                ),
              ),
            ),
          ),
          // Ambient Radial Gradient - Bottom Right
          Positioned.fill(
            child: Container(
              decoration: BoxDecoration(
                gradient: RadialGradient(
                  center: Alignment.bottomRight,
                  radius: 1.2,
                  colors: [
                    bottomRightColor,
                    Colors.transparent,
                  ],
                ),
              ),
            ),
          ),
          // Child content
          child,
        ],
      ),
    );
  }
}
