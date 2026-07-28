import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import '../models/types.dart';
import '../models/localization.dart';
import '../widgets/glass_card.dart';
import '../services/database_helper.dart';

class OnboardingView extends StatefulWidget {
  final Profile profile;
  final Function(Profile) onUpdateProfile;
  final Function(String domain) onLoginComplete;

  const OnboardingView({
    super.key,
    required this.profile,
    required this.onUpdateProfile,
    required this.onLoginComplete,
  });

  @override
  State<OnboardingView> createState() => _OnboardingViewState();
}

class _OnboardingViewState extends State<OnboardingView> {
  int _step = 0; // 0: Welcome, 1: Enter Domain, 2: Email & Password
  final TextEditingController _domainController = TextEditingController(text: 'solutions.sa');
  final TextEditingController _emailController = TextEditingController();
  final TextEditingController _passwordController = TextEditingController();

  String? _domainError;
  String? _credentialsError;

  int? _companyId;
  bool _isLoading = false;

  @override
  void dispose() {
    _domainController.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  void _nextStep() async {
    if (_isLoading) return;
    setState(() {
      _domainError = null;
      _credentialsError = null;
    });

    final authProvider = context.read<AuthProvider>();

    if (_step == 0) {
      setState(() => _step = 1);
    } else if (_step == 1) {
      final domain = _domainController.text.trim();
      if (domain.isEmpty) {
        setState(() {
          _domainError = Localization.translate('invalid_domain', widget.profile.language);
        });
        return;
      }
      
      setState(() => _isLoading = true);
      final success = await authProvider.validateDomain(domain);
      setState(() => _isLoading = false);

      if (success) {
        setState(() {
          _step = 2;
        });
      } else {
        setState(() {
          _domainError = authProvider.errorMessage ?? (widget.profile.language == "ar" ? "النطاق غير صحيح" : "Invalid domain link");
        });
      }
    } else if (_step == 2) {
      final email = _emailController.text.trim();
      final password = _passwordController.text.trim();

      if (email.isEmpty || !email.contains('@') || password.length < 6) {
        setState(() {
          _credentialsError = Localization.translate('invalid_credentials', widget.profile.language);
        });
        return;
      }

      setState(() => _isLoading = true);
      final success = await authProvider.login(email, password);
      setState(() => _isLoading = false);

      if (success) {
        widget.onLoginComplete(_domainController.text.trim());
      } else {
        setState(() {
          _credentialsError = authProvider.errorMessage ?? (widget.profile.language == "ar" ? "خطأ في بيانات الدخول" : "Invalid email or password");
        });
      }
    }
  }

  void _prevStep() {
    if (_step > 0) {
      setState(() => _step--);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.transparent,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
          child: Column(
            children: [
              // Top Action Header
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  // Logo
                  const Row(
                    children: [
                      Icon(Icons.diamond, color: Color(0xFF4CD7F6), size: 24),
                      SizedBox(width: 8),
                      Text(
                        "CrystalHR",
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w900,
                          color: Colors.white,
                          letterSpacing: -0.5,
                        ),
                      ),
                    ],
                  ),
                  // Toggles
                  Row(
                    children: [
                      // Language Toggler Button
                      GestureDetector(
                        onTap: () {
                          widget.onUpdateProfile(widget.profile.copyWith(
                            language: widget.profile.language == "ar" ? "en" : "ar",
                          ));
                        },
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                          decoration: BoxDecoration(
                            color: Colors.white.withOpacity(0.04),
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(color: Colors.white.withOpacity(0.08)),
                          ),
                          child: Text(
                            widget.profile.language == "ar" ? "English" : "العربية",
                            style: const TextStyle(
                              color: Color(0xFF4CD7F6),
                              fontSize: 11,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(width: 8),
                      // Theme Switcher Button
                      GestureDetector(
                        onTap: () {
                          widget.onUpdateProfile(widget.profile.copyWith(
                            themeMode: widget.profile.themeMode == "light" ? "dark" : "light",
                          ));
                        },
                        child: Container(
                          padding: const EdgeInsets.all(8),
                          decoration: BoxDecoration(
                            color: Colors.white.withOpacity(0.04),
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(color: Colors.white.withOpacity(0.08)),
                          ),
                          child: Icon(
                            widget.profile.themeMode == "light"
                                ? Icons.dark_mode_outlined
                                : Icons.light_mode_outlined,
                            size: 14,
                            color: Colors.white70,
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
              const Spacer(),

              // Welcome/Login glass card
              AnimatedSwitcher(
                duration: const Duration(milliseconds: 300),
                child: _buildCurrentStepView(),
              ),

              const Spacer(flex: 2),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildCurrentStepView() {
    final lang = widget.profile.language;
    final isAr = lang == "ar";

    if (_step == 0) {
      // Step 0: Welcome Screen
      return GlassCard(
        key: const ValueKey(0),
        padding: const EdgeInsets.all(28),
        borderRadius: 24,
        child: Column(
          children: [
            // Glowing diamond icon
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: const Color(0xFF4CD7F6).withOpacity(0.08),
                border: Border.all(color: const Color(0xFF4CD7F6).withOpacity(0.15)),
              ),
              child: const Icon(
                Icons.diamond_outlined,
                size: 48,
                color: Color(0xFF4CD7F6),
              ),
            ),
            const SizedBox(height: 24),
            Text(
              isAr ? "مرحباً بك في CrystalHR" : "Welcome to CrystalHR",
              style: const TextStyle(
                color: Colors.white,
                fontSize: 20,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 12),
            Text(
              Localization.translate('welcome_desc', lang),
              textAlign: TextAlign.center,
              style: const TextStyle(
                color: Colors.white70,
                fontSize: 12,
                height: 1.5,
              ),
            ),
            const SizedBox(height: 32),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: _nextStep,
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF4CD7F6),
                  foregroundColor: Colors.black,
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                ),
                child: Text(
                  Localization.translate('get_started', lang),
                  style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12),
                ),
              ),
            ),
          ],
        ),
      );
    } else if (_step == 1) {
      // Step 1: Subdomain Screen
      return GlassCard(
        key: const ValueKey(1),
        padding: const EdgeInsets.all(28),
        borderRadius: 24,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              Localization.translate('enter_subdomain', lang),
              style: const TextStyle(
                color: Colors.white,
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 6),
            const Text(
              "Enter your organization domain link to proceed • النطاق الموثق للمنشأة",
              style: TextStyle(color: Colors.grey, fontSize: 10),
            ),
            const SizedBox(height: 24),
            TextField(
              controller: _domainController,
              keyboardType: TextInputType.url,
              style: const TextStyle(color: Colors.white, fontSize: 13),
              decoration: InputDecoration(
                labelText: "Domain / النطاق",
                labelStyle: const TextStyle(color: Colors.grey, fontSize: 11),
                hintText: Localization.translate('subdomain_hint', lang),
                hintStyle: const TextStyle(color: Colors.white24, fontSize: 12),
                errorText: _domainError,
                prefixIcon: const Icon(Icons.lan_outlined, size: 16, color: Colors.grey),
              ),
            ),
            const SizedBox(height: 24),
            Row(
              children: [
                Expanded(
                  child: TextButton(
                    onPressed: _prevStep,
                    style: TextButton.styleFrom(
                      foregroundColor: Colors.white70,
                      padding: const EdgeInsets.symmetric(vertical: 12),
                    ),
                    child: Text(Localization.translate('back', lang)),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: ElevatedButton(
                    onPressed: _nextStep,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF4CD7F6),
                      foregroundColor: Colors.black,
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                    child: _isLoading
                        ? const SizedBox(
                            width: 16,
                            height: 16,
                            child: CircularProgressIndicator(strokeWidth: 2, color: Colors.black),
                          )
                        : Text(
                            Localization.translate('next', lang),
                            style: const TextStyle(fontWeight: FontWeight.bold),
                          ),
                  ),
                ),
              ],
            )
          ],
        ),
      );
    } else {
      // Step 2: Login Screen
      return GlassCard(
        key: const ValueKey(2),
        padding: const EdgeInsets.all(28),
        borderRadius: 24,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              Localization.translate('signin', lang),
              style: const TextStyle(
                color: Colors.white,
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              "Domain: ${_domainController.text.trim()}",
              style: const TextStyle(color: Color(0xFF4CD7F6), fontSize: 10, fontFamily: 'monospace'),
            ),
            const SizedBox(height: 20),
            TextField(
              controller: _emailController,
              keyboardType: TextInputType.emailAddress,
              style: const TextStyle(color: Colors.white, fontSize: 13),
              decoration: InputDecoration(
                labelText: Localization.translate('email', lang),
                labelStyle: const TextStyle(color: Colors.grey, fontSize: 11),
                prefixIcon: const Icon(Icons.email_outlined, size: 16, color: Colors.grey),
              ),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: _passwordController,
              obscureText: true,
              style: const TextStyle(color: Colors.white, fontSize: 13),
              decoration: InputDecoration(
                labelText: Localization.translate('password', lang),
                labelStyle: const TextStyle(color: Colors.grey, fontSize: 11),
                prefixIcon: const Icon(Icons.lock_outline, size: 16, color: Colors.grey),
              ),
            ),
            if (_credentialsError != null) ...[
              const SizedBox(height: 12),
              Text(
                _credentialsError!,
                style: const TextStyle(color: Color(0xFFF43F5E), fontSize: 10),
              ),
            ],
            const SizedBox(height: 24),
            Row(
              children: [
                Expanded(
                  child: TextButton(
                    onPressed: _prevStep,
                    style: TextButton.styleFrom(
                      foregroundColor: Colors.white70,
                      padding: const EdgeInsets.symmetric(vertical: 12),
                    ),
                    child: Text(Localization.translate('back', lang)),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: ElevatedButton(
                    onPressed: _nextStep,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF4CD7F6),
                      foregroundColor: Colors.black,
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                    child: _isLoading
                        ? const SizedBox(
                            width: 16,
                            height: 16,
                            child: CircularProgressIndicator(strokeWidth: 2, color: Colors.black),
                          )
                        : Text(
                            Localization.translate('signin', lang).split(" • ").first,
                            style: const TextStyle(fontWeight: FontWeight.bold),
                          ),
                  ),
                ),
              ],
            )
          ],
        ),
      );
    }
  }
}
