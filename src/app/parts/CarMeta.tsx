import {
  Document,
  Image,
  Page,
  PDFDownloadLink,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import { useRouter } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
import { useRef, useState } from "react";

const styles = StyleSheet.create({
  page: {
    backgroundColor: "#0a0a0a",
    width: 1098,
    height: 648,
    padding: 0,
    display: "flex",
    flexDirection: "row",
    position: "relative",
    fontFamily: "Helvetica",
  },
  // Dark gradient background
  gradientBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    width: 1098,
    height: 648,
    backgroundColor: "#0f0f0f",
  },
  // Main container with dark theme
  mainContainer: {
    position: "absolute",
    top: 20,
    left: 20,
    width: 1058,
    height: 608,
    backgroundColor: "#1a1a1a",
    border: "2 solid #333333",
    padding: 40,
  },
  // Dark left section with gradient - Logo and QR
  leftSection: {
    width: 400,
    height: 648,
    padding: 60,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    background:
      "linear-gradient(135deg, #0a0a0a 0%, #1c1c1c 50%, #0a0a0a 100%)",
    position: "relative",
  },
  // Logo container
  logoContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    marginBottom: 80,
  },
  logo: {
    width: 240,
    height: 90,
    marginBottom: 20,
  },
  // QR Code section
  qrSection: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  qrContainer: {
    backgroundColor: "#ffffff",
    padding: 30,
    marginBottom: 80,
  },
  qrCode: {
    width: 180,
    height: 180,
  },
  qrLabel: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
  },
  qrSubtext: {
    color: "#cccccc",
    fontSize: 12,
    textAlign: "center",
  },
  // Dark right section - Car information
  rightSection: {
    width: 698,
    height: 648,
    padding: 60,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    position: "relative",
    background:
      "linear-gradient(135deg, #0a0a0a 0%, #1c1c1c 50%, #0a0a0a 100%)",
    backgroundColor: "#121212",
    backgroundSize: "cover",
    border: "2 solid #333333",
    boxSizing: "border-box",
  },
  // Dark car header section
  carHeaderSection: {
    borderBottom: "3 solid #333333",
    paddingBottom: 40,
    marginBottom: 60,
  },
  manufacturer: {
    color: "#ffffff",
    fontSize: 48,
    fontWeight: "800",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 16,
    fontFamily: "Helvetica",
  },
  model: {
    color: "#3b82f6",
    fontSize: 36,
    fontWeight: "700",
    letterSpacing: 0.5,
    marginBottom: 20,
    fontFamily: "Helvetica",
    textTransform: "none",
  },
  engine: {
    color: "#cccccc",
    fontSize: 24,
    fontWeight: "300",
    backgroundColor: "#2a2a2a",
    padding: "12 24",
    borderRadius: 12,
    border: "2 solid #444444",
  },
  // Dark owner section
  ownerSection: {
    backgroundColor: "#2a2a2a",
    borderRadius: 16,
    padding: 40,
    border: "2 solid #444444",
    marginBottom: 40,
  },
  ownerLabel: {
    color: "#cccccc",
    fontSize: 14,
    fontWeight: "300",
    textTransform: "uppercase",
    letterSpacing: 2,
    marginBottom: 12,
    fontFamily: "Helvetica",
  },
  ownerName: {
    color: "#ffffff",
    fontSize: 28,
    fontWeight: "800",
    fontFamily: "Helvetica",
  },
  // Dark footer section
  footerSection: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "auto",
  },
  websiteContainer: {
    backgroundColor: "#333333",
    borderRadius: 12,
    padding: "16 32",
  },
  websiteText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "300",
    letterSpacing: 1,
    fontFamily: "Helvetica",
  },
  carId: {
    color: "#888888",
    fontSize: 16,
    fontWeight: "300",
    fontFamily: "Helvetica",
    letterSpacing: 1,
  },
  // Cut lines for sticker cutting
  cutLineTopLeft: {
    position: "absolute",
    top: 5,
    left: 5,
    width: 40,
    height: 2,
    backgroundColor: "#ffffff",
  },
  cutLineTopLeftVertical: {
    position: "absolute",
    top: 5,
    left: 5,
    width: 2,
    height: 40,
    backgroundColor: "#ffffff",
  },
  cutLineTopRight: {
    position: "absolute",
    top: 5,
    right: 5,
    width: 40,
    height: 2,
    backgroundColor: "#ffffff",
  },
  cutLineTopRightVertical: {
    position: "absolute",
    top: 5,
    right: 5,
    width: 2,
    height: 40,
    backgroundColor: "#ffffff",
  },
  cutLineBottomLeft: {
    position: "absolute",
    bottom: 5,
    left: 5,
    width: 40,
    height: 2,
    backgroundColor: "#ffffff",
  },
  cutLineBottomLeftVertical: {
    position: "absolute",
    bottom: 5,
    left: 5,
    width: 2,
    height: 40,
    backgroundColor: "#ffffff",
  },
  cutLineBottomRight: {
    position: "absolute",
    bottom: 5,
    right: 5,
    width: 40,
    height: 2,
    backgroundColor: "#ff0000",
  },
  cutLineBottomRightVertical: {
    position: "absolute",
    bottom: 5,
    right: 5,
    width: 2,
    height: 40,
    backgroundColor: "#ff0000",
  },
  // Decorative elements
  decorativeCircle: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "rgba(59, 130, 246, 0.05)",
    top: -100,
    right: -100,
  },
  decorativeLine: {
    position: "absolute",
    height: 4,
    backgroundColor: "#3b82f6",
    borderRadius: 2,
  },
  topLine: {
    top: 60,
    left: 60,
    width: 120,
  },
  bottomLine: {
    bottom: 60,
    right: 60,
    width: 120,
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
      <Page size={[1098, 648]} style={styles.page}>
        {/* Premium background */}
        <View style={styles.gradientBackground} fixed />
        <View style={styles.mainContainer} fixed />

        {/* Cut lines for sticker cutting */}
        <View style={styles.cutLineTopLeft} fixed />
        <View style={styles.cutLineTopLeftVertical} fixed />
        <View style={styles.cutLineTopRight} fixed />
        <View style={styles.cutLineTopRightVertical} fixed />
        <View style={styles.cutLineBottomLeft} fixed />
        <View style={styles.cutLineBottomLeftVertical} fixed />
        <View style={styles.cutLineBottomRight} fixed />
        <View style={styles.cutLineBottomRightVertical} fixed />

        {/* Left Section - Premium Logo and QR */}
        <View style={styles.leftSection}>
          <View style={styles.logoContainer}>
            <Image src={logoUrl} style={styles.logo} />
          </View>

          <View style={styles.qrSection}>
            <View style={styles.qrContainer}>
              <Image src={qrPngUrl} style={styles.qrCode} />
            </View>
            <Text style={styles.qrLabel}>Scan to View Vehicle</Text>
            <Text style={styles.qrSubtext}>Mobile Optimized Experience</Text>
          </View>
        </View>

        {/* Right Section - Car Information */}
        <View style={styles.rightSection}>
          {/* Car Header */}
          <View style={styles.carHeaderSection}>
            <Text style={styles.manufacturer}>
              {car.manufacturer || "MANUFACTURER"}
              <Text style={styles.model}> {car.model || "Model Name"}</Text>
            </Text>
            <Text style={styles.engine}>
              {`${car.engine} | ${car.year} | ${car.transmission}` ||
                "Engine Specification"}
            </Text>
          </View>

          {/* Owner Information */}
          <View style={styles.ownerSection}>
            <Text style={styles.ownerLabel}>Proudly Owned By</Text>
            <Text style={styles.ownerName}>{car.user || "Vehicle Owner"}</Text>
          </View>

          {/* Footer */}
          <View style={styles.footerSection}>
            <View style={styles.websiteContainer}>
              <Text style={styles.websiteText}>idmoto.vercel.app</Text>
            </View>
            <Text style={styles.carId}>// THIS STICKER MAY CHANGE</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}

export default function CarMeta({ car, user }: { car: any; user: any }) {
  const router = useRouter();
  const qrRef = useRef<SVGSVGElement>(null);
  const [qrPngUrl, setQrPngUrl] = useState<string | null>(null);
  const logoUrl = "/logo.png";

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
      canvas.width = 540; // Higher resolution for 1098x648 design
      canvas.height = 540;
      const ctx = canvas.getContext("2d");
      ctx?.drawImage(img, 0, 0, 540, 540);
      setQrPngUrl(canvas.toDataURL("image/png"));
    };
    img.src = imageSrc;
  };

  return (
    <div className="w-full flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center gap-2">
        <p className="text-sm text-zinc-400">
          Added by{" "}
          <button
            onClick={() => router.push(`/profile?uid=${car.userID}`)}
            className="text-blue-400 hover:underline font-medium cursor-pointer bg-transparent border-none p-0"
          >
            {car.user || "Unknown User"}
          </button>
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
        {user?.uid !== car.userID && (
          <span className="text-white font-light bg-transparent border-none p-0">
            Scan to View
          </span>
        )}
        {user?.uid === car.userID &&
          (qrPngUrl ? (
            <PDFDownloadLink
              document={
                <StickerPDF car={car} qrPngUrl={qrPngUrl} logoUrl={logoUrl} />
              }
              fileName={`premium-car-sticker-${car.id}.pdf`}
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
