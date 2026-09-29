# PSF Investor Research Hub 2027

A GitHub Pages frontend for the Pune Startup Fest 2027 Investor Relations team.

## Features

- Website B / investor-directory URL input
- Demo investor discovery workflow
- Production API mode
- Investor database
- Search and status filtering
- Editable records
- Evidence/source URLs
- Confidence scores
- Duplicate-safe merge by normalized investor name
- Excel `.xlsx` export
- CSV export
- Responsive dark investor-relations UI
- GitHub Pages deployment workflow

## Important architecture note

GitHub Pages hosts the frontend only. It is not a server-side web crawler or AI-agent runtime.

For production research:

```text
GitHub Pages frontend
        |
        | POST /api/research
        v
Your backend
        |
        +--> permitted web research/search service
        |
        +--> identity resolution
        |
        +--> evidence collection
        |
        v
structured investor JSON
```

Never place private API keys in `app.js` or other files published to GitHub Pages.

## Investor data fields

The exported workbook contains:

- Investor Name
- LinkedIn Bio
- LinkedIn Followers
- City / Location
- Phone
- Email
- LinkedIn Link
- Verification Status
- Confidence
- Source URLs
- Notes

The application is designed for public professional/business contact information. It should not be used to uncover private contact details.

## LinkedIn

Do not build an unauthorized crawler/scraper for LinkedIn profiles or follower counts. If LinkedIn-specific fields are required, use an authorized API/data provider or human verification workflow consistent with the provider's terms.

The frontend therefore supports the LinkedIn fields but does not claim to scrape LinkedIn automatically.

## Run locally

No build system is required.

Open:

```text
index.html
```

For best browser behavior, use a local static server:

```bash
python -m http.server 8000
```

Then visit:

```text
http://localhost:8000
```

## GitHub Pages deployment

1. Create a new GitHub repository, for example:

```text
psf-investor-research-2027
```

2. Upload all project files.

3. Push to the `main` branch.

4. Open:

```text
Repository
→ Settings
→ Pages
```

5. Under Build and deployment choose:

```text
Source: GitHub Actions
```

6. Push another commit if required.

The included:

```text
.github/workflows/deploy.yml
```

will deploy the site.

Your URL will normally be:

```text
https://YOUR-USERNAME.github.io/REPOSITORY-NAME/
```

## Production API response

The frontend expects:

```json
{
  "sourceUrl": "https://example.com/investors",
  "investors": [
    {
      "name": "Example Investor",
      "bio": "Public professional biography",
      "followers": "",
      "city": "Mumbai",
      "phone": "public business number",
      "email": "public business email",
      "linkedin": "https://www.linkedin.com/in/example",
      "status": "verified",
      "confidence": 94,
      "sources": [
        "https://company.example/team/example"
      ],
      "notes": "Verified against company profile."
    }
  ]
}
```

## Production backend

See:

```text
backend-example/server.js
backend-example/package.json
```

The example intentionally contains an empty research implementation. Connect it to the approved web research/search service of your choice.

## Security

- Do not commit API keys.
- Do not expose backend secrets in frontend JavaScript.
- Validate all URLs and input server-side.
- Log source URLs for provenance.
- Keep uncertain records in `review`.
- Never fabricate missing emails, phone numbers, bios or follower counts.
