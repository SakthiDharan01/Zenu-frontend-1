"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Stage, Layer, Line, Circle, Rect, Text, Group, Transformer } from 'react-konva';
import { useCanvasStore } from "../store/canvasStore";
import { useToolStore } from "../store/toolStore";
import type Konva from "konva";

interface KonvaStageProps {
  selectedSticker: string | null;
}

const KonvaStage = ({ selectedSticker }: KonvaStageProps) => {
  // Your existing CanvasArea implementation here
  const stageRef = useRef<Konva.Stage>(null);
  const layerRef = useRef<Konva.Layer>(null);

  // ... rest of your implementation

  return (
    <Stage width={window.innerWidth} height={window.innerHeight} ref={stageRef}>
      <Layer ref={layerRef}>
        {/* Your existing canvas content */}
      </Layer>
    </Stage>
  );
};

export default KonvaStage;