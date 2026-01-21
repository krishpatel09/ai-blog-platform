"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import { useEffect, useState } from "react";
import { EditorToolbar } from "./EditorToolbar";
import { extensions } from "./extensions";

interface BlogEditorProps {
  onFocus?: () => void;
  isReadOnly?: boolean;
  onChange?: (content: any) => void;
  initialContent?: any;
  coverImage: string | null;
}

const BlogEditor = ({
  onFocus,
  isReadOnly = false,
  onChange,
  initialContent = "",
  coverImage,
}: BlogEditorProps) => {
  const [isGenerating, setIsGenerating] = useState(false);

  const editor = useEditor({
    extensions: extensions,
    content: initialContent,
    editable: !isReadOnly,
    editorProps: {
      attributes: {
        class:
          "prose prose-lg dark:prose-invert max-w-none focus:outline-none min-h-[500px] p-4",
      },
    },
    immediatelyRender: false,
    onFocus: () => {
      onFocus?.();
    },
    onUpdate: ({ editor }) => {
      const json = editor.getJSON();
      onChange?.(json);
      console.log(json);
    },
  });

  // Sync isReadOnly prop with editor editable state
  useEffect(() => {
    if (editor) {
      editor.setEditable(!isReadOnly);
    }
  }, [editor, isReadOnly]);

  return (
    <div className="w-full max-w-4xl mx-auto min-h-[80vh] flex flex-col">
      {!isReadOnly && (
        <EditorToolbar
          editor={editor}
          coverImage={coverImage}
          setIsGenerating={setIsGenerating}
        />
      )}
      <div className="flex-1 relative">
        <EditorContent editor={editor} />
        {isGenerating && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 p-8 animate-pulse pointer-events-none">
            <div className="h-10 bg-gray-200 rounded w-3/4 mb-6"></div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              <div className="h-32 bg-gray-100 rounded w-full my-6"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-4/5"></div>
            </div>
            <div className="mt-8 flex items-center justify-center text-purple-600 font-medium">
              <span className="animate-bounce mr-2">✨</span>
              Generating your blog post...
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogEditor;
