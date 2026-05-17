"use client";

import { useEffect, useState } from "react";

type AdSenseProps = {
  className?: string;
  slotId?: string;
  format?: "auto" | "fluid" | "horizontal" | "vertical" | "rectangle";
  responsive?: boolean;
  style?: React.CSSProperties;
};

export default function AdSense({
  className = "",
  slotId = "1234567890", // Default placeholder slot
  format = "auto",
  responsive = true,
  style = { display: "block" },
}: AdSenseProps) {
  const [isDev, setIsDev] = useState(() => process.env.NODE_ENV === "development");

  useEffect(() => {
    if (isDev) return;
    
    try {
      // @ts-expect-error Google AdSense adds this to window
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (err) {
      console.error("AdSense error:", err);
    }
  }, []);

  if (isDev) {
    return (
      <div
        className={`bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-500 text-sm font-medium rounded-lg ${className}`}
        style={{ minHeight: "150px", ...style }}
      >
        [AdSense Placeholder: {format}]
      </div>
    );
  }

  return (
    <div className={`overflow-hidden flex justify-center ${className}`}>
      <ins
        className="adsbygoogle"
        style={style}
        data-ad-client={process.env.NEXT_PUBLIC_ADSENSE_ID || "pub-0000000000000000"}
        data-ad-slot={slotId}
        data-ad-format={format}
        data-full-width-responsive={responsive ? "true" : "false"}
      />
    </div>
  );
}
