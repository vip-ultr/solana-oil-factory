export function LaunchpadMath() {
  return (
    <section className="sof-lp-math">
      <h2>The math</h2>
      <div className="grid">
        <div className="card solana">
          <header>
            <span className="badge">Solana stream</span>
            <h3>Tx count → $CRUDE</h3>
          </header>
          <dl>
            <div>
              <dt>Oil units</dt>
              <dd>
                <code>txCount</code>
              </dd>
            </div>
            <div>
              <dt>Barrels</dt>
              <dd>
                <code>floor(oilUnits / 50)</code>
              </dd>
            </div>
            <div>
              <dt>$CRUDE earned</dt>
              <dd>
                <code>min(floor(oilUnits / 10), 15000)</code>
              </dd>
            </div>
            <div>
              <dt>Cap</dt>
              <dd>
                <strong>15,000 $CRUDE</strong>
              </dd>
            </div>
          </dl>
          <p className="ex">
            Example · a wallet with <strong>340 transactions</strong> mints
            <strong> 34 $CRUDE</strong> (340 / 10).
          </p>
        </div>

        <div className="card bags">
          <header>
            <span className="badge">Bags stream</span>
            <h3>Swaps + fee positions → $CRUDE</h3>
          </header>
          <dl>
            <div>
              <dt>Oil units</dt>
              <dd>
                <code>bagsSwapCount</code>
              </dd>
            </div>
            <div>
              <dt>Tx $CRUDE</dt>
              <dd>
                <code>floor(swapCount / 2)</code>
              </dd>
            </div>
            <div>
              <dt>Fee $CRUDE</dt>
              <dd>
                <code>floor(totalFeesSol × 2000)</code>
              </dd>
            </div>
            <div>
              <dt>Total</dt>
              <dd>
                <code>txCrude + feeCrude</code>{" "}
                <strong style={{ color: "var(--accent)" }}>· no cap</strong>
              </dd>
            </div>
          </dl>
          <p className="ex">
            Example · a wallet with <strong>40 Bags swaps</strong> and{" "}
            <strong>0.18 SOL</strong> of fee positions mints{" "}
            <strong>360 + 20 = 380 $CRUDE</strong>.
          </p>
        </div>
      </div>

      <p className="footnote">
        Refining timers scale with output: a 30-minute base, longer for
        bigger pools, capped at 6 hours. Pay <code>0.002 SOL</code> to a
        platform address to instantly finish a timer (
        <code>POST /api/verify-speedup</code> validates the transfer on-chain
        before crediting).
      </p>
    </section>
  );
}
