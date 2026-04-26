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
  const mutateWatchProgressRef = useRef(watchProgress.mutate);

  useEffect(() => {
    mutateWatchProgressRef.current = watchProgress.mutate;
  }, [watchProgress.mutate]);

  const stopHeartbeat = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const sendHeartbeat = useCallback(() => {
    const player = playerRef.current;
    if (!player) return;

    const currentTimeSeconds = Math.max(0, Math.floor(player.getCurrentTime()));
    const duration = player.getDuration();
    const percentage =
      duration > 0 ? Math.min(100, Math.round((currentTimeSeconds / duration) * 100)) : 0;

    mutateWatchProgressRef.current({
      lesson_id: lessonId,
      percentage,
      current_time_seconds: currentTimeSeconds,
    });

    if (percentage >= 90 && !completedRef.current) {
      completedRef.current = true;
      stopHeartbeat();
      toast.success("Lesson complete!");
    }
  }, [lessonId, stopHeartbeat]);

  const startHeartbeat = useCallback(() => {
    stopHeartbeat();
    intervalRef.current = setInterval(() => {
      sendHeartbeat();
    }, 5000);
  }, [sendHeartbeat, stopHeartbeat]);

  useEffect(() => {
    completedRef.current = false;
  }, [lessonId, youtubeVideoId]);

  useEffect(() => {
    return () => {
      sendHeartbeat();
      stopHeartbeat();
    };
  }, [sendHeartbeat, stopHeartbeat]);

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
      sendHeartbeat();
      stopHeartbeat();
    }
  };

  const opts = {
    width: "100%",
    height: "100%",
    playerVars: {
      controls: 1 as const,
      enablejsapi: 1 as const,
      playsinline: 1 as const,
      rel: 0 as const,
      modestbranding: 1 as const,
      iv_load_policy: 3 as const,
      origin: window.location.origin,
    },
  };

  return (
    <div className="w-full aspect-video bg-black overflow-hidden">
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
