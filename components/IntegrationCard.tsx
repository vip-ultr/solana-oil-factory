import React from "react";

interface IntegrationCardProps {
  name: string;
  description: string;
  icon?: React.ReactNode;
  className?: string;
}

export default function IntegrationCard({
  name,
  description,
  icon,
  className = "",
}: IntegrationCardProps) {
  return (
    <div className={`integration-card ${className}`}>
      {icon && <div className="integration-icon">{icon}</div>}
      <h3 className="integration-name">{name}</h3>
      <p className="integration-description">{description}</p>
    </div>
  );
}
