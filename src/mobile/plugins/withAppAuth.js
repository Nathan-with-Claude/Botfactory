const { withDangerousMod } = require('@expo/config-plugins');
const path = require('path');
const fs = require('fs');

/**
 * Plugin Expo — deux corrections pour le build Android :
 * 1. injecte manifestPlaceholders appAuthRedirectScheme dans app/build.gradle
 * 2. crée res/values/colors.xml avec splashscreen_background si absent
 */
const withAppAuthScheme = (config) => {
  return withDangerousMod(config, [
    'android',
    async (config) => {
      const platformRoot = config.modRequest.platformProjectRoot;
      const scheme = config.android?.package ?? 'com.docapost.docupost';

      // ── 1. manifestPlaceholders dans app/build.gradle ──────────────────────
      const buildGradlePath = path.join(platformRoot, 'app', 'build.gradle');
      if (fs.existsSync(buildGradlePath)) {
        let gradle = fs.readFileSync(buildGradlePath, 'utf8');
        if (!gradle.includes('appAuthRedirectScheme')) {
          gradle = gradle.replace(
            /defaultConfig\s*\{/,
            `defaultConfig {\n        manifestPlaceholders = [appAuthRedirectScheme: "${scheme}"]`
          );
          fs.writeFileSync(buildGradlePath, gradle);
        }
      }

      // ── 2. couleur splashscreen_background ─────────────────────────────────
      const colorsDir = path.join(platformRoot, 'app', 'src', 'main', 'res', 'values');
      const colorsPath = path.join(colorsDir, 'colors.xml');
      fs.mkdirSync(colorsDir, { recursive: true });

      if (!fs.existsSync(colorsPath)) {
        fs.writeFileSync(
          colorsPath,
          `<?xml version="1.0" encoding="utf-8"?>\n<resources>\n    <color name="splashscreen_background">#FFFFFF</color>\n</resources>\n`
        );
      } else {
        let colors = fs.readFileSync(colorsPath, 'utf8');
        if (!colors.includes('splashscreen_background')) {
          colors = colors.replace(
            '</resources>',
            '    <color name="splashscreen_background">#FFFFFF</color>\n</resources>'
          );
          fs.writeFileSync(colorsPath, colors);
        }
      }

      return config;
    },
  ]);
};

module.exports = withAppAuthScheme;
