# Kalori Sayar — Codex Çalışma Kuralları

Bu dosya, bu depoda çalışan Codex oturumları ve diğer geliştirme araçları için proje düzeyindeki kuralları tanımlar.

## Oturum başlangıcı

Her oturumda işlem yapmadan önce sırasıyla şu dosyaları oku:

1. `AGENTS.md`
2. `PLAN.md`
3. `PROGRESS.md`

Mevcut çalışma ağacını kontrol et. Kullanıcıya ait veya görev dışı değişiklikleri silme, geri alma ya da üzerine yazma.

## Yetki ve onay sınırları

- Ürün sahibinin açık geliştirme onayı olmadan uygulama kodlamasına başlama.
- Ücretli planı, faturalandırmayı veya ücret doğurabilecek servisi açık onay olmadan etkinleştirme.
- Canlı ortama dağıtım için önceden açık onay al.
- Veri silme, hesabı silme, üretim verisini değiştirme ve yıkıcı veritabanı migration işlemleri için açık onay al.
- API anahtarı, token, parola, gerçek kullanıcı verisi veya `.env` içeriğini commit etme ya da konuşmada gösterme.
- Büyük kapsam veya mimari değişikliklerini uygulamadan önce ürün sahibiyle değerlendir ve `PLAN.md` içinde kaydet.

## Değişmez mimari kurallar

- Uygulama ilk çalışan geliştirme diliminden itibaren çok kullanıcılıdır; tek kullanıcıya özel geçici veri modeli kurma.
- Supabase Auth ve PostgreSQL ana kimlik/veri katmanıdır.
- Kullanıcı verisi içeren her tabloda zorunlu `user_id`, foreign key ve Row Level Security politikaları bulunur.
- RLS politikaları `SELECT`, `INSERT`, `UPDATE` ve `DELETE` işlemleri için en az iki farklı kullanıcıyla negatif erişim testlerinden geçer.
- IndexedDB ana veritabanı değildir; kullanıcıya özel çevrimdışı önbellek ve işlem kuyruğudur.
- `service_role` ve diğer gizli anahtarlar tarayıcı koduna eklenmez.
- Fotoğraflar varsayılan olarak kalıcı saklanmaz ve Gemini'ye aktarılmadan önce sürümlü kullanıcı onayı gerekir.
- TürKomp verileri yazılı izin veya uygun lisans olmadan kopyalanmaz.
- AI sonucu doğrulanmış besin değeri gibi sunulmaz; kaynak ve tahmin durumu korunur.
- AI kotası dolduğunda otomatik ücretli plana veya başka sağlayıcıya geçilmez.

## Kod standartları

- React, Vite ve TypeScript kullan; TypeScript `strict` olmalıdır.
- Basit, okunabilir ve küçük birimler tercih et; gereksiz soyutlama ve bağımlılıktan kaçın.
- İş mantığını UI bileşenlerinden ayır; besin hesapları saf ve test edilebilir fonksiyonlarda yer alsın.
- Harici API yanıtlarını ve AI çıktılarını çalışma zamanında şema doğrulamasından geçir.
- Kullanıcıya gösterilen metinleri merkezi ve ileride yerelleştirilebilir tut.
- Erişilebilir HTML, klavye kullanımı, görünür odak ve yeterli renk kontrastı zorunludur.
- Zamanları veritabanında UTC sakla; günlük gruplamada kullanıcının IANA saat dilimini kullan.
- Besin değerlerinde kaynak kaydı ile öğüne kaydedilen anlık değerleri birbirinden ayır.

## Test ve tamamlanma tanımı

Bir işi tamamlandı olarak bildirmeden önce kapsamına göre:

- TypeScript kontrolünü
- lint/format denetimini
- birim ve entegrasyon testlerini
- üretim derlemesini
- güvenlik açısından kritik akışlarda negatif testleri
- kullanıcı akışında gerekli görsel veya gerçek tarayıcı doğrulamasını

çalıştır ve sonuçları bildir. Çalıştırılamayan kontrolleri açıkça belirt.

Çok kullanıcılı bir özellik, farklı kullanıcıların birbirinin verisine erişemediği otomatik test olmadan tamamlanmış sayılmaz.

## Git ve dokümantasyon

- Küçük ve anlamlı commitler oluştur.
- Ana dalı çalışır durumda tut.
- Oluşturulan dosyaları commit öncesinde secret ve kişisel veri açısından kontrol et.
- Mimari/kapsam kararı değiştiğinde `PLAN.md` dosyasını güncelle.
- Her anlamlı çalışma sonunda `PROGRESS.md` içinde tamamlananları, doğrulamaları, kararları, sorunları ve sıradaki adımı güncelle.
- Kurulum veya kullanım değiştiğinde `README.md` dosyasını güncelle.
- Yeni bağımlılık eklerken bakım durumu, lisans, paket boyutu ve ücretsiz kullanım koşullarını kontrol et.

## İletişim

- Teknik kararları ürün sahibinin seviyesine uygun, kısa ve gerekçeli anlat.
- Belirsiz ama geri alınabilir küçük ayrıntılarda makul varsayımla ilerle; ürün davranışını, maliyeti, güvenliği veya kapsamı etkileyen tercihlerde onay iste.
- Sağlık verileri ve besin tahminleri hakkında kesinlik iddiasında bulunma.
