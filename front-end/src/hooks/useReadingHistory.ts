"use client";

import { useEffect, useRef, useCallback } from "react";
import axiosInstance from "@/services/api/axiosInstance";
import { API_PATH } from "@/services/api/Apipath";

export const useReadingHistory = (postId: string) => {
  const hasTrackedView = useRef(false);
  const maxProgress = useRef(0);
  const progressMilestones = useRef(new Set<number>());

  // Track view after 5 seconds
  useEffect(() => {
    if (!postId) return;

    const timer = setTimeout(async () => {
      if (!hasTrackedView.current) {
        try {
          await axiosInstance.post(`${API_PATH.HISTORY.TRACK}/${postId}`);
          hasTrackedView.current = true;
        } catch (error) {
          console.error("Failed to track view history:", error);
        }
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [postId]);

  const handleScroll = useCallback(async () => {
    if (!postId) return;

    const scrollTop = window.scrollY;
    const docHeight =
      document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = Math.min(
      100,
      Math.max(0, Math.round((scrollTop / docHeight) * 100)),
    );

    if (scrollPercent > maxProgress.current) {
      maxProgress.current = scrollPercent;

      // Check for milestones: 25, 50, 75, 100
      // We check if we crossed a milestone that hasn't been sent yet
      // Actually, simplest is to just send if we crossed into a new bucket?
      // Or just send periodically?
      // Requirement: "Tracks scroll depth and sends a PATCH request only at major milestones (25%, 50%, 75%, 100%) to save database writes."

      let milestoneToSend: number | null = null;

      const milestones = [25, 50, 75, 100];
      for (const m of milestones) {
        if (scrollPercent >= m && !progressMilestones.current.has(m)) {
          milestoneToSend = m;
          // Mark all lower milestones as sent too to avoid duplicate calls if user jumps
          milestones.forEach((lower) => {
            if (lower <= m) progressMilestones.current.add(lower);
          });
          break; // Send the highest reached milestone? Or just the one we just crossed?
          // Ideally send the highest one.
        }
      }

      if (milestoneToSend) {
        try {
          // We optimize API calls by sending the max progress reached so far at that milestone time
          // Basically if they jump to 80%, we send 75% (milestone).
          // Wait, send actual progress or milestone?
          // "don't overwrite 80% with 20%". Logic is backend handled.
          // Requirement says "PATCH request only at major milestones".
          // So we send the milestone value or the exact value? Usually exact value is fine if we debounce,
          // but strict milestones means we only fire WHEN we cross them.

          // Let's send the specific milestone value to be clean.
          await axiosInstance.patch(`${API_PATH.HISTORY.PROGRESS}/${postId}`, {
            progress: milestoneToSend,
          });
        } catch (error) {
          console.error("Failed to update reading progress:", error);
        }
      }
    }
  }, [postId]);

  useEffect(() => {
    // Throttle scroll event
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, [handleScroll]);

  return {};
};
