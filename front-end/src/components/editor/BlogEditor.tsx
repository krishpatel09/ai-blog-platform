"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import { useEffect } from "react";
import { EditorToolbar } from "./EditorToolbar";
import { extensions } from "./extensions";

interface BlogEditorProps {
  onFocus?: () => void;
  isReadOnly?: boolean;
  onChange?: (content: any) => void;
  initialContent?: any;
}

const BlogEditor = ({
  onFocus,
  isReadOnly = false,
  onChange,
  initialContent = "",
}: BlogEditorProps) => {
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
      {!isReadOnly && <EditorToolbar editor={editor} />}
      <div className="flex-1">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};

export default BlogEditor;
