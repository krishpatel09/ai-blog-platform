interface HelperItem {
  title: string;
  items: string[];
}

interface BlogSidebarProps {
  activeHelper: "default" | "title" | "tags" | "editor";
  validationErrors?: string[];
}

const helperContent: Record<string, HelperItem> = {
  default: {
    title: "Publishing Tips",
    items: [
      "Ensure your post has a cover image set to make the most of the home feed and social media platforms.",
      "Share your post on social media platforms or with your co-workers or local communities.",
      "Ask people to leave questions for you in the comments. It's a great way to spark additional discussion.",
    ],
  },
  title: {
    title: "Writing a Great Post Title",
    items: [
      "Think of your title as a short hook that captures attention immediately.",
      "Use strong keywords that people might search for.",
      "Keep it clear and concise—usually under 60 characters works best.",
    ],
  },
  tags: {
    title: "Tagging Guidelines",
    items: [
      "Tags help people find your post on Genwrite.",
      "Add up to 4 tags to categorize your content effectively.",
      "Use existing tags whenever possible to reach established communities.",
    ],
  },
  editor: {
    title: "Editor Basics",
    items: [
      "Use Markdown shortcuts like # for headings and * for bullets.",
      "Highlight text to see the formatting toolbar.",
      "Type ':' to open the emoji picker or '/' for commands.",
      "Drag and drop images directly into the editor.",
    ],
  },
};

export default function BlogSidebar({
  activeHelper,
  validationErrors,
}: BlogSidebarProps) {
  return (
    <aside className="hidden lg:block w-80 shrink-0">
      <div className="sticky top-20 text-balance space-y-6">
        {validationErrors && validationErrors.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 animate-in fade-in slide-in-from-top-4">
            <h3 className="text-red-800 font-semibold mb-2 flex items-center gap-2">
              Please fix the following:
            </h3>
            <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
              {validationErrors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}
        <div
          key={activeHelper}
          className="animate-in fade-in slide-in-from-top-8 duration-200"
        >
          <h3 className="font-bold text-gray-900 mb-4 transition-colors">
            {helperContent[activeHelper]?.title || helperContent.default.title}
          </h3>
          <ul className="space-y-4 text-sm text-gray-700 leading-relaxed">
            {(
              helperContent[activeHelper]?.items || helperContent.default.items
            ).map((item, index) => (
              <li key={index} className="flex gap-2">
                <span className="text-gray-400 shrink-0">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </aside>
  );
}
