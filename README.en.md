# qPCR Studio

[中文说明](README.md)

An offline qPCR analysis and plotting application by **Steven Liu**. Import XLSX, CSV or TSV data, calculate ΔCt, ΔΔCt and 2^−ΔCt, and plot arithmetic mean expression with SD or SEM error bars.

## Quick start

Download `qPCR_Studio_Windows_x64.exe` from this repository's **Releases** section and run it on Windows 10/11 x64. No separate Python, Node.js or browser installation is required for the executable. Alternatively, download `app/index.html` and open it locally in a modern browser.

Import a table, check the column mapping and reference/replicate settings, then click **开始分析** (Start analysis). Loading a file or the synthetic example does not calculate results automatically. New imports clear previous results.

The interface is primarily Chinese. It uses serif fonts and includes a fully synthetic 96-well example. Export formats are CSV, SVG and PNG. Legacy `.xls` files must first be converted to `.xlsx` or CSV.

## Calculation

```text
ΔCt = target Ct − matched reference mean Ct
ΔΔCt = ΔCt − calibrator mean ΔCt
Plot point = arithmetic mean of 2^(−ΔCt)
```

The y-axis is **2^−ΔCt**, not 2^−ΔΔCt. Technical-well and biological-replicate modes have different units of replication. Technical-well error bars treat the reference mean as fixed and do not represent biological variability. Missing Ct values are not replaced with zero. SD and SEM are undefined for fewer than two observations. See [methods](docs/METHODS.md).

## Development

Use Node.js 24. Dependency installation and builds require internet access; the distributed app works offline.

```bash
npm ci
npm run check
npm test
npm start
```

On Windows x64:

```bash
npm run dist:win
npm run verify:dist
npm run smoke:windows
npm run release:files
```

Upload the contents of `release/` as release assets. Keep executables and dependencies out of Git history.

## Source scope

`app/main.cjs` is editable desktop launcher source. `app/index.html` is a complete **prebuilt** frontend with bundled scripts, styles, fonts and dependencies. The original React/TypeScript source files, frontend lockfile and source maps are not included. The build command repackages the preserved HTML; it does not rebuild the frontend from TSX source.

## Privacy, verification and license

Data are processed locally. Only an explicitly clicked reference link opens an external browser. The app contains no automatic update service. The supplied executable is unsigned and has not undergone Windows hardware acceptance testing. CI configurations are provided but must be verified in the destination GitHub repository.

Original project code and documentation use the [MIT License](LICENSE). Third-party libraries and fonts retain their respective licenses; see [notices](THIRD_PARTY_NOTICES.md).
