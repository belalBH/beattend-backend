import { LayoutGrid, ClipboardCheck, Calendar, BarChart2, User } from "lucide-react";

interface BottomNavProps {
  activeTab: "dashboard" | "requests" | "attendance" | "reports" | "profile";
  setActiveTab: (tab: "dashboard" | "requests" | "attendance" | "reports" | "profile") => void;
}

export default function BottomNav({ activeTab, setActiveTab }: BottomNavProps) {
  const tabs = [
    { id: "dashboard", icon: LayoutGrid, label: "Dashboard • الرئيسية" },
    { id: "requests", icon: ClipboardCheck, label: "Requests • الطلبات" },
    { id: "attendance", icon: Calendar, label: "Attendance • الحضور" },
    { id: "reports", icon: BarChart2, label: "Reports • التقارير" },
    { id: "profile", icon: User, label: "Profile • الملف" },
  ] as const;


  return (
    <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex justify-around items-center px-4 py-2 mx-auto w-[90%] max-w-md rounded-full bg-[#1e2020]/60 backdrop-blur-[40px] border border-white/20 shadow-2xl">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center justify-center rounded-full p-3 transition-all duration-300 ease-out active:scale-90 cursor-pointer relative group ${
              isActive
                ? "bg-brand-primary/10 text-brand-secondary shadow-[0_0_15px_rgba(76,215,246,0.3)] border border-brand-secondary/20"
                : "text-neutral-400 hover:text-white hover:bg-white/5 border border-transparent"
            }`}
            title={tab.label}
          >
            <Icon className="w-5 h-5" />
            <span className="sr-only">{tab.label}</span>
            
            {/* Tooltip */}
            <span className="absolute bottom-14 left-1/2 -translate-x-1/2 bg-[#0c0f0f] border border-white/10 text-[9px] font-bold text-white px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none uppercase tracking-widest whitespace-nowrap">
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
