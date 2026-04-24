import { useCallback, useEffect, useRef } from "react";
import YouTube from "react-youtube";
import { toast } from "sonner";
import { useWatchProgress } from "../../hooks/useProgress";

interface YTPlayer {
  getCurrentTime(): number;
  getDuration(): number;
  seekTo(seconds: number, allowSeekAhead: boolean): void;
}

interface YTEvent {
  target: YTPlayer;
  data: number;
}

interface VideoPlayerProps {
  lessonId: string;
  youtubeVideoId: string;
  resumeAtSeconds?: number;
}

const PLAYER_STATE_PLAYING = 1;

export function VideoPlayer({ lessonId, youtubeVideoId, resumeAtSeconds = 0 }: VideoPlayerProps) {
  const playerRef = useRef<YTPlayer | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const completedRef = useRef(false);
  const watchProgress = useWatchProgress();

  const stopHeartbeat = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const startHeartbeat = useCallback(() => {
    stopHeartbeat();
    intervalRef.current = setInterval(() => {
      const player = playerRef.current;
      if (!player || completedRef.current) return;

      const duration = player.getDuration();
      if (duration <= 0) return;

      const current = player.getCurrentTime();
      const percentage = Math.min(100, Math.round((current / duration) * 100));

      watchProgress.mutate({ lesson_id: lessonId, percentage });

      if (percentage >= 90) {
        completedRef.current = true;
        stopHeartbeat();
        toast.success("Lesson complete!");
      }
    }, 5000);
  }, [lessonId, watchProgress, stopHeartbeat]);

  useEffect(() => {
    return () => stopHeartbeat();
  }, [stopHeartbeat]);

  const handleReady = (e: YTEvent) => {
    playerRef.current = e.target;
    if (resumeAtSeconds > 0) {
      e.target.seekTo(resumeAtSeconds, true);
    }
  };

  const handleStateChange = (e: YTEvent) => {
    if (e.data === PLAYER_STATE_PLAYING) {
      startHeartbeat();
    } else {
      stopHeartbeat();
    }
  };

  const opts = {
    width: "100%",
    height: "100%",
    playerVars: {
      controls: 1 as const,
      rel: 0 as const,
      modestbranding: 1 as const,
      iv_load_policy: 3 as const,
    },
  };

  return (
    <div className="w-full aspect-video bg-black">
      <YouTube
        videoId={youtubeVideoId}
        opts={opts}
        className="w-full h-full"
        iframeClassName="w-full h-full"
        onReady={(e) => handleReady(e as unknown as YTEvent)}
        onStateChange={(e) => handleStateChange(e as unknown as YTEvent)}
      />
    </div>
  );
}
