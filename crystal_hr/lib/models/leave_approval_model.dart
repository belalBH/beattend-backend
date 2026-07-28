class LeaveApprovalModel {
  final int approvalId;
  final int requestId;
  final int sequence;
  final String approverType;
  final int approverId;
  final String status;
  final String? actionTimestamp;
  final String? comment;

  LeaveApprovalModel({
    required this.approvalId,
    required this.requestId,
    required this.sequence,
    required this.approverType,
    required this.approverId,
    required this.status,
    this.actionTimestamp,
    this.comment,
  });

  factory LeaveApprovalModel.fromJson(Map<String, dynamic> json) {
    return LeaveApprovalModel(
      approvalId: json['approvalId'] ?? 0,
      requestId: json['requestId'] ?? 0,
      sequence: json['sequence'] ?? 0,
      approverType: json['approverType'] ?? 'manager',
      approverId: json['approverId'] ?? 0,
      status: json['status'] ?? 'pending',
      actionTimestamp: json['actionTimestamp'],
      comment: json['comment'],
    );
  }

  Map<String, dynamic> toJson() => {
        'approvalId': approvalId,
        'requestId': requestId,
        'sequence': sequence,
        'approverType': approverType,
        'approverId': approverId,
        'status': status,
        'actionTimestamp': actionTimestamp,
        'comment': comment,
      };
}
