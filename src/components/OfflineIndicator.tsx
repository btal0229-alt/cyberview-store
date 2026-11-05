import React, { useEffect, useState } from 'react';
import { WifiOff } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div 
      className="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-2xl bg-slate-900 border border-amber-500/50 px-4 py-2 text-xs font-bold text-white shadow-xl animate-bounce"
      dir="rtl"
    >
      <span className="h-2 w-2 rounded-full bg-amber-400 animate-ping" />
      <WifiOff className="w-4 h-4 text-amber-400" />
      <span>وضع عدم الاتصال — يمكنك متابعة العمل وسيتم حفظ البيانات محلياً.</span>
    </div>
  );
};
