import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Image from "@tiptap/extension-image";
import BulletList from "@tiptap/extension-bullet-list";
import OrderedList from "@tiptap/extension-ordered-list";
import ListItem from "@tiptap/extension-list-item";
import { CodeSandboxNode } from "./CodeSandboxNode";
import Emoji from "@tiptap/extension-emoji";
import Highlight from "@tiptap/extension-highlight";

export const extensions = [
  StarterKit.configure({
    heading: {
      levels: [1, 2, 3, 4, 5],
    },
    // We will use custom configured lists
    bulletList: false,
    orderedList: false,
    listItem: false,
    // Disable default codeBlock to avoid confusion if we want only Sandbox
    codeBlock: false,
  }),
  Placeholder.configure({
    placeholder: "Tell your story...",
  }),
  Image,
  ListItem,
  CodeSandboxNode,
  Emoji,
  BulletList.configure({
    HTMLAttributes: {
      class: "list-disc ml-4 space-y-1",
    },
    keepAttributes: true,
    keepMarks: true,
  }).extend({
    addAttributes() {
      return {
        listStyleType: {
          default: "disc",
          parseHTML: (element) => element.style.listStyleType || "disc",
          renderHTML: (attributes) => ({
            style: `list-style-type: ${attributes.listStyleType}`,
          }),
        },
      };
    },
  }),
  OrderedList.configure({
    HTMLAttributes: {
      class: "list-decimal ml-4 space-y-1",
    },
    keepAttributes: true,
    keepMarks: true,
  }).extend({
    addAttributes() {
      return {
        listStyleType: {
          default: "decimal",
          parseHTML: (element) => element.style.listStyleType || "decimal",
          renderHTML: (attributes) => ({
            style: `list-style-type: ${attributes.listStyleType}`,
          }),
        },
      };
    },
  }),
  Highlight.configure({ multicolor: true }),
];
