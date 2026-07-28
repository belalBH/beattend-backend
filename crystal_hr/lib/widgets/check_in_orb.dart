import 'package:flutter/material.dart';

class CheckInOrb extends StatefulWidget {
  final bool checkedIn;
  final VoidCallback onTap;
  final String? checkInTime;
  final String language;

  const CheckInOrb({
    super.key,
    required this.checkedIn,
    required this.onTap,
    this.checkInTime,
    required this.language,
  });

  @override
  State<CheckInOrb> createState() => _CheckInOrbState();
}

class _CheckInOrbState extends State<CheckInOrb> with TickerProviderStateMixin {
  late AnimationController _pulseController;
  late AnimationController _scanController;
  late Animation<double> _pulseAnimation;
  late Animation<double> _scanAnimation;

  @override
  void initState() {
    super.initState();

    // Pulse Animation
    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 3),
    );
    _pulseAnimation = Tween<double>(begin: 0.95, end: 1.05).animate(
      CurvedAnimation(parent: _pulseController, curve: Curves.easeInOut),
    );

    // Scan Animation
    _scanController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 2),
    );
    _scanAnimation = Tween<double>(begin: -1.0, end: 1.0).animate(
      CurvedAnimation(parent: _scanController, curve: Curves.linear),
    );

    _scanController.repeat(reverse: true);

    if (widget.checkedIn) {
      _pulseController.repeat(reverse: true);
    } else {
      _pulseController.stop();
      _pulseController.value = 1.0;
    }
  }

  @override
  void didUpdateWidget(covariant CheckInOrb oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.checkedIn != oldWidget.checkedIn) {
      if (widget.checkedIn) {
        _pulseController.repeat(reverse: true);
      } else {
        _pulseController.stop();
        _pulseController.animateTo(1.0, duration: const Duration(milliseconds: 300));
      }
    }
  }

  @override
  void dispose() {
    _pulseController.dispose();
    _scanController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final size = 180.0;

    return Center(
      child: Stack(
        alignment: Alignment.center,
        children: [
          // Pulse Glow Ring 3 (Outer)
          if (widget.checkedIn)
            AnimatedBuilder(
              animation: _pulseAnimation,
              builder: (context, child) {
                return Container(
                  width: size * 1.35 * _pulseAnimation.value,
                  height: size * 1.35 * _pulseAnimation.value,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    border: Border.all(
                      color: const Color(0xFFF43F5E).withOpacity(0.08),
                      width: 1,
                    ),
                  ),
                );
              },
            ),

          // Pulse Glow Ring 2 (Middle)
          if (widget.checkedIn)
            AnimatedBuilder(
              animation: _pulseAnimation,
              builder: (context, child) {
                return Container(
                  width: size * 1.2 * _pulseAnimation.value,
                  height: size * 1.2 * _pulseAnimation.value,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    border: Border.all(
                      color: const Color(0xFFF43F5E).withOpacity(0.12),
                      width: 1.5,
                    ),
                  ),
                );
              },
            ),

          // Pulse Glow Ring 1 (Inner glow)
          if (widget.checkedIn)
            AnimatedBuilder(
              animation: _pulseAnimation,
              builder: (context, child) {
                return Container(
                  width: size * 1.05 * _pulseAnimation.value,
                  height: size * 1.05 * _pulseAnimation.value,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    boxShadow: [
                      BoxShadow(
                        color: const Color(0xFFF43F5E).withOpacity(0.15),
                        blurRadius: 40,
                        spreadRadius: 10,
                      ),
                    ],
                  ),
                );
              },
            ),

          // Main Orb Button
          GestureDetector(
            onTap: widget.onTap,
            child: AnimatedBuilder(
              animation: _pulseAnimation,
              builder: (context, child) {
                final currentSize = widget.checkedIn
                    ? size * (0.98 + 0.04 * _pulseAnimation.value)
                    : size;

                return Container(
                  width: currentSize,
                  height: currentSize,
                  padding: const EdgeInsets.all(4.0),
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    gradient: LinearGradient(
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                      colors: widget.checkedIn
                          ? [const Color(0xFFF43F5E), const Color(0xFFF59E0B)]
                          : [const Color(0xFFC5C6CA), const Color(0xFF4CD7F6)],
                    ),
                    boxShadow: [
                      BoxShadow(
                        color: widget.checkedIn
                            ? const Color(0xFFF43F5E).withOpacity(0.2)
                            : const Color(0xFF4CD7F6).withOpacity(0.1),
                        blurRadius: 20,
                        offset: const Offset(0, 10),
                      ),
                    ],
                  ),
                  child: Container(
                    decoration: const BoxDecoration(
                      shape: BoxShape.circle,
                      color: Color(0xFF0C0F0F),
                    ),
                    clipBehavior: Clip.antiAlias,
                    child: Stack(
                      alignment: Alignment.center,
                      children: [
                        // Holographic Laser Scanner Overlay
                        if (!widget.checkedIn)
                          AnimatedBuilder(
                            animation: _scanAnimation,
                            builder: (context, child) {
                              final offset = _scanAnimation.value * (size / 2);
                              return Positioned(
                                top: (size / 2) + offset - 10,
                                left: 0,
                                right: 0,
                                child: Container(
                                  height: 20,
                                  decoration: BoxDecoration(
                                    gradient: LinearGradient(
                                      begin: Alignment.topCenter,
                                      end: Alignment.bottomCenter,
                                      colors: [
                                        Colors.transparent,
                                        const Color(0xFF4CD7F6).withOpacity(0.25),
                                        Colors.transparent,
                                      ],
                                    ),
                                  ),
                                ),
                              );
                            },
                          ),

                        // Contents
                        Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(
                              widget.checkedIn ? Icons.logout : Icons.fingerprint,
                              size: 48,
                              color: widget.checkedIn
                                  ? const Color(0xFFF0657D)
                                  : const Color(0xFF4CD7F6),
                            ),
                            const SizedBox(height: 8),
                            Text(
                              widget.checkedIn
                                  ? (widget.language == "ar" ? "تسجيل انصراف" : "Check Out")
                                  : (widget.language == "ar" ? "تسجيل حضور" : "Check In"),
                              style: TextStyle(
                                color: widget.checkedIn
                                    ? const Color(0xFFF0657D)
                                    : const Color(0xFF4CD7F6),
                                fontSize: 18,
                                fontWeight: FontWeight.bold,
                                letterSpacing: -0.5,
                              ),
                            ),
                            const SizedBox(height: 6),
                            Text(
                              widget.checkedIn
                                  ? "${widget.language == "ar" ? "حضور: " : "In: "}${widget.checkInTime ?? '08:45 AM'}"
                                  : "08:45 AM",
                              style: const TextStyle(
                                color: Colors.grey,
                                fontSize: 11,
                                fontFamily: 'monospace',
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}
