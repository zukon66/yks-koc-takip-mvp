# YKS Koc Takip

YKS hazirlik surecinde ders/kitap ilerlemesini gunluk olarak takip etmek icin gelistirilmis bir Next.js uygulamasi. Uygulama tarayici tarafinda calisir, verileri `localStorage` ile saklar ve GitHub Pages uzerinden statik olarak yayinlanabilir.

## Ozellikler

- Gun bazli planlama (`plan`): secili gunun gorevleri, tamamlanma isaretleme, ilerleme yuzdesi
- Kitap notlari (`books`): ders bazli kitap ekleme, duzenleme, silme
- Gecmis kayitlar (`notes`): olusturma/guncelleme aksiyon gecmisi, kayit duzenleme/silme
- JSON yedekleme ve geri yukleme (import/export)
- Acik/koyu tema destegi
- Eski veri formatindan (`v1`) yeni formata (`v2`) migrasyon

## Teknoloji Yigini

- Next.js 15 (App Router, static export)
- React 19
- TypeScript
- Tailwind CSS
- Lucide React (ikonlar)

## Proje Yapisi

```text
.
|- app/
|  |- globals.css        # Global stiller
|  |- layout.tsx         # Fontlar ve metadata
|  `- page.tsx           # Tum uygulama akisi ve UI
|- .github/workflows/
|  `- deploy-pages.yml   # GitHub Pages deployment workflow
|- next.config.js        # Static export + basePath/assetPrefix
|- tailwind.config.ts
`- package.json
```

## Kurulum

Gereksinim: Node.js 20+

```bash
npm install
```

## Gelistirme

```bash
npm run dev
```

Tarayicida: `http://localhost:3000`

## Build ve Calistirma

```bash
npm run build
npm run start
```

Not: Proje `output: "export"` kullandigi icin build sonunda statik cikti `out/` klasorune uretilir.

## NPM Scriptleri

- `npm run dev`: gelistirme modu
- `npm run build`: production build + static export
- `npm run start`: production server
- `npm run lint`: lint kontrolu

## Veri Saklama

Veriler tarayicida asagidaki anahtarlarla tutulur:

- `yks-koc-takip-data-v2`: ana veri (kitaplar + loglar)
- `yks-koc-takip-books-v1`: eski format (otomatik migrasyon icin)
- `yks-koc-theme-v1`: tema tercihi

Yedekleme dosyasi JSON olarak disari aktarilir (`yks-takip-yedek.json`) ve tekrar ice aktarilabilir.

## Deploy (GitHub Pages)

Workflow: `.github/workflows/deploy-pages.yml`

- `main` branch push oldugunda otomatik deploy calisir
- Build artefakti `out/` klasorunden alinip Pages'e yuklenir
- `next.config.js` icinde production icin `basePath` ve `assetPrefix` repo adina gore ayarlanir (`yks-koc-takip-mvp`)

## Durum Ozeti

- Proje tek sayfa uzerinde calisan, kullanima hazir bir MVP seviyesinde
- Lokal build basarili (Next.js build + static export tamamlandi)
- CI/CD tarafinda GitHub Pages workflow tanimli
