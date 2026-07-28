import 'package:flutter/material.dart';
import '../widgets/glass_card.dart';

class RequestTimelineView extends StatelessWidget {
  final int requestId;
  final String language;

  const RequestTimelineView({
    super.key,
    required this.requestId,
    required this.language,
  });

  @override
  Widget build(BuildContext context) {
    final isAr = language == "ar";
    // Mock approval timeline details
    final steps = [
      {"stage": isAr ? "تقديم الطلب" : "Request Submitted", "status": "approved", "user": isAr ? "الموظف" : "Employee", "time": "2026-07-16 09:00"},
      {"stage": isAr ? "موافقة المدير المباشر" : "Manager Approval", "status": "approved", "user": "Manager ID 2", "time": "2026-07-16 11:30"},
      {"stage": isAr ? "اعتماد الموارد البشرية" : "HR Approval", "status": "pending", "user": "HR Admin ID 1", "time": "-"},
    ];

    return Scaffold(
      backgroundColor: const Color(0xFF02050E),
      appBar: AppBar(
        title: Text(isAr ? "جدول خط سير الطلب" : "Request Timeline"),
        backgroundColor: Colors.transparent,
        elevation: 0,
      ),
      body: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: steps.length,
        itemBuilder: (context, index) {
          final step = steps[index];
          final isApproved = step["status"] == "approved";
          final isPending = step["status"] == "pending";

          return Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Column(
                children: [
                  Icon(
                    isApproved
                        ? Icons.check_circle
                        : (isPending ? Icons.radio_button_unchecked : Icons.cancel),
                    color: isApproved ? Colors.green : (isPending ? Colors.amber : Colors.red),
                    size: 20,
                  ),
                  if (index < steps.length - 1)
                    Container(
                      width: 2,
                      height: 50,
                      color: isApproved ? Colors.green : Colors.grey,
                    ),
                ],
              ),
              const SizedBox(width: 15),
              Expanded(
                child: GlassCard(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        step["stage"]!,
                        style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        '${isAr ? "المنفذ:" : "Actor:"} ${step["user"]}',
                        style: const TextStyle(color: Colors.grey, fontSize: 10),
                      ),
                      Text(
                        '${isAr ? "الوقت:" : "Time:"} ${step["time"]}',
                        style: const TextStyle(color: Colors.grey, fontSize: 10),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          );
        },
      ),
    );
  }
}
