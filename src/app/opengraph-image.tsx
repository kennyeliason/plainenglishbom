import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "Plain English Book of Mormon";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#faf9f6",
          backgroundImage:
            "radial-gradient(circle at 25px 25px, #e8e4dc 2%, transparent 0%)",
          backgroundSize: "50px 50px",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "white",
            padding: "60px 80px",
            borderRadius: "16px",
            boxShadow: "0 4px 24px rgba(0, 0, 0, 0.08)",
            border: "1px solid #e8e4dc",
          }}
        >
          <div
            style={{
              fontSize: 72,
              fontWeight: 600,
              color: "#1a1a1a",
              letterSpacing: "-0.02em",
              marginBottom: "8px",
              fontFamily: "Georgia, serif",
            }}
          >
            Book of Mormon
          </div>
          <div
            style={{
              fontSize: 32,
              color: "#666",
              letterSpacing: "0.05em",
              textTransform: "uppercase",
              fontFamily: "Georgia, serif",
            }}
          >
            In Plain English
          </div>
          <div
            style={{
              marginTop: "32px",
              fontSize: 20,
              color: "#888",
              maxWidth: "600px",
              textAlign: "center",
              lineHeight: 1.5,
            }}
          >
            Scripture made accessible for modern readers
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
