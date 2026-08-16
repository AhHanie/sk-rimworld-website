import { ImageResponse } from "next/og";
import { SITE_NAME } from "@/lib/constants";

export const dynamic = "force-static";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
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
          gap: 24,
          backgroundColor: "#18181b",
          color: "#fafafa",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            width: 96,
            height: 96,
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 20,
            backgroundColor: "#fafafa",
            color: "#18181b",
            fontSize: 44,
            fontWeight: 700,
          }}
        >
          Sk
        </div>
        <div style={{ display: "flex", fontSize: 64, fontWeight: 700 }}>
          {SITE_NAME}
        </div>
        <div style={{ display: "flex", fontSize: 28, color: "#a1a1aa" }}>
          Rimworld mods on the Steam Workshop
        </div>
      </div>
    ),
    { ...size },
  );
}
