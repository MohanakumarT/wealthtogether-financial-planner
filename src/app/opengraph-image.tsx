import { ImageResponse } from "next/og";

export const alt =
  "WealthTogether Investments — plan your next financial step together";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        alignItems: "center",
        background:
          "radial-gradient(circle at 80% 18%, rgba(212,175,55,.24), transparent 28%), linear-gradient(135deg, #081B3A 0%, #102A50 100%)",
        color: "#fff",
        display: "flex",
        height: "100%",
        justifyContent: "space-between",
        padding: "76px",
        width: "100%",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", maxWidth: 780 }}>
        <div style={{ alignItems: "center", display: "flex", gap: 18 }}>
          <div
            style={{
              alignItems: "center",
              background: "rgba(212,175,55,.14)",
              border: "1px solid rgba(212,175,55,.55)",
              borderRadius: 18,
              color: "#D4AF37",
              display: "flex",
              fontSize: 24,
              fontWeight: 700,
              height: 58,
              justifyContent: "center",
              width: 58,
            }}
          >
            WT
          </div>
          <div style={{ color: "#D4AF37", fontSize: 22, letterSpacing: 3 }}>
            WEALTHTOGETHER INVESTMENTS
          </div>
        </div>
        <div
          style={{
            fontFamily: "Georgia, serif",
            fontSize: 68,
            lineHeight: 1.08,
            marginTop: 64,
          }}
        >
          Plan your next financial step together.
        </div>
        <div
          style={{
            color: "rgba(255,255,255,.72)",
            fontSize: 25,
            marginTop: 30,
          }}
        >
          Clear tools for the goals you share.
        </div>
      </div>
      <div
        style={{
          border: "1px solid rgba(255,255,255,.2)",
          borderRadius: 999,
          display: "flex",
          height: 310,
          marginLeft: 36,
          position: "relative",
          width: 310,
        }}
      >
        <div
          style={{
            border: "1px solid rgba(212,175,55,.6)",
            borderRadius: 999,
            height: 220,
            left: 45,
            position: "absolute",
            top: 45,
            width: 220,
          }}
        />
        <div
          style={{
            background: "#D4AF37",
            borderRadius: 999,
            height: 16,
            left: 146,
            position: "absolute",
            top: 146,
            width: 16,
          }}
        />
      </div>
    </div>,
    { ...size },
  );
}
