"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";

interface MedicalImageViewerProps {
  imageUrl: string;
  patientName?: string;
  date?: string;
  acte?: string;
  onClose: () => void;
}

export function MedicalImageViewer({
  imageUrl,
  patientName,
  date,
  acte,
  onClose,
}: MedicalImageViewerProps) {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [isInverted, setIsInverted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [mounted, setMounted] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Gestion du plein écran
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  // Raccourcis clavier
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "f" || e.key === "F") {
        toggleFullscreen();
      } else if (e.key === "r" || e.key === "R") {
        resetView();
      } else if (e.key === "i" || e.key === "I") {
        setIsInverted(!isInverted);
      } else if (e.key === "+" || e.key === "=") {
        setZoom((prev) => Math.min(prev + 0.1, 5));
      } else if (e.key === "-" || e.key === "_") {
        setZoom((prev) => Math.max(prev - 0.1, 0.5));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isInverted, onClose]);

  // Zoom avec la molette
  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -0.1 : 0.1;
        setZoom((prev) => Math.max(0.5, Math.min(5, prev + delta)));
      }
    },
    []
  );

  // Pan (déplacement) de l'image
  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom > 1) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning && zoom > 1) {
      setPanOffset({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  // Touch events pour mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && zoom > 1) {
      setIsPanning(true);
      setPanStart({
        x: e.touches[0].clientX - panOffset.x,
        y: e.touches[0].clientY - panOffset.y,
      });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isPanning && e.touches.length === 1 && zoom > 1) {
      setPanOffset({
        x: e.touches[0].clientX - panStart.x,
        y: e.touches[0].clientY - panStart.y,
      });
    }
  };

  const toggleFullscreen = async () => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      await containerRef.current.requestFullscreen();
    } else {
      await document.exitFullscreen();
    }
  };

  const resetView = () => {
    setZoom(1);
    setRotation(0);
    setBrightness(100);
    setContrast(100);
    setPanOffset({ x: 0, y: 0 });
    setIsInverted(false);
  };

  const rotateImage = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const zoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.25, 5));
  };

  const zoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.25, 0.5));
  };

  const fitToScreen = () => {
    setZoom(1);
    setPanOffset({ x: 0, y: 0 });
  };

  const viewerContent = (
    <div
      ref={containerRef}
      className="fixed inset-0 flex flex-col bg-[#1a1a1a] text-white"
      style={{ zIndex: 99999 }}
      onWheel={handleWheel}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Barre d'outils supérieure */}
      <div className="flex items-center justify-between bg-[#2a2a2a] px-4 py-3 border-b border-gray-700">
        <div className="flex items-center gap-4 flex-wrap">
          <h3 className="text-lg font-semibold">Visualiseur d'Images Médicales</h3>
          {patientName && (
            <div className="text-sm text-gray-300">
              <span className="font-medium">Patient:</span> {patientName}
              {date && ` • ${new Date(date).toLocaleDateString("fr-FR")}`}
              {acte && ` • ${acte}`}
            </div>
          )}
          <div className="text-xs text-gray-400">
            Zoom: {Math.round(zoom * 100)}% • Rotation: {rotation}°
          </div>
        </div>
        <button
          onClick={onClose}
          className="rounded-lg bg-red-600 px-4 py-2 hover:bg-red-700 transition-colors"
        >
          Fermer (ESC)
        </button>
      </div>

      {/* Zone d'affichage de l'image */}
      <div className="flex-1 overflow-hidden relative flex items-center justify-center">
        <div
          className="relative w-full h-full flex items-center justify-center"
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleMouseUp}
          style={{ cursor: zoom > 1 ? (isPanning ? "grabbing" : "grab") : "default" }}
        >
          <img
            ref={imageRef}
            src={imageUrl}
            alt="Imagerie médicale"
            className="max-w-full max-h-full select-none"
            style={{
              transform: `scale(${zoom}) rotate(${rotation}deg) translate(${panOffset.x / zoom}px, ${panOffset.y / zoom}px)`,
              filter: `brightness(${brightness}%) contrast(${contrast}%) ${isInverted ? "invert(1)" : ""}`,
              transition: isPanning ? "none" : "transform 0.1s ease-out",
            }}
            draggable={false}
          />
        </div>
      </div>

      {/* Barre d'outils inférieure */}
      <div className="bg-[#2a2a2a] px-4 py-3 border-t border-gray-700">
        <div className="flex items-center justify-between flex-wrap gap-4">
          {/* Contrôles de zoom */}
          <div className="flex items-center gap-2">
            <button
              onClick={zoomOut}
              className="px-3 py-1.5 bg-gray-700 rounded hover:bg-gray-600 transition-colors text-lg font-bold"
              title="Zoom arrière (-)"
            >
              −
            </button>
            <span className="min-w-[70px] text-center text-sm font-medium">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={zoomIn}
              className="px-3 py-1.5 bg-gray-700 rounded hover:bg-gray-600 transition-colors text-lg font-bold"
              title="Zoom avant (+)"
            >
              +
            </button>
            <button
              onClick={fitToScreen}
              className="px-3 py-1.5 bg-gray-700 rounded hover:bg-gray-600 transition-colors text-sm"
              title="Ajuster à l'écran"
            >
              Ajuster
            </button>
            <span className="text-xs text-gray-400 ml-2">Ctrl + Molette</span>
          </div>

          {/* Rotation */}
          <div className="flex items-center gap-2">
            <button
              onClick={rotateImage}
              className="px-3 py-1.5 bg-gray-700 rounded hover:bg-gray-600 transition-colors"
              title="Rotation (R)"
            >
              ↻ {rotation}°
            </button>
          </div>

          {/* Luminosité */}
          <div className="flex items-center gap-2 min-w-[200px]">
            <label className="text-sm">Luminosité:</label>
            <input
              type="range"
              min="0"
              max="200"
              value={brightness}
              onChange={(e) => setBrightness(Number(e.target.value))}
              className="flex-1"
            />
            <span className="text-sm w-12 text-right">{brightness}%</span>
          </div>

          {/* Contraste */}
          <div className="flex items-center gap-2 min-w-[200px]">
            <label className="text-sm">Contraste:</label>
            <input
              type="range"
              min="0"
              max="200"
              value={contrast}
              onChange={(e) => setContrast(Number(e.target.value))}
              className="flex-1"
            />
            <span className="text-sm w-12 text-right">{contrast}%</span>
          </div>

          {/* Autres outils */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsInverted(!isInverted)}
              className={`px-3 py-1.5 rounded transition-colors ${
                isInverted
                  ? "bg-primary text-white"
                  : "bg-gray-700 hover:bg-gray-600"
              }`}
              title="Inverser (I)"
            >
              Inverser
            </button>
            <button
              onClick={toggleFullscreen}
              className="px-3 py-1.5 bg-gray-700 rounded hover:bg-gray-600 transition-colors"
              title="Plein écran (F)"
            >
              {isFullscreen ? "☐" : "⛶"}
            </button>
            <button
              onClick={resetView}
              className="px-3 py-1.5 bg-gray-700 rounded hover:bg-gray-600 transition-colors text-sm"
              title="Réinitialiser (R)"
            >
              Réinitialiser
            </button>
          </div>
        </div>

        {/* Aide clavier */}
        <div className="mt-2 text-xs text-gray-400 text-center">
          Raccourcis: <kbd className="px-1 py-0.5 bg-gray-800 rounded">+/-</kbd> Zoom •{" "}
          <kbd className="px-1 py-0.5 bg-gray-800 rounded">R</kbd> Rotation •{" "}
          <kbd className="px-1 py-0.5 bg-gray-800 rounded">I</kbd> Inverser •{" "}
          <kbd className="px-1 py-0.5 bg-gray-800 rounded">F</kbd> Plein écran •{" "}
          <kbd className="px-1 py-0.5 bg-gray-800 rounded">ESC</kbd> Fermer
        </div>
      </div>
    </div>
  );

  // Utiliser un portal pour rendre au-dessus de tout
  if (!mounted) return null;

  return createPortal(viewerContent, document.body);
}
