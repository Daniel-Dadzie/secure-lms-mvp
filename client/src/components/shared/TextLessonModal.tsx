"use client";

import { useState, useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";

interface TextLessonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (content: string) => void;
  initialContent?: string;
  title?: string;
}

export default function TextLessonModal({
  isOpen,
  onClose,
  onSave,
  initialContent = "",
  title = "Edit Lesson Content",
}: TextLessonModalProps) {
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isMarkdownMode, setIsMarkdownMode] = useState(false);
  const [markdownContent, setMarkdownContent] = useState(initialContent);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 underline cursor-pointer',
        },
      }),
    ],
    content: initialContent,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      setMarkdownContent(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-slate max-w-none p-4 focus:outline-none bg-white min-h-[300px]',
      },
    },
  });

  // Reset editor when modal opens with new content
  useEffect(() => {
    if (isOpen && editor) {
      editor.commands.setContent(initialContent);
      // Use setTimeout to avoid cascading renders
      setTimeout(() => {
        setMarkdownContent(initialContent);
        setIsMarkdownMode(false);
        setIsPreviewMode(false);
      }, 0);
    }
  }, [isOpen, initialContent, editor]);

  const handleSave = () => {
    const contentToSave = isMarkdownMode ? markdownContent : (editor?.getHTML() || markdownContent);
    onSave(contentToSave);
    onClose();
  };

  const toggleMarkdownMode = () => {
    if (!isMarkdownMode && editor) {
      setMarkdownContent(editor.getHTML());
    } else if (isMarkdownMode && editor) {
      editor.commands.setContent(markdownContent);
    }
    setIsMarkdownMode(!isMarkdownMode);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative w-full max-w-5xl h-[80vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-900">{title}</h2>
          <div className="flex items-center gap-3">
            {/* Edit/Preview Toggle */}
            <div className="flex items-center bg-slate-100 rounded-lg p-1">
              <button
                type="button"
                onClick={() => setIsPreviewMode(false)}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  !isPreviewMode
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => setIsPreviewMode(true)}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  isPreviewMode
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Preview
              </button>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
              aria-label="Close"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-5 h-5 text-slate-600"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        {/* Editor */}
        <div className="flex-1 overflow-hidden p-6 min-h-0">
          <div className="h-full border border-slate-300 rounded-lg overflow-hidden flex flex-col">
            {isPreviewMode ? (
              <div
                className="h-full p-6 prose prose-slate max-w-none overflow-y-auto bg-white"
                dangerouslySetInnerHTML={{ __html: markdownContent }}
              />
            ) : isMarkdownMode ? (
              <div className="flex-1 flex flex-col overflow-hidden">
                <textarea
                  value={markdownContent}
                  onChange={(e) => setMarkdownContent(e.target.value)}
                  className="flex-1 p-4 font-mono text-sm bg-white border-0 resize-none focus:outline-none custom-scrollbar"
                  placeholder="Write your content in HTML format..."
                />
              </div>
            ) : (
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* Toolbar */}
                <div className="flex items-center gap-1 p-2 border-b border-slate-200 bg-slate-50 flex-wrap shrink-0">
                  <button
                    type="button"
                    onClick={() => editor?.chain().focus().toggleBold().run()}
                    className={`p-2 rounded hover:bg-slate-200 transition-colors ${editor?.isActive('bold') ? 'bg-slate-200' : ''}`}
                    title="Bold"
                  >
                    <strong>B</strong>
                  </button>
                  <button
                    type="button"
                    onClick={() => editor?.chain().focus().toggleItalic().run()}
                    className={`p-2 rounded hover:bg-slate-200 transition-colors ${editor?.isActive('italic') ? 'bg-slate-200' : ''}`}
                    title="Italic"
                  >
                    <em>I</em>
                  </button>
                  <div className="w-px h-6 bg-slate-300 mx-1" />
                  <button
                    type="button"
                    onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
                    className={`p-2 rounded hover:bg-slate-200 transition-colors ${editor?.isActive('heading', { level: 1 }) ? 'bg-slate-200' : ''}`}
                    title="Heading 1"
                  >
                    <strong>H1</strong>
                  </button>
                  <button
                    type="button"
                    onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
                    className={`p-2 rounded hover:bg-slate-200 transition-colors ${editor?.isActive('heading', { level: 2 }) ? 'bg-slate-200' : ''}`}
                    title="Heading 2"
                  >
                    <strong>H2</strong>
                  </button>
                  <button
                    type="button"
                    onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
                    className={`p-2 rounded hover:bg-slate-200 transition-colors ${editor?.isActive('heading', { level: 3 }) ? 'bg-slate-200' : ''}`}
                    title="Heading 3"
                  >
                    <strong>H3</strong>
                  </button>
                  <div className="w-px h-6 bg-slate-300 mx-1" />
                  <button
                    type="button"
                    onClick={() => editor?.chain().focus().toggleBulletList().run()}
                    className={`p-2 rounded hover:bg-slate-200 transition-colors ${editor?.isActive('bulletList') ? 'bg-slate-200' : ''}`}
                    title="Bullet List"
                  >
                    • List
                  </button>
                  <button
                    type="button"
                    onClick={() => editor?.chain().focus().toggleOrderedList().run()}
                    className={`p-2 rounded hover:bg-slate-200 transition-colors ${editor?.isActive('orderedList') ? 'bg-slate-200' : ''}`}
                    title="Numbered List"
                  >
                    1. List
                  </button>
                  <div className="w-px h-6 bg-slate-300 mx-1" />
                  <button
                    type="button"
                    onClick={() => editor?.chain().focus().toggleBlockquote().run()}
                    className={`p-2 rounded hover:bg-slate-200 transition-colors ${editor?.isActive('blockquote') ? 'bg-slate-200' : ''}`}
                    title="Quote"
                  >
                    &quot;
                  </button>
                  <button
                    type="button"
                    onClick={() => editor?.chain().focus().toggleCodeBlock().run()}
                    className={`p-2 rounded hover:bg-slate-200 transition-colors ${editor?.isActive('codeBlock') ? 'bg-slate-200' : ''}`}
                    title="Code Block"
                  >
                    &lt;/&gt;
                  </button>
                  <button
                    type="button"
                    onClick={() => editor?.chain().focus().setHorizontalRule().run()}
                    className="p-2 rounded hover:bg-slate-200 transition-colors"
                    title="Horizontal Rule"
                  >
                    —
                  </button>
                  <div className="w-px h-6 bg-slate-300 mx-1" />
                  <button
                    type="button"
                    onClick={() => {
                      const url = window.prompt('Enter link URL:');
                      if (url) {
                        editor?.chain().focus().setLink({ href: url }).run();
                      }
                    }}
                    className={`p-2 rounded hover:bg-slate-200 transition-colors ${editor?.isActive('link') ? 'bg-slate-200' : ''}`}
                    title="Add Link"
                  >
                    🔗
                  </button>
                  <div className="w-px h-6 bg-slate-300 mx-1" />
                  <button
                    type="button"
                    onClick={() => editor?.chain().focus().undo().run()}
                    className="p-2 rounded hover:bg-slate-200 transition-colors"
                    title="Undo"
                  >
                    ↶
                  </button>
                  <button
                    type="button"
                    onClick={() => editor?.chain().focus().redo().run()}
                    className="p-2 rounded hover:bg-slate-200 transition-colors"
                    title="Redo"
                  >
                    ↷
                  </button>
                  <div className="ml-auto flex items-center gap-2">
                    <button
                      type="button"
                      onClick={toggleMarkdownMode}
                      className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                        isMarkdownMode
                          ? "bg-blue-100 text-blue-700"
                          : "text-slate-600 hover:bg-slate-200"
                      }`}
                      title="Toggle HTML source mode"
                    >
                      {isMarkdownMode ? 'Rich Text' : 'HTML'}
                    </button>
                  </div>
                </div>
                {/* Editor Content */}
                <div className="flex-1 overflow-y-auto custom-scrollbar min-h-0">
                  <EditorContent editor={editor} />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200 bg-slate-50 rounded-b-2xl">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-6 py-2 text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors"
          >
            Save Content
          </button>
        </div>
      </div>
    </div>
  );
}
