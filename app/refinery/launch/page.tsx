import type { Metadata } from "next";
import { Stepper } from "@/components/sof/refinery-launch/Stepper";
import { LaunchWizard } from "@/components/sof/refinery-launch/LaunchWizard";

export const metadata: Metadata = {
  title: "Launch a refinery",
  description:
    "Reward holders of your token with on-chain claims. Anyone holding the token at snapshot time is eligible — no allowlist, no off-chain coordination.",
};

export default function LaunchPage() {
  return (
    <>
      <div className="sof-lw-hdr">
        <div className="crumb">Launch / New refinery</div>
        <h1>Launch a refinery</h1>
        <p>
          Reward holders of your token with on-chain claims. Paste any SPL
          mint, set the claim mechanics, fund the pool, sign the tx. The
          refinery is live as soon as the tx confirms.
        </p>
      </div>

      <Stepper />
      <LaunchWizard />
    </>
  );
}
