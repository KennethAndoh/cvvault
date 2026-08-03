"use client";

import React from "react";

interface ZeroDepQRCodeProps {
  value: string;
  size?: number;
  className?: string;
}

export function ZeroDepQRCode({ value, size = 50, className = "" }: ZeroDepQRCodeProps) {
  const encodedValue = encodeURIComponent(value);
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodedValue}&format=svg`;

  return (
    <img
      src={qrUrl}
      alt="Verification QR Code"
      width={size}
      height={size}
      className={`rounded border border-slate-200 bg-white ${className}`}
      loading="lazy"
    />
  );
}
