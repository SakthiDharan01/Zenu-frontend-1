"use client";

import { Save, X } from "lucide-react";
import { useState } from "react";

interface NotesSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NotesSidebar({ isOpen, onClose }: NotesSidebarProps) {
  const [notes, setNotes] = useState("");

  if (!isOpen) return null;

  const handleSave = () => {
    localStorage.setItem("scribble-notes", notes);
    alert("Notes saved!");
  };

  const loadNotes = () => {
    const saved = localStorage.getItem("scribble-notes");
    if (saved) setNotes(saved);
  };

  return (
    <div className="fixed right-0 top-0 h-full bg-white shadow-lg w-80 z-50">
      <div className="flex justify-between items-center p-4 border-b">
        <h2 className="text-xl font-semibold">Notes</h2>
        <button
          type="button"
          onClick={onClose}
          className="p-1 hover:bg-gray-100 rounded"
        >
          <X size={20} />
        </button>
      </div>
      <div className="p-4">
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Write your notes here..."
          className="w-full h-64 p-2 border rounded resize-none"
        />
        <div className="flex gap-2 mt-4">
          <button
            type="button"
            onClick={handleSave}
            className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded"
          >
            <Save size={16} />
            Save
          </button>
          <button
            type="button"
            onClick={loadNotes}
            className="bg-gray-200 px-4 py-2 rounded"
          >
            Load
          </button>
        </div>
      </div>
    </div>
  );
}
