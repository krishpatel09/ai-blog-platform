"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  X,
  Image as ImageIcon,
  Sparkles,
  Video,
  Bold,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Heading2,
  Quote,
  Code,
  FileImage,
  Zap,
  MoreHorizontal,
  Save,
  RotateCcw,
} from "lucide-react";

export default function NewBlogPage() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b">
        <div className="max-w-7xl mx-auto flex items-center justify-between h-14 px-4">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-(--color-blogane-yellow) rounded flex items-center justify-center text-black font-bold font-serif text-xl">
                Ai
              </div>
              <span className="text-xl font-bold tracking-tight">Genwrite</span>
            </Link>
          </div>

          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-2">
            <button className="text-sm text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded hover:bg-gray-100 transition-colors">
              Edit
            </button>
            <button className="text-sm text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded hover:bg-gray-100 transition-colors">
              Preview
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button className="p-2 hover:bg-gray-100 rounded transition-colors">
              <X size={20} className="text-gray-600" />
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto flex gap-6 p-6">
        {/* Main Editor */}
        <div className="flex-1 max-w-3xl">
          {/* Cover Image Options */}
          <div className="flex gap-3 mb-6">
            <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2">
              <FileImage size={16} />
              Upload Cover Image
            </button>
            <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2">
              <Sparkles size={16} />
              Generate Image
            </button>
            <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2">
              <Video size={16} />
              Cover Video Link
            </button>
          </div>

          {/* Title Input */}
          <textarea
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="New post title here..."
            className="w-full text-5xl font-bold text-gray-900 placeholder-gray-400 outline-none resize-none mb-4"
            rows={2}
            style={{ lineHeight: "1.2" }}
          />

          {/* Tags Input */}
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="Add up to 4 tags..."
            className="w-full text-sm text-gray-600 placeholder-gray-400 outline-none mb-6 pb-2"
          />

          {/* Toolbar */}
          <div className="flex items-center gap-1 mb-4 pb-4 border-b">
            <button
              className="p-2 hover:bg-gray-100 rounded transition-colors"
              title="Bold"
            >
              <Bold size={18} className="text-gray-600" />
            </button>
            <button
              className="p-2 hover:bg-gray-100 rounded transition-colors"
              title="Italic"
            >
              <Italic size={18} className="text-gray-600" />
            </button>
            <button
              className="p-2 hover:bg-gray-100 rounded transition-colors"
              title="Link"
            >
              <LinkIcon size={18} className="text-gray-600" />
            </button>
            <button
              className="p-2 hover:bg-gray-100 rounded transition-colors"
              title="Ordered List"
            >
              <ListOrdered size={18} className="text-gray-600" />
            </button>
            <button
              className="p-2 hover:bg-gray-100 rounded transition-colors"
              title="Unordered List"
            >
              <List size={18} className="text-gray-600" />
            </button>
            <button
              className="p-2 hover:bg-gray-100 rounded transition-colors"
              title="Heading"
            >
              <Heading2 size={18} className="text-gray-600" />
            </button>
            <button
              className="p-2 hover:bg-gray-100 rounded transition-colors"
              title="Quote"
            >
              <Quote size={18} className="text-gray-600" />
            </button>
            <button
              className="p-2 hover:bg-gray-100 rounded transition-colors"
              title="Code"
            >
              <Code size={18} className="text-gray-600" />
            </button>
            <button
              className="p-2 hover:bg-gray-100 rounded transition-colors"
              title="Code Block"
            >
              <FileImage size={18} className="text-gray-600" />
            </button>
            <button
              className="p-2 hover:bg-gray-100 rounded transition-colors"
              title="Embed"
            >
              <Zap size={18} className="text-gray-600" />
            </button>
            <button
              className="p-2 hover:bg-gray-100 rounded transition-colors"
              title="Upload Image"
            >
              <ImageIcon size={18} className="text-gray-600" />
            </button>
            <button
              className="p-2 hover:bg-gray-100 rounded transition-colors"
              title="More"
            >
              <MoreHorizontal size={18} className="text-gray-600" />
            </button>
          </div>

          {/* Content Editor */}
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your post content here..."
            className="w-full min-h-[400px] text-lg text-gray-700 placeholder-gray-400 outline-none resize-none leading-relaxed"
          />

          {/* Bottom Actions */}
          <div className="flex items-center gap-3 mt-8 pt-6 border-t">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-6">
              Publish
            </Button>
            <Button
              variant="outline"
              className="rounded-lg px-6 flex items-center gap-2"
            >
              <Save size={16} />
              Save draft
            </Button>
            <Button
              variant="ghost"
              className="rounded-lg px-4 flex items-center gap-2 text-gray-600"
            >
              <RotateCcw size={16} />
              Revert new changes
            </Button>
          </div>
        </div>

        {/* Vertical Separator */}
        <div className="hidden lg:block w-px bg-gray-200 shrink-0 mx-6 h-[calc(100vh-8rem)]" />

        {/* Publishing Tips Sidebar */}
        <aside className="hidden lg:block w-80 shrink-0">
          <div className="sticky top-20">
            <h3 className="font-bold text-gray-900 mb-4">Publishing Tips</h3>
            <ul className="space-y-4 text-sm text-gray-700 leading-relaxed">
              <li className="flex gap-2">
                <span className="text-gray-400 shrink-0">•</span>
                <span>
                  Ensure your post has a cover image set to make the most of the
                  home feed and social media platforms.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-gray-400 shrink-0">•</span>
                <span>
                  Share your post on social media platforms or with your
                  co-workers or local communities.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-gray-400 shrink-0">•</span>
                <span>
                  Ask people to leave questions for you in the comments. It's a
                  great way to spark additional discussion describing personally
                  why you wrote it or why people might find it helpful.
                </span>
              </li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
