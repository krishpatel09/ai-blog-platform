"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ReactNode } from "react";

interface ActionTooltipProps {
  children: ReactNode;
  content: string;
}

export function ActionTooltip({ children, content }: ActionTooltipProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent side="top" className="bg-black text-white border-black">
        <p>{content}</p>
      </TooltipContent>
    </Tooltip>
  );
}
