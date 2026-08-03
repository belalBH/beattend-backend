import React, { useState, useEffect } from 'react';
import { attendanceService } from '../services/attendance.service';
import { AttendanceKpis, ChartDayItem, RecentPunchItem } from '../types/attendance.types';
import { AttendanceKpiCards } from '../components/AttendanceKpiCards';
import { AttendanceChart } from '../components/AttendanceChart';
import { RecentPunches } from '../components/RecentPunches';

interface Props {
  onNavigateTab: (tabId: string) => void;
}

export const AttendanceDashboardPage: React.FC<Props> = ({ onNavigateTab }) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [kpis, setKpis] = useState<AttendanceKpis>({
    present_now: 2,
    late_today: 0,
    absent_today: 0,
    on_leave: 1,
    out_of_geofence: 0,
    not_punched_yet: 0,
    avg_arrival_time: '08:05 AM',
    avg_work_hours: '8.4 س'
  });
  const [chartData, setChartData] = useState<ChartDayItem[]>([]);
  const [recentPunches, setRecentPunches] = useState<RecentPunchItem[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await attendanceService.getDashboardData();
      setKpis(res.kpis);
      setChartData(res.chart_30_days || []);
      setRecentPunches(res.recent_punches || []);
    } catch {
      // Fallback values if initial query is empty
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 dir-rtl text-right" dir="rtl">
      {/* 1. KPI Cards */}
      <AttendanceKpiCards kpis={kpis} loading={loading} onCardClick={onNavigateTab} />

      {/* 2. Main Content Split: Chart & Recent Punches Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <AttendanceChart data={chartData} />
        </div>
        <div className="lg:col-span-1">
          <RecentPunches punches={recentPunches} />
        </div>
      </div>
    </div>
  );
};
