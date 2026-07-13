"use client";

import { Crown, X } from "lucide-react";

interface PremiumModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PremiumModal({ isOpen, onClose }: PremiumModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 max-h-96 overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Crown className="text-yellow-500" size={24} />
            Premium Features
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <X size={20} />
          </button>
        </div>
        <div className="space-y-4">
          <div className="p-4 bg-gradient-to-r from-yellow-100 to-yellow-200 rounded">
            <h3 className="font-medium">Unlimited Projects</h3>
            <p className="text-sm text-gray-600">
              Create as many drawings as you want
            </p>
          </div>
          <div className="p-4 bg-gradient-to-r from-purple-100 to-purple-200 rounded">
            <h3 className="font-medium">Advanced Export</h3>
            <p className="text-sm text-gray-600">Export in multiple formats</p>
          </div>
          <div className="p-4 bg-gradient-to-r from-blue-100 to-blue-200 rounded">
            <h3 className="font-medium">Cloud Sync</h3>
            <p className="text-sm text-gray-600">
              Sync your work across devices
            </p>
          </div>
          <button
            type="button"
            className="w-full bg-gradient-to-r from-yellow-400 to-yellow-600 text-white py-2 rounded font-medium"
          >
            Upgrade to Premium
          </button>
        </div>
      </div>
    </div>
  );
}
