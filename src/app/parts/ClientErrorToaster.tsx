"use client";
import { useEffect, useState } from "react";
import ErrorWrapper from "./ErrorWrapper";

export default function ClientErrorToaster() {
  const [message, setMessage] = useState<string | null>(null);
  const [type, setType] = useState<"error" | "success">("error");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const errorHandler = (e: CustomEvent) => {
      setMessage(e.detail);
      setType("error");
      setVisible(true);
    };
    const successHandler = (e: CustomEvent) => {
      setMessage(e.detail);
      setType("success");
      setVisible(true);
    };
    window.addEventListener("show-global-error", errorHandler as EventListener);
    window.addEventListener(
      "show-global-success",
      successHandler as EventListener
    );
    return () => {
      window.removeEventListener(
        "show-global-error",
        errorHandler as EventListener
      );
      window.removeEventListener(
        "show-global-success",
        successHandler as EventListener
      );
    };
  }, []);

  useEffect(() => {
    if (!message) return;
    setVisible(true);
    const timer = setTimeout(() => setVisible(false), 3500);
    const clearTimer = setTimeout(() => setMessage(null), 4000);
    return () => {
      clearTimeout(timer);
      clearTimeout(clearTimer);
    };
  }, [message]);

  return (
    <ErrorWrapper
      message={message}
      type={type}
      onClose={() => setVisible(false)}
      className={
        visible
          ? "opacity-100 transition-opacity duration-300"
          : "opacity-0 transition-opacity duration-500"
      }
    />
  );
}
