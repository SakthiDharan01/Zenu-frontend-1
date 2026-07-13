"use client";

import { X } from "lucide-react";

interface FilesPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function FilesPanel({ isOpen, onClose }: FilesPanelProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 max-h-96 overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Save</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <X size={20} />
          </button>
        </div>
        <div className="space-y-4">
          <div className="text-center">
            <p className="text-gray-600 mb-4">
              Save your creation as a JPEG image
            </p>
            <button
              type="button"
              className="w-full bg-blue-500 text-white py-3 rounded font-medium hover:bg-blue-600"
              onClick={() => {
                // Export canvas as JPEG
                const stage = document.querySelector("canvas");
                if (stage) {
                  const link = document.createElement("a");
                  const date = new Date().toISOString().split("T")[0];
                  link.download = `ScribblePad_${date}.jpeg`;
                  link.href = stage.toDataURL("image/jpeg", 0.9);
                  link.click();
                }
              }}
            >
              Save as JPEG
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
