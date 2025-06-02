import { useEffect } from "react";

export function useShowMainDom(trigger: any) {
  useEffect(() => {
    if (trigger) {
      document.getElementById("profile")?.style.setProperty("display", "grid");
      document.getElementById("watermark")?.style.setProperty("display", "flex");
      document.getElementById("navbar")?.style.setProperty("display", "flex");
    }
  }, [trigger]);
}