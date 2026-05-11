const TIERS = [
  { min: 0, label: "Dry Well" },
  { min: 1, label: "Mud Digger" },
  { min: 5, label: "Backyard Driller" },
  { min: 10, label: "Small Rig Operator" },
  { min: 20, label: "Pump Jack Runner" },
  { min: 50, label: "Oil Producer" },
  { min: 80, label: "Field Driller" },
  { min: 120, label: "Rig Supervisor" },
  { min: 200, label: "Pipeline Operator" },
  { min: 350, label: "Refinery Engineer" },
  { min: 500, label: "Black Gold Miner" },
  { min: 800, label: "Refinery Boss" },
  { min: 1200, label: "Pipeline Baron" },
  { min: 2000, label: "Oil Baron" },
  { min: 3500, label: "Crude Commander" },
  { min: 5000, label: "Petroleum Magnate" },
  { min: 8000, label: "Oil Syndicate Leader" },
  { min: 10000, label: "Global Refiner" },
  { min: 20000, label: "Petrostate Architect" },
  { min: 50000, label: "Black Gold Emperor" },
  { min: 100000, label: "Industrial Titan" },
  { min: 250000, label: "Energy Overlord" },
  { min: 500000, label: "Crude Sovereign" },
  { min: 1000000, label: "Oil Tycoon" },
  { min: 5000000, label: "Supreme PetroLord" },
];

function fmt(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(0)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(n % 1_000 === 0 ? 0 : 1)}K`;
  return n.toLocaleString();
}

export function LaunchpadPrestige() {
  return (
    <section className="sof-lp-prestige">
      <h2>Prestige titles</h2>
      <p className="sub">
        Your title is determined by your total lifetime $CRUDE — wallet-wide
        across both refining streams. Updated every claim. Visible on the
        leaderboard + your wallet profile.
      </p>
      <ol className="tiers">
        {TIERS.map((t) => (
          <li key={t.label}>
            <span className="amt">{fmt(t.min)}</span>
            <span className="ti">{t.label}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}
