# Python Background Removal API

AI-powered background removal using `rembg` library.

## Installation

```bash
cd server-python
pip install -r requirements.txt
```

**Not:** İlk kullanımda model otomatik olarak indirilecek (~176MB).

## Running

```bash
python app.py
```

Server `http://localhost:3002` adresinde çalışacak.

## API Endpoints

### POST /api/bg/remove
Full resolution background removal

### POST /api/bg/preview
Preview (lower resolution, faster)

### GET /api/health
Health check

## Usage

Frontend'den kullanım için `.vite.env` dosyasına ekle:

```env
VITE_API_URL_PYTHON=http://localhost:3002
```

## Notes

- İlk kullanım yavaş olabilir (model indirme)
- Model cache'lenir, sonraki kullanımlar hızlı
- rembg U²-Net modelini kullanır (yüksek kalite)

