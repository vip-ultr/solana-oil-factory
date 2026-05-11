import type { Metadata } from "next";
import { DashboardClient } from "@/components/sof/dashboard/DashboardClient";

export const metadata: Metadata = {
  title: "Dashboard",
  description:
    "Your refineries, claims, and reputation in one place. Live from devnet.",
};

export default function DashboardPage() {
  return <DashboardClient />;
}
