import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/leave_provider.dart';
import '../widgets/glass_card.dart';

class ApprovalsInboxView extends StatefulWidget {
  final String language;

  const ApprovalsInboxView({super.key, required this.language});

  @override
  State<ApprovalsInboxView> createState() => _ApprovalsInboxViewState();
}

class _ApprovalsInboxViewState extends State<ApprovalsInboxView> {
  final _commentController = TextEditingController();

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<LeaveProvider>().fetchPendingApprovals();
    });
  }

  @override
  Widget build(BuildContext context) {
    final isAr = widget.language == "ar";
    final leaveProvider = context.watch<LeaveProvider>();

    return Scaffold(
      backgroundColor: const Color(0xFF02050E),
      appBar: AppBar(
        title: Text(isAr ? "صندوق الموافقات المعلقة" : "Pending Approvals"),
        backgroundColor: Colors.transparent,
        elevation: 0,
      ),
      body: leaveProvider.isLoading
          ? const Center(child: CircularProgressIndicator())
          : leaveProvider.pendingApprovals.isEmpty
              ? Center(
                  child: Text(
                    isAr ? "لا توجد طلبات معلقة بانتظار موافقتك" : "No pending requests require your approval",
                    style: const TextStyle(color: Colors.grey),
                  ),
                )
              : ListView.builder(
                  padding: const EdgeInsets.all(16),
                  itemCount: leaveProvider.pendingApprovals.length,
                  itemBuilder: (context, index) {
                    final req = leaveProvider.pendingApprovals[index];
                    return GlassCard(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(
                                req.requestNumber,
                                style: const TextStyle(color: Color(0xFF4CD7F6), fontWeight: FontWeight.bold, fontSize: 12),
                              ),
                              Text(
                                '${req.requestedDays} ${isAr ? "أيام" : "Days"}',
                                style: const TextStyle(color: Colors.white70, fontSize: 11),
                              ),
                            ],
                          ),
                          const SizedBox(height: 10),
                          Text(
                            '${isAr ? "الموظف:" : "Employee:"} ${req.employeeId}',
                            style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold),
                          ),
                          const SizedBox(height: 5),
                          Text(
                            '${isAr ? "الفترة:" : "Period:"} ${req.startDate} ${isAr ? "إلى" : "to"} ${req.endDate}',
                            style: const TextStyle(color: Colors.grey, fontSize: 11),
                          ),
                          if (req.reason != null && req.reason!.isNotEmpty) ...[
                            const SizedBox(height: 8),
                            Text(
                              '${isAr ? "السبب:" : "Reason:"} ${req.reason}',
                              style: const TextStyle(color: Colors.white70, fontSize: 11),
                            ),
                          ],
                          const SizedBox(height: 15),
                          TextField(
                            controller: _commentController,
                            style: const TextStyle(color: Colors.white, fontSize: 11),
                            decoration: InputDecoration(
                              labelText: isAr ? "إضافة تعليق" : "Add Comment",
                              labelStyle: const TextStyle(color: Colors.grey),
                              enabledBorder: const UnderlineInputBorder(borderSide: BorderSide(color: Colors.white24)),
                            ),
                          ),
                          const SizedBox(height: 15),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.end,
                            children: [
                              TextButton(
                                onPressed: () async {
                                  final success = await leaveProvider.rejectRequest(req.requestId, comment: _commentController.text);
                                  if (success && mounted) {
                                    ScaffoldMessenger.of(context).showSnackBar(
                                      SnackBar(content: Text(isAr ? "تم رفض الطلب بنجاح" : "Request rejected successfully")),
                                    );
                                    _commentController.clear();
                                  }
                                },
                                child: Text(isAr ? "رفض" : "REJECT", style: const TextStyle(color: Colors.redAccent, fontSize: 11)),
                              ),
                              const SizedBox(width: 10),
                              ElevatedButton(
                                onPressed: () async {
                                  final success = await leaveProvider.approveRequest(req.requestId, comment: _commentController.text);
                                  if (success && mounted) {
                                    ScaffoldMessenger.of(context).showSnackBar(
                                      SnackBar(content: Text(isAr ? "تمت الموافقة بنجاح" : "Approved successfully")),
                                    );
                                    _commentController.clear();
                                  }
                                },
                                style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF00B6D4)),
                                child: Text(isAr ? "موافقة" : "APPROVE", style: const TextStyle(color: Colors.black, fontSize: 11, fontWeight: FontWeight.bold)),
                              ),
                            ],
                          ),
                        ],
                      ),
                    );
                  },
                ),
    );
  }
}
