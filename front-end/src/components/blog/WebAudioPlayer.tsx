"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Play,
  Pause,
  Square,
  Settings2,
  Volume2,
  FastForward,
  RotateCcw,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface WebAudioPlayerProps {
  content: string;
  title: string;
}

const WebAudioPlayer: React.FC<WebAudioPlayerProps> = ({ content, title }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [rate, setRate] = useState(1);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string>("");
  const [showSettings, setShowSettings] = useState(false);

  const synth = useRef<SpeechSynthesis | null>(null);
  const utterance = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      synth.current = window.speechSynthesis;

      const loadVoices = () => {
        const availableVoices = window.speechSynthesis.getVoices();

        const filteredVoices = availableVoices.filter(
          (v) =>
            v.lang.startsWith("hi") ||
            v.lang.startsWith("en") ||
            v.lang.startsWith("gu"),
        );

        setVoices(filteredVoices);
        const defaultVoice =
          filteredVoices.find(
            (v) => v.name.includes("Google") && v.lang.startsWith("en"),
          ) ||
          filteredVoices.find((v) => v.lang.startsWith("en")) ||
          filteredVoices[0];

        if (defaultVoice) {
          setSelectedVoice(defaultVoice.name);
        }
      };

      loadVoices();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = loadVoices;
      }
    }

    return () => {
      if (synth.current) {
        synth.current.cancel();
      }
    };
  }, []);

  const cleanText = (content: string) => {
    try {
      const parsed = JSON.parse(content);
      if (parsed && typeof parsed === "object" && parsed.type === "doc") {
        const extractText = (node: any): string => {
          if (node.text) return node.text;
          if (node.content && Array.isArray(node.content)) {
            return node.content.map(extractText).join(" ");
          }
          return "";
        };
        return extractText(parsed);
      }
    } catch (e) {}

    if (typeof window !== "undefined") {
      const doc = new DOMParser().parseFromString(content, "text/html");
      return doc.body.textContent || "";
    }
    return content;
  };

  const handlePlay = () => {
    if (!synth.current) return;

    if (isPaused) {
      synth.current.resume();
      setIsPlaying(true);
      setIsPaused(false);
      return;
    }

    synth.current.cancel();

    const textToRead = `${title}. ${cleanText(content)}`;
    utterance.current = new SpeechSynthesisUtterance(textToRead);

    const voice = voices.find((v) => v.name === selectedVoice);
    if (voice) utterance.current.voice = voice;

    utterance.current.rate = rate;

    utterance.current.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };

    utterance.current.onerror = (event) => {
      console.error("SpeechSynthesisUtterance error", event);
      setIsPlaying(false);
      setIsPaused(false);
    };

    synth.current.speak(utterance.current);
    setIsPlaying(true);
    setIsPaused(false);
  };

  const handlePause = () => {
    if (synth.current && isPlaying) {
      synth.current.pause();
      setIsPlaying(false);
      setIsPaused(true);
    }
  };

  const handleStop = () => {
    if (synth.current) {
      synth.current.cancel();
      setIsPlaying(false);
      setIsPaused(false);
    }
  };

  const handleRateChange = () => {
    const rates = [1, 1.25, 1.5, 2];
    const currentIndex = rates.indexOf(rate);
    const nextRate = rates[(currentIndex + 1) % rates.length];
    setRate(nextRate);

    if (isPlaying || isPaused) {
      handleStop();
      setTimeout(handlePlay, 100);
    }
  };

  return (
    <div className="my-8 w-full max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-white/40 backdrop-blur-md border border-gray-200/50 p-4 shadow-sm"
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black text-white shadow-lg">
              <Volume2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                AI Voice Narrator
              </p>
              <h4 className="text-sm font-semibold text-gray-900 truncate max-w-[200px]">
                {isPlaying ? "Reading now..." : "Listen to this post"}
              </h4>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleStop}
              className="p-2 rounded-full hover:bg-gray-100 text-gray-600 transition-colors"
              title="Stop"
            >
              <Square className="h-5 w-5 fill-current" />
            </button>

            {isPlaying ? (
              <button
                onClick={handlePause}
                className="h-12 w-12 flex items-center justify-center rounded-full bg-gray-100 text-black hover:bg-gray-200 transition-all active:scale-95 shadow-sm"
                title="Pause"
              >
                <Pause className="h-6 w-6 fill-current" />
              </button>
            ) : (
              <button
                onClick={handlePlay}
                className="h-12 w-12 flex items-center justify-center rounded-full bg-black text-white hover:bg-gray-800 transition-all active:scale-95 shadow-lg"
                title="Play"
              >
                <Play className="h-6 w-6 fill-current ml-1" />
              </button>
            )}

            <div className="flex items-center gap-1 ml-2">
              <button
                onClick={handleRateChange}
                className="px-3 py-1.5 rounded-full bg-gray-100 text-xs font-bold text-gray-700 hover:bg-gray-200 transition-colors"
                title="Playback Speed"
              >
                {rate}x
              </button>

              <button
                onClick={() => setShowSettings(!showSettings)}
                className={`p-2 rounded-full transition-colors ${showSettings ? "bg-black text-white" : "hover:bg-gray-100 text-gray-600"}`}
                title="Settings"
              >
                <Settings2 className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {showSettings && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-4 pt-4 border-t border-gray-100">
                <label className="text-xs font-semibold text-gray-500 mb-2 block">
                  Language Voice (Hindi, English, Gujarati)
                </label>
                {voices.length > 0 ? (
                  <select
                    value={selectedVoice}
                    onChange={(e) => setSelectedVoice(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/5"
                  >
                    {voices.map((voice) => (
                      <option key={voice.name} value={voice.name}>
                        {voice.name.includes("Google") ? "✨ " : ""}
                        {voice.lang.startsWith("hi")
                          ? "🇮🇳 Hindi - "
                          : voice.lang.startsWith("gu")
                            ? "🇮🇳 Gujarati - "
                            : "🇺🇸 English - "}
                        {voice.name
                          .replace(/Google|Microsoft|Natural|Desktop/g, "")
                          .trim()}
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="text-xs text-red-500 italic">
                    No voices found for Hindi, English, or Gujarati on this
                    device.
                  </p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {isPlaying && (
          <motion.div
            className="absolute bottom-0 left-0 h-0.5 bg-black"
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{
              duration: cleanText(content).length / 15 / rate,
              ease: "linear",
            }}
          />
        )}
      </motion.div>
    </div>
  );
};

export default WebAudioPlayer;
