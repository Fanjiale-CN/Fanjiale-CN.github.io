# Reader contact Worker setup

The City Atlas is published with the site. The reader form becomes active after this one-time Cloudflare setup. Until the route exists, every form location keeps the email fallback visible.

## 1. Create the private R2 inbox

1. Open the Cloudflare dashboard, then **Storage & Databases → R2 Object Storage**.
2. Choose **Create bucket**.
3. Name it exactly `galok-reader-submissions` and create it.
4. Keep this bucket private. It is an editorial inbox, not public media.

## 2. Create the Turnstile widget

1. In Cloudflare, open **Turnstile → Add widget**.
2. Use the widget name `galok-reader-contact`.
3. Add the hostname `www.galok.me`.
4. Keep the widget mode on **Managed** and create it.
5. Copy both values Cloudflare shows:

   - **Site key** — public; it goes in `workers/reader-contact/wrangler.jsonc`.
   - **Secret key** — private; it goes into the Worker secret command below.

Never put the **Secret key** in an HTML file, JavaScript file, GitHub repository variable, or GitHub Action secret. This Worker receives it directly from Cloudflare after deployment.

## 3. Deploy the Worker from this repository

Run these commands on a computer with Node.js 20 or later. They are executed from the repository root.

```bash
cd workers/reader-contact
npm install
npx wrangler login
```

Open `workers/reader-contact/wrangler.jsonc` and replace only this placeholder:

```json
"TURNSTILE_SITEKEY": "REPLACE_AFTER_CREATING_TURNSTILE_WIDGET"
```

Paste the public **Site key** there. Then set the private **Secret key**. The command opens a prompt; paste the value once and press Enter.

```bash
npx wrangler secret put TURNSTILE_SECRET
npx wrangler deploy
```

The configuration already binds the Worker to the R2 bucket named `galok-reader-submissions`. If Wrangler says it cannot find the bucket, return to step 1 and verify the bucket name character-for-character.

## 4. Connect the Worker to the site

1. Cloudflare dashboard → **Workers & Pages** → open `galok-reader-contact`.
2. Open **Settings → Domains & Routes**.
3. Choose **Add route**.
4. Select zone `galok.me` and enter this exact route:

```text
www.galok.me/api/contact*
```

5. Save the route.

The browser then calls `https://www.galok.me/api/contact/config` to obtain only the public site key, and sends completed records to `https://www.galok.me/api/contact`. The Worker validates Turnstile server-side, limits one IP to one record every 10 minutes, escapes submitted text, and writes JSON files to private R2.

## 5. Verify the form

1. Open `https://www.galok.me/about/` in a private window.
2. Scroll to **PUT IT ON THE RECORD**.
3. The Turnstile checkbox should appear. Submit a short test message.
4. In Cloudflare R2, open `galok-reader-submissions`. A new object should appear under `submissions/YYYY/MM/DD/`.

For a fast route check, open this URL in a browser:

```text
https://www.galok.me/api/contact/config
```

It should return JSON containing `turnstileSiteKey`. It must never return `TURNSTILE_SECRET`.

## Optional: deliver records to another service

R2 is the source of truth. If a future mail, automation, or database endpoint accepts JSON webhooks, configure it without changing the form:

```bash
npx wrangler secret put DELIVERY_WEBHOOK_URL
npx wrangler secret put DELIVERY_WEBHOOK_AUTH
```

`DELIVERY_WEBHOOK_AUTH` is optional and is sent as a Bearer token only when set. Failed webhook delivery does not discard the R2 record.

## Common checks

| Symptom | Check |
| --- | --- |
| “Reader desk is preparing” | Confirm the route in step 4 and open `/api/contact/config`. |
| Turnstile does not appear | Verify the **Site key** in `wrangler.jsonc` and the hostname `www.galok.me` in Turnstile. |
| Submit returns a verification error | Set `TURNSTILE_SECRET` again with `npx wrangler secret put TURNSTILE_SECRET`, then deploy. |
| Submit returns 503 | Check the R2 bucket binding and its exact name. |

Cloudflare reference: [Turnstile server-side validation](https://developers.cloudflare.com/turnstile/get-started/server-side-validation/).
