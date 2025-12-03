# 🚀 GitHub Pages Deployment Rehberi

## GitHub Pages Ayarları

Deploy başarılı olsa bile, GitHub Pages'in aktif olması için ayarları yapman gerekiyor:

### 1. GitHub Repository Sayfasına Git
`https://github.com/mehmetkzlldev/FotografUygulamas-App`

### 2. Settings'e Git
Repository sayfasında **"Settings"** sekmesine tıkla

### 3. Pages Ayarları
1. Sol menüden **"Pages"** sekmesine tıkla
2. **"Source"** bölümünde:
   - **"Deploy from a branch"** seç
   - **Branch:** `gh-pages` seç
   - **Folder:** `/ (root)` seç
3. **"Save"** butonuna tıkla

### 4. Bekle (2-5 dakika)
GitHub Pages siteyi hazırlaması biraz zaman alabilir. Sayfayı yenile ve şu linke git:
```
https://mehmetkzlldev.github.io/FotografUygulamas-App/
```

## Otomatik Deploy

Her kod değişikliğinden sonra deploy etmek için:

```bash
npm run deploy
```

Bu komut:
1. ✅ Production build yapar
2. ✅ `dist/` klasörünü `gh-pages` branch'ine push eder
3. ✅ GitHub Pages otomatik güncellenir (birkaç dakika sürebilir)

## Sorun Giderme

### 404 Hatası Görüyorsan:
1. GitHub → Settings → Pages kontrol et
2. `gh-pages` branch'inin var olduğunu kontrol et
3. 5-10 dakika bekle (ilk deploy zaman alabilir)

### Site Güncellenmiyorsa:
```bash
# Tekrar deploy et
npm run deploy

# GitHub'da branch'i kontrol et
git ls-remote --heads origin gh-pages
```

### Farklı URL Kullanmak İstersen:
`vite.config.ts` dosyasındaki `base` ayarını değiştir:
```typescript
base: '/FotografUygulamas-App/', // Repo adına göre
```

## Canlı Link
Site aktif olduktan sonra:
```
https://mehmetkzlldev.github.io/FotografUygulamas-App/
```

