import { useEffect, useMemo, useRef, useState } from "react";
import { API_URL } from "../utils/const";
import {
  clickNotificacion,
  getNotificaciones,
  getOrCreateClientId,
  marcarNotificacionLeida,
  recordarNotificacion,
  registrarImpresion,
  type NotificacionItem,
  type PrioridadNotificacion,
  type TipoNotificacion,
} from "../services/notificacion.service";

interface NotificacionRealtime {
  eventId: string;
  notificationId?: number;
  tipo: TipoNotificacion;
  cantidad: number;
  titulo: string;
  categoria: string;
  descripcion?: string;
  urlDestino: string;
  prioridad?: PrioridadNotificacion;
  previewImageUrl?: string;
  fecha: string;
}

interface ToastState extends NotificacionItem {
  title: string;
  description: string;
}

const ICONOS_POR_TIPO: Record<TipoNotificacion, string> = {
  imagen: "🖼️",
  formulario: "📄",
  mixto: "📢",
};

const COLOR_PRIORIDAD: Record<PrioridadNotificacion, string> = {
  alta: "#b91c1c",
  media: "#1d4ed8",
  baja: "#475569",
};

const READ_STORAGE_KEY = "intranet_notificaciones_leidas";

function getReadIdsFromStorage(): Set<number> {
  if (typeof window === "undefined") {
    return new Set();
  }

  try {
    const raw = window.localStorage.getItem(READ_STORAGE_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.map((id) => Number(id)).filter((id) => Number.isFinite(id) && id > 0));
  } catch {
    return new Set();
  }
}

function saveReadIdsToStorage(ids: Set<number>): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(READ_STORAGE_KEY, JSON.stringify(Array.from(ids).slice(-500)));
  } catch {
    // Ignore storage errors to avoid blocking UX.
  }
}

function construirDescripcion(data: NotificacionRealtime): string {
  const cantidadTexto = `${data.cantidad} ${data.cantidad === 1 ? "publicación" : "publicaciones"}`;
  const base = `${cantidadTexto} nueva${data.cantidad === 1 ? "" : "s"} en ${data.categoria}.`;

  if (data.descripcion && data.descripcion.trim().length > 0) {
    return `${base} ${data.descripcion}`;
  }

  return base;
}

export default function IntranetRealtimeToast() {
  const [toast, setToast] = useState<ToastState | null>(null);
  const [openCenter, setOpenCenter] = useState(false);
  const [items, setItems] = useState<NotificacionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const lastEventIdRef = useRef<string | null>(null);
  const clientIdRef = useRef<string>("anon");
  const readIdsRef = useRef<Set<number>>(new Set());

  const unreadCount = useMemo(() => items.filter((item) => !item.leida).length, [items]);

  const markReadLocal = (id: number) => {
    if (!Number.isFinite(id) || id <= 0) return;
    readIdsRef.current.add(id);
    saveReadIdsToStorage(readIdsRef.current);
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, leida: true } : item)));
  };

  const refreshNotificaciones = async () => {
    try {
      const data = await getNotificaciones(clientIdRef.current, false, 80);
      const hydrated = (data.items || []).map((item) => {
        if (readIdsRef.current.has(item.id)) {
          return { ...item, leida: true };
        }
        return item;
      });
      setItems(hydrated);
    } catch (error) {
      console.error("Error cargando centro de notificaciones:", error);
    } finally {
      setLoading(false);
    }
  };

  const navigateNotificacion = async (item: Pick<NotificacionItem, "id" | "url_destino">) => {
    markReadLocal(item.id);

    try {
      await Promise.allSettled([
        marcarNotificacionLeida(item.id, clientIdRef.current),
        clickNotificacion(item.id, clientIdRef.current),
      ]);
    } catch (_error) {
      // Se continúa la navegación aunque falle el tracking.
    }

    window.location.href = item.url_destino;
  };

  const handleMarcarLeida = async (id: number) => {
    markReadLocal(id);

    try {
      await marcarNotificacionLeida(id, clientIdRef.current);
    } catch (error) {
      console.error("Error marcando notificación como leída:", error);
    }
  };

  const handleRecordarLuego = async (id: number) => {
    try {
      await recordarNotificacion(id, clientIdRef.current, 30);
      setItems((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      console.error("Error aplicando recordar luego:", error);
    }
  };

  useEffect(() => {
    if (!API_URL) {
      return;
    }

    clientIdRef.current = getOrCreateClientId();
    readIdsRef.current = getReadIdsFromStorage();
    refreshNotificaciones();

    const streamUrl = `${API_URL}/notificaciones/stream`;
    const source = new EventSource(streamUrl);

    const onNuevaInformacion = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data) as NotificacionRealtime;

        if (!data?.eventId || data.eventId === lastEventIdRef.current) {
          return;
        }

        lastEventIdRef.current = data.eventId;

        const notificationId = Number(data.notificationId || 0);
        const newItem: NotificacionItem = {
          id: Number.isFinite(notificationId) && notificationId > 0 ? notificationId : Date.now(),
          tipo: data.tipo,
          prioridad: data.prioridad || "media",
          titulo: data.titulo,
          descripcion: data.descripcion,
          categoria: data.categoria,
          cantidad: data.cantidad,
          url_destino: data.urlDestino,
          preview_image_url: data.previewImageUrl,
          fecha_publicacion: data.fecha,
          leida: readIdsRef.current.has(Number.isFinite(notificationId) ? notificationId : 0),
          clickeada: false,
        };

        setItems((prev) => [newItem, ...prev].slice(0, 120));

        if (newItem.id > 0) {
          registrarImpresion(newItem.id).catch(() => null);
        }

        setToast({
          ...newItem,
          title: `${ICONOS_POR_TIPO[data.tipo] || "📢"} Nuevo contenido publicado`,
          description: construirDescripcion(data),
        });
      } catch (error) {
        console.error("Error procesando evento de notificación:", error);
      }
    };

    source.addEventListener("nueva-informacion", onNuevaInformacion);

    return () => {
      source.removeEventListener("nueva-informacion", onNuevaInformacion);
      source.close();
    };
  }, []);

  useEffect(() => {
    if (!toast) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setToast(null);
    }, 6000);

    return () => window.clearTimeout(timeout);
  }, [toast]);

  if (!toast) {
    return (
      <>
        <button
          type="button"
          onClick={() => {
            setOpenCenter((prev) => !prev);
            if (!openCenter) {
              refreshNotificaciones();
            }
          }}
          style={{
            position: "fixed",
            right: "16px",
            bottom: "16px",
            zIndex: 9998,
            width: "52px",
            height: "52px",
            borderRadius: "999px",
            border: "1px solid rgba(148, 163, 184, 0.25)",
            background: "#0f172a",
            color: "#f8fafc",
            boxShadow: "0 10px 26px rgba(2, 6, 23, 0.35)",
            cursor: "pointer",
          }}
          aria-label="Abrir centro de notificaciones"
          title="Notificaciones"
        >
          🔔
          {unreadCount > 0 && (
            <span
              style={{
                position: "absolute",
                top: "-3px",
                right: "-3px",
                minWidth: "20px",
                height: "20px",
                borderRadius: "999px",
                background: "#dc2626",
                color: "#fff",
                fontSize: "11px",
                fontWeight: 700,
                padding: "0 6px",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </button>

        {openCenter && (
          <div
            style={{
              position: "fixed",
              right: "16px",
              bottom: "76px",
              zIndex: 9998,
              width: "min(420px, calc(100vw - 24px))",
              maxHeight: "70vh",
              borderRadius: "14px",
              background: "#ffffff",
              border: "1px solid #cbd5e1",
              boxShadow: "0 16px 38px rgba(15, 23, 42, 0.24)",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div style={{ padding: "12px 14px", borderBottom: "1px solid #e2e8f0", background: "#f8fafc" }}>
              <strong style={{ fontSize: "14px", color: "#0f172a" }}>Centro de notificaciones</strong>
              <div style={{ fontSize: "12px", color: "#64748b", marginTop: "2px" }}>{unreadCount} sin leer</div>
            </div>

            <div style={{ overflowY: "auto", padding: "8px" }}>
              {loading && <p style={{ margin: "8px", color: "#64748b", fontSize: "13px" }}>Cargando...</p>}
              {!loading && items.length === 0 && (
                <p style={{ margin: "8px", color: "#64748b", fontSize: "13px" }}>No tienes notificaciones recientes.</p>
              )}

              {items.map((item) => (
                <div
                  key={`${item.id}-${item.fecha_publicacion || ""}`}
                  style={{
                    border: "1px solid #e2e8f0",
                    borderRadius: "10px",
                    padding: "10px",
                    marginBottom: "8px",
                    background: item.leida ? "#fff" : "#eff6ff",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", gap: "8px" }}>
                    <strong style={{ fontSize: "13px", color: "#0f172a" }}>{item.titulo}</strong>
                    <span style={{ fontSize: "11px", fontWeight: 700, color: COLOR_PRIORIDAD[item.prioridad || "media"] }}>
                      {(item.prioridad || "media").toUpperCase()}
                    </span>
                  </div>
                  <p style={{ marginTop: "4px", marginBottom: "6px", fontSize: "12px", color: "#334155" }}>
                    {item.descripcion || `${item.cantidad} publicación(es) nueva(s)`}
                  </p>
                  {item.preview_image_url && (
                    <img
                      src={item.preview_image_url}
                      alt={item.titulo}
                      style={{ width: "100%", maxHeight: "100px", objectFit: "cover", borderRadius: "8px", marginBottom: "8px" }}
                    />
                  )}
                  <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                    <button
                      type="button"
                      onClick={() => navigateNotificacion(item)}
                      style={{ background: "#1d4ed8", color: "#fff", border: "none", borderRadius: "8px", padding: "6px 10px", fontSize: "12px", cursor: "pointer" }}
                    >
                      Ver ahora
                    </button>
                    {!item.leida && (
                      <button
                        type="button"
                        onClick={() => handleMarcarLeida(item.id)}
                        style={{ background: "#e2e8f0", color: "#0f172a", border: "none", borderRadius: "8px", padding: "6px 10px", fontSize: "12px", cursor: "pointer" }}
                      >
                        Marcar leída
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleRecordarLuego(item.id)}
                      style={{ background: "#f1f5f9", color: "#334155", border: "none", borderRadius: "8px", padding: "6px 10px", fontSize: "12px", cursor: "pointer" }}
                    >
                      Recordar luego
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <div
      onClick={() => navigateNotificacion(toast)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          navigateNotificacion(toast);
        }
      }}
      style={{
        position: "fixed",
        right: "16px",
        bottom: "84px",
        zIndex: 9999,
        width: "min(420px, calc(100vw - 24px))",
        borderRadius: "14px",
        background: "#0f172a",
        color: "#f8fafc",
        boxShadow: "0 14px 40px rgba(2, 6, 23, 0.42)",
        border: "1px solid rgba(148, 163, 184, 0.25)",
        padding: "12px 14px",
        cursor: "pointer",
        textAlign: "left",
      }}
      role="status"
      aria-live="polite"
      tabIndex={0}
      aria-roledescription="boton"
      aria-label="Abrir contenido nuevo en la intranet"
      title="Haz clic para abrir"
    >
      <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
        {toast.preview_image_url && (
          <img
            src={toast.preview_image_url}
            alt={toast.title}
            style={{ width: "64px", height: "64px", objectFit: "cover", borderRadius: "10px", flexShrink: 0 }}
          />
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: "14px", fontWeight: 700, marginBottom: "3px" }}>{toast.title}</div>
          <div style={{ fontSize: "13px", lineHeight: 1.4, color: "#cbd5e1" }}>{toast.description}</div>
          <div style={{ fontSize: "12px", lineHeight: 1.4, color: "#93c5fd", marginTop: "4px", display: "flex", gap: "6px" }}>
            <span style={{ color: COLOR_PRIORIDAD[toast.prioridad || "media"], fontWeight: 700 }}>
              {(toast.prioridad || "media").toUpperCase()}
            </span>
            Haz clic para ver en la intranet
          </div>
          <div style={{ display: "flex", gap: "6px", marginTop: "8px" }}>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                navigateNotificacion(toast);
              }}
              style={{ background: "#1d4ed8", color: "#fff", border: "none", borderRadius: "8px", padding: "5px 8px", fontSize: "12px", cursor: "pointer" }}
            >
              Ver ahora
            </button>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                if (toast.id > 0) {
                  handleRecordarLuego(toast.id);
                }
                setToast(null);
              }}
              style={{ background: "#334155", color: "#fff", border: "none", borderRadius: "8px", padding: "5px 8px", fontSize: "12px", cursor: "pointer" }}
            >
              Recordar luego
            </button>
          </div>
        </div>
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            if (toast.id > 0) {
              registrarImpresion(toast.id).catch(() => null);
            }
            setToast(null);
          }}
          aria-label="Cerrar notificación"
          style={{
            background: "transparent",
            border: "none",
            color: "#cbd5e1",
            cursor: "pointer",
            fontSize: "16px",
            lineHeight: 1,
            padding: "2px",
          }}
        >
          ×
        </button>
      </div>

      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          setOpenCenter((prev) => !prev);
          if (!openCenter) {
            refreshNotificaciones();
          }
        }}
        style={{
          position: "fixed",
          right: "16px",
          bottom: "16px",
          zIndex: 9998,
          width: "52px",
          height: "52px",
          borderRadius: "999px",
          border: "1px solid rgba(148, 163, 184, 0.25)",
          background: "#0f172a",
          color: "#f8fafc",
          boxShadow: "0 10px 26px rgba(2, 6, 23, 0.35)",
          cursor: "pointer",
        }}
        aria-label="Abrir centro de notificaciones"
      >
        🔔
        {unreadCount > 0 && (
          <span
            style={{
              position: "absolute",
              top: "-3px",
              right: "-3px",
              minWidth: "20px",
              height: "20px",
              borderRadius: "999px",
              background: "#dc2626",
              color: "#fff",
              fontSize: "11px",
              fontWeight: 700,
              padding: "0 6px",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>
    </div>
  );
}
