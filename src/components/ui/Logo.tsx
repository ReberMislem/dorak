"use client";

import Image from "next/image";
import Link from "next/link";

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: "sm" | "md" | "lg";
  href?: string;
}

export function Logo({ className = "", showText = true, size = "md", href = "/" }: LogoProps) {
  const sizes = {
    sm: { container: "w-8 h-8", text: "text-lg" },
    md: { container: "w-9 h-9", text: "text-xl" },
    lg: { container: "w-10 h-10", text: "text-2xl" },
  };

  const currentSize = sizes[size];

  return (
    <Link href={href} className={`flex items-center gap-3 ${className}`}>
      <div className={`${currentSize.container} rounded-xl gradient-primary flex items-center justify-center shrink-0 shadow-lg overflow-hidden`}>
        <Image 
          src="/icons/dorak.ico" 
          alt="دورك" 
          width={40} 
          height={40} 
          className="w-full h-full object-cover"
        />
      </div>
      {showText && <span className={`font-black ${currentSize.text} gradient-text`}>دورك</span>}
    </Link>
  );
}
