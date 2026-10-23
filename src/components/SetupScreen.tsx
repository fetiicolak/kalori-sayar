export function SetupScreen() {
  return (
    <main className="setup-shell">
      <section className="setup-card">
        <img src="/logo.svg" alt="" width="64" height="64" />
        <p className="eyebrow">KURULUM GEREKİYOR</p>
        <h1>Uygulama hazır, bağlantı bekliyor.</h1>
        <p>
          Supabase projesi bağlandığında hesap oluşturma ve cihazlar arası senkronizasyon açılacak. Gerçek anahtarları kaynak
          koda yazmayın.
        </p>
        <ol>
          <li><code>.env.example</code> dosyasını <code>.env.local</code> olarak kopyalayın.</li>
          <li>Supabase URL ve yayımlanabilir anahtarı ekleyin.</li>
          <li>Geliştirme sunucusunu yeniden başlatın.</li>
        </ol>
        <p className="muted">Ayrıntılı adımlar README dosyasında yer alacak.</p>
      </section>
    </main>
  )
}
