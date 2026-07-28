import { useState } from "react";
import { Profile } from "../types";
import { Bell, Shield, LogOut, CheckCircle, Clock } from "lucide-react";

interface HeaderProps {
  profile: Profile;
  onOpenProfile: () => void;
  logsCount: number;
}

export default function Header({ profile, onOpenProfile, logsCount }: HeaderProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: "Biometric Verified",
      text: "Clock-in successful via Fingerprint at 08:45 AM.",
      time: "2h ago",
      icon: CheckCircle,
      unread: true,
      color: "text-brand-secondary",
    },
    {
      id: 2,
      title: "Portfolio Review Today",
      text: "Engagement Q4 Portfolio Review starts in Board Room Crystal.",
      time: "4h ago",
      icon: Clock,
      unread: true,
      color: "text-amber-400",
    },
    {
      id: 3,
      title: "Security Patch Applied",
      text: "System updated with zero downtime. Authentication integrity active.",
      time: "1d ago",
      icon: Shield,
      unread: false,
      color: "text-emerald-400",
    },
  ]);

  const unreadCount = notifications.filter((n) => n.unread).length;

  const markAllRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, unread: false })));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#121414]/60 dark:bg-[#0c0f0f]/60 backdrop-blur-[30px] border-b border-white/10 flex justify-between items-center px-6 md:px-12 py-4 shadow-inner shadow-white/5">
      <div className="flex items-center gap-4">
        <button
          onClick={onOpenProfile}
          className="w-10 h-10 rounded-full bg-neutral-800 border border-white/15 overflow-hidden hover:border-brand-secondary transition-all cursor-pointer hover:scale-105 active:scale-95 duration-300 relative group"
          title="Edit Profile"
        >
          <img
            className="w-full h-full object-cover"
            src={profile.avatarUrl}
            alt={profile.name}
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300">
            <span className="material-symbols-outlined text-[16px] text-white">edit</span>
          </div>
        </button>
        <div className="flex flex-col">
          <h1 className="font-sans text-xl font-bold text-white tracking-tight flex items-center gap-2">
            CrystalHR
            <span className="text-[10px] bg-brand-secondary/15 text-brand-secondary px-2 py-0.5 rounded-full border border-brand-secondary/20 font-mono">
              V2.5
            </span>
          </h1>
        </div>
      </div>

      <div className="relative">
        <button
          onClick={() => setShowNotifications(!showNotifications)}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 text-neutral-400 hover:text-white transition-all scale-95 active:scale-90 relative"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-brand-error shadow-[0_0_8px_rgba(255,180,171,0.8)] animate-pulse"></span>
          )}
        </button>

        {showNotifications && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setShowNotifications(false)}
            />
            <div className="absolute right-0 mt-3 w-80 md:w-96 glass-card rounded-2xl p-4 border border-white/15 shadow-2xl z-50 animate-in fade-in slide-in-from-top-3 duration-200">
              <div className="flex justify-between items-center pb-3 border-b border-white/10 mb-3">
                <span className="text-xs font-semibold text-neutral-300 uppercase tracking-wider">
                  Notifications ({unreadCount})
                </span>
                <div className="flex gap-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllRead}
                      className="text-[10px] text-brand-secondary hover:underline"
                    >
                      Mark read
                    </button>
                  )}
                  {notifications.length > 0 && (
                    <button
                      onClick={clearNotifications}
                      className="text-[10px] text-neutral-500 hover:text-neutral-300 hover:underline"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {notifications.length === 0 ? (
                <div className="py-8 text-center text-xs text-neutral-500 font-sans">
                  No notifications. You are all caught up!
                </div>
              ) : (
                <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                  {notifications.map((notif) => {
                    const Icon = notif.icon;
                    return (
                      <div
                        key={notif.id}
                        className={`p-2.5 rounded-xl border transition-all flex gap-3 ${
                          notif.unread
                            ? "bg-white/5 border-white/10"
                            : "bg-transparent border-transparent opacity-60"
                        }`}
                      >
                        <div className={`mt-0.5 p-1.5 bg-white/5 rounded-lg ${notif.color}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start gap-1">
                            <h4 className="text-xs font-bold text-white">{notif.title}</h4>
                            <span className="text-[9px] text-neutral-500 whitespace-nowrap">
                              {notif.time}
                            </span>
                          </div>
                          <p className="text-[11px] text-neutral-400 mt-1 leading-relaxed">
                            {notif.text}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </header>
  );
}
