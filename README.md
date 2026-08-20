# SK's RimWorld Mods

A static catalog of SK's RimWorld mods, built with Next.js. Visitors can
search, sort, and filter by tag or supported RimWorld version; every mod
links straight to its Steam Workshop page. The site is exported as static
HTML/CSS/JS with no runtime server required.

## Prerequisites

- Node.js 20.9 or later
- [pnpm](https://pnpm.io/) (`corepack enable` will provide it)
- A working native build toolchain (e.g. Visual Studio Build Tools on Windows,
  Xcode Command Line Tools on macOS, or `python3`/`make`/`g++` on Linux) so
  `pnpm install` can compile `better-sqlite3`'s native binding

## Setup

```bash
pnpm install
```

## Running the project

For day-to-day development, start the dev server and open
`http://localhost:3000`:

```bash
pnpm dev
```

To see the project exactly as it will be deployed (the static export in
`out/`), build it and serve those files directly:

```bash
pnpm build     # validate data, then produce the static export in out/
pnpm preview   # build, then serve out/ at http://localhost:3000
```

`next start` does not work here since the site is a static export with no
Next.js server; `pnpm preview` serves the built `out/` directory with a
plain static file server instead.

Other useful commands:

```bash
pnpm validate:data    # validate src/data/mods.json against the schema
pnpm lint             # run ESLint
pnpm test             # run the vitest suite
```

## Managing mod data

`src/data/mods.json` is the single source of truth for the catalog. Each
mod's local preview image lives at `public/mods/<steamWorkshopId>/preview.webp`.

To add a mod:

1. Copy `src/data/mods.template.json` as a reference (it is **not** loaded by
   the app; copy individual entries into `mods.json`, don't rename the
   template itself).
2. Add a preview image at `public/mods/<steamWorkshopId>/preview.webp`
   (recommended size: 640×360, `.webp` format).
3. Add an entry to the `mods` array in `src/data/mods.json`:

   ```json
   {
     "steamWorkshopId": "1234567890",
     "slug": "my-rimworld-mod",
     "name": "My RimWorld Mod",
     "description": "A concise but complete description.",
     "previewImage": {
       "src": "/mods/1234567890/preview.webp",
       "alt": "Preview artwork for My RimWorld Mod",
       "width": 640,
       "height": 360
     },
     "tags": ["quality-of-life", "utility"],
     "supportedVersions": ["1.5", "1.6"],
     "uploadDate": "2026-08-16T00:00:00.000Z",
     "workshopUrl": "https://steamcommunity.com/sharedfiles/filedetails/?id=1234567890"
   }
   ```

4. Run `pnpm validate:data` to check your entry before building.

### Rules

- The Workshop ID in `steamWorkshopId`, the `id` query parameter in
  `workshopUrl`, and the `public/mods/<id>/` folder name must all be
  identical.
- `steamWorkshopId` must contain digits only, and both `steamWorkshopId` and
  `slug` must be unique across the catalog.
- `slug` and tags must be lowercase kebab-case (e.g. `quality-of-life`).
- `supportedVersions` must list at least one RimWorld version in
  major.minor format (e.g. `"1.5"`), with no duplicates.
- `uploadDate` must be a valid UTC ISO-8601 instant, e.g.
  `2026-08-16T00:00:00.000Z`.
- `previewImage.src` must start with `/mods/<steamWorkshopId>/`, and the
  referenced file must exist under `public/`.

### Validation errors

`pnpm validate:data` (which also runs automatically before `pnpm build`)
reports every problem it finds, including the offending mod's Workshop ID,
the field, and the reason (for example a duplicate slug, a malformed date,
or a missing preview image file). Fix the reported entries in `mods.json` (and
add any missing image files) and re-run the command.

## Ratings and popularity

Star ratings and the default **Popularity** sort are read from
`data/workshop_stats.db`, a SQLite database of scraped Steam Workshop
statistics (not part of `src/data/`, and not checked into this repository).
`pnpm build` (and `pnpm dev`) open it once per process, keep only the newest
positive-vote count for each Workshop ID, and merge that optional value onto
the catalog data before the page renders. This happens entirely at build/dev
time; the exported static site never opens SQLite in the browser, and no
database file ships in the client bundle.

Ratings are a snapshot of `data/workshop_stats.db` as of the last build:
- A mod with no row, or whose newest row has a `NULL` rating, renders no star
  UI and sorts after every mod with a known count.
- **Rebuild the site** (`pnpm build`) to publish fresher stats; editing the
  database without rebuilding has no effect on the deployed site.

`pnpm build` fails fast with a clear error if `data/workshop_stats.db` is
missing, unreadable, or missing the expected `workshop_stats` table.

## Deployment

`pnpm build` produces a fully static site in `out/`. Upload the contents of
`out/` to any static host (e.g. Netlify, GitHub Pages, Cloudflare Pages, S3 +
CloudFront). No Node.js server or serverless functions are required at
runtime.

If deploying under a subpath, set `NEXT_PUBLIC_SITE_URL` at build time and
configure `basePath` in `next.config.ts` to match.
