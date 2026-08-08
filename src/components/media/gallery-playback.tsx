"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type GalleryPlaybackProps = {
  id: string;
  autoplay: boolean;
};

type GalleryPlaybackContextValue = {
  playingId: string | null;
  play: (id: string) => void;
  pause: (id: string) => void;
  toggle: (id: string) => void;
};

const GalleryPlaybackContext = createContext<GalleryPlaybackContextValue | null>(null);

export function GalleryPlaybackProvider({
  children,
  initialPlayingId = null,
}: {
  children: ReactNode;
  initialPlayingId?: string | null;
}) {
  const [playingId, setPlayingId] = useState<string | null>(initialPlayingId);

  const play = useCallback((id: string) => {
    setPlayingId(id);
  }, []);

  const pause = useCallback((id: string) => {
    setPlayingId((current) => (current === id ? null : current));
  }, []);

  const toggle = useCallback((id: string) => {
    setPlayingId((current) => (current === id ? null : id));
  }, []);

  const value = useMemo(
    () => ({ playingId, play, pause, toggle }),
    [playingId, play, pause, toggle],
  );

  return (
    <GalleryPlaybackContext.Provider value={value}>{children}</GalleryPlaybackContext.Provider>
  );
}

export function useGalleryPlayback() {
  const ctx = useContext(GalleryPlaybackContext);
  if (!ctx) {
    throw new Error("useGalleryPlayback must be used within GalleryPlaybackProvider");
  }
  return ctx;
}
