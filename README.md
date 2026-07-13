# Ready Coast Prep V8

## Fixed
- Browser tab favicon now uses the lighthouse shield.
- Added SVG and PNG favicon declarations with cache version 8.
- Replaced the app-install icons with the lighthouse shield.
- The initial setup is explicitly optional.
- Added a visible `Skip for now` button.
- Added a top-right close button.
- Pressing Escape also skips and closes the setup.
- The dashboard keeps a `Finish household setup` button so users can return later.
- Setup controls remain visible on shorter screens.

Upload all files to the repository root, including `CNAME`, `.nojekyll`, and `favicon-32.png`.

After deployment, open:
https://readycoastprep.com/?v=8

For the browser tab icon, fully close the old tab and open a new tab after deployment. Browsers often cache favicons longer than page content.
