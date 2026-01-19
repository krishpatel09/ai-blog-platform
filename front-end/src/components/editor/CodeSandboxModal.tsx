import { useState, useEffect } from "react";
import { X, Play, Save } from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";

export interface SandboxData {
  html: string;
  css: string;
  js: string;
}

interface CodeSandboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: SandboxData) => void;
  initialData?: SandboxData;
}

export const CodeSandboxModal = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}: CodeSandboxModalProps) => {
  const [data, setData] = useState<SandboxData>({
    html: "",
    css: "",
    js: "",
  });

  const [activeTab, setActiveTab] = useState<"html" | "css" | "js">("html");

  useEffect(() => {
    if (isOpen && initialData) {
      setData(initialData);
    } else if (isOpen) {
      setData({ html: "", css: "", js: "" });
    }
  }, [isOpen, initialData]);

  const generatePreview = () => {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>${data.css}</style>
        </head>
        <body>
          ${data.html}
          <script>
            try {
              ${data.js}
            } catch (err) {
              console.error(err);
            }
          </script>
        </body>
      </html>
    `;
  };

  if (!isOpen) return null;

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50 transition-opacity animate-in fade-in" />
        <Dialog.Content className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl h-[85vh] flex flex-col animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold">Code Sandbox</h2>
                <div className="flex bg-gray-100 rounded p-1 ml-4">
                  {(["html", "css", "js"] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                        activeTab === tab
                          ? "bg-white shadow text-black"
                          : "text-gray-500 hover:text-black"
                      }`}
                    >
                      {tab.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Split View */}
            <div className="flex-1 flex overflow-hidden">
              {/* Editor Pane */}
              <div className="w-1/2 flex flex-col border-r">
                <textarea
                  className="flex-1 w-full p-4 font-mono text-sm resize-none focus:outline-none bg-gray-50"
                  placeholder={`Write your ${activeTab.toUpperCase()} here...`}
                  value={data[activeTab]}
                  onChange={(e) =>
                    setData((prev) => ({
                      ...prev,
                      [activeTab]: e.target.value,
                    }))
                  }
                />
              </div>

              {/* Preview Pane */}
              <div className="w-1/2 flex flex-col bg-white">
                <div className="bg-gray-50 border-b px-4 py-2 flex justify-between items-center">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Preview
                  </span>
                </div>
                <iframe
                  title="preview"
                  srcDoc={generatePreview()}
                  className="flex-1 w-full border-none"
                  sandbox="allow-scripts"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t flex justify-end gap-2 bg-gray-50 rounded-b-lg">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-md font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onSave(data);
                  onClose();
                }}
                className="px-4 py-2 bg-black text-white rounded-md font-medium hover:bg-gray-800 flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Save & Insert
              </button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
