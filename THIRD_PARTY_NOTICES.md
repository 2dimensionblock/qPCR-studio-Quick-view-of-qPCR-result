# Third-party notices

The root MIT license applies to original qPCR Studio project material. It does not replace licenses belonging to third-party code, fonts or runtime components.

Full license texts recovered with the application, plus supplementary texts for the relevant dependency families, are included in [app/THIRD_PARTY_NOTICES.txt](app/THIRD_PARTY_NOTICES.txt). Keep that file when distributing the HTML or desktop app.

| Component family | Purpose | License / upstream |
| --- | --- | --- |
| React, React DOM, Scheduler | Interface rendering | MIT — https://github.com/facebook/react |
| Radix UI and related UI dependencies | Interface primitives | MIT and dependency-specific notices — https://github.com/radix-ui/primitives |
| Lucide | Icons | ISC — https://github.com/lucide-icons/lucide |
| read-excel-file and ZIP/XML dependencies | XLSX import | MIT and dependency-specific notices — https://gitlab.com/catamphetamine/read-excel-file |
| clsx, tailwind-merge, class-variance-authority | Interface class utilities | MIT — see bundled license texts |
| Noto Serif SC | Embedded Chinese serif font | SIL Open Font License 1.1 — see bundled font license |
| Electron and Chromium | Desktop runtime | Electron MIT and Chromium third-party licenses included in the packaged runtime |
| electron-builder | Development and packaging | MIT; a development dependency |
| jsdom | Automated DOM tests | MIT; a development dependency |

The archived HTML is a prebuilt frontend. Its original source dependency lockfile was not retained, so this document is **not an exact frontend software bill of materials**. Supplementary license files identify upstream dependency families and do not assert that every corresponding package/version is present in the HTML.

The desktop runtime includes its own `LICENSE` and `LICENSES.chromium.html`. Preserve them in desktop packages. Dependencies used only for development remain governed by their own package licenses.

字体使用说明：内嵌 Noto Serif SC 的许可文字随程序分发；Georgia、宋体等系统字体名称仅作为系统字体回退，不在项目中另行打包这些系统字体。
