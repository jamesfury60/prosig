// components/ImagePlaceholder.jsx
import { ImageIcon } from "lucide-react";

export default function ImagePlaceholder({
  label = "Image placeholder",
  className = "",
}) {
  return (
    <div
      className={`relative w-full aspect-video rounded-3xl border border-dashed border-white/15 bg-gradient-to-br from-white/[0.04] to-white/[0.01] flex flex-col items-center justify-center gap-2 overflow-hidden [html.light_&]:border-black/15 [html.light_&]:from-black/[0.03] [html.light_&]:to-black/[0.01] ${className}`}
    >
      <div
        className="absolute inset-0 opacity-40 [html.light_&]:opacity-20"
        style={{
          backgroundImage:
            "repeating-linear-gradient(135deg, rgba(255,255,255,0.04) 0px, rgba(255,255,255,0.04) 1px, transparent 1px, transparent 14px)",
        }}
      />
      <span className="relative w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-500 [html.light_&]:bg-black/5 [html.light_&]:border-black/10 [html.light_&]:text-gray-400">
        <ImageIcon className="w-5 h-5" />
      </span>
      <span className="relative text-xs font-medium text-gray-500 [html.light_&]:text-gray-400">
        {label}
      </span>
    </div>
  );
}
