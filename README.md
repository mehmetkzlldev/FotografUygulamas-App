# 📸 FotografApp - Profesyonel Fotoğraf Düzenleme Uygulaması

Modern, hızlı ve güçlü web tabanlı fotoğraf düzenleme uygulaması. React + TypeScript + Vite ile geliştirilmiştir.

## 🚀 Özellikler

### ✨ Temel Düzenleme
- 🖼️ **Yüksek Kaliteli Yükleme** - 80MB'a kadar, kalite kaybı olmadan
- 🎨 **50+ Profesyonel Filtre** - Vintage, modern, artistik ve daha fazlası
- 🎛️ **Gelişmiş Ayarlar** - Parlaklık, kontrast, doygunluk, sıcaklık, gölge/ışık
- 📝 **Metin Ekleme** - Özelleştirilebilir font, renk, boyut ve gölge efektleri
- 🎭 **Sticker & Emoji** - 100+ sticker ve emoji kategorisi
- 💾 **4K Kayıt** - Yüksek çözünürlükte kayıt (PNG, lossless)

### 🤖 AI Özellikleri
- ✂️ **Arka Plan Kaldırma** - Python rembg ile AI destekli (canvas fallback)
- 🎨 **Otomatik Renk Düzeltme** - Resim tipine göre akıllı düzeltme (Portre, Manzara, Gece, İç Mekan)
- ✨ **Akıllı Netleştirme** - Bulanık fotoğrafları 4K'ya upscale edip netleştirme

### 📐 Renk Düzeltme Modları
- **Portre** - Cilt tonlarını koruyarak doğal görünüm
- **Manzara** - Gökyüzü ve doğa renklerini canlandırma
- **Gece** - Düşük ışık koşulları için optimize
- **İç Mekan** - Sıcak tonlar ve yumuşak ışık
- **Dengeli** - Genel amaçlı otomatik düzeltme

## 📦 Kurulum

### Frontend (Web App)

```bash
# Bağımlılıkları yükle
npm install

# Development server'ı başlat
npm run dev

# Production build
npm run build

# Production preview
npm run preview
```

Uygulama `http://localhost:3000` adresinde açılacaktır.

### Backend (Python - Opsiyonel)

AI özellikleri için Python backend (opsiyonel):

```bash
cd server-python

# Virtual environment oluştur
python -m venv venv

# Activate et (Windows)
venv\Scripts\activate

# Dependencies yükle
pip install -r requirements.txt

# Server'ı başlat
python app.py
```

Backend `http://localhost:3002` adresinde çalışacaktır.

## 🛠️ Teknoloji Stack

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool ve dev server
- **React Router** - Routing
- **Zustand** - State management
- **Canvas API** - Görüntü işleme

### Backend (Opsiyonel)
- **Python 3.8+** - Backend runtime
- **Flask** - Web framework
- **rembg** - AI background removal
- **Pillow** - Image processing
- **NumPy/SciPy** - Advanced image algorithms

## 📁 Proje Yapısı

```
src/
├── components/          # Reusable components
│   ├── Button.tsx
│   ├── TextElement.tsx
│   └── StickerElement.tsx
├── screens/            # Page components
│   ├── HomeScreen.tsx
│   ├── EditorScreen.tsx
│   └── ...
├── store/              # State management (Zustand)
│   └── useAppStore.ts
├── utils/              # Utility functions
│   ├── filters.ts
│   ├── imageSharpening.ts
│   ├── colorCorrection.ts
│   ├── backgroundRemover.ts
│   └── ...
└── App.tsx

server-python/          # Python backend (opsiyonel)
├── app.py
└── requirements.txt
```

## 🔧 Yapılandırma

### Environment Variables (Opsiyonel)

`.env` dosyası oluşturun:

```env
VITE_API_URL_PYTHON=http://localhost:3002
```

Python backend kullanmıyorsanız, uygulama otomatik olarak canvas tabanlı fallback kullanacaktır.

## 🎯 Özellikler Detayı

### Arka Plan Kaldırma
- Python rembg (AI model) - En iyi sonuç
- Canvas algoritması (fallback) - Python yoksa
- Otomatik nesne algılama
- Saç ve ince kenarlar için optimize

### Renk Düzeltme
- Görsel analizi ile otomatik mod seçimi
- White balance düzeltme
- Exposure ve shadow/highlight ayarları
- Adaptive saturation (skin tone korumalı)
- Adaptive contrast

### Netleştirme
- 4K upscaling (3840x2160)
- Aspect ratio koruma
- Yumuşak unsharp mask
- Doğal görünümlü sonuçlar

## 🚀 GitHub'a Yükleme

### 1. GitHub Repository Oluştur

1. GitHub'da yeni bir repository oluştur
2. Repository adını seç (örn: `fotografapp`)
3. Public veya Private seç
4. "Initialize with README" seçme (boş repo oluştur)

### 2. Projeyi Git'e Bağla

```bash
# Git repository'sini başlat
git init

# Tüm dosyaları ekle
git add .

# İlk commit
git commit -m "Initial commit: FotografApp - Profesyonel fotoğraf düzenleme uygulaması"

# GitHub repository'yi remote olarak ekle (URL'i kendi repo'nunla değiştir)
git remote add origin https://github.com/KULLANICI_ADI/REPO_ADI.git

# Branch'i main yap (eğer master ise)
git branch -M main

# GitHub'a push et
git push -u origin main
```

### 3. Sonraki Değişiklikler İçin

```bash
# Değişiklikleri kontrol et
git status

# Değişiklikleri ekle
git add .

# Commit yap
git commit -m "Değişiklik açıklaması"

# GitHub'a gönder
git push
```

### 4. .gitignore Kontrolü

`.gitignore` dosyası şunları hariç tutar:
- `node_modules/` - Bağımlılıklar
- `.env` - Environment variables (asla commit etme!)
- `dist/` - Build dosyaları
- Python cache dosyaları (`__pycache__/`, `*.pyc`)
- `server/` - Eski Node.js backend (artık kullanılmıyor)

**Önemli:** `.env` dosyasını asla commit etme! Hassas bilgiler içerir.

Eğer `.env` dosyası yoksa, `.vite.env.example` dosyasını `.env` olarak kopyalayabilirsin:
```bash
# Windows
copy .vite.env.example .env

# Linux/Mac
cp .vite.env.example .env
```

### 5. GitHub Pages (Opsiyonel - Static Hosting)

Projeyi GitHub Pages'de yayınlamak için:

```bash
# Production build
npm run build

# GitHub Pages için gh-pages branch'i oluştur
npm install --save-dev gh-pages

# package.json'a script ekle:
# "deploy": "gh-pages -d dist"
```

## 📝 Lisans

MIT

## 👨‍💻 Geliştirici

FotografApp - Modern fotoğraf düzenleme için
