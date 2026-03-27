import { useEffect, useRef, useState } from "react";
import { API_URL } from "../utils/const";

type TipoEvento = "imagen" | "formulario" | "mixto";

interface NotificacionRealtime {
  eventId: string;
  tipo: TipoEvento;
  cantidad: number;
  titulo: string;
  categoria: string;
  descripcion?: string;
  urlDestino: string;
  fecha: string;
}

interface ToastState {
  title: string;
  description: string;
  urlDestino: string;
}

const ICONOS_POR_TIPO: Record<TipoEvento, string> = {
  imagen: "🖼️",
  formulario: "📄",
  mixto: "📢",
};

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
  const lastEventIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!API_URL) {
      return;
    }

    const streamUrl = `${API_URL}/notificaciones/stream`;
    const source = new EventSource(streamUrl);

    const onNuevaInformacion = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data) as NotificacionRealtime;

        if (!data?.eventId || data.eventId === lastEventIdRef.current) {
          return;
        }

        lastEventIdRef.current = data.eventId;

        setToast({
          title: `${ICONOS_POR_TIPO[data.tipo] || "📢"} Nuevo contenido publicado`,
          description: construirDescripcion(data),
          urlDestino: data.urlDestino,
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
    return null;
  }

  return (
    <div
      onClick={() => {
        if (toast.urlDestino) {
          window.location.href = toast.urlDestino;
        }
      }}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          if (toast.urlDestino) {
            window.location.href = toast.urlDestino;
          }
        }
      }}
      style={{
        position: "fixed",
        right: "16px",
        bottom: "16px",
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
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: "14px", fontWeight: 700, marginBottom: "3px" }}>{toast.title}</div>
          <div style={{ fontSize: "13px", lineHeight: 1.4, color: "#cbd5e1" }}>{toast.description}</div>
          <div style={{ fontSize: "12px", lineHeight: 1.4, color: "#93c5fd", marginTop: "4px" }}>
            Haz clic para ver en la intranet
          </div>
        </div>
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
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
    </div>
  );
}
