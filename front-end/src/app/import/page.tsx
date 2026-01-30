"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import ImportNavbar from "@/components/layout/ImportNavbar";
import StoriesService from "@/services/stories.service";
import Link from "next/link";

export default function ImportStoryPage() {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [importSuccess, setImportSuccess] = useState(false);
  const [importedData, setImportedData] = useState<any>(null);
  const router = useRouter();
  const { showError, showSuccess } = useToast();

  const handleImport = async () => {
    if (!url) {
      showError("Please enter a URL to import");
      return;
    }

    try {
      setIsLoading(true);
      const data = await StoriesService.importStory(url);
      console.log(data);
      if (data.success && data.data) {
        setImportedData(data.data);
        setImportSuccess(true);
        showSuccess("Story imported successfully");
      }
    } catch (error: any) {
      console.error("Import failed:", error);
      showError(error.message || "Failed to import story");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSeeStory = () => {
    if (importedData) {
      localStorage.setItem("import_draft", JSON.stringify(importedData));
      router.push("/new-blog");
    }
  };

  if (importSuccess && importedData) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <ImportNavbar />
        <div className="flex-1 flex flex-col items-center pt-20 px-4">
          <div className="max-w-3xl w-full text-center space-y-8 animate-in fade-in duration-500">
            <p className="text-gray-500 uppercase tracking-widest text-sm font-medium">
              Imported the story
            </p>

            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
              {importedData.title}
            </h1>

            <p className="text-gray-400 text-lg">
              from{" "}
              {importedData.siteName ||
                new URL(importedData.originalUrl).hostname}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-12 text-center">
              <div className="space-y-4">
                <div className="text-green-600 text-4xl font-bold">1.</div>
                <p className="text-gray-600 leading-relaxed">
                  Change your story as needed by selecting text and choosing
                  different formatting options.
                </p>
              </div>
              <div className="space-y-4">
                <div className="text-green-600 text-4xl font-bold">2.</div>
                <p className="text-gray-600 leading-relaxed">
                  Reformat images as needed by selecting them and choosing
                  different layout options.
                </p>
              </div>
              <div className="space-y-4">
                <div className="text-green-600 text-4xl font-bold">3.</div>
                <p className="text-gray-600 leading-relaxed">
                  Click Publish to share your story with the world (or just your
                  friends).
                </p>
              </div>
            </div>

            <div className="pb-12">
              <button
                onClick={handleSeeStory}
                className="px-8 py-3 rounded-full border border-green-600 text-green-600 hover:bg-green-600 hover:text-white transition-all duration-200 text-lg font-medium"
              >
                See your story
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <ImportNavbar />

      <div className="flex-1 flex flex-col items-center justify-center mt-20 px-4">
        <div className="max-w-2xl w-full text-center space-y-8">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 tracking-tight">
            See your story on Genwrite
          </h1>

          <p className="text-xl text-gray-500 max-w-lg mx-auto leading-relaxed">
            Import a story from anywhere on the internet to publish on your
            Genwrite account.
          </p>

          <div className="max-w-xl mx-auto w-full pt-4 space-y-6">
            <p className="text-sm text-gray-500 mb-2 text-center">
              Enter a link to your blog post/article/story/manifesto to import
              and share it on Genwrite.
            </p>

            <input
              type="url"
              placeholder="http://www.yoursite.org/your-post"
              className="w-full p-2 text-left text-lg border border-gray-300 rounded focus:outline-none focus:border-black transition-colors placeholder:text-gray-300"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleImport()}
            />

            <div className="flex justify-center pt-4">
              <button
                onClick={handleImport}
                disabled={isLoading}
                className={`
                  px-8 py-3 rounded-full border border-green-600 text-green-600 
                  hover:bg-green-600 hover:text-white transition-all duration-200
                  text-lg font-medium min-w-[140px]
                  ${isLoading ? "opacity-50 cursor-not-allowed" : ""}
                `}
              >
                {isLoading ? "Importing..." : "Import"}
              </button>
            </div>

            <p className="text-xs text-gray-400 pt-8 underline decoration-gray-300 underline-offset-4 cursor-pointer hover:text-gray-600">
              Please only import content that you own.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
