import { useState, type FormEvent } from 'react'
import { requireSupabase } from '../lib/supabase'

type Mode = 'sign-in' | 'sign-up' | 'forgot'

export function AuthScreen() {
  const [mode, setMode] = useState<Mode>('sign-in')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function submit(event: FormEvent) {
    event.preventDefault()
    setBusy(true)
    setError(null)
    setMessage(null)
    const client = requireSupabase()

    try {
      if (mode === 'sign-in') {
        const { error: authError } = await client.auth.signInWithPassword({ email, password })
        if (authError) throw authError
      } else if (mode === 'sign-up') {
        const { data, error: authError } = await client.auth.signUp({
          email,
          password,
          options: {
            data: {
              display_name: displayName.trim() || null,
              timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
            }
          }
        })
        if (authError) throw authError
        if (!data.session) setMessage('E-postanıza gönderilen doğrulama bağlantısını açın.')
      } else {
        const { error: authError } = await client.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/`
        })
        if (authError) throw authError
        setMessage('Parola yenileme bağlantısı e-posta adresinize gönderildi.')
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'İşlem tamamlanamadı.')
    } finally {
      setBusy(false)
    }
  }

  const title = mode === 'sign-in' ? 'Tekrar hoş geldin' : mode === 'sign-up' ? 'Hesabını oluştur' : 'Parolanı yenile'

  return (
    <main className="auth-shell">
      <section className="auth-brand" aria-label="Kalori Sayar tanıtımı">
        <img src={`${import.meta.env.BASE_URL}logo.svg`} alt="" width="56" height="56" />
        <p className="eyebrow">DAHA NET BESLENME TAKİBİ</p>
        <h1>Ne yediğini gör.<br />Hedefini sadeleştir.</h1>
        <p className="auth-lead">
          Öğünlerini kaydet, yaklaşık değerleri doğrula ve günlük ilerlemeni tek ekranda takip et.
        </p>
        <div className="trust-row" aria-label="Ürün özellikleri">
          <span>Kaynaklı değerler</span><span>Kişisel veriler</span><span>Çevrimdışı destek</span>
        </div>
      </section>

      <section className="auth-panel">
        <div className="auth-card">
          <div>
            <p className="eyebrow">KALORİ SAYAR</p>
            <h2>{title}</h2>
            <p className="muted">
              {mode === 'sign-in' && 'Bugünün kaydına kaldığın yerden devam et.'}
              {mode === 'sign-up' && 'Verilerin yalnızca sana ait bir hesapta saklansın.'}
              {mode === 'forgot' && 'Hesabına bağlı e-posta adresini yaz.'}
            </p>
          </div>

          <form onSubmit={(event) => void submit(event)} className="stack-lg">
            {mode === 'sign-up' && (
              <label>
                Görünen ad <span className="optional">(isteğe bağlı)</span>
                <input value={displayName} onChange={(event) => setDisplayName(event.target.value)} autoComplete="name" maxLength={80} />
              </label>
            )}
            <label>
              E-posta
              <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required />
            </label>
            {mode !== 'forgot' && (
              <label>
                Parola
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete={mode === 'sign-up' ? 'new-password' : 'current-password'}
                  minLength={8}
                  required
                />
                {mode === 'sign-up' && <small>En az 8 karakter kullan.</small>}
              </label>
            )}
            {error && <div className="notice error" role="alert">{error}</div>}
            {message && <div className="notice success" role="status">{message}</div>}
            <button className="button primary wide" disabled={busy}>
              {busy ? 'Bekleyin…' : mode === 'sign-in' ? 'Giriş yap' : mode === 'sign-up' ? 'Hesap oluştur' : 'Bağlantı gönder'}
            </button>
          </form>

          <div className="auth-links">
            {mode === 'sign-in' && <button className="text-button" onClick={() => setMode('forgot')}>Parolamı unuttum</button>}
            {mode !== 'sign-in' && <button className="text-button" onClick={() => setMode('sign-in')}>Girişe dön</button>}
            {mode !== 'sign-up' && <button className="text-button" onClick={() => setMode('sign-up')}>Yeni hesap oluştur</button>}
          </div>
        </div>
      </section>
    </main>
  )
}
