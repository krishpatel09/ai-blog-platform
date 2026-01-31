import { useState, useEffect, useRef, useCallback } from "react";
import axiosInstance from "@/services/api/axiosInstance";
import { API_PATH } from "@/services/api/Apipath";
import { X, Loader2, Plus } from "lucide-react";

interface Tag {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

interface BlogMetaInputProps {
  title: string;
  setTitle: (title: string) => void;
  tags: string[];
  setTags: (tags: string[]) => void;
  isPreviewMode: boolean;
  setActiveHelper: (helper: "title" | "tags") => void;
}

export default function BlogMetaInput({
  title,
  setTitle,
  tags,
  setTags,
  isPreviewMode,
  setActiveHelper,
}: BlogMetaInputProps) {
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [isLoadingTags, setIsLoadingTags] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  // Inline creation states
  const [showInlineCreate, setShowInlineCreate] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [newTagDescription, setNewTagDescription] = useState("");
  const [isCreatingTag, setIsCreatingTag] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const fetchTags = useCallback(async () => {
    try {
      setIsLoadingTags(true);
      const response = await axiosInstance.get(API_PATH.TAGS.GET_ALL);
      setAvailableTags(response.data);
    } catch (error) {
      console.error("Failed to fetch tags:", error);
    } finally {
      setIsLoadingTags(false);
    }
  }, []);

  useEffect(() => {
    fetchTags();
  }, [fetchTags]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
        setShowInlineCreate(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleAddTag = (tag: Tag) => {
    if (tags.length < 4 && !tags.includes(tag.name)) {
      const newTags = [...tags, tag.name];
      setTags(newTags);
      setSearchQuery("");
      if (newTags.length >= 4) {
        setShowDropdown(false);
      }
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleCreateTag = async () => {
    if (!newTagName.trim()) return;

    try {
      setIsCreatingTag(true);
      await axiosInstance.post(API_PATH.TAGS.CREATE, {
        name: newTagName,
        description: newTagDescription,
      });

      await fetchTags();
      if (tags.length < 4 && !tags.includes(newTagName)) {
        setTags([...tags, newTagName]);
      }

      setNewTagName("");
      setNewTagDescription("");
      setShowInlineCreate(false);
    } catch (error) {
      console.error("Failed to create tag:", error);
    } finally {
      setIsCreatingTag(false);
    }
  };

  const filteredTags = availableTags.filter(
    (tag) =>
      tag.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !tags.includes(tag.name),
  );

  return (
    <>
      {/* Title - Edit vs Preview */}
      {isPreviewMode ? (
        <h1 className="text-5xl font-bold text-gray-900 mb-4 leading-tight tracking-tight">
          {title || "Untitled Post"}
        </h1>
      ) : (
        <textarea
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onFocus={() => setActiveHelper("title")}
          placeholder="New post title here..."
          className="w-full text-5xl font-bold text-gray-900 placeholder-gray-400 outline-none resize-none mb-4"
          rows={2}
          style={{ lineHeight: "1.2" }}
        />
      )}

      {/* Tags - Edit vs Preview */}
      {isPreviewMode ? (
        <div className="flex flex-wrap gap-2 mb-8">
          {tags.map((tag, i) => (
            <span
              key={i}
              className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
            >
              #{tag}
            </span>
          ))}
        </div>
      ) : (
        <div className="relative mb-6">
          <div className="flex flex-wrap gap-2 mb-2">
            {tags.map((tag, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
              >
                #{tag}
                <button
                  onClick={() => handleRemoveTag(tag)}
                  className="hover:text-red-500 transition-colors"
                >
                  <X size={14} />
                </button>
              </span>
            ))}
          </div>

          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowDropdown(true);
            }}
            onFocus={() => {
              setActiveHelper("tags");
              setShowDropdown(true);
            }}
            placeholder={
              tags.length >= 4 ? "Max tags reached" : "Add up to 4 tags..."
            }
            disabled={tags.length >= 4}
            className="w-full text-sm text-gray-600 placeholder-gray-400 outline-none pb-2 border-b border-gray-200 focus:border-gray-400 transition-colors"
          />

          {showDropdown && (
            <div
              ref={dropdownRef}
              className="absolute top-full left-0 z-50 w-full max-w-md bg-white rounded-lg shadow-lg border border-gray-100 mt-1 max-h-60 overflow-y-auto"
            >
              <div className="sticky top-0 z-10 bg-white p-3 border-b border-gray-100 flex items-center justify-between">
                <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                  Top tags
                </h4>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowInlineCreate(!showInlineCreate);
                  }}
                  className="p-1 bg-gray-100 hover:bg-gray-200 rounded text-gray-600 transition-colors"
                  title={showInlineCreate ? "Close" : "Create new tag"}
                >
                  {showInlineCreate ? <X size={14} /> : <Plus size={14} />}
                </button>
              </div>

              {showInlineCreate && (
                <div className="p-3 bg-gray-50 border-b border-gray-100">
                  <div className="flex flex-col gap-2">
                    <input
                      type="text"
                      value={newTagName}
                      onChange={(e) => setNewTagName(e.target.value)}
                      placeholder="Tag Name"
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 bg-white"
                      autoFocus
                      onClick={(e) => e.stopPropagation()}
                    />
                    <input
                      type="text"
                      value={newTagDescription}
                      onChange={(e) => setNewTagDescription(e.target.value)}
                      placeholder="Description (Optional)"
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 bg-white"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div className="flex justify-end gap-2 mt-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowInlineCreate(false);
                          setNewTagName("");
                          setNewTagDescription("");
                        }}
                        className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-200 rounded transition-colors"
                      >
                        Close
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCreateTag();
                        }}
                        disabled={isCreatingTag || !newTagName.trim()}
                        className="px-3 py-1.5 text-xs font-medium bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 flex items-center gap-1 transition-colors"
                      >
                        {isCreatingTag && (
                          <Loader2 size={12} className="animate-spin" />
                        )}
                        Add
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {isLoadingTags ? (
                <div className="p-4 flex justify-center">
                  <Loader2 className="animate-spin text-gray-400" size={20} />
                </div>
              ) : filteredTags.length > 0 ? (
                <div className="divide-y divide-gray-50">
                  {filteredTags.map((tag) => (
                    <button
                      key={tag.id}
                      onClick={() => handleAddTag(tag)}
                      disabled={tags.includes(tag.name)}
                      className="w-full text-left p-3 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed group"
                    >
                      <div className="font-bold text-gray-900 group-hover:text-black">
                        #{tag.name}
                      </div>
                      {tag.description && (
                        <div className="text-sm text-gray-500 mt-0.5 line-clamp-2">
                          {tag.description}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center">
                  <p className="text-sm text-gray-500 mb-2">
                    No tags found matching "{searchQuery}"
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </>
  );
}
