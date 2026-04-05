import React from "react";

interface InfoBlockProps {
  children: React.ReactNode;
  className?: string;
}

export default function InfoBlock({ children, className = "" }: InfoBlockProps) {
  return <div className={`info-block ${className}`}>{children}</div>;
}
