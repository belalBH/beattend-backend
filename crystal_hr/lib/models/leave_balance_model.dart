class LeaveBalanceModel {
  final String leaveType;
  final double openingBalance;
  final double accruedBalance;
  final double usedBalance;
  final double pendingBalance;
  final double remainingBalance;
  final double carriedForwardBalance;

  LeaveBalanceModel({
    required this.leaveType,
    required this.openingBalance,
    required this.accruedBalance,
    required this.usedBalance,
    required this.pendingBalance,
    required this.remainingBalance,
    required this.carriedForwardBalance,
  });

  factory LeaveBalanceModel.fromJson(Map<String, dynamic> json) {
    return LeaveBalanceModel(
      leaveType: json['leave_type'] ?? json['type'] ?? '',
      openingBalance: (json['opening_balance'] ?? 0.0).toDouble(),
      accruedBalance: (json['accrued_balance'] ?? 0.0).toDouble(),
      usedBalance: (json['used_balance'] ?? 0.0).toDouble(),
      pendingBalance: (json['pending_balance'] ?? 0.0).toDouble(),
      remainingBalance: (json['remaining_balance'] ?? 0.0).toDouble(),
      carriedForwardBalance: (json['carried_forward_balance'] ?? 0.0).toDouble(),
    );
  }

  Map<String, dynamic> toJson() => {
        'leave_type': leaveType,
        'opening_balance': openingBalance,
        'accrued_balance': accruedBalance,
        'used_balance': usedBalance,
        'pending_balance': pendingBalance,
        'remaining_balance': remainingBalance,
        'carried_forward_balance': carriedForwardBalance,
      };
}
