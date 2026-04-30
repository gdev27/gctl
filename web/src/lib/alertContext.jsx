import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, AlertCircle, Info, X } from "lucide-react";

const AlertContext = React.createContext(null);

const severityConfig = {
  info: { icon: Info, color: "text-[hsl(var(--chart-2))]", border: "border-[hsl(var(--chart-2))]/40" },
  warning: { icon: AlertTriangle, color: "text-[hsl(var(--chart-4))]", border: "border-[hsl(var(--chart-4))]/40" },
  critical: { icon: AlertCircle, color: "text-destructive", border: "border-destructive/50" },
};

export function AlertNotificationProvider({ children }) {
  const [toasts, setToasts] = React.useState([]);

  const push = React.useCallback((toast) => {
    const id = Date.now() + Math.random();
    const t = { id, severity: "warning", duration: 5000, ...toast };
    setToasts((prev) => [...prev, t]);
    if (t.duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((x) => x.id !== id));
      }, t.duration);
    }
    return id;
  }, []);

  const dismiss = React.useCallback((id) => {
    setToasts((prev) => prev.filter((x) => x.id !== id));
  }, []);

  return (
    <AlertContext.Provider value={{ push, dismiss }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        <AnimatePresence>
          {toasts.map((t) => {
            const c = severityConfig[t.severity];
            const Icon = c.icon;
            return (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, x: 30, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 30, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className={`pointer-events-auto rounded-lg border ${c.border} bg-card shadow-2xl shadow-black/40 p-4 flex items-start gap-3`}
              >
                <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${c.color}`} strokeWidth={2} />
                <div className="min-w-0 flex-1">
                  {t.title && <p className="text-sm font-medium">{t.title}</p>}
                  {t.message && <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{t.message}</p>}
                  {t.agent && <p className="text-[10px] font-mono text-muted-foreground mt-1.5">agent: {t.agent}</p>}
                </div>
                <button onClick={() => dismiss(t.id)} className="text-muted-foreground hover:text-foreground shrink-0">
                  <X className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </AlertContext.Provider>
  );
}

export function useAlertToast() {
  const ctx = React.useContext(AlertContext);
  if (!ctx) throw new Error("useAlertToast must be used within AlertNotificationProvider");
  return ctx;
}