# Deploy SAQR Frontend To Vercel

This project can be deployed on Vercel as a static site.

## Recommended Settings

When importing the project into Vercel, choose the `SAQR RRR` folder as the project root.

Use these settings:

```text
Framework Preset: Other
Build Command: leave empty
Output Directory: leave empty
Install Command: leave empty
```

The site now has:

```text
index.html
vercel.json
```

So Vercel can serve the app from the root and route:

```text
/          -> Public-Pages/index.html
/login     -> Public-Pages/login.html
/register  -> Public-Pages/register.html
/contact   -> Public-Pages/contact.html
```

These routes use redirects, not rewrites. That is important because the HTML files use relative CSS paths such as `style.css`; a rewrite can make Vercel show unstyled HTML by keeping the browser URL at `/`.

## Important Backend Note

The frontend can deploy now with local demo data. For production with a real backend, set the API base URL before `core-services.js` loads:

```html
<script>
  window.SAQR_API_BASE_URL = "https://your-backend-domain.com/api/v1";
</script>
<script src="../assets/js/core-services.js"></script>
```

The backend team should implement the endpoints in:

```text
BACKEND_API_README.md
```

## Demo Logins

```text
Admin: admin@saqr.edu / password123
Lecturer: lecturer@saqr.edu / password123
Student: student@saqr.edu / password123
```
