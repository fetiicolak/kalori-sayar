# Kalori Sayar — İlerleme Kaydı

> Son güncelleme: 23 Ekim 2026

## Mevcut aşama

**Aşama 0 — Planlama ve proje hazırlığı**

Uygulama kodlaması henüz başlamadı.

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

## Doğrulanan kritik kabuller

- İlk güvenli temel aşaması en az iki bağımsız kullanıcı hesabıyla test edilecek.
- Kullanıcı izolasyonu yalnızca istemci filtrelerine değil veritabanı RLS politikalarına dayanacak.
- Ücretli servisler, canlı dağıtım ve yıkıcı veri işlemleri ayrıca onay gerektirecek.

## Açık kararlar

- Kaynak kod lisansı henüz seçilmedi. Lisans dosyası eklenene kadar kamuya açık depo, üçüncü kişilere otomatik yeniden kullanım hakkı vermez.
- Supabase, Cloudflare ve Gemini hesapları henüz kurulmadı/bağlanmadı.
- Geliştirmeye başlama onayı henüz verilmedi.

## Sıradaki adımlar

1. Kaynak kod lisansını ürün sahibiyle seç.
2. Supabase, Cloudflare ve Gemini hesap/secret kurulum planını uygula.
3. Ürün sahibinden Aşama 1 geliştirme onayı al.

## Sorunlar

Şu anda bilinen engelleyici bir sorun yok.
