import 'package:flutter/material.dart';
import '../models/leave_request_model.dart';
import '../widgets/glass_card.dart';

class LeaveRequestDetailsView extends StatelessWidget {
  final LeaveRequestModel request;
  final String language;

  const LeaveRequestDetailsView({
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
        title: Text(isAr ? "تفاصيل طلب الإجازة" : "Leave Request Details"),
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
              _buildDetailRow(isAr ? "نوع الإجازة" : "Leave Type", request.leaveTypeId.toString()),
              _buildDetailRow(isAr ? "تاريخ البدء" : "Start Date", request.startDate),
              _buildDetailRow(isAr ? "تاريخ الانتهاء" : "End Date", request.endDate),
              _buildDetailRow(isAr ? "الأيام المطلوبة" : "Requested Days", '${request.requestedDays} ${isAr ? "يوم" : "Days"}'),
              _buildDetailRow(isAr ? "أيام العمل الفعلية" : "Working Days", '${request.workingDays} ${isAr ? "يوم" : "Days"}'),
              _buildDetailRow(isAr ? "حالة الطلب" : "Status", request.status),
              if (request.reason != null && request.reason!.isNotEmpty) ...[
                const SizedBox(height: 15),
                Text(
                  isAr ? "السبب:" : "Reason:",
                  style: const TextStyle(color: Colors.grey, fontSize: 11, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 5),
                Text(
                  request.reason!,
                  style: const TextStyle(color: Colors.white70, fontSize: 11),
                ),
              ],
              const SizedBox(height: 20),
              Center(
                child: TextButton.icon(
                  onPressed: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) => RequestApprovalTimelineView(
                          requestId: request.requestId,
                          language: language,
                        ),
                      ),
                    );
                  },
                  icon: const Icon(Icons.timeline, color: Color(0xFF00B6D4), size: 16),
                  label: Text(
                    isAr ? "عرض مسار الموافقات" : "View Approval Timeline",
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

class RequestApprovalTimelineView extends StatelessWidget {
  final int requestId;
  final String language;

  const RequestApprovalTimelineView({
    super.key,
    required this.requestId,
    required this.language,
  });

  @override
  Widget build(BuildContext context) {
    final isAr = language == "ar";
    // Mock approval steps for timeline visualization
    final steps = [
      {"stage": isAr ? "تقديم الطلب" : "Request Submitted", "status": "approved", "user": isAr ? "الموظف" : "Employee", "time": "2026-07-16 09:00"},
      {"stage": isAr ? "موافقة المدير المباشر" : "Manager Approval", "status": "approved", "user": "Manager ID 2", "time": "2026-07-16 11:30"},
      {"stage": isAr ? "اعتماد الموارد البشرية" : "HR Approval", "status": "pending", "user": "HR Admin ID 1", "time": "-"},
    ];

    return Scaffold(
      backgroundColor: const Color(0xFF02050E),
      appBar: AppBar(
        title: Text(isAr ? "مسار موافقات الطلب" : "Request Approval Timeline"),
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
