"use client";

import { Pause, Play, RotateCcw, X } from "lucide-react";
import { useEffect, useState } from "react";

interface TimerPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TimerPopup({ isOpen, onClose }: TimerPopupProps) {
  const [time, setTime] = useState(25 * 60); // 25 minutes in seconds
  const [isRunning, setIsRunning] = useState(false);
  const [mode, setMode] = useState<"work" | "break">("work");

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning && time > 0) {
      interval = setInterval(() => {
        setTime((prev) => prev - 1);
      }, 1000);
    } else if (time === 0) {
      setIsRunning(false);
      setMode(mode === "work" ? "break" : "work");
      setTime(mode === "work" ? 5 * 60 : 25 * 60); // Switch to break or work
    }
    return () => clearInterval(interval);
  }, [isRunning, time, mode]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleStart = () => setIsRunning(true);
  const handlePause = () => setIsRunning(false);
  const handleReset = () => {
    setIsRunning(false);
    setTime(25 * 60);
    setMode("work");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-80">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Timer</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <X size={20} />
          </button>
        </div>
        <div className="text-center">
          <div className="text-4xl font-mono mb-4">{formatTime(time)}</div>
          <div className="text-lg mb-4">
            {mode === "work" ? "Work Session" : "Break Time"}
          </div>
          <div className="flex justify-center gap-4">
            {!isRunning ? (
              <button
                type="button"
                onClick={handleStart}
                className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded"
              >
                <Play size={16} />
                Start
              </button>
            ) : (
              <button
                type="button"
                onClick={handlePause}
                className="flex items-center gap-2 bg-yellow-500 text-white px-4 py-2 rounded"
              >
                <Pause size={16} />
                Pause
              </button>
            )}
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-2 bg-gray-500 text-white px-4 py-2 rounded"
            >
              <RotateCcw size={16} />
              Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
