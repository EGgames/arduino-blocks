const { execFileSync } = require('child_process');
const path = require('path');

/**
 * Force ad-hoc signing on macOS builds so Squirrel.Mac (ShipIt)
 * can validate bundle resources during auto-update.
 */
exports.default = async function afterSign(context) {
  if (process.platform !== 'darwin') return;

  const appName = context.packager.appInfo.productFilename;
  const appPath = path.join(context.appOutDir, `${appName}.app`);

  execFileSync('codesign', ['--force', '--deep', '--sign', '-', appPath], {
    stdio: 'inherit',
  });

  execFileSync('codesign', ['--verify', '--deep', '--strict', '--verbose=2', appPath], {
    stdio: 'inherit',
  });
};
