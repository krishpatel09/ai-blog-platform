import { Editor } from "@tiptap/react";
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Heading2,
  SmilePlus,
  FileCode,
  Link as LinkIcon,
  MoreHorizontal,
  Strikethrough,
  Minus,
  RotateCcw,
  RotateCw,
  RemoveFormatting,
  Sparkles,
} from "lucide-react";
import EmojiPicker, { EmojiClickData, Theme } from "emoji-picker-react";
import { CodeSandboxModal } from "./CodeSandboxModal";
import { useEffect, useState, useRef } from "react";
import { ToolbarDropdown } from "./ToolbarDropdown";

interface EditorToolbarProps {
  editor: Editor | null;
  coverImage: string | null;
  setIsGenerating: (isGenerating: boolean) => void;
}

export const EditorToolbar = ({
  editor,
  coverImage,
  setIsGenerating,
}: EditorToolbarProps) => {
  const [, forceUpdate] = useState({});
  const [isSandboxOpen, setIsSandboxOpen] = useState(false);
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const emojiPickerRef = useRef<HTMLDivElement>(null);

  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const moreDropdownRef = useRef<HTMLDivElement>(null);

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target as Node)
      ) {
        setIsEmojiPickerOpen(false);
      }
      if (
        moreDropdownRef.current &&
        !moreDropdownRef.current.contains(event.target as Node)
      ) {
        setIsMoreOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!editor) return;

    const handleUpdate = () => forceUpdate({});

    editor.on("selectionUpdate", handleUpdate);
    editor.on("transaction", handleUpdate);
    editor.on("update", handleUpdate);

    return () => {
      editor.off("selectionUpdate", handleUpdate);
      editor.off("transaction", handleUpdate);
      editor.off("update", handleUpdate);
    };
  }, [editor]);

  if (!editor) return null;

  const exec =
    (command: () => void, label: string) => (e: React.MouseEvent) => {
      e.preventDefault();
      const { from, to } = editor.state.selection;
      console.log(`[Toolbar] BEFORE ${label} → selection:`, { from, to });

      command();

      const nextSelection = editor.state.selection;
      console.log(`[Toolbar] AFTER ${label} → selection:`, {
        from: nextSelection.from,
        to: nextSelection.to,
      });
    };

  const baseBtn =
    "p-2 rounded transition-colors disabled:bg-transparent disabled:text-gray-400 disabled:cursor-not-allowed";
  const activeBtn = "bg-black text-white shadow-sm ring-1 ring-black";
  const inactiveBtn = "text-gray-600 hover:bg-gray-100 hover:text-black";

  return (
    <div className="flex flex-wrap items-center gap-1 border-b border-gray-200 p-2 sticky top-0 bg-gray-50 z-10 transition-all">
      {/* Bold */}
      <button
        onMouseDown={exec(
          () => editor.chain().focus().toggleBold().run(),
          "Bold",
        )}
        className={`${baseBtn} ${
          editor.isActive("bold") ? activeBtn : inactiveBtn
        }`}
        title="Bold"
      >
        <Bold className="w-5 h-5" />
      </button>

      {/* Italic */}
      <button
        onMouseDown={exec(
          () => editor.chain().focus().toggleItalic().run(),
          "Italic",
        )}
        className={`${baseBtn} ${
          editor.isActive("italic") ? activeBtn : inactiveBtn
        }`}
        title="Italic"
      >
        <Italic className="w-5 h-5" />
      </button>

      {/* Link */}
      <button
        onMouseDown={(e) => {
          e.preventDefault();

          const previousUrl = editor.getAttributes("link").href;
          console.log("[Toolbar] Link previous:", previousUrl);

          const url = window.prompt("Enter URL", previousUrl);
          if (url === null) return;

          if (url === "") {
            editor.chain().focus().extendMarkRange("link").unsetLink().run();
            console.log("[Toolbar] Link removed");
            return;
          }

          editor
            .chain()
            .focus()
            .extendMarkRange("link")
            .setLink({ href: url })
            .run();

          console.log("[Toolbar] Link set:", url);
        }}
        className={`${baseBtn} ${
          editor.isActive("link") ? activeBtn : inactiveBtn
        }`}
        title="Link"
      >
        <LinkIcon className="w-5 h-5" />
      </button>

      {/* Bullet List Dropdown */}
      <ToolbarDropdown
        icon={<List className="w-5 h-5" />}
        label="Bullet List"
        isActive={editor.isActive("bulletList")}
        activeValue={
          editor.isActive("bulletList", { listStyleType: "disc" })
            ? "disc"
            : editor.isActive("bulletList", { listStyleType: "circle" })
              ? "circle"
              : editor.isActive("bulletList", { listStyleType: "square" })
                ? "square"
                : undefined
        }
        options={[
          {
            label: "Default",
            value: "disc",
            icon: <div className="w-2 h-2 rounded-full bg-current" />,
          },
          {
            label: "Circle",
            value: "circle",
            icon: (
              <div className="w-2 h-2 rounded-full border-[1.5px] border-current bg-transparent" />
            ),
          },
          {
            label: "Square",
            value: "square",
            icon: <div className="w-2 h-2 bg-current" />,
          },
        ]}
        onSelect={(value) => {
          if (editor.isActive("bulletList", { listStyleType: value })) {
            editor.chain().focus().toggleBulletList().run();
          } else {
            editor
              .chain()
              .focus()
              .toggleBulletList()
              .updateAttributes("bulletList", { listStyleType: value })
              .run();
          }
        }}
      />

      {/* Ordered List Dropdown */}
      <ToolbarDropdown
        icon={<ListOrdered className="w-5 h-5" />}
        label="Ordered List"
        isActive={editor.isActive("orderedList")}
        activeValue={
          editor.isActive("orderedList", { listStyleType: "decimal" })
            ? "decimal"
            : editor.isActive("orderedList", { listStyleType: "lower-alpha" })
              ? "lower-alpha"
              : editor.isActive("orderedList", { listStyleType: "upper-alpha" })
                ? "upper-alpha"
                : editor.isActive("orderedList", {
                      listStyleType: "lower-roman",
                    })
                  ? "lower-roman"
                  : editor.isActive("orderedList", {
                        listStyleType: "upper-roman",
                      })
                    ? "upper-roman"
                    : undefined
        }
        options={[
          {
            label: "Numbered",
            value: "decimal",
            icon: <span className="text-xs font-bold font-serif">1.</span>,
          },
          {
            label: "Lower Alpha",
            value: "lower-alpha",
            icon: <span className="text-xs font-bold font-serif">a.</span>,
          },
          {
            label: "Upper Alpha",
            value: "upper-alpha",
            icon: <span className="text-xs font-bold font-serif">A.</span>,
          },
          {
            label: "Lower Roman",
            value: "lower-roman",
            icon: <span className="text-xs font-bold font-serif">i.</span>,
          },
          {
            label: "Upper Roman",
            value: "upper-roman",
            icon: <span className="text-xs font-bold font-serif">I.</span>,
          },
        ]}
        onSelect={(value) => {
          if (editor.isActive("orderedList", { listStyleType: value })) {
            editor.chain().focus().toggleOrderedList().run();
          } else {
            editor
              .chain()
              .focus()
              .toggleOrderedList()
              .updateAttributes("orderedList", { listStyleType: value })
              .run();
          }
        }}
      />

      {/* Heading Dropdown */}
      <ToolbarDropdown
        icon={<Heading2 className="w-5 h-5" />}
        label={
          editor.isActive("heading", { level: 1 })
            ? "Heading 1"
            : editor.isActive("heading", { level: 2 })
              ? "Heading 2"
              : editor.isActive("heading", { level: 3 })
                ? "Heading 3"
                : editor.isActive("heading", { level: 4 })
                  ? "Heading 4"
                  : editor.isActive("heading", { level: 5 })
                    ? "Heading 5"
                    : "Normal Text"
        }
        isActive={editor.isActive("heading")}
        activeValue={
          editor.isActive("heading", { level: 1 })
            ? "h1"
            : editor.isActive("heading", { level: 2 })
              ? "h2"
              : editor.isActive("heading", { level: 3 })
                ? "h3"
                : editor.isActive("heading", { level: 4 })
                  ? "h4"
                  : editor.isActive("heading", { level: 5 })
                    ? "h5"
                    : "p"
        }
        options={[
          {
            label: "Normal Text",
            value: "p",
            icon: <span className="text-xs font-bold font-serif">¶</span>,
            className: "text-sm",
          },
          {
            label: "Heading 1",
            value: "h1",
            icon: <span className="text-xs font-bold font-serif">H1</span>,
            className: "text-2xl font-bold",
          },
          {
            label: "Heading 2",
            value: "h2",
            icon: <span className="text-xs font-bold font-serif">H2</span>,
            className: "text-xl font-bold",
          },
          {
            label: "Heading 3",
            value: "h3",
            icon: <span className="text-xs font-bold font-serif">H3</span>,
            className: "text-lg font-bold",
          },
          {
            label: "Heading 4",
            value: "h4",
            icon: <span className="text-xs font-bold font-serif">H4</span>,
            className: "text-base font-bold",
          },
          {
            label: "Heading 5",
            value: "h5",
            icon: <span className="text-xs font-bold font-serif">H5</span>,
            className: "text-sm font-bold uppercase tracking-wide",
          },
        ]}
        onSelect={(value) => {
          if (value === "p") {
            editor.chain().focus().setParagraph().run();
          } else {
            const level = parseInt(value.replace("h", "")) as 1 | 2 | 3 | 4 | 5;
            editor.chain().focus().toggleHeading({ level }).run();
          }
        }}
        showLabel={true}
      />

      {/* Emoji Picker Button */}
      <div className="relative" ref={emojiPickerRef}>
        <button
          onMouseDown={(e) => {
            e.preventDefault();
            setIsEmojiPickerOpen(!isEmojiPickerOpen);
          }}
          className={`${baseBtn} ${
            isEmojiPickerOpen ? activeBtn : inactiveBtn
          }`}
          title="Insert Emoji"
        >
          <SmilePlus className="w-5 h-5" />
        </button>

        {isEmojiPickerOpen && (
          <div className="absolute top-full mt-2 left-0 z-50 animate-in fade-in zoom-in-95 duration-100">
            <div className="shadow-2xl rounded-lg border border-gray-100">
              <EmojiPicker
                onEmojiClick={(emojiData: EmojiClickData) => {
                  editor.chain().focus().insertContent(emojiData.emoji).run();
                  setIsEmojiPickerOpen(false);
                }}
                theme={Theme.LIGHT}
                lazyLoadEmojis={true}
                searchDisabled={false}
                skinTonesDisabled={true}
                previewConfig={{ showPreview: false }}
                width={320}
                height={400}
              />
            </div>
          </div>
        )}
      </div>

      {/* Code Sandbox (Opens Modal) */}
      <button
        onMouseDown={(e) => {
          e.preventDefault();
          setIsSandboxOpen(true);
        }}
        className={`${baseBtn} ${
          editor.isActive("codeSandbox") ? activeBtn : inactiveBtn
        }`}
        title="Code Sandbox (HTML/CSS/JS)"
      >
        <FileCode className="w-5 h-5" />
      </button>

      {/* More Options Dropdown */}
      <div className="ml-auto relative" ref={moreDropdownRef}>
        <button
          onMouseDown={(e) => {
            e.preventDefault();
            setIsMoreOpen(!isMoreOpen);
          }}
          className={`${baseBtn} ${isMoreOpen ? activeBtn : inactiveBtn}`}
          title="More Options"
        >
          <MoreHorizontal className="w-5 h-5" />
        </button>

        {isMoreOpen && (
          <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-100 z-50 p-1 animate-in fade-in zoom-in-95 duration-100">
            <div className="flex flex-col gap-1">
              <button
                onMouseDown={exec(
                  () => editor.chain().focus().toggleStrike().run(),
                  "Strikethrough",
                )}
                className={`flex items-center gap-2 px-2 py-1.5 text-sm rounded hover:bg-gray-100 ${
                  editor.isActive("strike")
                    ? "bg-gray-100 text-black font-medium"
                    : "text-gray-700"
                }`}
              >
                <Strikethrough className="w-4 h-4" />
                <span>Strikethrough</span>
              </button>

              <button
                onMouseDown={exec(
                  () => editor.chain().focus().setHorizontalRule().run(),
                  "Horizontal Rule",
                )}
                className="flex items-center gap-2 px-2 py-1.5 text-sm rounded hover:bg-gray-100 text-gray-700"
              >
                <Minus className="w-4 h-4" />
                <span>Divider</span>
              </button>

              <button
                onMouseDown={exec(
                  () => editor.chain().focus().unsetAllMarks().run(),
                  "Clear Formatting",
                )}
                className="flex items-center gap-2 px-2 py-1.5 text-sm rounded hover:bg-gray-100 text-gray-700"
              >
                <RemoveFormatting className="w-4 h-4" />
                <span>Clear Style</span>
              </button>

              <div className="h-px bg-gray-100 my-1" />

              <button
                onMouseDown={exec(
                  () => editor.chain().focus().undo().run(),
                  "Undo",
                )}
                disabled={!editor.can().undo()}
                className="flex items-center gap-2 px-2 py-1.5 text-sm rounded hover:bg-gray-100 disabled:opacity-50 text-gray-700"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Undo</span>
              </button>

              <button
                onMouseDown={exec(
                  () => editor.chain().focus().redo().run(),
                  "Redo",
                )}
                disabled={!editor.can().redo()}
                className="flex items-center gap-2 px-2 py-1.5 text-sm rounded hover:bg-gray-100 disabled:opacity-50 text-gray-700"
              >
                <RotateCw className="w-4 h-4" />
                <span>Redo</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Sandbox Modal (for inserting NEW blocks) */}
      {isSandboxOpen && (
        <CodeSandboxModal
          isOpen={isSandboxOpen}
          onClose={() => setIsSandboxOpen(false)}
          onSave={(data) => {
            editor
              .chain()
              .focus()
              .insertContent({
                type: "codeSandbox",
                attrs: data,
              })
              .run();
            setIsSandboxOpen(false);
          }}
        />
      )}

      {/* AI Generate Button (Sparkles) */}
      <div className="relative group">
        <button
          onMouseDown={async (e) => {
            e.preventDefault();

            // Validation
            if (!editor) return;

            if (!coverImage) {
              alert("Please upload a cover image first to generate content!");
              return;
            }

            if (
              !confirm(
                "This will generate a new blog post based on your cover image. Continue?",
              )
            ) {
              return;
            }

            try {
              setIsGenerating(true);
              // Dynamic import to avoid circular dependencies
              const { AiService } = await import("../../services/ai.service");

              const generatedBlog =
                await AiService.generateBlogFromImage(coverImage);

              // Insert content
              editor
                .chain()
                .focus()
                .insertContent(`<h1>${generatedBlog.title}</h1>`)
                .insertContent(generatedBlog.content)
                .run();
            } catch (error) {
              console.error("AI Generation failed:", error);
              alert("Failed to generate blog. Please try again.");
            } finally {
              setIsGenerating(false);
            }
          }}
          className={`${baseBtn} ${inactiveBtn} text-purple-600 hover:text-purple-700 hover:bg-purple-50`}
        >
          <Sparkles className="w-5 h-5" />
        </button>

        {/* Simple Tooltip */}
        <div className="absolute right-0 top-full mt-2 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">
          Generate content based on image
        </div>
      </div>
    </div>
  );
};
