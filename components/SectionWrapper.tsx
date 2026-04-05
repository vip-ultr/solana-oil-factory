import React from "react";

interface SectionWrapperProps {
  title: string;
  subtitle?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  withDivider?: boolean;
}

export default function SectionWrapper({
  title,
  subtitle,
  description,
  children,
  className = "",
  withDivider = true,
}: SectionWrapperProps) {
  return (
    <section className={`section-wrapper ${className}`}>
      <div className="section-header">
        <h2 className="section-title">{title}</h2>
        {subtitle && <p className="section-subtitle">{subtitle}</p>}
        {description && <p className="section-description">{description}</p>}
      </div>

      {withDivider && <div className="section-divider" />}

      <div className="section-content">{children}</div>
    </section>
  );
}
