# Kalori Sayar

Fotoğraf, metin, ses veya barkodla tüketilen yiyecekleri kaydetmeyi; günlük kalori ve makroları hesaplamayı; hedef, su ve kilo değişimini takip etmeyi sağlayan mobil öncelikli, çok kullanıcılı PWA.

> Uygulama kodu yerel olarak derlenip test edilmektedir. Supabase, Cloudflare ve Gemini hesap bağlantıları tamamlanmadan gerçek kullanıcı kaydı ve AI özellikleri çalışmaz.

## Özellikler

- E-posta ve parola ile çok kullanıcılı hesap sistemi
- PostgreSQL Row Level Security ile kullanıcı verisi izolasyonu
- Manuel, metin, fotoğraf, ses ve barkod destekli yemek girişi
- USDA FoodData Central araması
- Open Food Facts barkod sorgusu
- AI sonucu için güven düzeyi, kaynak etiketi ve kullanıcı düzeltmesi
- Günlük kalori ve protein/karbonhidrat/yağ hedefleri
- Öğün geçmişi, düzenleme ve silme
- Su ve kilo takibi; basit kilo eğrisi
- Mifflin–St Jeor yöntemiyle yaklaşık enerji ihtiyacı
- JSON ve CSV dışa aktarma
- IndexedDB tabanlı kullanıcıya özel çevrimdışı önbellek ve işlem kuyruğu
- Kurulabilir PWA ve service worker güncelleme akışı
- Cloudflare Worker üzerinde gizli anahtarlar, istek doğrulama ve hız sınırı

## Mimari

```text
React PWA
  ├─ Supabase Auth ── kullanıcı oturumu
  ├─ Supabase PostgreSQL ── RLS korumalı kişisel veriler
  ├─ IndexedDB ── çevrimdışı önbellek ve bekleyen işlemler
  └─ Cloudflare Worker
       ├─ Supabase JWT doğrulama
       ├─ Gemini metin/fotoğraf analizi
       ├─ USDA FoodData Central
       └─ Open Food Facts
```

Fotoğraflar analiz sırasında küçültülür, kullanıcı onayı olmadan gönderilmez ve uygulamada varsayılan olarak kalıcı saklanmaz.

## Teknolojiler

- React 19 + TypeScript 6 + Vite 8
- TanStack Query
- Supabase Auth + PostgreSQL + RLS
- Cloudflare Workers + Static Assets
- IndexedDB (`idb`)
- Zod çalışma zamanı doğrulaması
- Vitest + Testing Library
- Vite PWA / Workbox
- ESLint ve GitHub Actions

## Yerel kurulum

Gereksinim: Node.js 22 veya üzeri.

```bash
npm install
copy .env.example .env.local
npm run dev
```

`.env.local` içine yalnızca Supabase'in tarayıcıda kullanılmasına izin verilen değerleri ekleyin:

```dotenv
VITE_SUPABASE_URL=https://PROJE.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=YAYIMLANABILIR_ANAHTAR
VITE_API_BASE_URL=
```

Gerçek `.env` dosyaları Git tarafından yok sayılır.

## Supabase kurulumu

1. Ücretsiz bir Supabase projesi oluşturun.
2. `supabase/migrations/202610230001_initial_schema.sql` migration'ını uygulayın.
3. Authentication bölümünde e-posta/parola girişini etkin tutun.
4. Site URL ve yönlendirme URL'lerini yerel/üretim adresleriyle ayarlayın.
5. En az iki ayrı test hesabıyla RLS testlerini çalıştırın.

Migration şu tabloları oluşturur:

- `profiles`
- `nutrition_goals`
- `food_entries` ve `food_entry_items`
- `custom_foods`
- `consents`
- `water_entries`
- `weight_entries`

Her kullanıcı tablosunda ayrı `SELECT`, `INSERT`, `UPDATE` ve `DELETE` RLS politikaları bulunur. Öğün kalemlerinin başka bir kullanıcının üst kaydına bağlanması bileşik foreign key ile engellenir.

## Cloudflare Worker kurulumu

Yerel Worker geliştirmesi:

```bash
npm run build
npm run worker:dev
```

Sırlar kaynak koduna yazılmaz; Wrangler ile eklenir:

```bash
npx wrangler secret put SUPABASE_URL
npx wrangler secret put SUPABASE_PUBLISHABLE_KEY
npx wrangler secret put GEMINI_API_KEY
npx wrangler secret put USDA_API_KEY
```

`wrangler.jsonc` içindeki `ALLOWED_ORIGINS` üretim alan adı belli olduğunda güncellenmelidir. Canlı dağıtım ürün sahibinin ayrıca vereceği onaydan sonra yapılır.

## Komutlar

| Komut | Amaç |
|---|---|
| `npm run dev` | Vite geliştirme sunucusu |
| `npm run worker:dev` | Yerel Cloudflare Worker |
| `npm run typecheck` | TypeScript kontrolü |
| `npm run lint` | Kod kalitesi denetimi |
| `npm run test` | Birim/bileşen testleri |
| `npm run build` | Üretim PWA derlemesi |
| `npm run check` | Bütün yerel kalite kontrolleri |

## Güvenlik

- Supabase `service_role` anahtarı istemcide kullanılmaz.
- Worker her API isteğinde Supabase JWT'sini `/auth/v1/user` üzerinden doğrular.
- Harici API ve AI yanıtları güvenilmeyen veri kabul edilip doğrulanır.
- Görsel türü ve boyutu, metin uzunluğu ve istek sıklığı sınırlandırılır.
- Kimlik doğrulamalı API yanıtları service worker çalışma zamanı önbelleğine alınmaz.
- RLS negatif erişim senaryoları `supabase/tests/rls.sql` içinde bulunur.

## Veri kaynakları

- [USDA FoodData Central](https://fdc.nal.usda.gov/) — CC0/kamu malı; uygulamada kaynak kimliği saklanır.
- [Open Food Facts](https://world.openfoodfacts.org/) — ODbL; barkod verileri ayrı kaynak kimliğiyle tutulur.
- Gemini sonuçları “AI tahmini” olarak işaretlenir ve kullanıcı onayı gerektirir.
- TürKomp verileri yazılı izin veya uygun lisans olmadan projeye kopyalanmaz.

## Proje belgeleri

- [PLAN.md](PLAN.md): kapsam, mimari, güvenlik ve yol haritası
- [AGENTS.md](AGENTS.md): Codex çalışma kuralları
- [PROGRESS.md](PROGRESS.md): doğrulanan işler, açık konular ve sıradaki adımlar

## Sağlık uyarısı

Kalori Sayar tıbbi tanı veya tedavi aracı değildir. Fotoğraf ve AI tabanlı porsiyon/besin sonuçları yaklaşık olabilir; kullanıcı doğrulaması gerekir.

## Lisans

Henüz açık kaynak lisansı seçilmemiştir. `LICENSE` dosyası eklenene kadar tüm haklar saklıdır.
