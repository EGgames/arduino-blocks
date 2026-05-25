#!/usr/bin/env node
/**
 * Descarga el binario de arduino-cli para la plataforma actual.
 * Uso: node scripts/download-arduino-cli.js
 *
 * Coloca el binario en:
 *   tools/win/arduino-cli.exe   (Windows)
 *   tools/mac/arduino-cli       (macOS)
 *   tools/linux/arduino-cli     (Linux)
 */

const https = require('https');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const os = require('os');

const CLI_VERSION = '1.1.1';
const BASE_URL = `https://github.com/arduino/arduino-cli/releases/download/v${CLI_VERSION}`;

const ASSETS = {
  win32: {
    x64:  `arduino-cli_${CLI_VERSION}_Windows_64bit.zip`,
    ia32: `arduino-cli_${CLI_VERSION}_Windows_32bit.zip`,
  },
  darwin: {
    arm64: `arduino-cli_${CLI_VERSION}_macOS_ARM64.tar.gz`,
    x64:   `arduino-cli_${CLI_VERSION}_macOS_64bit.tar.gz`,
  },
  linux: {
    x64:   `arduino-cli_${CLI_VERSION}_Linux_64bit.tar.gz`,
    arm64: `arduino-cli_${CLI_VERSION}_Linux_ARM64.tar.gz`,
    arm:   `arduino-cli_${CLI_VERSION}_Linux_ARMv7.tar.gz`,
  },
};

const PLATFORM_DIR = { win32: 'win', darwin: 'mac', linux: 'linux' };

function getAssetName(platform, arch) {
  const platformAssets = ASSETS[platform];
  if (!platformAssets) throw new Error(`Plataforma no soportada: ${platform}`);
  const assetName = platformAssets[arch] || platformAssets['x64'];
  if (!assetName) throw new Error(`Arquitectura no soportada: ${arch} en ${platform}`);
  return assetName;
}

function download(url, destFile) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destFile);
    const req = https.get(url, (response) => {
      // Seguir redirecciones (GitHub redirige a assets CDN)
      if (response.statusCode === 301 || response.statusCode === 302) {
        file.close();
        try { fs.unlinkSync(destFile); } catch {}
        download(response.headers.location, destFile).then(resolve).catch(reject);
        return;
      }
      if (response.statusCode !== 200) {
        reject(new Error(`HTTP ${response.statusCode} al descargar ${url}`));
        return;
      }
      let downloaded = 0;
      response.on('data', (chunk) => {
        downloaded += chunk.length;
        process.stdout.write(`\r  ${(downloaded / 1024 / 1024).toFixed(1)} MB descargados...`);
      });
      response.pipe(file);
      file.on('finish', () => { file.close(); process.stdout.write('\n'); resolve(); });
    });
    req.on('error', (err) => {
      try { fs.unlinkSync(destFile); } catch {}
      reject(err);
    });
  });
}

async function main() {
  const platform = process.argv[2] || process.platform;
  const arch = process.argv[3] || process.arch;

  const assetName = getAssetName(platform, arch);
  const platformDir = PLATFORM_DIR[platform];
  const outputDir = path.resolve(__dirname, '..', 'tools', platformDir);
  const binaryName = platform === 'win32' ? 'arduino-cli.exe' : 'arduino-cli';
  const binaryPath = path.join(outputDir, binaryName);

  if (fs.existsSync(binaryPath)) {
    console.log(`✓ arduino-cli ya existe en tools/${platformDir}/${binaryName}`);
    return;
  }

  fs.mkdirSync(outputDir, { recursive: true });

  const tmpFile = path.join(os.tmpdir(), assetName);
  const downloadUrl = `${BASE_URL}/${assetName}`;

  console.log(`Plataforma: ${platform} (${arch})`);
  console.log(`Descargando ${assetName}...`);
  await download(downloadUrl, tmpFile);

  console.log('Extrayendo binario...');

  if (assetName.endsWith('.zip')) {
    // Windows: usar PowerShell (disponible en Win7+)
    const tmpExtract = path.join(os.tmpdir(), 'arduino-cli-extract');
    execSync(
      `powershell -command "Expand-Archive -Path '${tmpFile}' -DestinationPath '${tmpExtract}' -Force"`,
      { stdio: 'inherit' }
    );
    fs.copyFileSync(path.join(tmpExtract, 'arduino-cli.exe'), binaryPath);
    fs.rmSync(tmpExtract, { recursive: true, force: true });
  } else {
    // macOS / Linux: usar tar (disponible nativamente)
    execSync(`tar -xzf "${tmpFile}" -C "${outputDir}" arduino-cli`, { stdio: 'inherit' });
    execSync(`chmod +x "${binaryPath}"`);
  }

  try { fs.unlinkSync(tmpFile); } catch {}

  console.log(`✓ arduino-cli instalado en tools/${platformDir}/${binaryName}`);
  console.log('\nAhora puedes ejecutar la app con: npm run electron-dev');
}

main().catch((err) => {
  console.error('\n✗ Error:', err.message);
  process.exit(1);
});
