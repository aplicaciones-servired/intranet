import { useEffect, useRef, useState } from "react";

const INACTIVITY_LIMIT = 10 * 60 * 1000; // 10 minutos
const WARNING_BEFORE = 60 * 1000;        // advertencia 1 minuto antes

export function InactivityGuard() {
  const signOut = (cb?: () => void) => (window.Clerk as any)?.signOut(cb);
  const [showWarning, setShowWarning] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(60);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const warningTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // Ref para evitar stale closure en los event listeners
  const showWarningRef = useRef(false);

  const clearAllTimers = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
    if (countdownRef.current) clearInterval(countdownRef.current);
  };

  const startCountdown = () => {
    setSecondsLeft(60);
    if (countdownRef.current) clearInterval(countdownRef.current);
    countdownRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          if (countdownRef.current) clearInterval(countdownRef.current);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
  };

  const resetTimer = () => {
    if (showWarningRef.current) return; // usa ref, no state (evita stale closure)
    clearAllTimers();

    // Advertencia 1 minuto antes del cierre
    warningTimerRef.current = setTimeout(() => {
      showWarningRef.current = true;
      setShowWarning(true);
      startCountdown();
    }, INACTIVITY_LIMIT - WARNING_BEFORE);

    // Cierre de sesión al llegar al límite
    timerRef.current = setTimeout(() => {
      signOut(() => { window.location.href = "/sign-in"; });
    }, INACTIVITY_LIMIT);
  };

  const continuar = () => {
    showWarningRef.current = false;
    setShowWarning(false);
    clearAllTimers();
    resetTimer();
  };

  const cerrarAhora = () => {
    clearAllTimers();
    signOut(() => { window.location.href = "/sign-in"; });
  };

  useEffect(() => {
    const eventos = ["mousemove", "keydown", "mousedown", "scroll", "touchstart"];
    eventos.forEach((e) => window.addEventListener(e, resetTimer, { passive: true }));
    resetTimer();

    return () => {
      clearAllTimers();
      eventos.forEach((e) => window.removeEventListener(e, resetTimer));
    };
  }, []);

  if (!showWarning) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          backgroundColor: "white",
          borderRadius: "12px",
          padding: "32px",
          maxWidth: "400px",
          width: "90%",
          boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
          textAlign: "center",
        }}
      >
        {/* Ícono */}
        <div
          style={{
            width: "64px",
            height: "64px",
            borderRadius: "50%",
            backgroundColor: "#FEF3C7",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 16px",
          }}
        >
          <svg width="32" height="32" fill="none" stroke="#D97706" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
            />
          </svg>
        </div>

        <h2 style={{ fontSize: "18px", fontWeight: "700", color: "#111827", marginBottom: "8px" }}>
          ¿Sigues ahí?
        </h2>
        <p style={{ fontSize: "14px", color: "#6B7280", marginBottom: "8px" }}>
          Tu sesión se cerrará por inactividad en
        </p>

        {/* Contador */}
        <div
          style={{
            fontSize: "40px",
            fontWeight: "800",
            color: secondsLeft <= 10 ? "#DC2626" : "#D97706",
            marginBottom: "24px",
            letterSpacing: "-1px",
          }}
        >
          {secondsLeft}s
        </div>

        {/* Barra de progreso */}
        <div
          style={{
            width: "100%",
            height: "6px",
            backgroundColor: "#F3F4F6",
            borderRadius: "9999px",
            overflow: "hidden",
            marginBottom: "24px",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${(secondsLeft / 60) * 100}%`,
              backgroundColor: secondsLeft <= 10 ? "#DC2626" : "#F59E0B",
              borderRadius: "9999px",
              transition: "width 1s linear, background-color 0.3s",
            }}
          />
        </div>

        <div style={{ display: "flex", gap: "12px" }}>
          <button
            onClick={cerrarAhora}
            style={{
              flex: 1,
              padding: "10px",
              borderRadius: "8px",
              border: "1px solid #E5E7EB",
              backgroundColor: "white",
              color: "#6B7280",
              fontSize: "14px",
              cursor: "pointer",
            }}
          >
            Cerrar sesión
          </button>
          <button
            onClick={continuar}
            style={{
              flex: 1,
              padding: "10px",
              borderRadius: "8px",
              border: "none",
              background: "linear-gradient(135deg, #005a9c, #0078d4)",
              color: "white",
              fontSize: "14px",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            Continuar
          </button>
        </div>
      </div>
    </div>
  );
}
