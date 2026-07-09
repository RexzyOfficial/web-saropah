# Kopi Saropah Website

A premium website for Kopi Saropah, showcasing a "Pay As You Wish" coffee experience — a static public site plus a React admin dashboard for managing menu items and the promo popup.

## 🌟 Features
- **Premium Design**: Monochrome (black/white/grey) color scheme, modern typography.
- **Responsive**: Fully optimized for Mobile, Tablet, and Desktop.
- **Interactive**: Scroll animations, mobile menu, gallery lightbox, promo popup.
- **Accessible**: Skip-to-content link on every page for keyboard/screen-reader users.
- **SEO-ready**: sitemap.xml, robots.txt, Open Graph & Twitter meta tags.
- **Analytics**: Google Analytics (GA4, `gtag.js`) loaded on every page.
- **Security**: A single, identical Content-Security-Policy is applied on every page (via meta tag) and duplicated in `vercel.json` / `netlify.toml` headers, so protection doesn't depend on which host you deploy to.
- **Admin dashboard**: A React app at `/admin` for menu CRUD (with image upload + live preview) and promo popup settings, backed by Supabase.

## 📂 Structure
- `index.html`: Home page
- `about.html`: About / founder story / timeline
- `coffee-basic.html`, `coffee-signature.html`, `milkshake.html`, `tea.html`, `food.html`: Menu pages (rendered dynamically from the Supabase `menu_items` table via `assets/js/menu-renderer.js`)
- `visit.html`: Location, hours, gallery, Google Maps embed
- `contact.html`: Contact form (Web3Forms) + FAQ
- `assets/css/style.css`: Single global stylesheet (also contains the WhatsApp floating widget styles)
- `assets/js/main.js`: Navigation, mobile menu, scroll animations, lightbox
- `assets/js/menu-renderer.js`: Fetches active menu items from Supabase per page (based on `data-category` on `<body>`), escapes all fields before injecting into the DOM
- `assets/js/promo-popup.js`: Renders the promo popup for visitors, reading config from the Supabase `promo_config` table
- `assets/js/whatsapp-widget.js`: Floating WhatsApp chat button
- `assets/js/supabase-config.js`: Supabase URL + anon key, shared by the public site
- `admin/`: React (Vite) app — the admin dashboard. Has its own `package.json`, builds independently from the public site. See **Admin Dashboard** section below.

## 🚀 Deployment
The public site is a pure static site (HTML/CSS/JS) — no build step required for it directly. The `admin/` folder, however, **is** a React app that needs building. Deployment is set up so both happen together automatically:

**To Deploy on Vercel (current setup):**
1. Push the repo to GitHub and import it into Vercel (Framework Preset: **Other**, Root Directory: repo root — not `admin/`).
2. The root `package.json` has a `vercel-build` script that runs `cd admin && npm install && npm run build` — Vercel runs this automatically on every deploy, so the admin app gets rebuilt without any extra manual step.
3. `vercel.json` already configures:
   - Clean URLs for the public site (e.g. `/about` → `about.html`)
   - Security headers (CSP, X-Frame-Options, etc.)
   - Long-term caching for `/assets/*`
   - Rewrites so `/admin/*` serves the built React app (`admin/dist/`) with client-side routing
4. Update the domain in `sitemap.xml`, `robots.txt`, and the Open Graph / Twitter meta tags in every `.html` file once you have a final production domain.

> `netlify.toml` is also included in case you ever migrate to Netlify instead. Note: it currently only covers the public site's headers — the equivalent `admin/*` build + rewrite setup would need to be added there too if you switch hosts.

### About the Content-Security-Policy
The CSP intentionally keeps `'unsafe-inline'` in `script-src` so inline `gtag()` calls and tag-manager scripts keep working, and includes `https://*.supabase.co` in `connect-src` so both the public site and the admin app can reach Supabase. If you swap analytics/tag tools later, update the CSP in **all** of these places at once (they must stay identical):
- The `<meta http-equiv="Content-Security-Policy">` tag in every public `.html` file
- `vercel.json`
- `netlify.toml`

If a third-party script or pixel stops firing after this update, it's almost always because its domain isn't in `script-src`/`connect-src` yet — add it to the CSP string in all three places above.

## 🛠 Customization
- **Colors / spacing / fonts (public site)**: Edit the `:root` variables in `assets/css/style.css`.
- **Colors / spacing / fonts (admin dashboard)**: Edit the `:root` variables in `admin/src/index.css` — kept intentionally in sync with the public site's design tokens.
- **Content**: Edit the `.html` files directly.
- **Menu items & prices**: Manage through `/admin` (Menu section) — no more editing a JSON file by hand. Changes save to Supabase and appear on the public site immediately.

## 🖥 Admin Dashboard (`/admin`)

A React app (Vite) covering two things: menu management and promo popup settings, behind a single Supabase Auth login.

**Local development:**
```bash
cd admin
npm install
npm run dev
```
Runs at `http://localhost:5173/admin/`.

**What it does:**
- **Menu**: add/edit/delete menu items, toggle active/inactive per item (inactive items are hidden from the public site immediately), upload images to Supabase Storage, live preview while editing.
- **Promo**: configure the popup image, click-through link, delay, and display frequency — same data the public-facing popup (`promo-popup.js`) reads from.

**Data model (Supabase):**
```sql
create table menu_items (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  price integer not null,
  description text,
  image_url text,
  category text not null,        -- 'coffee-basic' | 'coffee-signature' | 'milkshake' | 'tea' | 'food'
  active boolean default true,
  sort_order integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table menu_items enable row level security;

create policy "public can read active items" on menu_items
  for select using (active = true);

create policy "authenticated can do everything" on menu_items
  for all using (auth.role() = 'authenticated');
```
Images are uploaded to a public Supabase Storage bucket named `menu-images`.

**Creating an admin account:** Supabase Dashboard → **Authentication → Users → Add user**. There's no public sign-up — this is the only way to create a login.

## 📣 Promo popup (background info)
The promo popup (`assets/js/promo-popup.js` on the public site, configured via `/admin` → Promo) is backed by [Supabase](https://supabase.com) so that changes made in the admin dashboard show up for every visitor immediately — no redeploy needed.

```sql
create table promo_config (
  id int primary key default 1,
  url text,
  link text,
  delay int default 3000,
  freq text default 'session',
  active boolean default false,
  updated_at timestamptz default now()
);

insert into promo_config (id) values (1);

alter table promo_config enable row level security;

create policy "public can read" on promo_config
  for select using (true);

create policy "authenticated can update" on promo_config
  for update using (auth.role() = 'authenticated');
```
This makes the config publicly *readable* (so the popup can load it) but only *writable* by a logged-in admin.

**Click behavior:** if the promo link field is filled in, the promo image itself becomes clickable (and keyboard-focusable) and opens that link in a new tab. If left empty, the image is just a static banner.

## ⚠️ Before going live — please replace
- **Images**: `about.html` hero, `visit.html` hero, and the 3 gallery photos on `visit.html` still load from **Catbox.moe** and **Unsplash** — replace these with real photos hosted in `assets/images/` before launch so the site doesn't break if those external links ever go down.
- **Web3Forms access key**: `contact.html` ships with a real Web3Forms `access_key`. Web3Forms keys are meant to be public/client-side, but anyone who copies it can send mail through your quota unless you set domain restriction in your Web3Forms dashboard. Set this before final launch.
- **Domain references**: `sitemap.xml`, `robots.txt`, canonical links, and Open Graph/Twitter tags currently point at `https://web-saropah.vercel.app`. Update all of these once you have a final production domain.

## 📝 Recent changes
- **Menu data migrated from `assets/data/menu.json` to Supabase (`menu_items` table)**, managed via the new `/admin` React dashboard. `menu-renderer.js` now fetches from Supabase instead of a static JSON file.
- **`promo-admin.html` replaced by `/admin`** (React) — promo settings now live alongside menu management behind one login.
- All "Order Now" buttons switched from EasyEat to Shopee Food (shop `21718202`), with device-aware behavior:
  - **Mobile (Android/iOS)**: intercepted by `assets/js/main.js` (a delegated click listener on `[data-order-link]`) and redirected straight to the Shopee universal link in the same tab, which opens the Shopee app directly if it's installed.
  - **Desktop**: goes to a new page, `order.html`, in the same tab, showing a QR code plus a fallback link to the plain Shopee web page.
  - `order.html` intentionally doesn't load `promo-popup.js` / `supabase-config.js`, so the promo popup never shows on that page.
  - `order.html` has `noindex, follow` and isn't in `sitemap.xml`.
- Menu page hero background image replaced with a real local photo (`assets/images/menu-hero.webp`), no longer loading from Catbox.
- `contact.html` hero image now matches `visit.html` hero instead of an unrelated Unsplash placeholder.
- Removed the unused "Autumn Chant" font, its `@font-face`, and its font file.
- Added a skip-to-content link on every public page for keyboard/screen-reader accessibility.

---
© 2026 Kopi Saropah