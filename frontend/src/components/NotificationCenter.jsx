import { useEffect, useState } from 'react';
import { BellIcon } from '@heroicons/react/24/solid';
import clsx from 'clsx';
import { api } from '../api/client.js';

const NotificationCenter = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    let mounted = true;
    const fetchNotifications = async () => {
      try {
        const { data } = await api.get('/notifications').catch(() => ({ data: { notifications: [] } }));
        if (mounted && data) {
          const notifs = Array.isArray(data) ? data : (data.notifications || []);
          const unread = notifs.filter(n => !n.is_read).slice(0, 5);
          setNotifications(unread);
        }
      } catch {
        // swallow errors for demo mode
      }
    };
    fetchNotifications();

    const interval = setInterval(fetchNotifications, 5000); // Poll every 5 seconds for real-time updates
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="rounded-xl bg-white shadow flex items-center gap-4 p-4">
      <div className="relative">
        <BellIcon className="h-8 w-8 text-accent" />
        {notifications.length > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-danger text-[10px] text-white">
            {notifications.length}
          </span>
        )}
      </div>
      <div className="flex-1">
        <p className="font-medium text-slate-800">Recent notifications</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {notifications.length === 0 && <span className="text-sm text-slate-500">No unread notifications</span>}
          {notifications.map((notif) => (
            <span
              key={notif.notification_id || notif.id}
              className={clsx(
                'rounded-full border px-3 py-1 text-xs',
                notif.is_read ? 'bg-slate-100 text-slate-500' : 'bg-accent/10 border-accent text-accent'
              )}
            >
              {notif.title}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NotificationCenter;


