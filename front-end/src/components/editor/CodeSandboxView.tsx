import { NodeViewWrapper, NodeViewProps } from "@tiptap/react";
import { Code, Edit, Trash, Eye } from "lucide-react";
import { useState } from "react";
import { CodeSandboxModal } from "./CodeSandboxModal";

export const CodeSandboxView = (props: NodeViewProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const { html, css, js } = props.node.attrs;

  return (
    <NodeViewWrapper className="my-6">
      <div className="border rounded-lg overflow-hidden shadow-sm bg-white ring-1 ring-gray-200 selection:bg-none">
        {/* Header */}
        <div className="bg-gray-50 px-4 py-3 border-b flex items-center justify-between">
          <div className="flex items-center gap-2 text-gray-700">
            <Code className="w-5 h-5 text-blue-500" />
            <span className="font-semibold text-sm">
              HTML + CSS + JS Payload
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsPreviewOpen(!isPreviewOpen)}
              className={`p-1.5 rounded transition-colors ${
                isPreviewOpen
                  ? "bg-blue-100 text-blue-700"
                  : "text-gray-500 hover:bg-gray-200"
              }`}
              title="Toggle Live Preview"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="p-1.5 text-gray-500 hover:bg-gray-200 rounded"
              title="Edit Code"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={() => props.deleteNode()}
              className="p-1.5 text-red-500 hover:bg-red-50 rounded"
              title="Remove Block"
            >
              <Trash className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Preview (Collapsed) */}
        {!isPreviewOpen && (
          <div className="p-4 bg-gray-50/50 flex flex-col gap-2 font-mono text-xs text-gray-500">
            <div className="truncate">
              <span className="font-bold text-gray-700">HTML:</span>{" "}
              {html.slice(0, 50) || "Empty"}...
            </div>
            <div className="truncate">
              <span className="font-bold text-gray-700">CSS:</span>{" "}
              {css.slice(0, 50) || "Empty"}...
            </div>
            <div className="truncate">
              <span className="font-bold text-gray-700">JS:</span>{" "}
              {js.slice(0, 50) || "Empty"}...
            </div>
          </div>
        )}

        {/* Live Preview */}
        {isPreviewOpen && (
          <div className="h-64 border-t relative">
            <iframe
              title="embedded-preview"
              srcDoc={`
                <html>
                  <head><style>${css}</style></head>
                  <body>
                    ${html}
                    <script>${js}</script>
                  </body>
                </html>
              `}
              className="w-full h-full border-none"
              sandbox="allow-scripts"
            />
          </div>
        )}
      </div>

      {/* Editing Modal */}
      {isModalOpen && (
        <CodeSandboxModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          initialData={{ html, css, js }}
          onSave={(data) => {
            props.updateAttributes(data);
            setIsModalOpen(false);
          }}
        />
      )}
    </NodeViewWrapper>
  );
};
