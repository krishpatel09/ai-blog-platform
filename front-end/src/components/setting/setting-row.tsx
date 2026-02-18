"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ChevronRight } from "lucide-react";
import { useEffect } from "react";

interface SettingRowProps {
  label: string;
  description?: string;
  value: string | React.ReactNode;
  editTitle?: string;
  editDescription?: string;
  inputValue?: string;
  onSave?: (value: string) => Promise<void> | void;
  showInput?: boolean;
  readOnly?: boolean;
}

export function SettingRow({
  label,
  description,
  value,
  editTitle,
  editDescription,
  inputValue,
  onSave,
  showInput = true,
  readOnly = false,
}: SettingRowProps) {
  const [open, setOpen] = useState(false);
  const [tempValue, setTempValue] = useState(inputValue || "");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setTempValue(inputValue || "");
      setError(null);
    }
  }, [open, inputValue]);

  const handleSave = async () => {
    setError(null);
    if (onSave) {
      try {
        setIsLoading(true);
        await onSave(tempValue);
        setOpen(false);
      } catch (err: any) {
        console.error("SettingRow save error:", err);
        setError(err.response?.data?.message || "Failed to save.");
      } finally {
        setIsLoading(false);
      }
    } else {
      setOpen(false);
    }
  };

  const handleCancel = () => {
    setTempValue(inputValue || "");
    setError(null);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {readOnly ? (
        <div className="flex items-center justify-between py-6 border-b border-gray-200 last:border-b-0 px-4 -mx-4 rounded-lg">
          <div className="flex-1">
            <h3 className="font-medium text-gray-900 mb-1">{label}</h3>
            {description && (
              <p className="text-sm text-gray-600">{description}</p>
            )}
          </div>
          <div className="flex items-center gap-4">
            <div className="text-gray-700">{value}</div>
          </div>
        </div>
      ) : (
        <DialogTrigger asChild>
          <div className="flex items-center justify-between py-6 border-b border-gray-200 last:border-b-0 cursor-pointer hover:bg-gray-50 transition-colors px-4 -mx-4 rounded-lg">
            <div className="flex-1">
              <h3 className="font-medium text-gray-900 mb-1">{label}</h3>
              {description && (
                <p className="text-sm text-gray-600">{description}</p>
              )}
            </div>
            <div className="flex items-center gap-4">
              <div className="text-gray-700 hover:text-gray-900 transition-colors">
                {value}
              </div>
              <ChevronRight size={20} className="text-gray-400" />
            </div>
          </div>
        </DialogTrigger>
      )}
      {!readOnly && (
        <DialogContent className="sm:max-w-[500px] bg-white">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="text-2xl font-bold">
                {editTitle || label}
              </DialogTitle>
            </div>
            {editDescription && (
              <DialogDescription className="text-gray-600 pt-2">
                {editDescription}
              </DialogDescription>
            )}
          </DialogHeader>
          {showInput && (
            <div className="py-4">
              <Input
                value={tempValue}
                onChange={(e) => setTempValue(e.target.value)}
                className="w-full bg-white border-gray-200 focus:border-gray-400 transition-all font-medium"
                placeholder={`Enter ${label.toLowerCase()}`}
              />
              {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={handleCancel}
              className="rounded-full px-6"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isLoading || tempValue === (inputValue || "")}
              className="bg-green-600 hover:bg-green-700 text-white rounded-full px-6 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      )}
    </Dialog>
  );
}
