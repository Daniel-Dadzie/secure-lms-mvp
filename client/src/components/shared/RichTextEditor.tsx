"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = "Write your lesson content here using Markdown...",
  minHeight = "300px",
}: RichTextEditorProps) {
  const [isPreview, setIsPreview] = useState(false);

  return (
    <div className="border border-slate-300 rounded-lg overflow-hidden">
      {/* Toggle buttons */}
      <div className="flex border-b border-slate-300 bg-slate-50">
        <button
          type="button"
          onClick={() => setIsPreview(false)}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            !isPreview
              ? "bg-white text-blue-600 border-b-2 border-blue-600"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          Edit
        </button>
        <button
          type="button"
          onClick={() => setIsPreview(true)}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            isPreview
              ? "bg-white text-blue-600 border-b-2 border-blue-600"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          Preview
        </button>
      </div>

      {/* Editor or Preview */}
      <div className="min-h-[300px]" style={{ minHeight }}>
        {isPreview ? (
          <div className="p-4 prose prose-slate max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{value || "No content to preview"}</ReactMarkdown>
          </div>
        ) : (
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full h-full min-h-[300px] p-4 resize-none focus:outline-none focus:ring-2 focus:ring-blue-600 font-mono text-sm"
            style={{ minHeight }}
          />
        )}
      </div>

      {/* Markdown help hint */}
      {!isPreview && (
        <div className="px-4 py-2 bg-slate-50 border-t border-slate-300 text-xs text-slate-500">
          Supports Markdown: **bold**, *italic*, `code`, [links](url), ## headings, - lists, etc.
        </div>
      )}
    </div>
  );
}
