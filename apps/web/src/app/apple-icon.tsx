import { ImageResponse } from "next/og";

export const size = {
  width: 180,
  height: 180,
};
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(180deg, #1a2744 0%, #0f1a2e 100%)",
          padding: "16px",
        }}
      >
        {/* Gold border */}
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            border: "2px solid #c9a227",
            borderRadius: "4px",
            padding: "8px",
          }}
        >
          {/* Inner frame */}
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              border: "1px solid #c9a227",
              borderRadius: "2px",
              gap: "4px",
            }}
          >
            <div
              style={{
                fontSize: 13,
                color: "#c9a227",
                fontFamily: "Georgia, serif",
                fontWeight: 600,
                textAlign: "center",
                letterSpacing: "0.05em",
              }}
            >
              THE
            </div>
            <div
              style={{
                fontSize: 16,
                color: "#c9a227",
                fontFamily: "Georgia, serif",
                fontWeight: 700,
                textAlign: "center",
                letterSpacing: "0.02em",
              }}
            >
              BOOK OF
            </div>
            <div
              style={{
                fontSize: 16,
                color: "#c9a227",
                fontFamily: "Georgia, serif",
                fontWeight: 700,
                textAlign: "center",
                letterSpacing: "0.02em",
              }}
            >
              MORMON
            </div>
            <div
              style={{
                fontSize: 8,
                color: "#c9a227",
                fontFamily: "Georgia, serif",
                marginTop: "4px",
                textAlign: "center",
                opacity: 0.8,
              }}
            >
              PLAIN ENGLISH
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
