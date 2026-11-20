# Element Gym — Live Sponsorship Tracker

A live, shared tracker for Element Gym's 2026–27 sponsorship campaign. It's a React app built with Vite and hosted on Netlify. One Netlify Function saves the data in Netlify Blobs, Netlify's built-in storage, so there's no outside database or account to set up.

- **Everyone with the link** sees the tracker read-only. It refreshes every 15 seconds and whenever the tab regains focus.
- **Editors** sign in with one shared passcode to log touches, edit prospects, assign fighter sponsors, update milestones and post the Friday update.

Contact names, emails and negotiation notes are **not** stored here. Keep them in the internal CRM workbook.

## Deploy (about 10 minutes)

You need a free Netlify account and either a GitHub account or the Netlify CLI. A plain drag-and-drop deploy publishes only the page, not the save function, so use one of these two ways.

### Option A — GitHub (recommended)
1. Create a new private GitHub repository and upload everything in this folder. Upload the folder's contents, not a zip.
2. In Netlify: **Add new project → Import an existing project → GitHub**, then pick the repository.
3. Netlify reads `netlify.toml` and fills in the build settings itself: build command `npm run build`, publish folder `dist`, functions folder `netlify/functions`. Click **Deploy**.
4. Go to **Project configuration → Environment variables → Add a variable**:
   - Key: `EDITOR_PASSCODE`
   - Value: a passphrase only editors will know, for example four random words
   - Scope: Functions
5. **Deploys → Trigger deploy → Deploy project** so the function picks up the passcode.
6. Open the site, click **Editor sign-in** and enter the passcode.

### Option B — Netlify CLI
```bash
npm install
npx netlify login
npx netlify init          # create or link the Netlify project
npx netlify env:set EDITOR_PASSCODE "your passphrase here"
npx netlify deploy --build --prod
```

### Local development
```bash
npm install
npx netlify dev           # runs the app and the function together at http://localhost:8888
```
`netlify dev` uses a local Blobs store. Set `EDITOR_PASSCODE` in a `.env` file (already git-ignored) to test editing.

## How the data works

- On the first visit the function serves the starting data in `data/seed.js`: 85 prospects from the outreach calendar, the Dec 5 fighters, 35 partner positions at $490,000, timeline milestones, and the Nov 1 and Nov 20 Friday updates.
- The first save writes the full tracker to the Blobs store `element-sponsorship` under the key `tracker-v1`. From then on `data/seed.js` is ignored, and redeploys don't touch saved data.
- Each save sends only what changed. If two editors save at the same moment, the function re-reads the latest copy and applies the change again, so nothing is overwritten.
- Every change shows an **Undo** button for 7 seconds.

**Back up or export:** open `https://YOUR-SITE.netlify.app/api/tracker` to download the whole tracker as JSON.

**Start over from the starting data:** in Netlify, open **Blobs**, find store `element-sponsorship`, and delete the key `tracker-v1`.

## Using it

| Task | Where |
| --- | --- |
| See what's due | **Due today** at the top. Overdue items have a red edge. |
| Log a touch | **Log touch** records the touch, sets the next follow-up date and next step (touch 2 after 4 days, touch 3 after 4, touch 4 after 5), and moves the prospect to *Outreach initiated*. |
| Update a deal | **Edit** on a row: stage, partner position, potential and signed value, meeting date, decline reason. |
| Add a prospect | **Add prospect** above the pipeline. |
| Fighter sponsors | Click a fighter card. |
| Milestones | **Update milestone status** under the timeline. |
| Friday update | Add items at the bottom of the Friday update section. Pick past weeks from the menu. |

The headline numbers, stage chart and position map are calculated from the pipeline. Signed revenue counts only *Closed* prospects with a signed value. Pipeline value counts potential value for prospects in conversation, proposal or negotiation.

## Files

```
netlify.toml                  build + function settings
netlify/functions/tracker.mjs the only server code (read + save, passcode check)
data/seed.js                  starting data
src/App.jsx                   app state, live refresh, saving, undo
src/components/               masthead, due today, pipeline, forms, progress, fighters, timeline, Friday update
src/logic.js                  dates, money, stages, follow-up cadence
src/styles.css                Element brand styles
```

## Security notes

- The passcode is checked on the server, never in the browser. Anyone without it can only read.
- The tracker URL is unlisted (`noindex`) but not private: anyone with the link can view it. To restrict viewing too, turn on Netlify's site-wide password protection, which needs a paid Netlify plan.
- To change the passcode, update `EDITOR_PASSCODE` and redeploy. Editors then sign in again.
