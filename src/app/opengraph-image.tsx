import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "RoomSpa — premium in-room massage";
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
          background: "linear-gradient(135deg, #121816 0%, #1a2e28 45%, #2F5D50 100%)",
          color: "#F7F9F8",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 28,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            opacity: 0.75,
          }}
        >
          GetRoomSpa
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div
            style={{
              display: "flex",
              fontSize: 72,
              fontFamily: "Georgia, serif",
              lineHeight: 1.05,
              maxWidth: 900,
            }}
          >
            Spa-quality massage at your door
          </div>
          <div style={{ display: "flex", fontSize: 28, opacity: 0.85, maxWidth: 820 }}>
            Hotels, condos & homes across Chiang Mai — book in minutes.
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
