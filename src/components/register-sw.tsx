"use client";

import { useEffect } from "react";

export function RegisterServiceWorker() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
      navigator.serviceWorker.register(`${basePath}/sw.js`).catch(() => {
        // Installability degrades gracefully without a SW; not worth surfacing.
      });
    }
  }, []);

  return null;
}
