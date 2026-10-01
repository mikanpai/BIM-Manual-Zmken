<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/ce42c95c-abd6-44e9-b1bc-e6eced94972f

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Shared media and manual content

Editor file pickers upload images (including `.webp`), GIFs, WebM, and MP4 files to
Supabase Storage when `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set. The
editor saves the returned public Storage URL instead of a browser-only data URL.
It also synchronizes the manual configuration through the `gloobe_manual_state`
table, so the same media and edits appear from any browser.

1. Copy the Supabase variables from `.env.example` into `.env.local`.
2. In the Supabase SQL Editor, run the SQL schema shown in **Admin Panel → Supabase**.
   It creates the `gloobe-assets` public bucket, its policies, and the shared state table.
3. Deploy the app with the same `VITE_SUPABASE_*` values. Do not use the service-role
   key in the browser.

The supplied SQL permits anonymous uploads so this unauthenticated editor works. For
a public production site, replace that upload policy with an authenticated admin-only
policy before exposing the Supabase project broadly.

Without those variables (or if the bucket policy is not installed), uploads fall back
to Base64 data stored in that browser's local storage; they are not shared with other
devices and may exceed browser storage limits.
