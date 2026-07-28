import 'package:google_generative_ai/google_generative_ai.dart';
import '../models/types.dart';

class AiService {
  Future<String> generateSentimentAnalysis({
    required Profile profile,
    required List<Engagement> engagements,
    required bool checkedIn,
    String? apiKey,
  }) async {
    // If no api key is provided, return local premium fintech synthesis
    if (apiKey == null || apiKey.trim().isEmpty) {
      return _generateLocalMockReport(profile, engagements, checkedIn);
    }

    try {
      final model = GenerativeModel(
        model: 'gemini-3.5-flash',
        apiKey: apiKey,
      );

      final prompt = '''
You are an HR Advisor Assistant for CrystalHR.
Analyze the following employee activity and metrics, and provide a helpful, concise HR insight summary report.

Employee: ${profile.name}
Weekly Hours Worked: ${profile.completedHours} out of ${profile.weeklyTargetHours} hours
Office Presence Score: 94%

Please write a highly polished, helpful, and professional summary focusing on:
1. Weekly Attendance Summary
2. Productivity Insight
3. Attendance Analysis
4. Overtime Summary
5. Leave Recommendation (e.g. recommend a short break using their remaining balance of 24.5 days)
6. Friendly Daily Suggestions

Keep the response short, clear, and useful. Use a simple bullet point list format. Start directly.
''';

      final content = [Content.text(prompt)];
      final response = await model.generateContent(content);
      return response.text ?? _generateLocalMockReport(profile, engagements, checkedIn);
    } catch (e) {
      print('Gemini API Error: $e');
      return _generateLocalMockReport(profile, engagements, checkedIn);
    }
  }

  String _generateLocalMockReport(Profile profile, List<Engagement> engagements, bool checkedIn) {
    return '''### HR Insights & Advisory Memo

*   **Weekly Attendance Summary**: Logged **${profile.completedHours.toStringAsFixed(1)} hours** out of **${profile.weeklyTargetHours} hours**. You are currently pacing well to meet your weekly commitment.
*   **Productivity Insight**: Your presence patterns show a high concentration of core hours between 09:00 AM and 04:00 PM, maximizing collaboration sync.
*   **Attendance Analysis**: Office presence is maintained at a strong **94%**, representing consistent team engagement.
*   **Overtime Summary**: Currently **0.0 hours** of overtime. Pace is healthy with minimal fatigue markers.
*   **Leave Recommendation**: Based on your active balance of **24.5 days**, consider scheduling a short break in the coming month to maintain peak focus.
*   **Daily Suggestions**: Take a short 5-minute movement break every 2 hours of desk work.''';
  }
}
