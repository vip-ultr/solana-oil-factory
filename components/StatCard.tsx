import React from "react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  className?: string;
}

export default function StatCard({
  label,
  value,
  icon,
  className = "",
}: StatCardProps) {
  return (
    <div className={`stat-card ${className}`}>
      {icon && <div className="stat-icon">{icon}</div>}
      <p className="stat-label">{label}</p>
      <p className="stat-value">{value}</p>
    </div>
  );
}
