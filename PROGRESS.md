# Kalori Sayar — İlerleme Kaydı

> Son güncelleme: 23 Ekim 2026

## Mevcut aşama

**Aşama 1–6 — Uygulama ve Supabase üretim altyapısı hazır; Cloudflare/AI bağlantıları bekleniyor**

Geliştirme onayı verildi. Uygulama, veritabanı migration'ı ve Worker kodu yerel olarak hazırlandı.

## Tamamlananlar

- Ürün vizyonu ve ilk kullanılabilir sürüm kapsamı netleştirildi.
- İlk çalışan geliştirme diliminden itibaren çok kullanıcılı mimari kararı alındı.
- Supabase Auth, PostgreSQL ve zorunlu RLS yaklaşımı kabul edildi.
- IndexedDB'nin ana veritabanı değil, çevrimdışı önbellek/eşitleme kuyruğu olması kararlaştırıldı.
- İlk giriş yöntemi e-posta + parola olarak belirlendi.
- Fotoğrafların varsayılan olarak saklanmaması ve Gemini öncesi açık kullanıcı onayı kabul edildi.
- TürKomp verilerinin izin/lisans olmadan kopyalanmaması kararlaştırıldı.
- USDA ve Open Food Facts kaynaklarının lisans sınırları plana işlendi.
- Cloudflare Workers Static Assets yaklaşımı tercih edildi.
- GitHub hesabı `fetiicolak` olarak doğrulandı.
- Herkese açık `fetiicolak/kalori-sayar` GitHub deposu oluşturuldu.
- Başlangıç belgeleri `main` dalına pushlandı.
- `PLAN.md` onaylandı.
- Proje çalışma kuralları `AGENTS.md` içinde oluşturuldu.
- React 19, Vite 8 ve TypeScript 6 PWA iskeleti oluşturuldu.
- Supabase e-posta/parola auth arayüzü hazırlandı.
- Kullanıcıya özel profil, hedef, öğün, onay, su ve kilo tabloları oluşturuldu.
- Bütün kişisel tablolarda CRUD bazlı RLS politikaları yazıldı.
- İki kullanıcıyla negatif erişim senaryolarını kapsayan pgTAP testi eklendi.
- Öğün ve öğün kalemlerini atomik güncelleyen `save_food_entry` fonksiyonu yazıldı.
- Günlük kalori/makro özeti, hedef düzenleme, öğün ekleme/düzenleme/silme hazırlandı.
- Manuel, metin, fotoğraf, ses, USDA araması ve barkod giriş akışları eklendi.
- Gemini öncesi sürümlü fotoğraf onayı ve görsel küçültme uygulandı.
- Open Food Facts ve USDA kaynak kimliği/atıf ayrımı korundu.
- IndexedDB önbelleği ve kullanıcıya özel çevrimdışı işlem kuyruğu eklendi.
- JSON/CSV dışa aktarma hazırlandı.
- Su/kilo takibi, kilo eğrisi ve enerji ihtiyacı hesaplaması eklendi.
- Cloudflare Worker JWT doğrulaması, CORS, giriş sınırları ve yumuşak hız limitiyle hazırlandı.
- PWA manifesti, service worker ve güncelleme bildirimi oluşturuldu.
- GitHub Actions kalite iş akışı eklendi.
- TypeScript, lint, birim/bileşen testleri ve üretim derlemesi başarıyla çalıştırıldı.
- Cloudflare Worker paketi `wrangler --dry-run` ile başarıyla doğrulandı.
- Ücretsiz Supabase projesi `kalori-sayar` oluşturuldu ve ilk migration uygulandı.
- Canlı Supabase ortamında 8 uygulama tablosu, 32 CRUD RLS politikası ve 8 RLS-etkin tablo doğrulandı.
- Yerel istemci yalnızca Supabase yayımlanabilir anahtarıyla bağlandı; anonim REST isteğinin kullanıcı satırı göremediği doğrulandı.
- Gerçek Supabase yapılandırmasıyla TypeScript, lint, 10 test ve üretim PWA derlemesi yeniden başarıyla çalıştırıldı.

## Doğrulanan kritik kabuller

- İlk güvenli temel aşaması en az iki bağımsız kullanıcı hesabıyla test edilecek.
- Kullanıcı izolasyonu yalnızca istemci filtrelerine değil veritabanı RLS politikalarına dayanacak.
- Ücretli servisler, canlı dağıtım ve yıkıcı veri işlemleri ayrıca onay gerektirecek.
- Kodlama işlerinin ürün sahibi adına Codex tarafından yürütülmesi için geliştirme onayı verildi.

## Açık kararlar

- Kaynak kod lisansı henüz seçilmedi. Lisans dosyası eklenene kadar kamuya açık depo, üçüncü kişilere otomatik yeniden kullanım hakkı vermez.
- Cloudflare, Gemini ve USDA hesap/anahtarları henüz bağlanmadı.
- RLS tablo/politika kurulumu ve anonim erişim canlı ortamda doğrulandı; iki kimlikli pgTAP testi henüz canlı PostgreSQL üzerinde çalıştırılmadı.
- Canlı dağıtım onayı henüz verilmedi.

## Sıradaki adımlar

1. Canlı Supabase üzerinde işlemsel iki-kullanıcılı RLS testini çalıştır.
2. Gemini ve USDA anahtarlarını oluştur; Cloudflare Worker sırlarına ekle.
3. Cloudflare projesini bağla ve ön izleme dağıtımında uçtan uca testleri yap.
4. Kaynak kod lisansını seç.
5. Ürün sahibinden canlı dağıtım onayı al.

## Sorunlar

- Parola gerektiren test kullanıcıları oluşturulana kadar gerçek kayıt/giriş ve iki gerçek hesaplı uçtan uca test çalıştırılamaz.
- Cloudflare ile Gemini/USDA bağlanana kadar AI ve harici veri kaynağı uçtan uca testleri çalıştırılamaz.
- Codex'in in-app tarayıcısı yerel geliştirme sunucusuna ağ izolasyonu nedeniyle erişemedi; görsel QA servis bağlantısından sonra gerçek ön izleme URL'sinde tekrarlanacaktır.
