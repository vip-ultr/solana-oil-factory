import { ShieldCheck, Globe, Layers, Code2 } from "lucide-react";

export function TrustStrip() {
  return (
    <div className="sof-home-trust-strip">
      <div>
        <ShieldCheck strokeWidth={1.6} aria-hidden="true" />
        <span>
          Audited by <b>[Pending]</b>
        </span>
      </div>
      <div>
        <Globe strokeWidth={1.6} aria-hidden="true" />
        <span>
          Running on <b>Solana Devnet</b>
        </span>
      </div>
      <div>
        <Layers strokeWidth={1.6} aria-hidden="true" />
        <span>
          Built on the <b>Anchor framework</b>
        </span>
      </div>
      <div>
        <Code2 strokeWidth={1.6} aria-hidden="true" />
        <span>
          Open-source <b>Solana program</b>
        </span>
      </div>
    </div>
  );
}
