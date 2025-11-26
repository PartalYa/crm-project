import { useCallback, useEffect, useRef, useState } from 'react';

interface Touch {
  id: number;
  x: number;
  y: number;
}

interface ImageZoomProps {
  imageSrc: string;
  width?: string;
  height?: string;
  minZoom?: number;
  maxZoom?: number;
  className?: string;
  onZoomChange?: (zoom: number) => void;
  alt?: string;
}

export default function ImageZoom({
  imageSrc,
  width = '100%',
  height = '100%',
  minZoom = 0.5,
  maxZoom = 5,
  className = '',
  onZoomChange,
  alt = 'Zoomable image',
}: ImageZoomProps) {
  // State management
  const [zoom, setZoom] = useState(1);
  const [translateX, setTranslateX] = useState(0);
  const [translateY, setTranslateY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Touch/gesture state
  const [touches, setTouches] = useState<Touch[]>([]);
  const [lastTouchDistance, setLastTouchDistance] = useState(0);
  const [lastTouchCenter, setLastTouchCenter] = useState({ x: 0, y: 0 });
  const [isZooming, setIsZooming] = useState(false);

  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const initialTransformRef = useRef({ x: 0, y: 0 });
  const animationFrameRef = useRef<number>();
  const lastZoomTime = useRef<number>(0);

  // Helper functions
  const getTouchDistance = useCallback((touch1: Touch, touch2: Touch): number => {
    const dx = touch1.x - touch2.x;
    const dy = touch1.y - touch2.y;
    return Math.sqrt(dx * dx + dy * dy);
  }, []);

  const getTouchCenter = useCallback((touch1: Touch, touch2: Touch): { x: number; y: number } => {
    return {
      x: (touch1.x + touch2.x) / 2,
      y: (touch1.y + touch2.y) / 2,
    };
  }, []);

  const constrainTransform = useCallback((x: number, y: number, currentZoom: number) => {
    if (!containerRef.current || !imageRef.current) return { x, y };

    const container = containerRef.current.getBoundingClientRect();
    const scaledWidth = imageRef.current.naturalWidth * currentZoom;
    const scaledHeight = imageRef.current.naturalHeight * currentZoom;

    // If image is smaller than container, center it
    if (scaledWidth <= container.width) {
      x = 0;
    } else {
      const maxTranslateX = (scaledWidth - container.width) / 2;
      x = Math.max(-maxTranslateX, Math.min(maxTranslateX, x));
    }

    if (scaledHeight <= container.height) {
      y = 0;
    } else {
      const maxTranslateY = (scaledHeight - container.height) / 2;
      y = Math.max(-maxTranslateY, Math.min(maxTranslateY, y));
    }

    return { x, y };
  }, []);

  const updateTransform = useCallback(
    (newZoom: number, newX: number, newY: number, smooth = true) => {
      const constrainedZoom = Math.max(minZoom, Math.min(maxZoom, newZoom));
      const constrainedTransform = constrainTransform(newX, newY, constrainedZoom);

      if (smooth && animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      const updateState = () => {
        setZoom(constrainedZoom);
        setTranslateX(constrainedTransform.x);
        setTranslateY(constrainedTransform.y);
        onZoomChange?.(constrainedZoom);
      };

      if (smooth) {
        animationFrameRef.current = requestAnimationFrame(updateState);
      } else {
        updateState();
      }
    },
    [minZoom, maxZoom, constrainTransform, onZoomChange],
  );

  // Mouse event handlers
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.button !== 0 || isZooming) return;
      e.preventDefault();

      setIsDragging(true);
      dragStartRef.current = { x: e.clientX, y: e.clientY };
      initialTransformRef.current = { x: translateX, y: translateY };
      document.body.style.userSelect = 'none';
    },
    [translateX, translateY, isZooming],
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging) return;
      e.preventDefault();

      const deltaX = e.clientX - dragStartRef.current.x;
      const deltaY = e.clientY - dragStartRef.current.y;

      const newX = initialTransformRef.current.x + deltaX;
      const newY = initialTransformRef.current.y + deltaY;

      updateTransform(zoom, newX, newY, false);
    },
    [isDragging, zoom, updateTransform],
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    document.body.style.userSelect = '';
  }, []);

  // Wheel event handler
  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      // e.preventDefault();

      if (!containerRef.current) return;

      const now = Date.now();
      if (now - lastZoomTime.current < 16) return;
      lastZoomTime.current = now;

      const rect = containerRef.current.getBoundingClientRect();
      const centerX = e.clientX - rect.left - rect.width / 2;
      const centerY = e.clientY - rect.top - rect.height / 2;

      const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
      const newZoom = zoom * zoomFactor;

      const zoomRatio = newZoom / zoom;
      const newX = translateX - centerX * (zoomRatio - 1);
      const newY = translateY - centerY * (zoomRatio - 1);

      updateTransform(newZoom, newX, newY);
    },
    [zoom, translateX, translateY, updateTransform],
  );

  // Touch event handlers
  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      // e.preventDefault();

      const newTouches: Touch[] = Array.from(e.touches).map((touch) => ({
        id: touch.identifier,
        x: touch.clientX,
        y: touch.clientY,
      }));

      setTouches(newTouches);

      if (newTouches.length === 1) {
        setIsDragging(true);
        setIsZooming(false);
        dragStartRef.current = { x: newTouches[0].x, y: newTouches[0].y };
        initialTransformRef.current = { x: translateX, y: translateY };
      } else if (newTouches.length === 2) {
        setIsDragging(false);
        setIsZooming(true);
        const distance = getTouchDistance(newTouches[0], newTouches[1]);
        const center = getTouchCenter(newTouches[0], newTouches[1]);
        setLastTouchDistance(distance);
        setLastTouchCenter(center);
      }
    },
    [translateX, translateY, getTouchDistance, getTouchCenter],
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      // e.preventDefault();

      const newTouches: Touch[] = Array.from(e.touches).map((touch) => ({
        id: touch.identifier,
        x: touch.clientX,
        y: touch.clientY,
      }));

      if (newTouches.length === 1 && isDragging && !isZooming) {
        const deltaX = newTouches[0].x - dragStartRef.current.x;
        const deltaY = newTouches[0].y - dragStartRef.current.y;

        const newX = initialTransformRef.current.x + deltaX;
        const newY = initialTransformRef.current.y + deltaY;

        updateTransform(zoom, newX, newY, false);
      } else if (newTouches.length === 2 && isZooming) {
        const distance = getTouchDistance(newTouches[0], newTouches[1]);
        const center = getTouchCenter(newTouches[0], newTouches[1]);

        if (lastTouchDistance > 0) {
          const zoomRatio = distance / lastTouchDistance;
          const newZoom = zoom * zoomRatio;

          const centerDeltaX = center.x - lastTouchCenter.x;
          const centerDeltaY = center.y - lastTouchCenter.y;

          const newX = translateX + centerDeltaX;
          const newY = translateY + centerDeltaY;

          updateTransform(newZoom, newX, newY, false);
        }

        setLastTouchDistance(distance);
        setLastTouchCenter(center);
      }

      setTouches(newTouches);
    },
    [
      isDragging,
      isZooming,
      zoom,
      translateX,
      translateY,
      lastTouchDistance,
      lastTouchCenter,
      getTouchDistance,
      getTouchCenter,
      updateTransform,
    ],
  );

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      // e.preventDefault();

      const remainingTouches: Touch[] = Array.from(e.touches).map((touch) => ({
        id: touch.identifier,
        x: touch.clientX,
        y: touch.clientY,
      }));

      setTouches(remainingTouches);

      if (remainingTouches.length === 0) {
        setIsDragging(false);
        setIsZooming(false);
        setLastTouchDistance(0);
      } else if (remainingTouches.length === 1 && isZooming) {
        setIsDragging(true);
        setIsZooming(false);
        dragStartRef.current = { x: remainingTouches[0].x, y: remainingTouches[0].y };
        initialTransformRef.current = { x: translateX, y: translateY };
        setLastTouchDistance(0);
      }
    },
    [translateX, translateY, isZooming],
  );

  // Image load handlers
  const handleImageLoad = useCallback(() => {
    setIsLoaded(true);
    setImageError(false);
  }, []);

  const handleImageError = useCallback(() => {
    setImageError(true);
    setIsLoaded(false);
  }, []);

  // Reset function
  const resetZoom = useCallback(() => {
    updateTransform(1, 0, 0);
  }, [updateTransform]);

  // Double click handler
  const handleDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      if (zoom > 1) {
        resetZoom();
      } else {
        const rect = containerRef.current?.getBoundingClientRect();
        if (rect) {
          const centerX = e.clientX - rect.left - rect.width / 2;
          const centerY = e.clientY - rect.top - rect.height / 2;
          updateTransform(2, -centerX, -centerY);
        }
      }
    },
    [zoom, resetZoom, updateTransform],
  );

  // Global event listeners
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove, { passive: false });
      document.addEventListener('mouseup', handleMouseUp, { passive: false });

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Cleanup effect
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      document.body.style.userSelect = '';
    };
  }, []);

  // Reset on image change
  useEffect(() => {
    resetZoom();
    setIsLoaded(false);
    setImageError(false);
  }, [imageSrc, resetZoom]);

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden select-none touch-none focus:outline-none rounded-lg ${className}`}
      style={{ width, height }}
      onMouseDown={handleMouseDown}
      onDoubleClick={handleDoubleClick}
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onContextMenu={(e) => e.preventDefault()}
      tabIndex={0}
    >
      {imageError ? (
        <div className="flex items-center justify-center w-full h-full bg-gray-100 text-gray-500">
          <div className="text-center">
            <div className="text-2xl mb-2">⚠️</div>
            <div>Failed to load image</div>
          </div>
        </div>
      ) : (
        <>
          {!isLoaded && (
            <div className="flex items-center justify-center w-full h-full bg-gray-100 text-gray-500">
              <div className="text-center">
                <div className="animate-spin text-2xl mb-2">⟳</div>
                <div>Loading...</div>
              </div>
            </div>
          )}
          <img
            ref={imageRef}
            src={imageSrc}
            alt={alt}
            className={`absolute top-1/2 left-1/2 origin-center ${
              isDragging || isZooming
                ? 'transition-none'
                : 'transition-transform duration-150 ease-out'
            }`}
            style={{
              transform: `translate(-50%, -50%) translate(${translateX}px, ${translateY}px) scale(${zoom})`,
              transformOrigin: 'center center',
              maxWidth: 'none',
              maxHeight: 'none',
              userSelect: 'none',
              pointerEvents: 'none',
              imageRendering: zoom > 2 ? 'pixelated' : 'auto',
            }}
            onLoad={handleImageLoad}
            onError={handleImageError}
            draggable={false}
          />
        </>
      )}

      {/* Zoom controls */}
      <div className="absolute bottom-4 right-4 flex flex-col gap-2 bg-black bg-opacity-50 rounded-lg p-2">
        <button
          onClick={() => updateTransform(zoom * 1.2, translateX, translateY)}
          disabled={zoom >= maxZoom}
          className="w-8 h-8 bg-white text-black rounded text-xl font-bold hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Zoom in"
        >
          +
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            updateTransform(zoom * 0.8, translateX, translateY);
          }}
          onDoubleClick={(e) => {
            e.stopPropagation();
          }}
          disabled={zoom <= minZoom}
          className="w-8 h-8 bg-white text-black rounded text-xl font-bold hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Zoom out"
        >
          −
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            resetZoom();
          }}
          onDoubleClick={(e) => {
            e.stopPropagation();
          }}
          className="w-8 h-8 bg-white text-black rounded text-xs font-bold hover:bg-gray-200"
          aria-label="Reset zoom"
        >
          1:1
        </button>
      </div>

      {/* Debug info */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute top-2 left-2 bg-black bg-opacity-75 text-white text-xs p-2 rounded pointer-events-none font-mono">
          <div>Zoom: {zoom.toFixed(2)}x</div>
          <div>X: {translateX.toFixed(0)}</div>
          <div>Y: {translateY.toFixed(0)}</div>
          <div>Touches: {touches.length}</div>
          <div>Dragging: {isDragging ? 'Yes' : 'No'}</div>
          <div>Zooming: {isZooming ? 'Yes' : 'No'}</div>
        </div>
      )}
    </div>
  );
}
