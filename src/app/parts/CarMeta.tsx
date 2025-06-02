import {
  Document,
  Image,
  Page,
  PDFDownloadLink,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import { QRCodeSVG } from "qrcode.react";
import { useRef, useState } from "react";

const styles = StyleSheet.create({
  page: {
    backgroundColor: "#111216",
    width: 120,
    height: 180,
    padding: 0,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "flex-start",
    position: "relative",
  },
  border: {
    position: "absolute",
    top: 0,
    left: 0,
    width: 120,
    height: 180,
    border: "1 solid #2d3a53",
  },
  logo: {
    width: 64,
    height: 24,
    marginTop: 14,
    marginBottom: 10,
    alignSelf: "center",
    opacity: 0.92,
  },
  qrBox: {
    backgroundColor: "#181a20",
    border: "1 solid #232b38",
    width: 66,
    height: 66,
    alignSelf: "center",
    marginBottom: 12,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    boxShadow: "0 2px 12px #0004",
  },
  qrImg: {
    width: 66,
    height: 66,
    alignSelf: "center",
  },
  label: {
    color: "#3b82f6",
    fontSize: 12,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 3,
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  carName: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 6,
    letterSpacing: 0.8,
  },
  user: {
    color: "#b3b3b3",
    fontSize: 9,
    textAlign: "center",
    marginTop: 4,
    letterSpacing: 0.3,
  },
});

function StickerPDF({
  car,
  qrPngUrl,
  logoUrl,
}: {
  car: any;
  qrPngUrl: string;
  logoUrl: string;
}) {
  return (
    <Document>
      <Page size={[120, 180]} style={styles.page}>
        <View style={styles.border} fixed />
        <Image src={logoUrl} style={styles.logo} />
        <View style={styles.qrBox}>
          <Image src={qrPngUrl} style={styles.qrImg} />
        </View>
        <Text style={styles.label}>SCAN TO VIEW</Text>
        <Text style={styles.carName}>
          {car.manufacturer} {car.model}
        </Text>
        <Text style={styles.user}>{car.user}</Text>
      </Page>
    </Document>
  );
}

export default function CarMeta({ car, user }: { car: any; user: any }) {
  const qrRef = useRef<SVGSVGElement>(null);
  const [qrPngUrl, setQrPngUrl] = useState<string | null>(null);
  const logoUrl = "/logo.png"; // <-- podmień na swoją ścieżkę do logo PNG

  // Convert SVG QR to PNG DataURL for react-pdf
  const handleGeneratePDF = () => {
    const svg = qrRef.current;
    if (!svg) return;
    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svg);
    const svg64 = btoa(unescape(encodeURIComponent(svgString)));
    const imageSrc = "data:image/svg+xml;base64," + svg64;

    const img = new window.Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 440;
      canvas.height = 440;
      const ctx = canvas.getContext("2d");
      ctx?.drawImage(img, 0, 0, 440, 440);
      setQrPngUrl(canvas.toDataURL("image/png"));
    };
    img.src = imageSrc;
  };

  return (
    <div className="w-full flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center gap-2">
        <p className="text-sm text-zinc-400">
          Added by{" "}
          <a
            href={`/profile?uid=${car.userID}`}
            className="text-blue-400 hover:underline font-medium"
          >
            {car.user || "Unknown User"}
          </a>
        </p>
        {user?.uid === car.userID && (
          <span className="text-xs bg-zinc-800/60 text-zinc-300 px-3 py-1 rounded-full font-mono tracking-wide">
            Car ID: {car.id}
          </span>
        )}
      </div>
      <div className="flex flex-col gap-4 items-center bg-white/5 rounded-xl p-4 shadow-inner">
        <p className="font-semibold text-zinc-200">Vehicle QR Code</p>
        <div style={{ position: "relative" }}>
          <QRCodeSVG
            ref={qrRef as any}
            value={`${window.location.origin}/car?id=${car.id}`}
            size={120}
            bgColor="#fff"
            fgColor="#000"
            level="H"
          />
        </div>
        {user?.uid === car.userID &&
          (qrPngUrl ? (
            <PDFDownloadLink
              document={
                <StickerPDF car={car} qrPngUrl={qrPngUrl} logoUrl={logoUrl} />
              }
              fileName={`car-sticker-${car.id}.pdf`}
              className="flex gap-2 cursor-pointer border border-zinc-700 hover:bg-zinc-800 transition px-4 py-2 rounded-lg text-xs uppercase tracking-widest font-bold bg-zinc-900"
            >
              {({ loading }) =>
                loading ? "Generating PDF..." : "Download sticker PDF"
              }
            </PDFDownloadLink>
          ) : (
            <button
              className="flex gap-2 cursor-pointer border border-zinc-700 hover:bg-zinc-800 transition px-4 py-2 rounded-lg text-xs uppercase tracking-widest font-bold bg-zinc-900"
              onClick={handleGeneratePDF}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Get sticker
            </button>
          ))}
      </div>
    </div>
  );
}
