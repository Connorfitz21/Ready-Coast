# Ready Coast Prep V4

Expanded preparedness command center with:

- Readiness score and dashboard
- Household profile
- Emergency contacts
- Important-record location tracking
- Full supply inventory with quantity, target, storage location, and expiration
- Low-stock, expiring, and expired filters
- Eight hazard-specific preparedness plans
- Evacuation planning
- Water, meals, pet-water, backup-power, and fuel-rotation calculators
- National Weather Service active alerts
- Offline-capable progressive web app
- Print-friendly plan
- Full JSON backup and restore

## Run locally

```bash
python -m http.server 8000
```

Open `http://localhost:8000`.

## Deploy free with GitHub Pages

1. Create a public GitHub repository.
2. Upload every file in this folder to the repository root.
3. Open Settings > Pages.
4. Choose "Deploy from a branch."
5. Select `main` and `/ (root)`.
6. Save and use the generated URL.

## Privacy

Data is stored in browser localStorage. Ready Coast does not create user accounts or send household data to a server. Location is sent only to the National Weather Service when the user requests active alerts.


## If the old version still appears

The original app used offline caching. After uploading V3:

1. Open the site.
2. Press Ctrl+Shift+R on Windows or Command+Shift+R on Mac.
3. If needed, open browser settings for the site and clear stored data.
4. On a phone, remove the installed app icon, reopen the site in the browser, and install it again.

The V3 header displays a visible `V3` badge, so you can immediately confirm the update loaded.


## V4 branding update

This build applies the production lighthouse shield logo and the new Ready Coast Prep visual system directly to the website:

- Dark navy navigation and hero section
- Electric blue controls and progress indicators
- Gold lighthouse-beam accents
- White and light-gray content surfaces
- New shield favicon and full wordmark
- Cache version updated to V4

After uploading the files, use Ctrl+Shift+R. On an installed phone version, remove and reinstall the app if the previous theme remains cached.
