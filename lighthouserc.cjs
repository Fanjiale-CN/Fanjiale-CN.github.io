module.exports = {
  ci: {
    collect: {
      numberOfRuns: 1,
      settings: {
        preset: "desktop",
        chromeFlags: "--headless --no-sandbox --disable-dev-shm-usage"
      },
      url: [
        "http://127.0.0.1:4173/",
        "http://127.0.0.1:4173/cities/",
        "http://127.0.0.1:4173/essays/",
        "http://127.0.0.1:4173/radar/",
        "http://127.0.0.1:4173/research/",
        "http://127.0.0.1:4173/research/fast-metabolism-economy/",
        "http://127.0.0.1:4173/data/",
        "http://127.0.0.1:4173/index/"
      ]
    },
    assert: {
      assertions: {
        "categories:performance": ["warn", { "minScore": 0.45 }],
        "categories:accessibility": ["error", { "minScore": 0.85 }],
        "categories:best-practices": ["error", { "minScore": 0.7 }],
        "categories:seo": ["error", { "minScore": 0.85 }]
      }
    },
    upload: { target: "filesystem", outputDir: "artifacts/ci/lighthouse" }
  }
};
