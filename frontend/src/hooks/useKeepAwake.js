import { useEffect, useRef } from "react";

export default function useKeepAwake(active) {
  const wakeLockRef = useRef(null);

  useEffect(() => {
    if (!active) return;

    const requestWakeLock = async () => {
      try {
        if ("wakeLock" in navigator && !wakeLockRef.current) {
          wakeLockRef.current = await navigator.wakeLock.request("screen");

          wakeLockRef.current.addEventListener("release", () => {
            wakeLockRef.current = null;
          });

        }
      } catch (err) {
        console.error("Wake lock error:", err);
      }
    };

    const releaseWakeLock = async () => {
      if (wakeLockRef.current) {
        await wakeLockRef.current.release();
        wakeLockRef.current = null;
      }
    };

    requestWakeLock();

    const handleVisibility = () => {
      if (document.visibilityState === "visible" && active) {
        requestWakeLock();
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      releaseWakeLock();
    };
  }, [active]);
}