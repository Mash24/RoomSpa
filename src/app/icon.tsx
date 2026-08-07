import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#2F5D50",
          borderRadius: 8,
          color: "#F7F9F8",
          fontSize: 15,
          fontWeight: 600,
          fontFamily: "Georgia, 'Times New Roman', serif",
          letterSpacing: "-0.06em",
        }}
      >
        RS
      </div>
    ),
    { ...size },
  );
}
