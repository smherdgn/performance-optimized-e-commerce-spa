# Strateji Varyantları ve Davranış Farkları

Aşağıdaki Vercel deployment’ları aynı kod tabanının farklı strateji konfigürasyonlarını çalıştırır. Her strateji, `VITE_STRATEGY` ile seçilir; CDN varyantlarında ayrıca `VITE_CDN_ENABLED=true` ve `VITE_ASSET_BASE_URL=https://semiherd.com` kullanılır. Varsayılan veri seti `medium`dir ve chunk/manifest yapısı geçerlidir.

## Varyant Haritası
- **Lazy (A)**: https://performance-optimized-strategy-a.vercel.app  
- **Split (B)**: https://strategy-b-performance-optimized.vercel.app  
- **Prefetch (C)**: https://strategy-c-performance-optimized.vercel.app  
- **Combo (D)**: https://strategy-d-performance-optimized.vercel.app  
- **Lazy + CDN (A’)**: https://strategy-a-cdn-performance-optimize.vercel.app  
- **Split + CDN (B’)**: https://strategy-b-cdn-performance-optimize.vercel.app  
- **Prefetch + CDN (C’)**: https://strategy-c-cdn-performance-optimize.vercel.app  
- **Combo + CDN (D’)**: https://strategy-d-cdn-performance-optimize.vercel.app  

## Strateji Bazlı Davranışlar (koda göre)
- **Lazy (`VITE_STRATEGY=lazy`)**
  - Bileşenler `LazyComponent` ile viewport’a girince yüklenir.
  - Route preload yok (route modülleri uygulama başında preload edilir).
  - Prefetch yok; veri sadece ihtiyaç olduğunda çekilir.
- **Split (`VITE_STRATEGY=split`)**
  - Route modülleri gerçekten ayrık chunk’lara bölünür ve ziyaret edilince yüklenir.
  - Prefetch yok; veri sadece sayfa açılınca çekilir.
  - Lazy davranışı devre dışı.
- **Prefetch (`VITE_STRATEGY=prefetch`)**
  - Route modülleri eager preload (split yok).
  - Prefetch aktif: `usePrefetch` link hover/viewport ile hem route kodunu hem ürün datasını (`preloadProducts`) önden indirir.
  - Lazy davranışı devre dışı.
- **Combo (`VITE_STRATEGY=combo`)**
  - Lazy + split + prefetch hepsi açık.
  - Route modülleri split edilir; link hover/viewport ile hem kod hem data preload edilir.

## Veri Yükleme Özeti (tüm stratejiler)
- **Dataset yapısı**: `catalog.<variant>.manifest.json` + 500’lük chunk dosyaları. Tekil büyük JSON yok.
- **Home**: `fetchProductsPreview(4)` ile yalnız ilk chunk’tan 4 ürün çeker; hata olursa tam dataset’e düşer.
- **Catalog/Product**: `fetchProducts()` manifestteki tüm chunk’ları çeker (katalog sayfasına girince veya prefetch ile).
- **Prefetch etkisi**: Sadece `prefetch`/`combo` stratejisinde link hover/viewport ile `preloadProducts` tetiklenir; diğer stratejilerde data önceden yüklenmez.
- **CDN varyantı**: Önce `VITE_ASSET_BASE_URL` üzerinden manifest/chunk istemi; CORS/erişim hatası olursa otomatik `/assets/...` fallback.

## Test/Ölçüm İçin
- Sentetik matris: `pnpm run-matrix` (15 tekrar, tüm strateji + CDN varyantları).  
- Tek koşu: `pnpm test:lhci -- --variant=A` (araç: lhci|wpt|k6).  
- Özet: `pnpm analyze` → `reports/summary.{json,md}`.

## Ortak Vercel Build/Runtime Ayarları
- Build Machine: Standard performance (4 vCPU, 8 GB RAM), On-Demand Concurrent Builds: Disabled, Prioritize Production: Enabled.
- Runtime: Fluid Compute Enabled, Function CPU: Standard (1 vCPU, 2 GB RAM).
- Deployment Protection: Standard, Skew Protection: Disabled, Cold Start Prevention: (varsayılan/uygulanmıyor).

## CDN (Cloudflare R2) Konfigürasyonu
- Bucket: `perfshop-assets` (EEUR). S3 API: `https://dd101a441692b94ef98221c66d3cf43c.r2.cloudflarestorage.com/perfshop-assets`
- Custom domain: `https://semiherd.com` (prod için önerilen erişim).
- Public dev URL: `https://pub-937098cf946840d1992cd22c8c40bae8.r2.dev` (rate-limited, cache yok).
- CORS Allowed Origins: `https://strategy-a-cdn-performance-optimize.vercel.app`, `https://strategy-b-cdn-performance-optimize.vercel.app`, `https://strategy-c-cdn-performance-optimize.vercel.app`, `https://strategy-d-cdn-performance-optimize.vercel.app`, `http://localhost:5173`
- Allowed Methods: `GET`; Allowed Headers: `--` (yok). Diğer alanlar (Lifecycle, Bucket Lock, Event Notifications, On Demand Migration): varsayılan/kapalı.
