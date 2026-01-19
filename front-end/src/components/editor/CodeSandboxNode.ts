import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { CodeSandboxView } from "./CodeSandboxView";

export const CodeSandboxNode = Node.create({
  name: "codeSandbox",

  group: "block",

  atom: true,

  addAttributes() {
    return {
      html: {
        default: "",
      },
      css: {
        default: "",
      },
      js: {
        default: "",
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: "code-sandbox",
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ["code-sandbox", mergeAttributes(HTMLAttributes)];
  },

  addNodeView() {
    return ReactNodeViewRenderer(CodeSandboxView);
  },
});
