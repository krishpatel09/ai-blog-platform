# AI Blog Platform – Editor Implementation Guide

This document explains **how to implement the Tiptap editor**, **how many components to create**, and **which is the main vs child component**, based on your current **Next.js + NestJS + Neon DB** architecture.

---

## 1. Goal of This Setup

We want a **Medium‑like blog editor** that is:

- Modular
- Reusable
- Easy to extend (AI, autosave, slash commands)
- Cleanly separated (UI vs logic)

---

## 2. Component Hierarchy (IMPORTANT)

### Component Tree

```
Write Page (page.tsx)
 └── BlogEditor (MAIN COMPONENT)
      ├── EditorToolbar (CHILD)
      ├── EditorContent (from Tiptap)
      └── EditorStatus (optional child – autosave / draft status)
```

### Summary

| Type     | Component      | Responsibility               |
| -------- | -------------- | ---------------------------- |
| Page     | write/page.tsx | Route + layout only          |
| MAIN     | BlogEditor     | Owns editor instance & state |
| CHILD    | EditorToolbar  | Buttons & actions            |
| CHILD    | EditorContent  | Text editor UI (Tiptap)      |
| OPTIONAL | EditorStatus   | Autosave / draft info        |

---

## 3. Folder Structure for Editor

```
src/components/editor/
├── BlogEditor.tsx        # MAIN component
├── EditorToolbar.tsx    # CHILD (buttons)
├── extensions.ts        # Tiptap extensions
├── editor.styles.css    # Editor-specific styles
└── README.md            # (optional) editor docs
```

---

## 4. Technical Implementation

### Step 1: Installation

Install the core Tiptap packages and necessary extensions:

```bash
npm install @tiptap/react @tiptap/starter-kit @tiptap/extension-placeholder @tiptap/extension-image
# Optional: Install icons for the toolbar
npm install lucide-react
```

### Step 2: Extensions Configuration (`src/components/editor/extensions.ts`)

Define the extensions separately to keep the main component clean.

```typescript
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Image from "@tiptap/extension-image";

export const extensions = [
  StarterKit.configure({
    heading: {
      levels: [1, 2, 3],
    },
  }),
  Placeholder.configure({
    placeholder: "Tell your story...",
  }),
  Image,
];
```

### Step 3: Editor Toolbar (`src/components/editor/EditorToolbar.tsx`)

This component handles all text formatting actions. It receives the `editor` instance as a prop.

```typescript
import { Editor } from "@tiptap/react";
import { Bold, Italic, List, Heading2, Quote } from "lucide-react";

interface EditorToolbarProps {
  editor: Editor | null;
}

export const EditorToolbar = ({ editor }: EditorToolbarProps) => {
  if (!editor) return null;

  return (
    <div className="flex items-center gap-2 border-b p-2 sticky top-0 bg-background z-10">
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        className={
          editor.isActive("bold") ? "is-active p-2 bg-muted rounded" : "p-2"
        }
      >
        <Bold className="w-5 h-5" />
      </button>

      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        className={
          editor.isActive("italic") ? "is-active p-2 bg-muted rounded" : "p-2"
        }
      >
        <Italic className="w-5 h-5" />
      </button>

      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={
          editor.isActive("heading", { level: 2 })
            ? "is-active p-2 bg-muted rounded"
            : "p-2"
        }
      >
        <Heading2 className="w-5 h-5" />
      </button>

      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={
          editor.isActive("bulletList")
            ? "is-active p-2 bg-muted rounded"
            : "p-2"
        }
      >
        <List className="w-5 h-5" />
      </button>

      <button
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={
          editor.isActive("blockquote")
            ? "is-active p-2 bg-muted rounded"
            : "p-2"
        }
      >
        <Quote className="w-5 h-5" />
      </button>
    </div>
  );
};
```

### Step 4: Main Component (`src/components/editor/BlogEditor.tsx`)

This is the brain of the editor. It initializes Tiptap and manages the state.

```typescript
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
    onUpdate: ({ editor }) => {
      const json = editor.getJSON();
      // TODO: Save 'json' to your state or send to backend
      console.log(json);
    },
  });

  return (
    <div className="w-full max-w-4xl mx-auto border rounded-xl shadow-sm bg-card min-h-[80vh]">
      <EditorToolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
};

export default BlogEditor;
```

### Step 5: Page Integration (`src/app/new-blog/page.tsx`)

Keep specific page logic here, but delegate the editor UI to `BlogEditor`.

```typescript
import BlogEditor from "@/components/editor/BlogEditor";

export default function NewBlogPage() {
  return (
    <main className="container mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6">Create New Story</h1>
      <BlogEditor />
    </main>
  );
}
```

---

## 5. Main Component: BlogEditor (Conceptual)

### Why BlogEditor is MAIN

- Holds `useEditor()` instance
- Controls editor lifecycle
- Reads editor JSON
- Sends data to backend

### Responsibilities

- Initialize Tiptap
- Pass editor to children
- Handle save / publish

### Rules

- ❌ No UI buttons here
- ❌ No page layout here
- ✅ Logic + orchestration only

---

## 6. Child Component: EditorToolbar (Conceptual)

### Purpose

- UI actions only
- No editor initialization

### Responsibilities

- Bold / Italic / List / Heading
- Image upload trigger
- YouTube embed trigger

### Rules

- ❌ No API calls directly
- ❌ No editor creation
- ✅ Only call `editor.chain()`

---

## 7. How Data Flows (End‑to‑End)

```
User types
  ↓
Tiptap Editor
  ↓ editor.getJSON()
BlogEditor
  ↓
blog.service.ts (frontend)
  ↓
NestJS Controller
  ↓
Prisma
  ↓
Neon DB (JSONB)
```

---

## 8. Blog Content Storage Format

### What to Store

- Store **Tiptap JSON**

### What NOT to Store

- ❌ HTML
- ❌ Markdown

### Reason

- AI-friendly
- Safe
- Re-renderable
- Versionable

---

## 9. Rendering Blog Post (Read Mode)

```
DB JSON
  ↓
JSON → HTML (Tiptap renderer)
  ↓
Public Blog Page (/blog/[slug])
```

---

## 10. How Many Components You Need (Answer)

### Minimum (Recommended)

```
1 Page Component
1 Main Component
1 Child Component
-----------------
TOTAL: 3 components
```

### With Advanced Features

```
BlogEditor (main)
├── EditorToolbar
├── EditorStatus (autosave)
├── EditorAIButton
└── EditorSlashMenu
-----------------
TOTAL: 5–6 components
```

---

## 11. Scaling Rules (VERY IMPORTANT)

- Add features as **child components**
- Never bloat `BlogEditor`
- Editor JSON is single source of truth

---

## 12. Industry Best Practice (Reality)

This structure is used by:

- Medium‑style editors
- Hashnode‑style platforms
- AI writing SaaS products

---

## 13. Final Summary

- BlogEditor = **brain**
- Toolbar = **hands**
- Page = **container**
- JSON = **truth**

You are building this **the correct, professional way**.

---

## 14. What to Build Next

Choose one:

1. Auto‑save drafts
2. Publish / unpublish flow
3. AI write & rewrite
4. Slash commands (/image, /h2)
5. Version history
