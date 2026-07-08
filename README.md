# guidefinder

A lightweight widget that recommends relevant [Civic Tech Field Guide](https://civictech.guide) [categories](https://app.civictech.guide/categories), [issues](https://app.civictech.guide/issues), and [communities](https://app.civictech.guide/communities) for any piece of text.

Pass it a paragraph, a page summary, or a theory of change — it returns up to 3 matching entries from the CTFG directory with links to explore further.

---

## Quick start

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/mstem/guidefinder@v1.0.0/guidefinder.css">
<script src="https://cdn.jsdelivr.net/gh/mstem/guidefinder@v1.0.0/guidefinder.js"></script>

<div id="ctfg-recommendations" hidden></div>

<script>
  GuiFinder.show(
    document.getElementById('ctfg-recommendations'),
    'Your text here — a page summary, a description of your project, etc.'
  );
</script>
```

Always pin the CDN URL to a release tag or commit hash (`@v1.0.0`, never `@main`) so the code you embed can't change out from under you. For extra protection, add an [`integrity`](https://developer.mozilla.org/en-US/docs/Web/Security/Subresource_Integrity) attribute:

```sh
openssl dgst -sha384 -binary guidefinder.js | openssl base64 -A
```

Or skip the CDN entirely — see [Self-hosting](#self-hosting-the-widget) below.

The container stays hidden until results arrive. If no relevant matches are found, or the daily request cap is reached, it stays hidden.

---

## API

### `GuiFinder.show(container, text [, options])`

| Parameter | Type | Description |
|---|---|---|
| `container` | `Element` | DOM element to render results into |
| `text` | `string` | Text to match against the CTFG directory (max 5000 chars) |
| `options.limit` | `number` | Max results to show, 1–3 (default: 3) |
| `options.heading` | `string` | Override the default heading text |

Results are lazy-loaded when the container scrolls into view (200px margin), so it's safe to call on page load without delaying rendering.

---

## Public API endpoint

The widget calls a public endpoint hosted by the Civic Tech Field Guide:

```
POST https://curator.civictech.guide/api/recommend
Content-Type: application/json

{
  "text": "your text here",
  "limit": 3
}
```

### Response

```json
{
  "categories": [
    {
      "name": "Civic Engagement",
      "description": "Tools and platforms for civic participation...",
      "softrUrl": "https://civictech.guide/...",
      "type": "category"
    }
  ],
  "issues": [...],
  "communities": [...]
}
```

Each result has `name`, `description`, `softrUrl`, and `type` (`"category"`, `"issue"`, or `"community"`).

If the daily request cap is reached, the response includes `"dailyCapReached": true` and empty arrays.

### Rate limits

- 10 requests per minute per IP
- 400 requests per day total across all callers
- Results are cached for 24 hours, so repeated identical queries are free

---

## Self-hosting the widget

Copy `guidefinder.js` and `guidefinder.css` into your project and update the script/link tags to point to your local copies. No build step required.

---

## License

MIT
