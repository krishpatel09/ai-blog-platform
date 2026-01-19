import { ChevronDown, Check } from "lucide-react";
import { useState, useRef, useEffect } from "react";

export interface DropdownOption {
  label: string;
  value: string;
  icon?: React.ReactNode;
  className?: string; // Allow custom styling for options
}

interface ToolbarDropdownProps {
  icon: React.ReactNode;
  label: string;
  options: DropdownOption[];
  activeValue?: string;
  onSelect: (value: string) => void;
  isActive: boolean;
  disabled?: boolean;
  showLabel?: boolean; // New prop to optionally show the label text
}

export const ToolbarDropdown = ({
  icon,
  label,
  options,
  activeValue,
  onSelect,
  isActive,
  disabled,
  showLabel = false,
}: ToolbarDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const baseBtn =
    "p-2 rounded flex items-center gap-1 transition-colors disabled:opacity-50 disabled:cursor-not-allowed";
  const activeBtn = "bg-black text-white hover:bg-gray-800";
  const inactiveBtn = "text-gray-600 hover:bg-gray-100 hover:text-black";

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        onMouseDown={(e) => {
          e.preventDefault();
          // Always allow toggling unless explicitly unwanted,
          // but for now we follow the permissive pattern.
          if (!disabled) setIsOpen(!isOpen);
        }}
        disabled={disabled}
        className={`${baseBtn} ${isActive ? activeBtn : inactiveBtn}`}
        title={label}
      >
        {icon}
        {showLabel && <span className="text-sm font-medium">{label}</span>}
        <ChevronDown className="w-3 h-3 opacity-60" />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-56 bg-white rounded-lg shadow-xl border border-gray-100 ring-1 ring-black/5 focus:outline-none animate-in fade-in zoom-in-95 duration-100 origin-top-left overflow-hidden">
          <div className="p-1">
            {options.map((option) => {
              const isSelected = activeValue === option.value;
              return (
                <button
                  key={option.value}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    onSelect(option.value);
                    setIsOpen(false);
                  }}
                  className={`flex items-center w-full px-3 py-2 text-sm text-left gap-3 rounded-md transition-colors
                    ${
                      isSelected
                        ? "bg-gray-100 text-gray-900 font-medium"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }
                  `}
                >
                  {/* Icon Container */}
                  <span
                    className={`flex items-center justify-center w-5 h-5 ${
                      isSelected ? "text-gray-900" : "text-gray-400"
                    }`}
                  >
                    {option.icon}
                  </span>

                  <span className={`flex-1 truncate ${option.className || ""}`}>
                    {option.label}
                  </span>

                  {isSelected && <Check className="w-4 h-4 text-gray-900" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
