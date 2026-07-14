/**
 * Lighthouse CI config. `.js` (not `.json`) specifically so the assertion
 * thresholds below can carry inline comments explaining each number.
 */
module.exports = {
  ci: {
    collect: {
      staticDistDir: 'dist',
      url: ['/index.html'],
      numberOfRuns: 3,
      settings: {
        preset: 'desktop',
      },
    },
    assert: {
      assertions: {
        // Measured locally (desktop preset, 3-run median, homepage):
        // Performance 100, Accessibility 98, Best Practices 100, SEO 63.
        // Performance floor set below the measured 1.00 to leave headroom
        // for real-world variance (fonts/CDN latency) without being a
        // regression tripwire on every 1-point fluctuation.
        'categories:performance': ['error', { minScore: 0.85 }],
        // TODO tighten to 1 (product's stated accessibility target).
        // Currently 0.98 — the one failing audit is `heading-order`:
        // elato-web/src/components/layout/Footer.tsx renders an <h3>
        // ("EXPLORE") that isn't preceded by an h2 in that branch of the
        // DOM, so screen readers see a skipped heading level. Left unfixed
        // here since it's a structural heading-hierarchy change, not a
        // trivial one-line aria-label addition — flagged for follow-up
        // instead (see the task summary for the full finding).
        'categories:accessibility': ['error', { minScore: 0.98 }],
        'categories:best-practices': ['error', { minScore: 0.95 }],
        // TODO investigate. Currently 0.63 — the failing audit is
        // `is-crawlable`, which may be a false positive of testing against
        // a local static server/non-HTTPS origin rather than a real bug
        // (robots.txt in dist/ correctly allows crawling). Re-verify once
        // elato-web is deployed to its real domain before tightening
        // further — see vercel.json's header comments for the same
        // "no real domain yet" caveat.
        'categories:seo': ['warn', { minScore: 0.6 }],
      },
    },
    // No `upload` target configured: results stay local (`.lighthouseci/`,
    // gitignored) / as a CI artifact rather than being pushed to Lighthouse
    // CI's public temporary-storage service, which would publish this
    // client site's report to a public, indexed URL nobody asked for.
    // Point this at a private Lighthouse CI server (`target: 'lhci'`) if/
    // when one is stood up.
  },
}
