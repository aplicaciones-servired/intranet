import { useEffect, useRef, useState } from "react";
import type { Imagen } from "../../services/GetInfo.service";
import { isVideo, formatFecha } from "./utils";

interface Props {
  item: Imagen;
  catLabel: string;
  onClose: () => void;
  onPrev?: () => void;
  onNext?: () => void;
  hasPrev?: boolean;
  hasNext?: boolean;
}

export function MediaModal({ item, catLabel, onClose, onPrev, onNext, hasPrev = false, hasNext = false }: Props) {
  const video = isVideo(item.poster);
  const [zoom, setZoom] = useState(1);
  const [imageSize, setImageSize] = useState<{ width: number; height: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const mediaRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef({
    isActive: false,
    moved: false,
    startX: 0,
    startY: 0,
    scrollLeft: 0,
    scrollTop: 0,
  });
  const zoomLevels = [1, 1.1, 1.16, 1.28, 1.42, 1.58, 1.76, 2];
  const minZoom = zoomLevels[0];
  const maxZoom = zoomLevels[zoomLevels.length - 1];

  const setNextZoom = (direction: 1 | -1) => {
    setZoom((prev) => {
      const currentIndex = zoomLevels.indexOf(prev);
      if (currentIndex === -1) return minZoom;
      const nextIndex = Math.min(Math.max(currentIndex + direction, 0), zoomLevels.length - 1);
      return zoomLevels[nextIndex];
    });
  };

  // Cerrar con Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
      if (e.key === "ArrowLeft" && hasPrev && onPrev) {
        onPrev();
      }
      if (e.key === "ArrowRight" && hasNext && onNext) {
        onNext();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose, hasPrev, hasNext, onPrev, onNext]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  useEffect(() => {
    if (video || !mediaRef.current) return;

    const el = mediaRef.current;
    // Recentrar viewport para que el zoom ocurra hacia el centro de la imagen.
    const centerX = Math.max((el.scrollWidth - el.clientWidth) / 2, 0);
    const centerY = Math.max((el.scrollHeight - el.clientHeight) / 2, 0);

    el.scrollLeft = centerX;
    el.scrollTop = centerY;
  }, [zoom, imageSize, video]);

  const handleImageClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (dragRef.current.moved) {
      dragRef.current.moved = false;
      return;
    }
    if (!video) {
      const currentIndex = zoomLevels.indexOf(zoom);
      const nextIndex = (currentIndex + 1) % zoomLevels.length;
      setZoom(zoomLevels[nextIndex]);
    }
  };

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (video || zoom <= 1 || !mediaRef.current) return;

    const el = mediaRef.current;
    const canScrollY = el.scrollHeight > el.clientHeight + 1;
    const canScrollX = el.scrollWidth > el.clientWidth + 1;

    if (!canScrollX && !canScrollY) return;

    // Trackpad: deltaX mueve horizontal, deltaY mueve vertical.
    if (canScrollX) {
      el.scrollLeft += e.deltaX;
    }

    if (canScrollY && !e.shiftKey) {
      el.scrollTop += e.deltaY;
    }

    // Shift + rueda: usar deltaY para desplazamiento horizontal.
    if (canScrollX && (e.shiftKey || (!canScrollY && Math.abs(e.deltaY) > 0))) {
      el.scrollLeft += e.deltaY;
    }

    e.preventDefault();
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (video || zoom <= 1 || !mediaRef.current) return;

    // No iniciar drag si el click viene de un control interactivo (botones de zoom/cierre).
    const target = e.target as HTMLElement;
    if (target.closest("button")) return;
    if (e.button !== 0) return;

    dragRef.current = {
      isActive: true,
      moved: false,
      startX: e.clientX,
      startY: e.clientY,
      scrollLeft: mediaRef.current.scrollLeft,
      scrollTop: mediaRef.current.scrollTop,
    };
    setIsDragging(true);
    mediaRef.current.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current.isActive || !mediaRef.current) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;

    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
      dragRef.current.moved = true;
    }

    mediaRef.current.scrollLeft = dragRef.current.scrollLeft - dx;
    mediaRef.current.scrollTop = dragRef.current.scrollTop - dy;
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current.isActive || !mediaRef.current) return;
    dragRef.current.isActive = false;
    setIsDragging(false);
    mediaRef.current.releasePointerCapture(e.pointerId);
  };

  const handlePointerCancel = () => {
    dragRef.current.isActive = false;
    setIsDragging(false);
  };

  return (
    <div
      className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl overflow-hidden max-w-4xl w-full shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Media */}
        <div className="relative" style={{ maxHeight: "65vh" }}>
          {hasPrev && onPrev && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onPrev();
              }}
              className="absolute z-30 left-3 top-1/2 -translate-y-1/2 bg-black/55 hover:bg-black/75 text-white rounded-full w-10 h-10 flex items-center justify-center transition-colors"
              aria-label="Anterior"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}

          {hasNext && onNext && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onNext();
              }}
              className="absolute z-30 right-3 top-1/2 -translate-y-1/2 bg-black/55 hover:bg-black/75 text-white rounded-full w-10 h-10 flex items-center justify-center transition-colors"
              aria-label="Siguiente"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}

          <div 
            ref={mediaRef}
            className={`w-full bg-black flex overflow-auto ${zoom > 1 ? "items-start justify-start" : "items-center justify-center"}`}
            style={{ 
              maxHeight: "65vh",
              overscrollBehavior: 'contain',
              touchAction: zoom > 1 ? "none" : "auto"
            }}
            onWheel={handleWheel}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerCancel}
          >
            {video ? (
              <video src={item.poster} controls autoPlay className="w-full" style={{ maxHeight: "65vh" }} />
            ) : (
              <div
                style={{
                  width: zoom === 1 ? "100%" : imageSize ? `${imageSize.width * zoom}px` : `${zoom * 100}%`,
                  height: zoom === 1 ? "auto" : imageSize ? `${imageSize.height * zoom}px` : "auto",
                  display: "flex",
                  flex: "0 0 auto",
                  flexShrink: 0,
                  alignItems: zoom === 1 ? "center" : "flex-start",
                  justifyContent: zoom === 1 ? "center" : "flex-start"
                }}
              >
                <img 
                  src={item.poster} 
                  alt={item.titulo} 
                  className="object-contain transition-all duration-300 ease-out cursor-zoom-in" 
                  style={{ 
                    width: zoom === 1 ? "auto" : "100%",
                    height: zoom === 1 ? "auto" : "100%",
                    maxHeight: zoom === 1 ? "65vh" : "none",
                    maxWidth: zoom === 1 ? "100%" : "none",
                    cursor: zoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'zoom-in'
                  }}
                  onLoad={(e) => {
                    setImageSize({
                      width: e.currentTarget.naturalWidth,
                      height: e.currentTarget.naturalHeight,
                    });
                  }}
                  draggable={false}
                  onClick={handleImageClick}
                />
              </div>
            )}
          </div>

          <button
            onClick={onClose}
            className="absolute z-30 top-3 right-3 bg-black/60 hover:bg-black/80 text-white rounded-full w-8 h-8 flex items-center justify-center transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {!video && (
            <div className="absolute z-30 bottom-3 right-3 flex items-center gap-1.5 bg-white/95 border border-gray-200 rounded-full px-1.5 py-1 shadow-lg">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setNextZoom(-1);
                }}
                disabled={zoom <= minZoom}
                className="cursor-pointer bg-[#1d4ed8] hover:bg-[#1e40af] disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed text-white rounded-full w-8 h-8 flex items-center justify-center transition-colors"
                aria-label="Alejar"
              >
                -
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setZoom(1);
                }}
                className="cursor-pointer bg-[#0f172a] hover:bg-black text-white rounded-full px-3 h-8 text-xs font-semibold transition-colors"
                aria-label="Quitar zoom"
              >
                { zoom}
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setNextZoom(1);
                }}
                disabled={zoom >= maxZoom}
                className="cursor-pointer bg-[#16a34a] hover:bg-[#15803d] disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed text-white rounded-full w-8 h-8 flex items-center justify-center transition-colors"
                aria-label="Acercar"
              >
                +
              </button>
            </div>
          )}
          
          {/* Indicador de zoom */}
          {!video && zoom > 1 && (
            <div className="absolute z-30 bottom-3 left-3 bg-black/60 text-white text-xs px-2.5 py-1 rounded-full font-medium">
              {zoom}x
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-5">
          <span className="text-[10px] font-bold uppercase tracking-widest bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full">
            {catLabel}
          </span>
          {(hasPrev || hasNext) && (
            <p className="text-xs text-gray-400 mt-2">Usa las flechas para navegar por las imágenes notificadas.</p>
          )}
          <h2 className="text-lg font-bold text-gray-900 mt-3">{item.titulo}</h2>
          {item.descripcion && (
            <p className="text-sm text-gray-500 mt-1.5 leading-relaxed">{item.descripcion}</p>
          )}
          {item.fecha_registro && (
            <p className="text-xs text-gray-400 mt-3 flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {formatFecha(item.fecha_registro)}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
