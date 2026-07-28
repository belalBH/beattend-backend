import 'package:flutter/material.dart';
import '../models/request_model.dart';
import '../widgets/glass_card.dart';
import 'request_timeline_view.dart';

class DynamicRequestDetailsView extends StatelessWidget {
  final RequestModel request;
  final String language;

  const DynamicRequestDetailsView({
    super.key,
    required this.request,
    required this.language,
  });

  @override
  Widget build(BuildContext context) {
    final isAr = language == "ar";
    return Scaffold(
      backgroundColor: const Color(0xFF02050E),
      appBar: AppBar(
        title: Text(isAr ? "تفاصيل الطلب المخصص" : "Request Details"),
        backgroundColor: Colors.transparent,
        elevation: 0,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: GlassCard(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                '${isAr ? "رقم الطلب:" : "Request Number:"} ${request.requestNumber}',
                style: const TextStyle(color: Color(0xFF4CD7F6), fontWeight: FontWeight.bold, fontSize: 13),
              ),
              const Divider(color: Colors.white12, height: 20),
              _buildDetailRow(isAr ? "نوع الطلب" : "Request Type", request.requestTypeId.toString()),
              _buildDetailRow(isAr ? "حالة الطلب" : "Status", request.status),
              _buildDetailRow(isAr ? "تاريخ الإنشاء" : "Created At", request.submittedAt ?? '-'),
              _buildDetailRow(isAr ? "النسخة" : "Version", 'v${request.recordVersion}'),
              const SizedBox(height: 20),
              Center(
                child: TextButton.icon(
                  onPressed: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) => RequestTimelineView(
                          requestId: request.requestId,
                          language: language,
                        ),
                      ),
                    );
                  },
                  icon: const Icon(Icons.timeline, color: Color(0xFF00B6D4), size: 16),
                  label: Text(
                    isAr ? "عرض جدول خط سير الموافقات" : "View Approval Timeline",
                    style: const TextStyle(color: Color(0xFF00B6D4), fontSize: 11, fontWeight: FontWeight.bold),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildDetailRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8.0),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(color: Colors.grey, fontSize: 11)),
          Text(value, style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold)),
        ],
      ),
    );
  }
}
