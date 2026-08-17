"use client";

import { useState } from "react";
import {
  MDXEditor,
  toolbarPlugin,
  headingsPlugin,
  listsPlugin,
  quotePlugin,
  thematicBreakPlugin,
  linkPlugin,
  linkDialogPlugin,
  codeBlockPlugin,
  codeMirrorPlugin,
  diffSourcePlugin,
  DiffSourceToggleWrapper,
  UndoRedo,
  BoldItalicUnderlineToggles,
  BlockTypeSelect,
  ListsToggle,
  CreateLink,
  InsertThematicBreak,
  Separator,
} from "@mdxeditor/editor";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeRaw from "rehype-raw";
import "@mdxeditor/editor/style.css";

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
  const [content, setContent] = useState(initialContent);
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  const handleSave = () => {
    onSave(content);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative w-full max-w-5xl h-[85vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden">
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
              <div className="h-full p-6 prose prose-slate max-w-none overflow-y-auto bg-white">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm, remarkRehype]}
                  rehypePlugins={[rehypeRaw]}
                >
                  {content}
                </ReactMarkdown>
              </div>
            ) : (
              <MDXEditor
                markdown={content}
                onChange={setContent}
                plugins={[
                  headingsPlugin(),
                  listsPlugin(),
                  quotePlugin(),
                  thematicBreakPlugin(),
                  linkPlugin(),
                  linkDialogPlugin(),
                  codeBlockPlugin({ defaultCodeBlockLanguage: "js" }),
                  codeMirrorPlugin({ codeBlockLanguages: { js: "JavaScript", css: "CSS", ts: "TypeScript", python: "Python" } }),
                  diffSourcePlugin({ viewMode: "rich-text" }),
                  toolbarPlugin({
                    toolbarContents: () => (
                      <>
                        <DiffSourceToggleWrapper>
                          <UndoRedo />
                          <Separator />
                          <BoldItalicUnderlineToggles />
                          <Separator />
                          <BlockTypeSelect />
                          <Separator />
                          <ListsToggle />
                          <Separator />
                          <CreateLink />
                          <Separator />
                          <InsertThematicBreak />
                        </DiffSourceToggleWrapper>
                      </>
                    ),
                  }),
                ]}
                contentEditableClassName="prose prose-slate max-w-none min-h-full p-4 focus:outline-none bg-white overflow-y-auto"
                className="flex-1 min-h-0"
              />
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
