"use client";

import { X } from "lucide-react";

interface DashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DashboardModal({
  isOpen,
  onClose,
}: DashboardModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 max-h-96 overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Dashboard</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <X size={20} />
          </button>
        </div>
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 rounded">
            <h3 className="font-medium">Recent Projects</h3>
            <p className="text-sm text-gray-600">No recent projects</p>
          </div>
          <div className="p-4 bg-gray-50 rounded">
            <h3 className="font-medium">Statistics</h3>
            <p className="text-sm text-gray-600">Total drawings: 0</p>
          </div>
        </div>
      </div>
    </div>
  );
}
