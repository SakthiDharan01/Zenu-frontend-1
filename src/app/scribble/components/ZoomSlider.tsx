"use client";

export default function ZoomSlider() {
  return (
    <div className="flex items-center gap-2">
      <button type="button" className="bg-gray-200 px-2 py-1 rounded">
        -
      </button>
      <span>100%</span>
      <button type="button" className="bg-gray-200 px-2 py-1 rounded">
        +
      </button>
    </div>
  );
}
