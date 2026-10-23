# Kalori Sayar — Proje Planı

> Durum: **AŞAMA 0 — PLAN ONAYLANDI, PROJE HAZIRLIĞI**
>
> Son güncelleme: 23 Ekim 2026
>
> Kodlama, servis kurulumu, GitHub deposu oluşturma ve canlıya dağıtım ürün sahibinin ayrıca vereceği geliştirme onayından önce başlamaz.

## 1. Ürün vizyonu

Kalori Sayar; kullanıcıların tükettikleri yiyecekleri fotoğraf, metin, ses veya barkodla kaydedebildiği; kalori, protein, karbonhidrat ve yağ değerlerini takip edebildiği; kişisel hedef, su tüketimi ve kilo değişimini izleyebildiği mobil öncelikli bir PWA'dır.

Uygulama ilk sürümden itibaren çok kullanıcılıdır. Her kullanıcı:

- Kendi hesabıyla oturum açar.
- Verilerine telefon ve bilgisayardan ulaşabilir.
- Yalnızca kendisine ait kayıtları okuyabilir ve değiştirebilir.
- Verilerini JSON ve CSV olarak dışa aktarabilir.
- Hesabının ve kişisel verilerinin silinmesini isteyebilir.

Geliştirme sırası önce tek kullanıcıya özel bir prototip üretip daha sonra hesap sistemi eklemek şeklinde olmayacaktır. İlk çalışan geliştirme diliminde kimlik doğrulama, kullanıcı sahipliği ve RLS bulunacak; sistem en az iki bağımsız test hesabıyla doğrulanacaktır. İlk kullanılabilir sürüm, küçük bir gerçek kullanıcı grubunun aynı dağıtımı eş zamanlı kullanabileceği şekilde hazırlanacaktır.

Uygulama tıbbi tanı veya kişiye özel sağlık tavsiyesi vermez. Besin ve porsiyon sonuçları bilgilendirme amaçlıdır; özellikle fotoğraftan üretilen değerlerin yaklaşık olduğu arayüzde açıkça belirtilir.

## 2. Değişmez ürün ilkeleri

| İlke | Karar |
|---|---|
| Çok kullanıcılı yapı | Kimlik doğrulama, sunucu tarafı veri saklama ve kullanıcı izolasyonu ilk sürümde zorunludur. |
| Başlangıç kapasitesi | İlk çalışan sürüm kişisel prototip olmayacak; birkaç gerçek kullanıcıyı ayrı hesaplar ve izole verilerle destekleyecektir. |
| Sıfır maliyet | Yalnızca ücretsiz katmanlar kullanılır. Ücretli plan veya faturalandırma ürün sahibinin açık onayı olmadan etkinleştirilmez. |
| Doğruluk | Yapay zekâ besini ve porsiyonu tahmin eder; mümkün olduğunda besin değerleri lisansı uygun veri kaynaklarından alınır. |
| Kullanıcı kontrolü | Her AI sonucu kaydedilmeden önce kullanıcı tarafından görülebilir ve düzeltilebilir. |
| Kaynak şeffaflığı | Besin değerinin kaynağı ve tahmin/doğrulama durumu kayıtta tutulur ve arayüzde gösterilebilir. |
| Gizlilik | Fotoğraflar varsayılan olarak analizden sonra saklanmaz. Gemini'ye gönderim öncesinde kullanıcıdan açık onay alınır. |
| Güvenlik | Gizli anahtarlar istemciye gönderilmez; kullanıcı izolasyonu yalnızca arayüze değil veritabanı politikalarına dayanır. |
| Çevrimdışı kullanım | Yerel kayıtlar önbelleğe alınır; uygun işlemler bağlantı gelince güvenli biçimde eşitlenir. |
| Taşınabilirlik | Kullanıcı verileri standart biçimlerde dışa aktarılabilir. Sağlayıcı bağımlılığı veri katmanı sınırlarıyla azaltılır. |
| Portföy kalitesi | Kod temiz, test edilebilir, erişilebilir, belgelenmiş ve otomatik kontrollerden geçen bir yapıda tutulur. |

## 3. İlk kullanılabilir sürümün kapsamı

### 3.1 Zorunlu özellikler

- E-posta ve parola ile hesap oluşturma, giriş ve çıkış
- Parola sıfırlama ve temel hesap yönetimi
- Kullanıcı profili, birim ve saat dilimi tercihleri
- Günlük kalori ve makro hedefleri
- Metinle yemek girişi
- Fotoğraf yükleme/kamera ile yemek analizi
- Analiz sonucu için porsiyon ve besin değeri onay/düzeltme ekranı
- Kahvaltı, öğle, akşam ve atıştırma öğünleri
- Günlük öğün listesi ve kalori/makro toplamları
- Kayıt düzenleme ve silme
- Cihazlar arası senkronizasyon
- Son veriler için çevrimdışı okuma ve bekleyen yazma kuyruğu
- JSON ve CSV dışa aktarma
- PWA kurulumu ve mobil öncelikli erişilebilir arayüz
- Veri kaynağı, AI tahmini ve kullanıcı düzenlemesi ayrımı

### 3.2 Sonraki sürümlere bırakılan özellikler

- Barkodla ürün ekleme
- Sesle yemek ekleme
- Favoriler, sık yenenler ve “tekrar ye”
- Kişisel tarifler
- Su ve kilo takibi
- Haftalık/aylık grafikler
- Kişisel enerji ihtiyacı hesaplama
- Sosyal giriş sağlayıcıları, ilk aday Google ile giriş
- Gelişmiş çevrimdışı çalışma ve çatışma çözüm ekranı

Bu özellikler mimaride dikkate alınır ancak ilk kullanılabilir sürümün çıkışını geciktirmez.

### 3.3 Kapsam dışı

- Tıbbi teşhis, tedavi veya diyetisyen yerine geçen öneriler
- Otomatik ücretli servis yükseltmesi
- Kullanıcının açık onayı olmadan fotoğraf saklama
- Sosyal ağ, kullanıcılar arası veri paylaşımı veya herkese açık profil
- Sağlık kuruluşlarına uygunluk ya da mevzuat sertifikasyonu iddiası
- AI tahmininin doğrulanmış laboratuvar verisi gibi sunulması

## 4. Teknik mimari

### 4.1 İstemci

- React
- Vite
- TypeScript (`strict` mod)
- PWA manifesti ve service worker
- Mobil öncelikli, duyarlı ve klavye/ekran okuyucu uyumlu arayüz
- Sunucu durumu için uygun bir sorgu/önbellek katmanı
- IndexedDB tabanlı yerel önbellek ve işlem kuyruğu

Kesin kütüphaneler geliştirme başlangıcında güncel bakım durumu, paket boyutu ve lisansları kontrol edilerek seçilir. Gereksiz bağımlılık eklenmez.

### 4.2 Kimlik doğrulama ve veritabanı

- Supabase Auth: ilk sürümde e-posta + parola
- Supabase PostgreSQL: kalıcı ve cihazlar arası eşitlenen ana veri kaynağı
- Row Level Security (RLS): bütün kullanıcı verisi içeren tablolarda zorunlu
- İstemcide yalnızca yayımlanabilir Supabase anahtarı
- `service_role` anahtarı tarayıcıya, mobil pakete veya GitHub deposuna kesinlikle konmaz

İstemci, kullanıcı JWT'siyle Supabase'e erişebilir. Veritabanı politikaları her satırda `auth.uid()` ile sahiplik denetimi yapar. Yalnızca arayüzde filtre uygulamak güvenlik kabul edilmez.

### 4.3 Sunucusuz API katmanı

Cloudflare Workers kullanılacaktır:

- Vite uygulamasının statik dosyalarını sunma
- Gemini isteklerini güvenli şekilde aracılama
- Gizli API anahtarlarını ortam sırrı olarak saklama
- İstek boyutu, hız ve kullanım sınırlarını uygulama
- Yapılandırılmış AI yanıtını doğrulama
- Gerektiğinde USDA isteklerini aracılama ve önbelleğe alma

Cloudflare yeni projelerde Workers platformunu önceliklendirdiği için, ayrı Pages + Worker yerine Workers Static Assets ile tek dağıtım tercih edilir. Uygulama sırasında bu özelliklerin ücretsiz katman koşulları yeniden doğrulanır.

### 4.4 Fotoğraf işleme

1. Kullanıcı kamera veya dosya seçiciden fotoğraf seçer.
2. İstemci fotoğrafı makul boyut ve kaliteye küçültür; gereksiz metadata mümkünse kaldırılır.
3. İlk kullanımda ve gerekli olduğunda Gemini veri işleme koşulları açıkça gösterilir.
4. Kullanıcının onayından sonra görsel Cloudflare Worker üzerinden Gemini'ye gönderilir.
5. Gemini yalnızca tanımlama, bileşen ve porsiyon tahmini için yapılandırılmış sonuç döndürür.
6. Sonuç besin kaynağıyla eşleştirilir ve kullanıcı onay ekranına alınır.
7. Kullanıcı açıkça farklı bir özellik seçmedikçe özgün fotoğraf kalıcı olarak saklanmaz.

Fotoğraf saklama ileride eklenirse Supabase Storage'da kullanıcıya özel yollar, Storage RLS politikaları, kota ve silme akışı zorunlu olacaktır.

## 5. Besin verisi ve doğruluk stratejisi

### 5.1 Kaynak önceliği

1. Kullanıcının daha önce doğruladığı kişisel besin veya tarif
2. Uygulamanın lisansı belgelenmiş yerleşik kayıtları
3. USDA FoodData Central
4. Barkodlu ürünlerde Open Food Facts
5. AI tarafından önerilen yaklaşık değer; mutlaka kullanıcı onayına tabi

Arama sonucu yalnızca isim benzerliğiyle otomatik kaydedilmez. Birim, porsiyon, hazırlama biçimi ve 100 gram başına değerlerin uyumu kontrol edilir.

### 5.2 Yapay zekânın rolü

Yapay zekâ:

- Görseldeki veya metindeki yiyecekleri ayırır.
- Yaklaşık miktar, gramaj veya adet önerir.
- Arama için standartlaştırılmış besin adları üretir.
- Eşleşme bulunamadığında açıkça “AI tahmini” olarak işaretlenen değer önerebilir.

Yapay zekâ çıktısı tek başına doğrulanmış besin kaynağı sayılmaz. Belirsiz sonuçlarda güven düzeyi gösterilir ve kullanıcıdan düzeltme istenir.

### 5.3 Kayıt kökeni

Her besin/öğün kaleminde uygun olduğu ölçüde şunlar tutulur:

- Kaynak türü: `usda`, `open_food_facts`, `user`, `curated` veya `ai_estimate`
- Dış kaynak kayıt kimliği
- Kaynak sorgulama tarihi
- Kaynaktan alınan 100 gram değerleri
- Kullanılan miktar ve birim
- Hesaplanan kalori ve makrolar
- AI güven düzeyi ve model sürümü
- Kullanıcı tarafından değiştirilme durumu
- Oluşturma ve güncelleme zamanları

Kaynak değer ile öğüne kaydedilen anlık değer ayrı tutulur. Dış kaynak daha sonra değişse bile geçmiş öğünlerin toplamı geriye dönük ve sessizce değişmez.

### 5.4 Lisans kararları

- **USDA FoodData Central:** CC0/kamu malı veriler temel genel besin kaynağı olabilir. Uygulamada kaynak gösterilir.
- **Open Food Facts:** ODbL ve atıf/paylaşım koşulları nedeniyle veriler kaynak kimliğiyle ayrı tutulur. Büyük veri kopyası veya birleşik veri seti yayımlanmadan önce lisans uyumu yeniden incelenir. API çağrılarında tanımlayıcı `User-Agent` ve hız sınırları uygulanır.
- **TürKomp:** Yazılı izin veya uygun lisans alınmadan veriler uygulamaya ya da GitHub deposuna kopyalanmaz. İlk sürümün başlangıç tablosu TürKomp'tan oluşturulmaz.
- **Türk yemekleri:** Kullanıcı tarifleri ve lisansı uygun temel bileşenlerden hesaplanan tarifler önceliklendirilir. Yerleşik tarif eklenecekse tarifin/verinin kökeni ve kullanım hakkı belgelenir.

Lisans koşulları dağıtım öncesinde yeniden kontrol edilir ve uygulamada bir “Veri kaynakları” sayfası bulunur.

## 6. Önerilen veri modeli

Kesin SQL şeması geliştirme aşamasında migration olarak hazırlanacaktır. Başlangıç varlıkları:

| Varlık | Amaç |
|---|---|
| `profiles` | Kullanıcıya ait uygulama profili, birim ve saat dilimi |
| `nutrition_goals` | Tarih aralığına bağlı kalori ve makro hedefleri |
| `food_entries` | Öğün üst kaydı; tarih, öğün türü ve kullanıcı notu |
| `food_entry_items` | Öğündeki her besin, miktar, anlık besin değerleri ve kaynak bilgisi |
| `custom_foods` | Kullanıcının oluşturduğu veya doğruladığı kişisel besinler |
| `recipes` | Sonraki sürüm için kişisel tarif üst kaydı |
| `recipe_items` | Tarif bileşenleri |
| `water_entries` | Sonraki sürüm su kayıtları |
| `weight_entries` | Sonraki sürüm kilo kayıtları |
| `consents` | Gizlilik metni sürümü, kapsamı ve onay zamanı |

Kullanıcıya ait her tabloda:

- `user_id` zorunludur ve `auth.users` ile ilişkilidir.
- Sahiplik politikaları `SELECT`, `INSERT`, `UPDATE` ve `DELETE` için ayrı ayrı test edilir.
- Kimlikler tahmin edilemeyen UUID olur.
- Zamanlar UTC saklanır; günlük gruplama kullanıcının IANA saat dilimine göre yapılır.
- Silme ve eşitleme için gerekli sürüm/zaman bilgileri bulunur.

## 7. Çevrimdışı kullanım ve senkronizasyon

Supabase ana veri kaynağıdır; IndexedDB çevrimdışı çalışma katmanıdır.

- Başarılı sunucu okumaları yerelde önbelleğe alınır.
- Çevrimdışıyken desteklenen ekleme, düzenleme ve silme işlemleri benzersiz işlem kimliğiyle kuyruğa yazılır.
- Bağlantı geldiğinde işlemler tekrar gönderilmeye dayanıklı şekilde eşitlenir.
- Kullanıcıya çevrimdışı, eşitleniyor, eşitlendi ve hata durumları gösterilir.
- İlk oturum açma ve parola işlemleri çevrimiçi bağlantı gerektirir.
- Aynı kayıt iki cihazda değişirse ilk sürümde sunucu zamanına dayalı belgelenmiş bir “son geçerli yazma” kuralı uygulanır; veri kaybı riski olan durumda kullanıcı bilgilendirilir.
- Çevrimdışı kuyruk başka bir kullanıcı oturumuna taşınmaz. Çıkışta kullanıcıya bekleyen işlemler bildirilir.

Service worker API isteklerini kontrolsüz biçimde genel önbelleğe almaz. Kimlik doğrulamalı yanıtların farklı kullanıcılar arasında sızmasını önleyecek önbellek anahtarları ve temizleme davranışı test edilir.

## 8. Güvenlik ve gizlilik gereksinimleri

### 8.1 Zorunlu kontroller

- Bütün kullanıcı tablolarında varsayılan olarak kapalı erişim ve açık RLS politikaları
- Başka kullanıcı kimliğiyle doğrudan erişim denemelerini kapsayan otomatik RLS testleri
- İstemci ve Worker girişlerinde şema doğrulaması
- Dosya türü, boyutu ve istek sıklığı sınırları
- Gemini çıktısının güvenilmeyen veri kabul edilmesi ve şema dışı alanların reddedilmesi
- API anahtarlarının yalnızca servis sırlarında tutulması
- `.env` dosyalarının Git'e alınmaması; yalnızca güvenli `.env.example`
- Bağımlılık ve secret taraması
- Güvenli HTTP başlıkları ve makul Content Security Policy
- Ayrıntılı kişisel verilerin loglanmaması
- Hata mesajlarında anahtar, token veya başka kullanıcı verisi gösterilmemesi
- Hesap silme ve kullanıcı verisini zincirleme temizleme akışının test edilmesi

### 8.2 Gemini ve kullanıcı onayı

Gemini ücretsiz katmanının veri kullanım şartları bölgeye ve hizmet türüne göre farklılık gösterebilir. Bu nedenle:

- Kullanıcı fotoğraf göndermeden önce kullanılan sağlayıcı ve verinin üçüncü tarafa gönderileceği konusunda bilgilendirilir.
- Onay metninin sürümü ve zamanı kaydedilir.
- Onay verilmezse fotoğraf analizi kapalı kalır; metinle manuel giriş kullanılabilir.
- Kullanıcı onayını geri çekebilir.
- Hassas, gizli veya kişisel bilgi içeren görsellerin gönderilmemesi konusunda uyarı gösterilir.
- Sağlayıcı koşulları ve model adı dağıtım öncesinde yeniden doğrulanır.

### 8.3 Maliyet koruması

- Ücretsiz katman limitleri belgelenir ve takip edilir.
- Worker üzerinde kullanıcı ve IP bazlı kötüye kullanım sınırları bulunur.
- Görseller istemcide küçültülür ve gereksiz tekrar analizleri önlenir.
- Kota dolduğunda otomatik ücretli kullanıma veya ikinci AI sağlayıcısına geçilmez.
- Kullanıcıya anlaşılır hata ve manuel giriş alternatifi sunulur.
- Faturalandırma gerektiren hiçbir özellik ürün sahibinin açık onayı olmadan açılmaz.

## 9. Kalite gereksinimleri

- TypeScript strict modunda derleme hatası olmamalı.
- Lint ve biçim denetimleri otomatik çalışmalı.
- Besin hesaplama, birim dönüştürme ve tarih/saat dilimi mantığı birim testleriyle korunmalı.
- Auth ve RLS için entegrasyon testleri bulunmalı.
- Ana kullanıcı akışları için uçtan uca testler bulunmalı.
- Mobil ekranlar ve en az bir masaüstü görünümü test edilmeli.
- Klavye kullanımı, etiketler, odak göstergeleri ve renk kontrastı kontrol edilmeli.
- PWA kurulumu ve çevrimdışı davranış gerçek tarayıcıda doğrulanmalı.
- Üretim derlemesi ve dağıtım ön izlemesi başarılı olmadan aşama tamamlanmış sayılmamalı.

Hedeflenen tarayıcı matrisi geliştirme başlangıcında güncel kullanım oranlarıyla belirlenecektir. Web Speech API ve BarcodeDetector tek başına güvenilir kabul edilmez; ses ve barkod aşamalarında destek kontrolü ve alternatif kütüphane/manuel giriş gerekir.

## 10. Geliştirme aşamaları ve kabul ölçütleri

### Aşama 0 — Planlama ve yönetişim

- `PLAN.md` ürün sahibi tarafından onaylanır.
- GitHub deposu oluşturulur.
- `AGENTS.md`, `PROGRESS.md`, `README.md` ve lisans kararı hazırlanır.
- Ücretsiz servis hesapları ve gizli anahtar yönetimi planlanır.
- Büyük mimari kararlar ADR veya proje belgelerinde kaydedilir.

**Tamamlanma ölçütü:** Kapsam, güvenlik sınırları, veri lisansları ve geliştirme kuralları belgelenmiş ve ürün sahibi tarafından onaylanmıştır.

### Aşama 1 — Güvenli temel

- React/Vite/TypeScript/PWA iskeleti
- Supabase yerel/geliştirme şeması ve migration düzeni
- E-posta + parola auth akışları
- Birden fazla gerçek kullanıcı hesabının aynı dağıtımda kullanılabilmesi
- Profil ve hedef tabloları
- Bütün kullanıcı tabloları için RLS
- Test, lint, build ve GitHub Actions kontrolleri
- Cloudflare ön izleme dağıtımı

**Tamamlanma ölçütü:** En az iki bağımsız test kullanıcısı aynı dağıtımda hesap oluşturup oturum açabilir ve birbirinin hiçbir kaydını okuyamaz veya değiştiremez; auth, RLS, build ve otomatik kontroller geçer. Bu ölçüt sağlanmadan tek kullanıcıya yönelik özellik geliştirmesi tamamlanmış kabul edilmez.

### Aşama 2 — Metin tabanlı çekirdek

- Metinle yemek girişi
- USDA arama/eşleştirme
- Porsiyon ve birim dönüştürme
- Onay/düzeltme ekranı
- Öğün ekleme, düzenleme ve silme
- Günlük kalori/makro toplamı ve hedef ilerlemesi
- Kaynak göstergeleri

**Tamamlanma ölçütü:** Kullanıcı metinle bir öğün oluşturabilir, değerlerini doğrulayabilir, farklı cihazda görebilir ve toplamların hesaplama testleri geçer.

### Aşama 3 — Fotoğraf analizi

- Fotoğraf seçme/kamera akışı
- Gizlilik bilgilendirmesi ve sürümlü onay
- İstemci tarafında görsel küçültme
- Worker üzerinden Gemini entegrasyonu
- Yapılandırılmış çıktı doğrulama
- Çoklu yiyecek ve porsiyon düzeltme
- Kota ve hata durumunda manuel giriş

**Tamamlanma ölçütü:** Onay vermeyen kullanıcıdan görsel çıkmaz; onay veren kullanıcı sonucu düzenlemeden kayda zorlanmaz; özgün fotoğraf kalıcı depoda bulunmaz.

### Aşama 4 — PWA, çevrimdışı kullanım ve veri taşınabilirliği

- IndexedDB önbelleği ve işlem kuyruğu
- Bağlantı/eşitleme durumları
- Kullanıcı değişiminde yerel veri izolasyonu
- PWA kurulum ve güncelleme davranışı
- JSON/CSV dışa aktarma
- Hesap ve veri silme akışı

**Tamamlanma ölçütü:** Kullanıcı son verilerini çevrimdışı görebilir, desteklenen kaydı çevrimdışı ekleyip daha sonra eşitleyebilir ve dışa aktarabilir.

### Aşama 5 — Genişletilmiş giriş yöntemleri

- Barkod tarama ve Open Food Facts
- Desteklenmeyen cihazlar için manuel barkod girişi
- Ses girişi ve desteklenmeyen tarayıcılar için metin alternatifi
- Favoriler, sık yenenler ve “tekrar ye”

**Tamamlanma ölçütü:** Her özellik destek kontrolü, hata alternatifi, veri kaynağı atfı ve gerçek cihaz testiyle çalışır.

### Aşama 6 — Takip ve içgörüler

- Kişisel tarifler
- Su ve kilo takibi
- Haftalık/aylık grafikler
- Enerji ihtiyacı hesaplama ve yöntem açıklaması

**Tamamlanma ölçütü:** Hesaplamalar kaynak ve varsayımlarıyla açıklanır; geçmiş veriler saat dilimi sınırlarında doğru gruplanır.

### Aşama 7 — Sertleştirme ve canlıya çıkış

- Güvenlik, gizlilik ve lisans kontrol listeleri
- Erişilebilirlik ve performans incelemesi
- Hata izleme yaklaşımı; kişisel veri içermeyen loglar
- Yedekleme ve geri yükleme tatbikatı
- Kullanım koşulları, gizlilik metni ve veri kaynakları sayfası
- Üretim dağıtımı için ürün sahibi onayı

**Tamamlanma ölçütü:** Kritik testler geçer, açık yüksek riskli güvenlik sorunu kalmaz ve ürün sahibi canlı dağıtımı açıkça onaylar.

## 11. Proje yönetimi

Depoda şu belgeler güncel tutulur:

- `PLAN.md`: kapsam, mimari, gereksinimler, kararlar ve yol haritası
- `AGENTS.md`: Codex çalışma kuralları, kod standartları, güvenlik ve doğrulama şartları
- `PROGRESS.md`: tamamlanan işler, mevcut durum, kararlar, sorunlar ve sıradaki işler
- `README.md`: kurulum, geliştirme, test ve dağıtım kullanım kılavuzu

Her çalışma oturumunda önce `AGENTS.md`, `PLAN.md` ve `PROGRESS.md` okunur. Bir iş tamamlanmadan önce ilgili testler çalıştırılır ve `PROGRESS.md` güncellenir.

### Git çalışma ilkeleri

- Ana dal her zaman çalışır durumda tutulur.
- Özellikler küçük, incelenebilir değişiklikler halinde geliştirilir.
- Commit mesajları değişikliğin amacını açıklar.
- Anahtarlar, tokenlar, gerçek kullanıcı verileri ve gizli yapılandırmalar commit edilmez.
- Canlıya dağıtım, veri silme, şema açısından yıkıcı migration ve ücretli hizmet etkinleştirme için ürün sahibinden onay alınır.

## 12. Başlıca riskler ve azaltma yöntemleri

| Risk | Azaltma |
|---|---|
| Fotoğraftan porsiyon tahmini hatalı olabilir | Güven düzeyi, kullanıcı düzeltmesi, açık “tahmin” etiketi ve geçmiş kişisel porsiyonlar |
| Ücretsiz AI kotası değişebilir veya dolabilir | Kullanım sınırı, görsel küçültme, manuel giriş ve otomatik ücretli geçişin yasaklanması |
| Supabase ücretsiz proje duraklatılabilir | Kullanıcıya anlaşılır durum, düzenli dışa aktarma/yedek yaklaşımı ve koşulların izlenmesi |
| Ücretsiz planda indirilebilir otomatik veritabanı yedeği yoktur | Belgelenmiş mantıksal yedek ve geri yükleme süreci; kritik değişiklik öncesi yedek |
| Veri kaynaklarının lisansları birbiriyle çakışabilir | Kaynakları ayrı tutma, köken metadata'sı ve dağıtım öncesi lisans incelemesi |
| Çevrimdışı değişiklikler çakışabilir | Sürümlü kayıtlar, belgelenmiş çatışma kuralı ve kullanıcıya eşitleme durumu |
| RLS hatası kullanıcı verisi sızıntısına yol açabilir | Varsayılan kapalı politikalar ve iki kullanıcıyla otomatik negatif erişim testleri |
| Web Speech veya BarcodeDetector her cihazda çalışmayabilir | Özellik algılama, alternatif kütüphane ve her zaman manuel giriş seçeneği |
| Sağlık uygulaması gibi algılanabilir | Tıbbi iddialardan kaçınma, yöntem/kaynak açıklaması ve açık bilgilendirme |

## 13. Onaylanmış karar kaydı

23 Ekim 2026 tarihinde ürün sahibi tarafından onaylanan kararlar:

1. İlk giriş yöntemi e-posta + parola olacaktır; Google ile giriş sonraki sürüme bırakılmıştır.
2. Yemek fotoğrafları varsayılan olarak analizden sonra saklanmayacaktır.
3. Gemini'ye fotoğraf gönderilmeden önce her kullanıcıya açık bilgilendirme yapılacak ve onayı alınacaktır.
4. TürKomp verileri izin veya uygun lisans alınmadan uygulamaya ya da depoya kopyalanmayacaktır.
5. İlk sürüm çok kullanıcılı olacak; Supabase Auth, PostgreSQL ve RLS başlangıç mimarisinin parçasıdır.
6. IndexedDB ana veri kaynağı değil, çevrimdışı önbellek ve eşitleme kuyruğudur.
7. AI kotası bittiğinde otomatik olarak ücretli plana veya ikinci sağlayıcıya geçilmeyecektir.
8. Çok kullanıcılı yapı sonradan eklenmeyecek; ilk çalışan geliştirme diliminden itibaren birkaç bağımsız kullanıcı hesabı desteklenecektir.

## 14. Geliştirmeye başlamadan önce gereken onay

Bu planın son hâli ürün sahibi tarafından onaylandıktan sonra sıradaki ayrı adımlar şunlardır:

1. GitHub deposunun oluşturulması veya mevcut bir depoya bağlanılması
2. `AGENTS.md`, `PROGRESS.md` ve başlangıç `README.md` dosyalarının hazırlanması
3. Ücretsiz servis hesaplarının ve geliştirme ortamının kurulması
4. Aşama 1 geliştirmesine başlama onayı

Bu dört adımdan hiçbiri plan onayı otomatik olarak geliştirme veya canlıya dağıtım izni verdiği şeklinde yorumlanmaz.

## 15. Başvuru bağlantıları

Koşullar değişebileceği için uygulama ve dağıtım öncesinde yeniden kontrol edilir:

- Supabase fiyatlandırma: https://supabase.com/pricing
- Supabase RLS: https://supabase.com/docs/guides/database/postgres/row-level-security
- Supabase ücretsiz proje duraklatma: https://supabase.com/docs/guides/platform/free-project-pausing
- Cloudflare Workers fiyatlandırma: https://developers.cloudflare.com/workers/platform/pricing/
- Cloudflare Static Assets: https://developers.cloudflare.com/workers/static-assets/
- Gemini API fiyatlandırma: https://ai.google.dev/gemini-api/docs/pricing
- Gemini API ek koşulları: https://ai.google.dev/gemini-api/terms
- USDA FoodData Central API: https://fdc.nal.usda.gov/api-guide/
- Open Food Facts API: https://openfoodfacts.github.io/openfoodfacts-server/api/
- Open Food Facts lisans açıklaması: https://github.com/openfoodfacts/openfoodfacts-server/blob/main/docs/api/tutorials/license-be-on-the-legal-side.md
- TürKomp veri kullanım koşulları: https://turkomp.tarimorman.gov.tr/useofdata
