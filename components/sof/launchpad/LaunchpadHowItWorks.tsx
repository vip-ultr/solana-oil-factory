const STEPS = [
  {
    n: "01",
    title: "Connect your wallet",
    body: "We read your Solana transaction count + any Bags launchpad swap history. No funds move; no signature touches a transaction.",
  },
  {
    n: "02",
    title: "Pick a refining stream",
    body: "Solana stream converts every 10 tx into 1 $CRUDE (capped at 15,000). Bags stream converts every 2 swaps into 1 $CRUDE plus 2000 $CRUDE per SOL of fee positions — no cap.",
  },
  {
    n: "03",
    title: "Wait the refining window, then claim",
    body: "Each stream runs a timer (30 min to 6 hours, scaled to output). When it finishes, your $CRUDE is minted to your wallet and your leaderboard rank updates.",
  },
];

export function LaunchpadHowItWorks() {
  return (
    <section className="sof-lp-howitworks">
      <h2>How refining works</h2>
      <ol>
        {STEPS.map((s) => (
          <li key={s.n}>
            <span className="num">{s.n}</span>
            <div>
              <h3>{s.title}</h3>
              <p>{s.body}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
