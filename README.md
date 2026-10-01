# حنين & جوهر — Wedding Invitation

A two-page static site (no build step). Open `index.html` in a browser, or serve the folder:

```bash
python3 -m http.server 8000   # then visit http://localhost:8000
```

## Flow

1. `index.html` — envelope intro. Pressing the button opens the envelope and navigates to `main.html`.
2. `main.html` — the invitation (hero, details, countdown, venue, music toggle).

## Structure

```text
project/
├── index.html          Envelope intro page
├── main.html           Invitation page
├── css/
│   ├── intro.css       Styles for index.html
│   └── main.css        Styles for main.html
├── js/
│   ├── intro.js        Envelope, doves, petals, particles (index.html)
│   ├── early.js        Tiny synchronous script in <head> of main.html (sets the
│   │                   "from-envelope" class before first paint, avoids a flash)
│   └── main.js         Audio, countdown, reveals, nav, map link (main.html)
└── assets/
    ├── images/         logo-seal.png, hero-photo.webp
    └── audio/          song.mp3
```

Each page has its own stylesheet because the two pages share a design system but
differ in many values (font sizes, seal style, `--gold-bright`, ...). Merging them
would have risked visual changes.

## Common edits

- Wedding date: `initCountdown()` in `js/main.js`.
- Venue / map search: `initVenue()` in `js/main.js` and the venue card in `main.html`.
- Hero photo: replace `assets/images/hero-photo.webp`.
- Song: replace `assets/audio/song.mp3`.
- Colors: CSS variables in `:root` at the top of each CSS file.
