import 'package:flutter_test/flutter_test.dart';
import 'package:crystal_hr/main.dart';

void main() {
  testWidgets('Smoke test', (WidgetTester tester) async {
    // Build our app and trigger a frame.
    await tester.pumpWidget(const CrystalHrApp());
    expect(find.byType(CrystalHrApp), findsOneWidget);
  });
}
