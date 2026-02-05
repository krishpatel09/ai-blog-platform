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
  onEditorReady?: (editor: any) => void;
}

const BlogEditor = ({
  onFocus,
  isReadOnly = false,
  onChange,
  initialContent = "",
  coverImage,
  onEditorReady,
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
  // Sync isReadOnly prop with editor editable state
  useEffect(() => {
    if (editor) {
      editor.setEditable(!isReadOnly);
      onEditorReady?.(editor);
    }
  }, [editor, isReadOnly, onEditorReady]);

  // Sync initialContent prop with editor content
  useEffect(() => {
    if (editor && initialContent) {
      // Avoid resetting cursor or re-rendering if content is effectively same to avoid loops
      // But here we mainly want to catch the async load.
      // We can check if editor is empty or just force set it if it differs significantly?
      // JSON comparison is heavy.
      // For this simple case of "import loading", checking if editor has basic empty content might be enough,
      // or just trusting the prop update for now if it's not frequent.
      // Let's just set it. TipTap usually handles diffs well or we can check.
      const currentContent = editor.getJSON();
      // Simple check to see if we are "initializing"
      const isEmpty = editor.isEmpty;
      if (isEmpty && initialContent) {
        editor.commands.setContent(initialContent);
      } else if (
        initialContent &&
        JSON.stringify(initialContent) !== JSON.stringify(currentContent)
      ) {
        // This might cause loops if onChange updates parent state which updates this prop.
        // Since we track 'content' in parent via onChange, we should be careful.
        // The parent uses 'content' state primarily for saving.
        // If we want to use 'initialContent' purely for initialization, we shouldn't sync it constantly.
        // The issue is the async load from localStorage happens AFTER first render.
        // So we DO need to update.
        // But after that, user types -> updates parent 'content' -> passes back here?
        // If parent passes 'content' back to 'initialContent', we might get loops.
        // NewBlogPage: passed `content={content}`. `content` starts null, then updates.
        // So yes, we need this check.
        editor.commands.setContent(initialContent);
      }
    }
  }, [editor, initialContent]);

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
