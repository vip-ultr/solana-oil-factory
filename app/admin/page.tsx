import type { Metadata } from "next";
import { AdminClient } from "@/components/sof/admin/AdminClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Admin",
  description:
    "Treasury authority rotation. Restricted to the wallet recorded as treasury_config.admin.",
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return <AdminClient />;
}
