# Rani's California - Images Guide

Complete guide for image naming, sizing, formats, and expected files for the 6 sample products.

---

## FILENAME NAMING CONVENTION

All product images must follow this pattern:

```
product_<PRODUCTID>_<VARIANT>_<VIEW>.<extension>
```

### Components

**PRODUCTID:** Unique product identifier (e.g., A12, B08, C15)
**VARIANT:** Version number (v1, v2, v3) for color/style variants
**VIEW:** Type of photo (model, flatlay, detail, etc.)
**EXTENSION:** jpg, png, or webp

### Examples
```
product_A12_v1_model.jpg
product_A12_v1_flatlay.jpg
product_A12_v2_detail.jpg
product_B08_v1_model.webp
product_B08_v2_model.jpg
```

---

## VIEW TYPES

### model
Full-body or 3/4 shot showing garment worn by model in context

### flatlay
Garment laid flat on neutral surface, showing full piece

### detail
Close-up of specific feature: stitching, fabric texture, embroidery, buttons, etc.

### model_reverse
For reversible garments—model wearing other side

### detail_pocket / detail_collar / detail_cuff
Specific detail shots (can customize as needed)

### lifestyle
Styled shot in environment (less formal than model shot)

### studio
Product on dress form or hanger with clean background

---

## IMAGE SIZES & FORMATS

### Three Sizes Required (for responsive srcset)

**Small:** 480px wide
- Mobile devices
- Thumbnail views
- Filename: `product_A12_v1_model-480.jpg`

**Medium:** 900px wide
- Tablet devices
- Default product grid
- Filename: `product_A12_v1_model-900.jpg`

**Large:** 1600px wide
- Desktop displays
- Lightbox/modal views
- Filename: `product_A12_v1_model-1600.jpg`

### File Format Recommendations

**Primary:** JPG (75-85% quality)
- Best for photos with complex colors
- Smaller file size than PNG

**Fallback:** WebP
- 20-30% smaller than JPG
- Better quality at same file size
- Use with `<picture>` tag for browser support

**Avoid:** PNG for photos (too large)

### Compression Guidelines
- Hero images: 85% quality
- Product photos: 75-80% quality
- Detail shots: 80-85% quality (preserve sharpness)
- Maximum file size: 500KB per image

---

## ASPECT RATIOS

### Product Main Images
**Ratio:** 3:4 (portrait)
**Example:** 900px × 1200px
**Best for:** Model shots, flatlays

### Hero Images
**Ratio:** 16:9 or 3:2 (landscape)
**Example:** 1600px × 900px or 1600px × 1067px
**Best for:** Banner, hero section

### Collection Thumbnails
**Ratio:** 4:5 (portrait)
**Example:** 900px × 1125px
**Best for:** Collection grid

### Social Media
**Ratio:** 1:1 (square)
**Size:** 1200px × 1200px
**Best for:** Instagram posts

**Ratio:** 1200:630
**Size:** 1200px × 630px
**Best for:** Open Graph / social sharing

---

## EXPECTED FILES FOR 6 SAMPLE PRODUCTS

### Product A12: Indigo Block-Print Shawl

**Images Required:** 3

1. `product_A12_v1_model.jpg` (3 sizes: 480, 900, 1600)
   - Alt: "Model wearing indigo block-print shawl draped over shoulders"

2. `product_A12_v1_flatlay.jpg` (3 sizes)
   - Alt: "Indigo block-print shawl laid flat showing full pattern"

3. `product_A12_v1_detail.jpg` (3 sizes)
   - Alt: "Close-up detail of block-print pattern and hand-rolled edge"

**Total files:** 9 (3 images × 3 sizes)

---

### Product B08: Reversible Linen Jacket

**Images Required:** 3

1. `product_B08_v1_model.jpg` (3 sizes)
   - Alt: "Model wearing reversible linen jacket in indigo side"

2. `product_B08_v2_model.jpg` (3 sizes)
   - Alt: "Model wearing reversible linen jacket in olive side"

3. `product_B08_v1_detail.jpg` (3 sizes)
   - Alt: "Detail of invisible seam construction and coconut button"

**Total files:** 9

---

### Product C15: Wide-Leg Cotton Trousers

**Images Required:** 3

1. `product_C15_v1_model.jpg` (3 sizes)
   - Alt: "Model wearing wide-leg cotton trousers in natural color"

2. `product_C15_v1_flatlay.jpg` (3 sizes)
   - Alt: "Wide-leg cotton trousers laid flat showing silhouette"

3. `product_C15_v1_detail.jpg` (3 sizes)
   - Alt: "Close-up of deep pocket and elastic waistband detail"

**Total files:** 9

---

### Product D22: Marigold Silk Wrap Shawl

**Images Required:** 3

1. `product_D22_v1_model.jpg` (3 sizes)
   - Alt: "Model wearing marigold silk wrap shawl in natural sunlight"

2. `product_D22_v1_flatlay.jpg` (3 sizes)
   - Alt: "Marigold silk shawl laid flat showing hand-fringed edges"

3. `product_D22_v1_detail.jpg` (3 sizes)
   - Alt: "Detail of silk texture and natural dye variation"

**Total files:** 9

---

### Product E09: Quilted Wool Jacket

**Images Required:** 3

1. `product_E09_v1_model.jpg` (3 sizes)
   - Alt: "Model wearing quilted wool jacket with stand collar"

2. `product_E09_v1_detail.jpg` (3 sizes)
   - Alt: "Close-up of kantha quilting stitches and texture"

3. `product_E09_v2_detail.jpg` (3 sizes)
   - Alt: "Detail of hidden snap closures and chest pocket"

**Total files:** 9

---

### Product F31: Embroidered Linen Trousers

**Images Required:** 3

1. `product_F31_v1_model.jpg` (3 sizes)
   - Alt: "Model wearing embroidered linen trousers in cream"

2. `product_F31_v1_detail.jpg` (3 sizes)
   - Alt: "Close-up of hand-embroidered cuff detail"

3. `product_F31_v1_flatlay.jpg` (3 sizes)
   - Alt: "Embroidered linen trousers laid flat showing straight-leg cut"

**Total files:** 9

---

## GRAND TOTAL: 54 product images (6 products × 3 images × 3 sizes)

---

## ADDITIONAL IMAGES NEEDED

### Hero Section
- `hero-480.jpg`
- `hero-900.jpg`
- `hero-1600.jpg`
- `hero-480.webp`
- `hero-900.webp`
- `hero-1600.webp`

**Alt:** "Woman wearing handcrafted Indo-Western jacket in warm natural setting"

---

### Collection Thumbnails
- `collection-shawls.jpg`
- `collection-jackets.jpg`
- `collection-trousers.jpg`
- `collection-limited.jpg`

**Alt patterns:**
- "Hand-woven shawls collection"
- "Tailored Indo-Western jackets collection"
- "Hand-stitched trousers collection"
- "Limited edition pieces"

---

### About Section
- `about-grandmother.jpg` — Vintage photo of Rani
- `workshop.jpg` — Artisans working in workshop
- `sister-priya.jpg` — Portrait of Priya
- `sister-anjali.jpg` — Portrait of Anjali
- `sister-meera.jpg` — Portrait of Meera

---

### Social Media
- `og-image.jpg` (1200×630) — Primary Open Graph image
- `og-image-hero.jpg` (1200×630)
- `og-image-story.jpg` (1200×630)
- `og-image-custom.jpg` (1200×630)

---

## PLACEHOLDER IMAGE

If images are not available, the site will show a placeholder:

**File:** `images/placeholder.svg`
**Content:** Simple icon + text "Made-to-order: request photos"
**Background:** Cream with subtle texture

---

## IMAGE OPTIMIZATION CHECKLIST

Before uploading images:

- [ ] Resize to exact dimensions (480, 900, 1600)
- [ ] Compress to appropriate quality (75-85%)
- [ ] Convert to WebP for modern browsers
- [ ] Strip EXIF data (reduces file size)
- [ ] Verify filenames match convention
- [ ] Test in admin.html mapper tool
- [ ] Confirm alt text is descriptive

---

## TOOLS FOR IMAGE PROCESSING

### Batch Resizing
- **ImageMagick** (command line)
  ```bash
  convert input.jpg -resize 900x900 output-900.jpg
  ```
- **Photoshop Actions** (batch process)
- **Online:** Squoosh.app, TinyPNG

### WebP Conversion
- **cwebp** (command line)
  ```bash
  cwebp -q 80 input.jpg -o output.webp
  ```
- **Photoshop:** Save As → WebP
- **Online:** Squoosh.app

### Compression
- **JPEGmini** (preserves quality)
- **TinyPNG** (lossy but smart)
- **ImageOptim** (Mac, lossless)

---

## FOLDER STRUCTURE

Organize images in the `/images` directory:

```
/images/
  ├── hero-480.jpg
  ├── hero-480.webp
  ├── hero-900.jpg
  ├── hero-900.webp
  ├── hero-1600.jpg
  ├── hero-1600.webp
  ├── collection-shawls.jpg
  ├── collection-jackets.jpg
  ├── collection-trousers.jpg
  ├── collection-limited.jpg
  ├── about-grandmother.jpg
  ├── workshop.jpg
  ├── sister-priya.jpg
  ├── sister-anjali.jpg
  ├── sister-meera.jpg
  ├── product_A12_v1_model-480.jpg
  ├── product_A12_v1_model-900.jpg
  ├── product_A12_v1_model-1600.jpg
  ├── product_A12_v1_model-480.webp
  ├── product_A12_v1_model-900.webp
  ├── product_A12_v1_model-1600.webp
  ├── product_A12_v1_flatlay-480.jpg
  ├── product_A12_v1_flatlay-900.jpg
  ├── product_A12_v1_flatlay-1600.jpg
  ├── product_A12_v1_detail-480.jpg
  ├── product_A12_v1_detail-900.jpg
  ├── product_A12_v1_detail-1600.jpg
  ├── [... repeat for products B08, C15, D22, E09, F31]
  ├── og-image.jpg
  ├── og-image-hero.jpg
  ├── og-image-story.jpg
  ├── og-image-custom.jpg
  └── placeholder.svg
```

---

## RESPONSIVE IMAGE IMPLEMENTATION

The site uses `<picture>` tags with `srcset` for responsive images:

```html
<picture>
  <source
    srcset="images/product_A12_v1_model-480.webp 480w,
            images/product_A12_v1_model-900.webp 900w,
            images/product_A12_v1_model-1600.webp 1600w"
    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
    type="image/webp">
  <img
    srcset="images/product_A12_v1_model-480.jpg 480w,
            images/product_A12_v1_model-900.jpg 900w,
            images/product_A12_v1_model-1600.jpg 1600w"
    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
    src="images/product_A12_v1_model-900.jpg"
    alt="Model wearing indigo block-print shawl draped over shoulders"
    loading="lazy">
</picture>
```

### How it works:
1. Browser checks if it supports WebP
2. If yes, loads WebP version (smaller file size)
3. If no, loads JPG version
4. Chooses appropriate size based on viewport width
5. Lazy-loads images below the fold

---

## QUICK REFERENCE: 6 Products × Expected Filenames

### A12 (Indigo Shawl)
- product_A12_v1_model
- product_A12_v1_flatlay
- product_A12_v1_detail

### B08 (Linen Jacket)
- product_B08_v1_model
- product_B08_v2_model
- product_B08_v1_detail

### C15 (Cotton Trousers)
- product_C15_v1_model
- product_C15_v1_flatlay
- product_C15_v1_detail

### D22 (Silk Shawl)
- product_D22_v1_model
- product_D22_v1_flatlay
- product_D22_v1_detail

### E09 (Wool Jacket)
- product_E09_v1_model
- product_E09_v1_detail
- product_E09_v2_detail

### F31 (Linen Trousers)
- product_F31_v1_model
- product_F31_v1_detail
- product_F31_v1_flatlay

**Each filename needs 3 sizes:** -480, -900, -1600
**Each size needs 2 formats:** .jpg and .webp (optional but recommended)

---

## PHOTOGRAPHY GUIDELINES

### Style
- Natural lighting preferred
- Warm, muted tones that complement brand palette (cream, indigo, marigold)
- Mix of model shots, flatlays, and detail close-ups
- Authentic workshop photos welcome (use "Artisan / In-studio photo" badge)

### Model Shots
- Neutral backgrounds (cream, gray, natural outdoor)
- Show full garment in context
- Model should not obscure garment details
- Multiple angles if possible

### Flatlays
- Clean, neutral surface (wood, linen, paper)
- Garment pressed and styled neatly
- Show full silhouette
- Natural lighting from side

### Detail Shots
- Macro lens or close focus
- Show craftsmanship: stitching, embroidery, buttons, fabric texture
- Sharp focus on detail
- Soft background blur (bokeh)

---

## NEED HELP?

If you're unsure about an image:
1. Upload to the admin.html mapper tool
2. Check the preview
3. The tool will flag naming issues
4. Export CSV to see what's missing

For questions: hello@raniscalifornia.com
