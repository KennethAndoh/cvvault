import { ImageResponse } from "next/og";

export const alt = "CVVault | Secure Career Credentials";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#0f172a",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          padding: "80px 90px",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        {/* Subtle gradient accent */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background:
              "radial-gradient(ellipse at 20% 50%, rgba(52,130,190,0.18) 0%, transparent 60%)",
            display: "flex",
          }}
        />

        {/* Logo row */}
        <div style={{ display: "flex", alignItems: "center", gap: "28px", marginBottom: "28px" }}>
          {/* Shield icon SVG */}
          <div
            style={{
              width: 90,
              height: 90,
              background: "rgba(52,130,190,0.15)",
              borderRadius: "22px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "2px solid rgba(52,130,190,0.4)",
            }}
          >
            <svg width="52" height="52" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 2L4 6v6c0 5.25 3.5 10.15 8 11.5C16.5 22.15 20 17.25 20 12V6L12 2z"
                fill="#3482BE"
                opacity="0.9"
              />
              <path
                d="M9 12l2 2 4-4"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            <span
              style={{
                color: "white",
                fontSize: 68,
                fontWeight: 800,
                letterSpacing: "-2px",
                lineHeight: 1,
              }}
            >
              CVVault
            </span>
          </div>
        </div>

        {/* Tagline */}
        <p
          style={{
            color: "rgba(255,255,255,0.6)",
            fontSize: 28,
            fontWeight: 400,
            margin: 0,
            letterSpacing: "0.2px",
          }}
        >
          Securely store, organize, and share your career credentials.
        </p>

        {/* Bottom feature pills */}
        <div
          style={{
            display: "flex",
            gap: "16px",
            marginTop: "48px",
          }}
        >
          {["Store", "Verify", "Share"].map((label) => (
            <div
              key={label}
              style={{
                background: "rgba(52,130,190,0.15)",
                border: "1px solid rgba(52,130,190,0.35)",
                color: "#60a5fa",
                borderRadius: "999px",
                padding: "10px 28px",
                fontSize: 22,
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
              }}
            >
              {label}
            </div>
          ))}
        </div>

        {/* Bottom-right domain */}
        <div
          style={{
            position: "absolute",
            bottom: 52,
            right: 90,
            color: "rgba(255,255,255,0.25)",
            fontSize: 20,
            fontWeight: 500,
            display: "flex",
          }}
        >
          cvvault.vercel.app
        </div>
      </div>
    ),
    { ...size }
  );
}
