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
    backgroundColor: "#000000",
    width: 280,
    height: 160,
    padding: 0,
    display: "flex",
    flexDirection: "row",
    position: "relative",
  },
  // Main gradient background
  gradientBg: {
    position: "absolute",
    top: 0,
    left: 0,
    width: 280,
    height: 160,
    backgroundColor: "#000000",
    background:
      "linear-gradient(135deg, #1a1a2e 0%, #16213e 30%, #0f172a 100%)",
  },
  // Border and accent lines
  border: {
    position: "absolute",
    top: 2,
    left: 2,
    width: 276,
    height: 156,
    border: "2 solid #3b82f6",
    borderRadius: 8,
  },
  accentLine: {
    position: "absolute",
    top: 8,
    left: 8,
    width: 264,
    height: 2,
    backgroundColor: "#60a5fa",
  },
  // Left section - QR and main info
  leftSection: {
    width: 140,
    height: 160,
    padding: 12,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "space-between",
  },
  logo: {
    width: 48,
    height: 18,
    marginBottom: 8,
    opacity: 0.95,
  },
  qrContainer: {
    backgroundColor: "#ffffff",
    border: "2 solid #3b82f6",
    borderRadius: 6,
    width: 76,
    height: 76,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: 4,
    boxShadow: "0 4px 16px rgba(59, 130, 246, 0.3)",
  },
  qrImg: {
    width: 68,
    height: 68,
  },
  scanLabel: {
    color: "#60a5fa",
    fontSize: 8,
    fontWeight: "bold",
    textAlign: "center",
    letterSpacing: 1.5,
    textTransform: "uppercase",
    marginTop: 6,
  },
  // Right section - Car details
  rightSection: {
    width: 140,
    height: 160,
    padding: 12,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  brandSection: {
    marginTop: 8,
  },
  carBrand: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "bold",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  carModel: {
    color: "#e2e8f0",
    fontSize: 12,
    fontWeight: "normal",
    letterSpacing: 0.3,
    marginTop: 2,
  },
  // Specs section
  specsSection: {
    marginTop: 8,
    width: "100%",
  },
  specRow: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 3,
  },
  specLabel: {
    color: "#94a3b8",
    fontSize: 7,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  specValue: {
    color: "#f1f5f9",
    fontSize: 7,
    fontWeight: "bold",
  },
  // Bottom section
  bottomSection: {
    marginTop: "auto",
    width: "100%",
  },
  userInfo: {
    color: "#64748b",
    fontSize: 8,
    textAlign: "center",
    marginBottom: 4,
  },
  idmotoLabel: {
    color: "#3b82f6",
    fontSize: 9,
    fontWeight: "bold",
    textAlign: "center",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  // Decorative elements
  decorativeDot: {
    position: "absolute",
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#3b82f6",
  },
  topDot: {
    top: 16,
    right: 16,
  },
  bottomDot: {
    bottom: 16,
    left: 16,
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
      <Page size={[280, 160]} style={styles.page}>
        {/* Background gradient effect */}
        <View style={styles.gradientBg} fixed />

        {/* Main border */}
        <View style={styles.border} fixed />

        {/* Accent line */}
        <View style={styles.accentLine} fixed />

        {/* Decorative dots */}
        <View style={[styles.decorativeDot, styles.topDot]} fixed />
        <View style={[styles.decorativeDot, styles.bottomDot]} fixed />

        {/* Left Section - QR Code and Logo */}
        <View style={styles.leftSection}>
          <Image src={logoUrl} style={styles.logo} />

          <View style={styles.qrContainer}>
            <Image src={qrPngUrl} style={styles.qrImg} />
          </View>

          <Text style={styles.scanLabel}>Scan to View</Text>
        </View>

        {/* Right Section - Car Information */}
        <View style={styles.rightSection}>
          {/* Brand and Model */}
          <View style={styles.brandSection}>
            <Text style={styles.carBrand}>{car.manufacturer || "Unknown"}</Text>
            <Text style={styles.carModel}>{car.model || "Model"}</Text>
          </View>

          {/* Car Specifications */}
          <View style={styles.specsSection}>
            <View style={styles.specRow}>
              <Text style={styles.specLabel}>Year</Text>
              <Text style={styles.specValue}>{car.year || "N/A"}</Text>
            </View>
            <View style={styles.specRow}>
              <Text style={styles.specLabel}>Engine</Text>
              <Text style={styles.specValue}>{car.engine || "N/A"}</Text>
            </View>
            <View style={styles.specRow}>
              <Text style={styles.specLabel}>Power</Text>
              <Text style={styles.specValue}>
                {car.horsepower ? `${car.horsepower} HP` : "N/A"}
              </Text>
            </View>
            <View style={styles.specRow}>
              <Text style={styles.specLabel}>Nm</Text>
              <Text style={styles.specValue}>{car.nm || "N/A"}</Text>
            </View>
          </View>

          {/* Bottom Info */}
          <View style={styles.bottomSection}>
            <Text style={styles.userInfo}>Owner: {car.user || "Unknown"}</Text>
            <Text style={styles.idmotoLabel}>IDMOTO Community</Text>
          </View>
        </View>
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
      canvas.width = 272; // Higher resolution for better PDF quality
      canvas.height = 272;
      const ctx = canvas.getContext("2d");
      ctx?.drawImage(img, 0, 0, 272, 272);
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
                loading ? "Generating PDF..." : "Download Car Sticker"
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
              Get Car Sticker
            </button>
          ))}
      </div>
    </div>
  );
}
