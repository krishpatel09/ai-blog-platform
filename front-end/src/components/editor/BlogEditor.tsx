"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import { EditorToolbar } from "./EditorToolbar";
import { extensions } from "./extensions";

const BlogEditor = () => {
  const editor = useEditor({
    extensions: extensions,
    content: "",
    editorProps: {
      attributes: {
        class:
          "prose prose-lg dark:prose-invert max-w-none focus:outline-none min-h-[500px] p-4",
      },
    },
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      const json = editor.getJSON();
      // Placeholder for future state management or auto-save
      console.log(json);
    },
  });

  return (
    <div className="w-full max-w-4xl mx-auto min-h-[80vh] flex flex-col">
      <EditorToolbar editor={editor} />
      <div className="flex-1">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};

export default BlogEditor;
