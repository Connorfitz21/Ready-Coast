# Ready Coast

Ready Coast is a free, static progressive web app for household emergency planning.

## Features
- Emergency kit checklist with custom items
- Household water, meal, and pet-water estimates
- Locally stored family plan
- JSON backup export/import
- Active National Weather Service alerts using device location
- Official FEMA, NOAA/NWS, NHC, USGS, and Red Cross links
- Offline support after the first visit
- Installable on supported phones and computers

## Run locally
Service workers and location permissions require HTTP/HTTPS rather than opening `index.html` directly.

With Python installed:

```bash
cd ready_coast_app
python -m http.server 8000
```

Open `http://localhost:8000`.

## Free deployment with GitHub Pages
1. Create a free GitHub account and a new public repository.
2. Upload every file in this folder to the repository root.
3. Open Settings → Pages.
4. Under "Build and deployment," select "Deploy from a branch."
5. Select the `main` branch and `/ (root)`, then save.
6. GitHub will provide the public web address.

## Important notes
- User information is stored in browser localStorage, not on a server.
- Clearing browser data can erase it, so use Export backup.
- NWS alerts are U.S.-focused and require an internet connection and location permission.
- This app is an organizer, not an emergency warning system.
