import React from 'react';
import { useNotifications } from '../context/NotificationContext';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  CheckCheck,
  CheckCircle2,
  AlertTriangle,
  Info,
  X,
  ExternalLink
} from 'lucide-react';

export const NotificationsPage: React.FC = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, loading } = useNotifications();
  const navigate = useNavigate();

  const getIcon = (type: string) => {
    switch (type) {
      case 'SUCCESS':
        return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
      case 'WARNING':
      case 'ACTION_REQUIRED':
        return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      case 'DANGER':
        return <X className="w-5 h-5 text-rose-500" />;
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Notification Center</h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time updates regarding application determinations, underwriter notices, and payment reminders.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="px-4 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-sm transition flex items-center gap-1.5 self-start sm:self-auto"
          >
            <CheckCheck className="w-4 h-4 text-blue-600" /> Mark All as Read
          </button>
        )}
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : notifications.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 text-xs text-slate-400 space-y-2">
          <Bell className="w-12 h-12 mx-auto stroke-1 text-slate-300" />
          <p className="font-bold text-slate-700">No notifications on file</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm divide-y divide-slate-100 overflow-hidden">
          {notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => {
                markAsRead(n.id);
                if (n.link) navigate(n.link);
              }}
              className={`p-5 flex items-start justify-between gap-4 transition hover:bg-slate-50/80 cursor-pointer ${
                !n.is_read ? 'bg-blue-50/30' : ''
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div className="mt-0.5 flex-shrink-0">{getIcon(n.type)}</div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className={`text-xs font-bold ${!n.is_read ? 'text-slate-900' : 'text-slate-700'}`}>
                      {n.title}
                    </h3>
                    {!n.is_read && (
                      <span className="w-2 h-2 rounded-full bg-blue-600 flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">{n.message}</p>
                  <span className="text-[10px] text-slate-400 block pt-1">
                    {new Date(n.created_at).toLocaleString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              </div>

              {n.link && (
                <span className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 flex-shrink-0">
                  Open <ExternalLink className="w-3.5 h-3.5" />
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
