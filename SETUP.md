# Setup guide (your part)

Three things need your accounts: the **Google Sheet**, the **Google Cloud project**, and the
**GitHub repo**. Do them in this order. Replace `<username>` with your GitHub username and
`<repo>` with the repo name (suggested: `kasatria-3d`).

When you're done, send me the three values from step 2.7. The site works locally without
them (demo login + sample data); with them it uses real Google sign-in and the live Sheet.

---

## 1. Google Sheet (~5 min)

1. Go to <https://sheets.google.com> → **Blank spreadsheet**.
2. **File → Import → Upload** → choose `data/people-clean.csv` from this project.
   - Import location: **Replace spreadsheet** · Separator: **Detect automatically** ·
     Convert text to numbers: **Yes** → **Import data**.
3. Rename the tab at the bottom from `Sheet1` (or `people-clean`) to **`Data`**
   (double-click the tab).
4. Name the file, e.g. *Kasatria Assignment – People*.
5. **Share** (top right):
   - Add **lisa@kasatria.com** as **Viewer** → **Send**.
   - Under **General access** choose **Anyone with the link** → role **Viewer** → **Done**.
     (The API key can only read sheets shared this way.)
6. Copy the **Sheet ID** from the address bar:
   `https://docs.google.com/spreadsheets/d/`**`<SHEET_ID>`**`/edit`

## 2. Google Cloud project (~15 min)

Go to <https://console.cloud.google.com>.

1. **Create project**: project picker (top bar) → **New project** → name `kasatria-3d` → **Create**,
   then make sure it's selected.
2. **Enable the Sheets API**: ☰ → **APIs & Services → Library** → search *Google Sheets API* →
   **Enable**.
3. **Branding**: ☰ → **Google Auth Platform → Branding** (if asked, click **Get started**):
   - App name: `Kasatria 3D People Table`
   - User support email: your Gmail
   - Audience: **External**
   - Developer contact email: your Gmail → **Create**.
4. **Test users (for now)**: **Audience → Test users → Add users** → add
   `lisa@kasatria.com` and your own Gmail. Publishing needs the live site URL, so it is done in
   §4 after deployment.
5. **OAuth client**: **Google Auth Platform → Clients → Create client**
   - Application type: **Web application**, name `kasatria-3d web`
   - **Authorized JavaScript origins** → add both:
     - `http://localhost:5173`
     - `https://<username>.github.io` ← origin only, no `/<repo>` path
   - Authorized redirect URIs: leave empty → **Create**. Copy the **Client ID**
     (`…apps.googleusercontent.com`).
6. **API key**: ☰ → **APIs & Services → Credentials → Create credentials → API key**. Then open
   the key (**Edit API key**):
   - **Application restrictions → Websites**, add:
     - `http://localhost:5173/*`
     - `https://<username>.github.io/<repo>/*`
   - **API restrictions → Restrict key** → tick **Google Sheets API** → **Save**.
7. Send me (they are not secrets — they ship in the public page; the restrictions above
   protect them):
   - Client ID
   - API key
   - Sheet ID

> New origins/restrictions can take 5 minutes (occasionally longer) to start working.

## 3. GitHub Pages (~10 min)

1. Create an empty repo at <https://github.com/new> named `<repo>` (public; no README).
2. Repo → **Settings → Secrets and variables → Actions → Variables tab → New repository
   variable**, add four:

   | Name | Value |
   |---|---|
   | `VITE_GOOGLE_CLIENT_ID` | Client ID from 2.5 |
   | `VITE_SHEETS_API_KEY` | API key from 2.6 |
   | `VITE_SHEET_ID` | Sheet ID from 1.6 |
   | `VITE_SHEET_RANGE` | `Data!A1:F` |

3. Repo → **Settings → Pages → Build and deployment → Source: GitHub Actions**.
4. Push the code (I can do this once the repo exists):
   ```bash
   git remote add origin https://github.com/<username>/<repo>.git
   git push -u origin main
   ```
5. **Actions** tab → wait for *Deploy to GitHub Pages* to go green. Your link is
   `https://<username>.github.io/<repo>/`.
6. Test in a private/incognito window with a different Google account.

## 4. Publish the Google app (~5 min, after the site is live)

Google requires a home page, privacy policy and authorised domain before an app can go to
production. The site includes `privacy.html` for this.

1. **Google Auth Platform → Branding**:

   | Field | Value |
   |---|---|
   | Application home page | `https://<username>.github.io/<repo>/` |
   | Application privacy policy link | `https://<username>.github.io/<repo>/privacy.html` |
   | Authorised domains → Add domain | `<username>.github.io` |

   Leave Terms of Service empty → **Save**.
2. **Audience → Publish app → Confirm**. Status must say **In production** — otherwise only
   test users can sign in. (No Google review is needed: the app only asks for name, email
   and photo.)
3. Send the link to Kasatria.

## Troubleshooting

| Symptom | Fix |
|---|---|
| Google button missing / "origin not allowed" / `idpiframe` error | Add the exact origin in 2.5; wait a few minutes. |
| "Access blocked: app is in testing" or reviewer can't sign in | Add them under Audience → Test users (2.4), or publish the app (§4). |
| Data error 403 | Sheet not "Anyone with the link", or API key website restriction doesn't match the URL, or Sheets API not enabled. |
| Data error 400 | Tab isn't named `Data` (or change `VITE_SHEET_RANGE`). |
| Data error 404 | Wrong Sheet ID. |
| "Site not configured" page | A GitHub Actions variable is missing — add it and re-run the workflow. |
