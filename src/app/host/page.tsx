import type { Metadata } from "next";
import { HostDashboard } from "@/components/HostDashboard";

export const metadata: Metadata = {
  title: "Host — Annie & Dũng",
  robots: { index: false, follow: false },
};

export default function HostPage() {
  return <HostDashboard />;
}
