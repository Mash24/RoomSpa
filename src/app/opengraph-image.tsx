import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "RoomSpa — private Signature massage Thailand";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "linear-gradient(135deg, #0c0a09 0%, #1a1512 45%, #3d2e1f 100%)",
          color: "#f5f0e8",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 28,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: "#c9a86c",
          }}
        >
          RoomSpa · Signature
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div
            style={{
              display: "flex",
              fontSize: 64,
              fontFamily: "Georgia, serif",
              lineHeight: 1.05,
              maxWidth: 980,
            }}
          >
            Private Signature massage, to your door
          </div>
          <div style={{ display: "flex", fontSize: 28, opacity: 0.85, maxWidth: 860 }}>
            Tantric · Nuru · Body-to-body — discreet delivery across Thailand.
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
