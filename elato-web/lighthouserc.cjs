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
        // Measured locally (desktop preset, 3-run median, homepage), re-verified
        // after fixing Footer's heading-order violation (<h3> labels with no
        // preceding <h2> -> now <p>, same styling, no heading semantics):
        // Performance 100, Accessibility 100, Best Practices 100, SEO 63.
        // Performance floor set below the measured 1.00 to leave headroom
        // for real-world variance (fonts/CDN latency) without being a
        // regression tripwire on every 1-point fluctuation.
        'categories:performance': ['error', { minScore: 0.85 }],
        'categories:accessibility': ['error', { minScore: 1 }],
        'categories:best-practices': ['error', { minScore: 0.95 }],
        // Currently 0.63 — confirmed (not just suspected) to be the
        // `is-crawlable` audit flagging a localhost/non-HTTPS origin, not a
        // real bug: robots.txt in dist/ correctly allows crawling, and no
        // robots meta tag or X-Robots-Tag exists anywhere in elato-web.
        // Re-verify once elato-web is deployed to its real domain before
        // tightening further — see vercel.json's header comments for the
        // same "no real domain yet" caveat.
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
