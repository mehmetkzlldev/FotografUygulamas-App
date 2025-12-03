# Background Removal API Server

AI-powered background removal API using `@imgly/background-removal`.

## Installation

```bash
cd server
npm install
```

## Configuration

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

## Running

Development (with auto-reload):
```bash
npm run dev
```

Production:
```bash
npm start
```

## API Endpoints

### POST /api/bg/preview
Preview background removal (lower resolution, faster)

**Request:**
```json
{
  "image": "data:image/png;base64,...",
  "mode": "auto",
  "tolerance": 40
}
```

**Response:**
```json
{
  "success": true,
  "result": "data:image/png;base64,...",
  "mode": "auto",
  "resolution": { "width": 800, "height": 600 }
}
```

### POST /api/bg/remove
Full resolution background removal

**Request:**
Same as preview, but processes full resolution image.

### GET /api/health
Health check endpoint

## Modes

- `auto`: AI-powered segmentation (best quality)
- `direct`: Fast edge-based removal
- `color`: Color-based removal with target color

## Notes

- AI model will be downloaded on first use (~10-50MB)
- First request may be slower due to model initialization
- Subsequent requests are much faster

