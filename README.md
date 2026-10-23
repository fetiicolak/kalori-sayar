# Kalori Sayar

Fotoğraf, metin, ses veya barkodla tüketilen yiyecekleri kaydetmeyi; günlük kalori ve makroları hesaplamayı; hedef, su ve kilo değişimini takip etmeyi amaçlayan mobil öncelikli, çok kullanıcılı bir PWA projesi.

> Proje şu anda planlama ve altyapı hazırlığı aşamasındadır. Uygulama kodlaması henüz başlamamıştır.

## Temel ilkeler

- İlk çalışan sürümden itibaren bağımsız ve güvenli kullanıcı hesapları
- Supabase Auth, PostgreSQL ve Row Level Security ile veri izolasyonu
- AI tahmini ile kaynaklı besin değerinin açık biçimde ayrılması
- Kullanıcı tarafından onaylanabilir ve düzeltilebilir porsiyonlar
- Ücretsiz servis katmanları ve onaysız ücretli kullanıma geçmeme
- Fotoğrafları varsayılan olarak kalıcı saklamama
- Mobil öncelikli, erişilebilir ve kurulabilir PWA deneyimi
- Çevrimdışı önbellek ve bağlantı geldiğinde cihazlar arası senkronizasyon

## Planlanan teknoloji

- React + Vite + TypeScript
- Progressive Web App
- Cloudflare Workers ve Static Assets
- Supabase Auth + PostgreSQL + Row Level Security
- IndexedDB
- Google Gemini API
- USDA FoodData Central
- Open Food Facts
- GitHub Actions

Teknoloji seçimleri geliştirme sırasında güncel ücretsiz katman, lisans, bakım ve güvenlik koşullarıyla yeniden doğrulanacaktır.

## Proje belgeleri

- [PLAN.md](PLAN.md): kapsam, mimari, güvenlik, yol haritası ve kabul ölçütleri
- [AGENTS.md](AGENTS.md): Codex çalışma kuralları ve teknik kısıtlar
- [PROGRESS.md](PROGRESS.md): mevcut durum, tamamlananlar ve sıradaki işler

## Durum

Plan onaylandı. Sıradaki aşama servis hesaplarının güvenli kurulumu ve çok kullanıcılı temelin geliştirilmesidir. Geliştirme başlamadan önce ürün sahibinden ayrıca onay alınacaktır.

## Veri ve sağlık uyarısı

Bu proje tıbbi tanı veya tedavi aracı değildir. Fotoğraf ve yapay zekâ tabanlı porsiyon/besin sonuçları yaklaşık olabilir ve kullanıcı doğrulaması gerektirir.

## Lisans

Henüz bir açık kaynak lisansı seçilmemiştir. Lisans dosyası eklenene kadar tüm haklar saklıdır.
