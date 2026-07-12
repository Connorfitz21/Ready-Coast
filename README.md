# Ready Coast v2

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
