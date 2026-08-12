"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type Konva from "konva";
import { Stage, Layer, Line, Circle, Rect, Text, Group, Transformer } from 'react-konva/lib/ReactKonva';
import { useCanvasStore } from "../store/canvasStore";
import { useToolStore } from "../store/toolStore";

interface CanvasAreaProps {
  selectedSticker: string | null;
}

export default function CanvasArea({ selectedSticker }: CanvasAreaProps) {
  const stageRef = useRef<Konva.Stage>(null);
  const transformerRef = useRef<Konva.Transformer>(null);
  const activeTool = useToolStore((state) => state.activeTool);
  const color = useToolStore((state) => state.color);
  const brushSize = useToolStore((state) => state.brushSize);
  const opacity = useToolStore((state) => state.opacity);
  const gridEnabled = useToolStore((state) => state.gridEnabled);
  const gridSize = useToolStore((state) => state.gridSize);
  const fillColor = useToolStore((state) => state.fillColor);
  const strokeWidth = useToolStore((state) => state.strokeWidth);
  const textFontFamily = useToolStore((state) => state.textFontFamily);
  const textFontStyle = useToolStore((state) => state.textFontStyle);
  const textFontWeight = useToolStore((state) => state.textFontWeight);
  const zoom = useToolStore((state) => state.zoom);
  const darkMode = useToolStore((state) => state.darkMode);


  const elements = useCanvasStore((state) => state.elements);
  const addElement = useCanvasStore((state) => state.addElement);
  const updateLastElement = useCanvasStore((state) => state.updateLastElement);
  const updateElement = useCanvasStore((state) => state.updateElement);
  const setSelectedElement = useCanvasStore(
    (state) => state.setSelectedElement,
  );
  const selectedElement = useCanvasStore((state) => state.selectedElement);
  const deleteElement = useCanvasStore((state) => state.deleteElement);
  const duplicateElement = useCanvasStore((state) => state.duplicateElement);
  const [drawing, setDrawing] = useState(false);
  const [stageSize, setStageSize] = useState({ width: 800, height: 600 });
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [textInput, setTextInput] = useState("");
  const [isTextEditing, setIsTextEditing] = useState(false);

  const [_textProperties, _setTextProperties] = useState({
    fontSize: 16,
    fontFamily: "Arial",
    fontStyle: "normal",
    fontWeight: "normal",
  });

  useEffect(() => {
    const updateSize = () => {
      setStageSize({
        width: window.innerWidth * 0.8,
        height: window.innerHeight * 0.8,
      });
    };

    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  useEffect(() => {
    if (activeTool === "Select" && selectedElement && transformerRef.current && stageRef.current) {
      const node = stageRef.current.findOne(`#${selectedElement}`);
      if (node) {
        transformerRef.current.nodes([node]);
        transformerRef.current.getLayer()?.batchDraw();
      } else {
        transformerRef.current.nodes([]);
      }
    } else if (transformerRef.current) {
      transformerRef.current.nodes([]);
      transformerRef.current.getLayer()?.batchDraw();
    }
  }, [selectedElement, activeTool, elements.length]);

  const handleMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
    const pos = stageRef.current?.getPointerPosition();
    if (!pos) return;

    const clickedOnEmpty = e.target === e.target.getStage();

    if (activeTool === "Select" && clickedOnEmpty) {
      setSelectedElement(null);
      return;
    }

    if (activeTool === "Select" && !clickedOnEmpty) {
      const elementId = e.target.attrs.id;
      if (elementId) {
        setSelectedElement(elementId);
      }
      return;
    }

    if (activeTool === "Draw") {
      setDrawing(true);
      addElement({
        type: "line",
        points: [pos.x, pos.y],
        color,
        strokeWidth: brushSize,
        opacity,
        id: `line-${Date.now()}`,
      });
    } else if (activeTool === "Erase") {
      setDrawing(true);
      addElement({
        type: "eraser",
        points: [pos.x, pos.y],
        color: "#ffffff",
        strokeWidth: brushSize,
        opacity: 1,
        id: `eraser-${Date.now()}`,
      });
    } else if (activeTool === "Rectangle") {
      setDrawing(true);
      setStartPos(pos);
      addElement({
        type: "rect",
        points: [],
        x: pos.x,
        y: pos.y,
        width: 0,
        height: 0,
        color,
        strokeWidth,
        fill: fillColor,
        id: `rect-${Date.now()}`,
      });
    } else if (activeTool === "Circle") {
      setDrawing(true);
      setStartPos(pos);
      addElement({
        type: "circle",
        points: [],
        x: pos.x,
        y: pos.y,
        radius: 0,
        color,
        strokeWidth,
        fill: fillColor,
        id: `circle-${Date.now()}`,
      });
    } else if (activeTool === "Text") {
      setIsTextEditing(true);
      setTextInput("");
      const textId = `text-${Date.now()}`;
      addElement({
        type: "text",
        points: [],
        x: pos.x,
        y: pos.y,
        text: "",
        color,
        strokeWidth: 1,
        fontSize: brushSize,
        fontFamily: textFontFamily,
        fontStyle: textFontStyle,
        fontWeight: textFontWeight,
        id: textId,
      });
      setSelectedElement(textId);
    } else if (activeTool === "Sticker" && selectedSticker) {
      // Handle sticker placement
      addElement({
        type: "sticker",
        points: [],
        x: pos.x,
        y: pos.y,
        stickerName: selectedSticker || "smile",
        color,
        strokeWidth: 1,
        id: `sticker-${Date.now()}`,
      });
    }
  };

  const handleMouseMove = (_e: Konva.KonvaEventObject<MouseEvent>) => {
    const pos = stageRef.current?.getPointerPosition();
    if (!pos) return;

    if ((activeTool === "Draw" || activeTool === "Erase") && drawing) {
      const lastElement = elements[elements.length - 1];
      if (lastElement) {
        const newPoints = [...lastElement.points, pos.x, pos.y];
        updateLastElement(newPoints);
      }
    } else if (activeTool === "Rectangle" && drawing && elements.length > 0) {
      const lastIndex = elements.length - 1;
      const width = pos.x - startPos.x;
      const height = pos.y - startPos.y;
      updateElement(lastIndex, { width, height });
    } else if (activeTool === "Circle" && drawing && elements.length > 0) {
      const lastIndex = elements.length - 1;
      const dx = pos.x - startPos.x;
      const dy = pos.y - startPos.y;
      const radius = Math.sqrt(dx * dx + dy * dy);
      updateElement(lastIndex, { radius });
    }
  };

  const handleMouseUp = () => {
    if (drawing) {
      useCanvasStore.getState().saveToHistory();
    }
    setDrawing(false);
  };

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (selectedElement) {
        if (e.key === "Delete") {
          deleteElement(selectedElement);
        } else if (e.ctrlKey && e.key === "d") {
          e.preventDefault();
          duplicateElement(selectedElement);
        }
      }
    },
    [selectedElement, deleteElement, duplicateElement],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const handleSelect = (id: string) => {
    setSelectedElement(id);
  };

  const handleTextChange = (id: string, newText: string) => {
    const index = elements.findIndex((el) => el.id === id);
    updateElement(index, { text: newText });
  };

  const renderGrid = () => {
    if (!gridEnabled) return null;
    const lines: JSX.Element[] = [];
    for (let i = 0; i < stageSize.width / gridSize; i++) {
      lines.push(
        <Line
          key={`v-${i}`}
          points={[i * gridSize, 0, i * gridSize, stageSize.height]}
          stroke="#ddd"
          strokeWidth={1}
        />,
      );
    }
    for (let i = 0; i < stageSize.height / gridSize; i++) {
      lines.push(
        <Line
          key={`h-${i}`}
          points={[0, i * gridSize, stageSize.width, i * gridSize]}
          stroke="#ddd"
          strokeWidth={1}
        />,
      );
    }
    return lines;
  };

  const getCursor = () => {
    switch (activeTool) {
      case "Draw":
        return "crosshair";
      case "Erase":
        return "crosshair";
      case "Select":
        return "move";
      case "Text":
        return "text";
      default:
        return "default";
    }
  };

  const getCommonProps = (element: any) => ({
    draggable: activeTool === "Select",
    x: element.x || 0,
    y: element.y || 0,
    scaleX: element.scaleX || 1,
    scaleY: element.scaleY || 1,
    rotation: element.rotation || 0,
    onClick: () => activeTool === "Select" && handleSelect(element.id),
    onTap: () => activeTool === "Select" && handleSelect(element.id),
    onDragStart: () => {
      if (activeTool === "Select") {
        handleSelect(element.id);
      }
    },
    onDragEnd: (e: any) => {
      const node = e.target;
      const index = elements.findIndex(el => el.id === element.id);
      if (index !== -1) {
        updateElement(index, { x: node.x(), y: node.y() });
        useCanvasStore.getState().saveToHistory();
      }
    },
    onTransformEnd: (e: any) => {
      const node = e.target;
      const index = elements.findIndex(el => el.id === element.id);
      if (index !== -1) {
        updateElement(index, { 
          x: node.x(), 
          y: node.y(), 
          scaleX: Math.max(0.01, node.scaleX()), 
          scaleY: Math.max(0.01, node.scaleY()), 
          rotation: node.rotation() 
        });
        useCanvasStore.getState().saveToHistory();
      }
    }
  });

  return (
    <div className="flex flex-1 justify-center items-center h-[calc(100dvh-8rem)] md:h-[calc(100dvh-4rem)] touch-none overflow-hidden">
      <div
        className={`rounded-2xl shadow-lg relative w-[90vw] h-[calc(90dvh-8rem)] md:h-[calc(90vh-4rem)] ${darkMode ? "bg-gray-800" : "bg-gradient-to-br from-blue-50 to-purple-50"}`}
        style={{
          backgroundImage: darkMode
            ? "none"
            : `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23f3f4f6' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      >
        <Stage
          width={stageSize.width * zoom}
          height={stageSize.height * zoom}
          ref={stageRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onTouchStart={handleMouseDown as unknown as (e: Konva.KonvaEventObject<TouchEvent>) => void}
          onTouchMove={handleMouseMove as unknown as (e: Konva.KonvaEventObject<TouchEvent>) => void}
          onTouchEnd={handleMouseUp}
          onPointerDown={handleMouseDown as unknown as (e: Konva.KonvaEventObject<PointerEvent>) => void}
          onPointerMove={handleMouseMove as unknown as (e: Konva.KonvaEventObject<PointerEvent>) => void}
          onPointerUp={handleMouseUp}
          style={{
            cursor: getCursor(),
            transform: `scale(${zoom})`,
            transformOrigin: "top left",
            touchAction: "none",
          }}
        >
          <Layer>
            {renderGrid()}
            {elements.map((element, _idx) => {
              const _isSelected = selectedElement === element.id;
              if (element.type === "line") {
                return (
                  <Line
                    key={element.id}
                    id={element.id}
                    points={element.points}
                    stroke={element.color}
                    strokeWidth={element.strokeWidth}
                    opacity={element.opacity}
                    tension={0.5}
                    lineCap="round"
                    lineJoin="round"
                    {...getCommonProps(element)}
                  />
                );
              } else if (element.type === "eraser") {
                return (
                  <Line
                    key={element.id}
                    id={element.id}
                    points={element.points}
                    stroke={element.color}
                    strokeWidth={element.strokeWidth}
                    opacity={element.opacity}
                    tension={0.5}
                    lineCap="round"
                    lineJoin="round"
                    globalCompositeOperation="destination-out"
                    {...getCommonProps(element)}
                  />
                );
              } else if (element.type === "rect") {
                return (
                  <Rect
                    key={element.id}
                    id={element.id}
                    
                    width={element.width}
                    height={element.height}
                    stroke={element.color}
                    strokeWidth={element.strokeWidth}
                    fill={element.fill}
                    {...getCommonProps(element)}
                  />
                );
              } else if (element.type === "circle") {
                return (
                  <Circle
                    key={element.id}
                    id={element.id}
                    
                    radius={element.radius}
                    stroke={element.color}
                    strokeWidth={element.strokeWidth}
                    fill={element.fill}
                    {...getCommonProps(element)}
                  />
                );
              } else if (element.type === "text") {
                return (
                  <Text
                    key={element.id}
                    id={element.id}
                    
                    text={element.text || "Click to edit"}
                    fontSize={element.fontSize}
                    fontFamily={element.fontFamily}
                    fill={element.color}
                    {...getCommonProps(element)}
                    onDblClick={() => {
                      setIsTextEditing(true);
                      setTextInput(element.text || "");
                      setSelectedElement(element.id);
                    }}
                  />
                );
              } else if (element.type === "sticker") {
                // Render sticker as emoji based on name
                const getEmoji = (name: string) => {
                  const emojiMap: { [key: string]: string } = {
                    smile: "😊",
                    heart: "❤️",
                    star: "⭐",
                    zap: "⚡",
                    sun: "☀️",
                    moon: "🌙",
                    cloud: "☁️",
                    cute_face: "🥰",
                    love: "💖",
                    sparkle: "✨",
                  };
                  return emojiMap[name] || "😊";
                };
                return (
                  <Text
                    key={element.id}
                    id={element.id}
                    
                    text={getEmoji(element.stickerName || "smile")}
                    fontSize={32}
                    fill={element.color}
                    {...getCommonProps(element)}
                  />
                );
              }

              return null;
            })}
            {selectedElement && (
              <Transformer
                ref={transformerRef}
                boundBoxFunc={(oldBox, newBox) => {
                  if (newBox.width < 5 || newBox.height < 5) {
                    return oldBox;
                  }
                  return newBox;
                }}
              />
            )}
          </Layer>
        </Stage>
        {isTextEditing && selectedElement && (
          <input
            type="text"
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            onBlur={() => {
              handleTextChange(selectedElement, textInput);
              setIsTextEditing(false);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleTextChange(selectedElement, textInput);
                setIsTextEditing(false);
              }
            }}
            className="absolute top-4 left-4 bg-white border border-gray-300 rounded px-2 py-1 z-10"
          />
        )}
      </div>
    </div>
  );
}
