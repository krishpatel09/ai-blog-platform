import { Editor } from "@tiptap/react";
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Heading2,
  Quote,
  Code,
  FileCode,
  Zap,
  Image as ImageIcon,
  Link as LinkIcon,
  MoreHorizontal,
} from "lucide-react";

interface EditorToolbarProps {
  editor: Editor | null;
}

export const EditorToolbar = ({ editor }: EditorToolbarProps) => {
  if (!editor) return null;

  return (
    <div className="flex items-center gap-1 border-b border-gray-200 p-2 sticky top-0 bg-white z-10 transition-all">
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        className={`p-2 rounded transition-colors ${
          editor.isActive("bold")
            ? "bg-black text-white"
            : "text-gray-600 hover:bg-gray-100 disabled:bg-transparent disabled:text-gray-400 disabled:cursor-not-allowed"
        }`}
        title="Bold"
      >
        <Bold className="w-5 h-5" />
      </button>

      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        className={`p-2 rounded transition-colors ${
          editor.isActive("italic")
            ? "bg-black text-white"
            : "text-gray-600 hover:bg-gray-100 disabled:bg-transparent disabled:text-gray-400 disabled:cursor-not-allowed"
        }`}
        title="Italic"
      >
        <Italic className="w-5 h-5" />
      </button>

      <button
        onClick={() => {
          const previousUrl = editor.getAttributes("link").href;
          const url = window.prompt("URL", previousUrl);
          if (url === null) return;
          if (url === "") {
            editor.chain().focus().extendMarkRange("link").unsetLink().run();
            return;
          }
          editor
            .chain()
            .focus()
            .extendMarkRange("link")
            .setLink({ href: url })
            .run();
        }}
        disabled={!editor.can().chain().focus().setLink({ href: "" }).run()}
        className={`p-2 rounded transition-colors ${
          editor.isActive("link")
            ? "bg-black text-white"
            : "text-gray-600 hover:bg-gray-100 disabled:bg-transparent disabled:text-gray-400 disabled:cursor-not-allowed"
        }`}
        title="Link"
      >
        <LinkIcon className="w-5 h-5" />
      </button>

      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        disabled={!editor.can().chain().focus().toggleBulletList().run()}
        className={`p-2 rounded transition-colors ${
          editor.isActive("bulletList")
            ? "bg-black text-white"
            : "text-gray-600 hover:bg-gray-100 disabled:bg-transparent disabled:text-gray-400 disabled:cursor-not-allowed"
        }`}
        title="Bullet List"
      >
        <List className="w-5 h-5" />
      </button>

      <button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        disabled={!editor.can().chain().focus().toggleOrderedList().run()}
        className={`p-2 rounded transition-colors ${
          editor.isActive("orderedList")
            ? "bg-black text-white"
            : "text-gray-600 hover:bg-gray-100 disabled:bg-transparent disabled:text-gray-400 disabled:cursor-not-allowed"
        }`}
        title="Ordered List"
      >
        <ListOrdered className="w-5 h-5" />
      </button>

      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        disabled={
          !editor.can().chain().focus().toggleHeading({ level: 2 }).run()
        }
        className={`p-2 rounded transition-colors ${
          editor.isActive("heading", { level: 2 })
            ? "bg-black text-white"
            : "text-gray-600 hover:bg-gray-100 disabled:bg-transparent disabled:text-gray-400 disabled:cursor-not-allowed"
        }`}
        title="Heading 2"
      >
        <Heading2 className="w-5 h-5" />
      </button>

      <button
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        disabled={!editor.can().chain().focus().toggleBlockquote().run()}
        className={`p-2 rounded transition-colors ${
          editor.isActive("blockquote")
            ? "bg-black text-white"
            : "text-gray-600 hover:bg-gray-100 disabled:bg-transparent disabled:text-gray-400 disabled:cursor-not-allowed"
        }`}
        title="Blockquote"
      >
        <Quote className="w-5 h-5" />
      </button>

      <button
        onClick={() => editor.chain().focus().toggleCode().run()}
        disabled={!editor.can().chain().focus().toggleCode().run()}
        className={`p-2 rounded transition-colors ${
          editor.isActive("code")
            ? "bg-black text-white"
            : "text-gray-600 hover:bg-gray-100 disabled:bg-transparent disabled:text-gray-400 disabled:cursor-not-allowed"
        }`}
        title="Code"
      >
        <Code className="w-5 h-5" />
      </button>

      <button
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        disabled={!editor.can().chain().focus().toggleCodeBlock().run()}
        className={`p-2 rounded transition-colors ${
          editor.isActive("codeBlock")
            ? "bg-black text-white"
            : "text-gray-600 hover:bg-gray-100 disabled:bg-transparent disabled:text-gray-400 disabled:cursor-not-allowed"
        }`}
        title="Code Block"
      >
        <FileCode className="w-5 h-5" />
      </button>

      <button
        onClick={() => {}}
        disabled={true}
        className="p-2 rounded text-gray-400 cursor-not-allowed"
        title="Embed (Coming Soon)"
      >
        <Zap className="w-5 h-5" />
      </button>

      <button
        onClick={() => {
          const url = window.prompt("Image URL");
          if (url) {
            editor.chain().focus().setImage({ src: url }).run();
          }
        }}
        disabled={!editor.can().chain().focus().setImage({ src: "" }).run()}
        className="p-2 rounded transition-colors text-gray-600 hover:bg-gray-100 disabled:bg-transparent disabled:text-gray-400 disabled:cursor-not-allowed"
        title="Add Image"
      >
        <ImageIcon className="w-5 h-5" />
      </button>

      <div className="ml-auto">
        <button
          className="p-2 hover:bg-gray-100 rounded text-gray-600"
          title="More Options"
        >
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
