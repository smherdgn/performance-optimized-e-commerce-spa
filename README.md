# Performance-Optimized E-commerce SPA

This project is a single-page application (SPA) built with React and TypeScript, designed specifically for benchmarking and comparing various front-end performance optimization strategies. It serves as a robust testbed for performance engineering experiments.

## 1. Project Overview

The application is a mini e-commerce site that allows testing of four distinct performance strategies, both with and without a simulated CDN. This results in an 8-variant test matrix, enabling detailed analysis of how different optimization techniques impact key web performance metrics (Web Vitals).

### 1.1. Core Features
- **Pages**: Home, Catalog (with infinite scroll), Product Detail, Cart, Checkout, About.
- **Content**: Multiple datasets (`small`, `medium`, `large`) to simulate different content loads.
- **Heavy Modules**: Dynamically imported charting and mapping libraries to test the impact of large, non-critical assets.
- **Performance Strategies**: Configurable via environment variables.
- **Measurement**: Integrated Web Vitals collection and a full suite of performance testing scripts.

## 2. Setup and Installation

### 2.1. Prerequisites
- Node.js (v18+)
- A package manager: `pnpm` (recommended), `yarn`, or `npm`

### 2.2. Installation
1. Clone the repository:
   ```bash
   git clone <repository_url>
   cd perf-ecommerce-spa
   ```
2. Install dependencies:
   ```bash
   pnpm install
   ```

### 2.3. Generate the large dataset (optional)
Datasets are shipped as 500-item chunks plus a manifest. Large single-file catalogs are no longer used.

### 2.4. Refresh chunked catalogs
If you modify any source catalog data, regenerate the manifest and chunk files with:

```bash
pnpm split:catalog
```

Chunks are written to `public/assets/data/pages/<variant>/catalog.<variant>.chunk-XXX.json`.  
Deploy the manifest and all chunk files if you serve assets from a CDN.
You can override the chunk size when splitting:

```bash
CATALOG_CHUNK_SIZE=1000 pnpm split:catalog
```

### 2.5. Environment Variables
Create a `.env` file in the project root by copying `.env.example`. This file controls the application's behavior for testing.

```ini
# .env

# Controls the optimization strategy.
# Options: lazy | split | prefetch | combo
VITE_STRATEGY=combo

# Enables or disables the use of a CDN for assets.
# Options: true | false
VITE_CDN_ENABLED=true

# The base URL for the CDN. Used only if VITE_CDN_ENABLED is true.
VITE_ASSET_BASE_URL=https://semiherd.com

# Selects the dataset size for the product catalog.
# Options: small | medium | large
VITE_DATA_VARIANT=medium

# API key for WebPageTest (if used).
WPT_API_KEY=YOUR_WPT_API_KEY
```

## 3. Available Scripts

- `pnpm dev`: Starts the development server with Hot Module Replacement (HMR).
- `pnpm build`: Builds the application for production.
- `pnpm start`: Serves the production build locally. Requires `sirv-cli` (`pnpm i -g sirv-cli`).
- `pnpm test:lhci -- --variant=A`: Runs Lighthouse CI for a single variant.
- `pnpm test:wpt -- --variant=A`: Runs WebPageTest for a single variant.
- `pnpm test:k6 -- --variant=A`: Runs k6 load tests for a single variant.
- `pnpm run-matrix`: Executes the full test matrix (all 8 variants, 15 iterations each). *This is a simulation and will print commands.*
- `pnpm analyze`: Generates a performance report from the collected test data in `/reports`.

## 4. Performance Strategies & Variation Matrix

The core of this project is the ability to switch between different optimization strategies.

### 4.1. Strategies
- `lazy`: Implements component-level lazy loading for below-the-fold or non-critical components using `IntersectionObserver`.
- `split`: Implements route-based code splitting using `React.lazy()` and `Suspense`.
- `prefetch`: Implements predictive prefetching of routes and data on link hover or when a link is about to enter the viewport.
- `combo`: A combination of all three strategies (`lazy` + `split` + `prefetch`).

### 4.2. Variation Matrix

| Variant | Strategy  | CDN | Description                                           |
|---------|-----------|-----|-------------------------------------------------------|
| A       | `lazy`    | Off | Baseline lazy loading                                 |
| A’      | `lazy`    | On  | Lazy loading with assets served from a CDN            |
| B       | `split`   | Off | Baseline route-based code splitting                   |
| B’      | `split`   | On  | Code splitting with assets served from a CDN          |
| C       | `prefetch`| Off | Baseline prefetching                                  |
| C’      | `prefetch`| On  | Prefetching with assets served from a CDN             |
| D       | `combo`   | Off | All optimizations combined                            |
| D’      | `combo`   | On  | All optimizations combined, served from a CDN         |

## 5. Directory Structure
A brief overview of the project's structure:
- `/public`: Static assets (images, data files) served directly.
- `/src`: Application source code.
  - `/app`: Core React application (routes, components).
  - `/config`: Configuration files for strategies and CDN.
  - `/hooks`: Reusable React hooks.
  - `/lib`: Helper libraries (HTTP, metrics, prefetching).
  - `/modules`: Heavy, dynamically imported modules (charts, maps).
- `/scripts`: Node.js scripts for test automation and reporting.
- `/tests`: Configuration and test files for Lighthouse, k6, etc.
- `/reports`: Output directory for all performance test results.

## 6. Example Test Results

After running the test matrix and analysis scripts, a summary report is generated.

### `reports/summary.md` (Example Output)

| Variant | Strategy | CDN | LCP (ms) | FCP (ms) | CLS    | TBT (ms) |
|---------|----------|-----|----------|----------|--------|----------|
| A       | lazy     | Off | 2105     | 1850     | 0.08   | 210      |
| A'      | lazy     | On  | 1855     | 1610     | 0.08   | 205      |
| B       | split    | Off | 1980     | 1790     | 0.05   | 180      |
| B'      | split    | On  | 1750     | 1550     | 0.05   | 175      |
| C       | prefetch | Off | 1950     | 1750     | 0.10   | 200      |
| C'      | prefetch | On  | 1710     | 1520     | 0.10   | 195      |
| D       | combo    | Off | **1650** | 1580     | **0.02** | **150**  |
| D'      | combo    | On  | **1420** | **1210** | **0.02** | **145**  |

![Example Chart](https://via.placeholder.com/600x400.png?text=LCP+Comparison+Chart)
*Caption: The `combo` strategy with CDN enabled (D') shows a significant improvement in LCP compared to other variants.*

### Acceptance Criteria Check
- **LCP Improvement (Combo vs. Lazy/CDN Off):** `(1 - 1650 / 2105) * 100 = ~21.6%` improvement. (✅ Met)
- **CLS:** All variants are `≤ 0.1`. (✅ Met)
- **TBT Reduction:** `(1 - 150 / 210) * 100 = ~28.5%` reduction. (✅ Met)

## 7. Data and Assets
- Product data is stored in `/public/assets/data/`.
- Product images are referenced from `https://picsum.photos` for demonstration purposes. The files in `/public/assets/images` are placeholders to simulate the asset structure. All content is for demonstration and testing purposes only.
Catalog chunks and manifests are git-ignored to avoid oversized commits; regenerate via `pnpm split:catalog` when needed.

### 2.6. Prefetch/Lazy/Split strategies with chunked data
- Prefetch and lazy-loading both rely on the chunk manifest (`catalog.<variant>.manifest.json`) and its chunk list; ensure the manifest and chunks exist for the selected `VITE_DATA_VARIANT`.
- When serving via CDN, set `VITE_CDN_ENABLED=true` and `VITE_ASSET_BASE_URL` to your custom domain (e.g., `https://semiherd.com`). The loader will try CDN first, then fall back to local `/assets/...` to keep development working.
- Configure CORS on your bucket/domain to allow your app origins (`http://localhost:5173`, etc.) to fetch the manifest and chunk files.
