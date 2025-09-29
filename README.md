# Weltraum Shooter PWA – GitHub Pages Paket

Dieses ZIP enthält **manifest.json**, **sw.js** und **Icons** für die PWA-Installation.
> **Wichtig:** Lege **deine unveränderte `index.html`** (die du mir oben geschickt hast) direkt in dasselbe Verzeichnis wie `manifest.json` und `sw.js`.

## Deploy auf GitHub Pages
1. Neues Repo erstellen (z. B. `space-shooter-pwa`).
2. Die Inhalte aus diesem ZIP in die Repo-Wurzel kopieren **und deine `index.html` daneben legen**.
3. Commit & Push.
4. In den Repo-Einstellungen → **Pages** → „Deploy from branch“ → Branch `main`/`master`, Ordner `/root`.
5. Warten bis die Seite gebaut ist. Rufe die URL auf (HTTPS ist Pflicht).
6. Auf dem Handy solltest du „Zum Startbildschirm hinzufügen“/„Installieren“ sehen.

## Technische Hinweise
- `manifest.json` verweist auf PNG-Icons (192/512) und `maskable` für schöne Abrundungen.
- `sw.js` cached `index.html`, Manifest und Icons. Deine Seite funktioniert **offline**.
- In deiner `index.html` registrierst du `sw.js` bereits – passt!
- Der Startpunkt ist `./index.html`. Falls du umbenennst (z. B. `/`), ändere `start_url` und die Precache-Liste.

Viel Spaß beim Zocken! 🚀
