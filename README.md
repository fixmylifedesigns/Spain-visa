# Irving & Moeno · Spain hub (dev branch)

One place for our Spain move, with an EN / 日本語 toggle on every page:

- **Game plan**: Málaga for the DNV filing, Madrid for the TIE, Valencia for home
- **Checklist**: every item from the Google Sheet, grouped by workflow
- **California partnership**: why we use a California registered domestic partnership instead of a Spanish pareja de hecho
- **N26**: our Spanish bank account and what to update after the move
- **Mui**: bringing Mui from Japan to Spain, with her rows from the Google Sheet
- **Valencia homes**: the dog-friendly flat shortlist (reads live from the `valencia-home` repo)
- **Videos**: Valencia life in English plus Japanese vlogs

## How the dev branch differs from main

This branch is a **static** Next.js site (`output: "export"`, code in `src/`) so it can run on GitHub Pages instead of Netlify.

- The login and live Google Sheet sync need a server, so they are not on this branch. They still live on `main`. Don't merge `dev` into `main` without deciding how to keep them.
- The checklist is a snapshot in `src/data/checklist.json`. The Google Sheet stays the place to update statuses; refresh the snapshot when things change.
- Valencia listings come from `fixmylifedesigns/valencia-home/data/listings.json`, so edits there show up here within 5 minutes.

## Deploy

Every push to `dev` runs `.github/workflows/deploy-dev.yml`, builds the site and publishes it to the `gh-pages` branch.

One-time setup: **Settings → Pages → Source: Deploy from a branch → `gh-pages` / root**.

Note: GitHub Pages on a **private** repo needs a paid GitHub plan, and the published site itself is public. The pages are marked `noindex`, but anyone with the link can open them.

## Local development

```bash
npm install
npm run dev
```
