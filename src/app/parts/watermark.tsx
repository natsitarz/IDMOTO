export function Watermark() {
  return (
    <div
      id="watermark"
      className="fixed bottom-0 left-0 w-full p-2 text-sm text-gray-500 flex justify-end items-center animate-fade-in-scale z-50 bg-transparent pointer-events-none"
      style={{ backdropFilter: "blur(0.5px)" }}
    >
      <a
        href="https://natsitarz.tech"
        target="_blank"
        rel="noopener noreferrer"
        className="pointer-events-auto"
      >
        Powered by unleashed creativity
      </a>
    </div>
  );
}
