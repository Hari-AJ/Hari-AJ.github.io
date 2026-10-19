# Hari Krishnan · Pixel Quest portfolio

A static, game-style portfolio. Visitors watch a pixel character walk the journey from campus to Karbonwise, click any level to read its story, or scroll past the map to read everything as a normal page.

Plain HTML, CSS and JavaScript. No framework, no build step, no third-party requests (fonts are self-hosted).

## What's in the folder

| Path | What it is |
|---|---|
| `index.html` | The page: title screen, world map scenery, section shells |
| `js/content.js` | **All your text.** Levels, quest log, achievements, skills, email |
| `js/main.js` | The game engine: map, walking avatar, dialog, animations |
| `css/style.css` | All styles and animations |
| `404.html` | "Game over" page for broken links |
| `assets/` | Fonts, favicon, link-preview image, résumé PDF |
| `robots.txt`, `sitemap.xml` | Search engine basics |
| `.nojekyll` | Tells GitHub Pages to serve the files as they are |

## Preview it on your computer

Double-click `index.html`, or for the most accurate preview run a tiny local server:

```bash
cd hari-portfolio
python3 -m http.server 8000
# then open http://localhost:8000
```

## Put it online with GitHub Pages (free)

### 1. Set your username in three files

Replace `YOUR-USERNAME` with your GitHub username in `index.html`, `robots.txt` and `sitemap.xml`.

macOS / Linux:

```bash
cd hari-portfolio
grep -rl "YOUR-USERNAME" index.html robots.txt sitemap.xml | xargs sed -i.bak "s/YOUR-USERNAME/yourname/g" && rm -f *.bak
```

Windows (PowerShell):

```powershell
cd hari-portfolio
foreach ($f in "index.html","robots.txt","sitemap.xml") { (Get-Content $f) -replace "YOUR-USERNAME","yourname" | Set-Content $f }
```

### 2. Create the repository

On GitHub, create a **public** repository named exactly `yourname.github.io` (your username, lowercase). Don't add a README or licence there.

### 3. Push the files

```bash
cd hari-portfolio
git init
git add .
git commit -m "Launch portfolio"
git branch -M main
git remote add origin https://github.com/yourname/yourname.github.io.git
git push -u origin main
```

No git? Open the empty repository on github.com, choose **uploading an existing file**, and drag in everything inside the `hari-portfolio` folder (including the `assets`, `css` and `js` folders and the `.nojekyll` file).

### 4. Turn on Pages

In the repository: **Settings → Pages → Build and deployment**. Set **Source** to *Deploy from a branch*, choose **Branch: `main`** and **`/ (root)`**, then **Save**.

After a minute or two the site is live at `https://yourname.github.io`, with HTTPS included. Every later push updates it automatically.

## Updating your content

Everything visitors read lives in `js/content.js`:

- **Levels** (the 9 map stops and the quest log): edit `title`, `when`, `text` and `loot`. Keep exactly 9 levels, because the map has 9 stops.
- **Achievements**: `num` counts up on screen, `pre` and `post` wrap it (`≈`, `%`, `+`).
- **Inventory**: add or remove skills freely.
- **Email**: `email.user` and `email.domain`. It's split in two so simple spam bots can't read it from the page source.
- **nowLevel**: which level counts as "today"; the intro walk stops there.

To replace the résumé, overwrite `assets/Hari-Krishnan-Resume.pdf` with a new file of the same name.

## Optional: a custom domain

1. Buy a domain (for example `harikrishnan.dev`).
2. In **Settings → Pages → Custom domain**, enter it and save. GitHub adds a `CNAME` file for you.
3. At your domain registrar, point the domain to GitHub Pages (GitHub's docs list the exact DNS records: four `A` records for the root domain, or a `CNAME` record to `yourname.github.io` for `www`).
4. Tick **Enforce HTTPS** once it becomes available.
5. Replace `yourname.github.io` with the new domain in `index.html`, `robots.txt` and `sitemap.xml`.

## Good to know

- **Motion:** visitors who turn on "reduce motion" in their system settings get a still version: no walking, typing or floating effects, with all content still visible.
- **Keyboard:** Tab reaches every level button; with the map focused, the left and right arrow keys move between levels.
- **Phones:** the map scales down and scrolls sideways, and the camera follows the character.
- **Link previews:** `assets/og-image.png` is the card shown when the link is shared on LinkedIn, WhatsApp or Slack.
- **Fonts:** Press Start 2P and Pixelify Sans, both under the SIL Open Font License (licence files in `assets/fonts`).
