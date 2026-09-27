import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageHeader, StickyBar } from '../components/layout/Layout'
import { Button, IconButton } from '../components/ui/Button'
import { Field, Input, inputClass } from '../components/ui/Field'
import { Icon } from '../components/ui/Icon'
import { ToastHost } from '../components/ui/Toast'
import { useProfile } from '../store/ProfileContext'
import { useToast } from '../store/ToastContext'
import { cn } from '../utils/cn'

const GENDER_OPTIONS = [
  { id: 'pria' as const, label: 'Pria' },
  { id: 'wanita' as const, label: 'Wanita' },
]

export function ProfileEdit() {
  const navigate = useNavigate()
  const { profile, updateProfile } = useProfile()
  const { push } = useToast()

  const [name, setName] = useState(profile.name)
  const [phoneLocal, setPhoneLocal] = useState(profile.phone.replace(/^\+62\s*/, ''))
  const [birthDate, setBirthDate] = useState(profile.birthDate ?? '')
  const [gender, setGender] = useState<'pria' | 'wanita' | undefined>(profile.gender)
  const [error, setError] = useState<string | null>(null)

  const phone = phoneLocal.trim() ? `+62 ${phoneLocal.trim()}` : profile.phone

  const save = () => {
    if (!name.trim()) {
      setError('Nama lengkap wajib diisi')
      push('Nama lengkap belum diisi', 'error')
      return
    }
    updateProfile({ name: name.trim(), phone, birthDate, gender })
    push('Perubahan profil tersimpan', 'success')
    navigate(-1)
  }

  return (
    <>
      <PageHeader
        title="Edit Profil"
        actions={
          <IconButton
            name="help_outline"
            label="Bantuan"
            onClick={() => push('Hubungi OptiCare di 0800-1234-567 bila butuh bantuan', 'info')}
          />
        }
      />

      <main className="flex-1 space-y-5 px-5 pb-36 pt-4">
        {/* Foto profil */}
        <section className="flex flex-col items-center rounded-xl border border-line bg-surface px-4 py-5">
          <div className="relative">
            <img
              src={profile.avatar}
              alt=""
              className="h-24 w-24 rounded-full border border-line object-cover"
            />
            <span className="absolute -bottom-1 -right-1 grid h-9 w-9 place-items-center rounded-full border-2 border-surface bg-brand text-white">
              <Icon name="photo_camera" size={16} />
            </span>
          </div>
          <Button
            variant="secondary"
            size="sm"
            className="mt-3"
            leadingIcon="add_a_photo"
            onClick={() => push('Unggah foto profil belum tersedia pada demo ini', 'info')}
          >
            Ubah Foto
          </Button>
          <p className="mt-1.5 text-[11px] text-ink-muted">Format JPG atau PNG. Maksimal 2MB.</p>
        </section>

        {/* Data diri */}
        <section className="space-y-4 rounded-xl border border-line bg-surface p-4">
          <Field label="Nama Lengkap" htmlFor="name" error={error ?? undefined}>
            <Input
              id="name"
              value={name}
              autoComplete="name"
              onChange={(e) => {
                setName(e.target.value)
                if (error) setError(null)
              }}
              placeholder="Nama lengkap sesuai identitas"
            />
          </Field>

          <Field label="Email" htmlFor="email" hint="Email terhubung ke akun OptiCare kamu">
            <div className="relative">
              <Input
                id="email"
                value={profile.email}
                readOnly
                className="pr-28 text-ink-muted"
                aria-describedby="email-status"
              />
              <span
                id="email-status"
                className="pointer-events-none absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-1 text-[11px] font-semibold text-success"
              >
                <Icon name="check_circle" size={14} />
                Terverifikasi
              </span>
            </div>
          </Field>

          <Field label="Nomor Telepon" htmlFor="phone" hint="Digunakan untuk kurir dan notifikasi booking">
            <div className="flex items-stretch gap-2">
              <span
                className={cn(
                  'grid h-12 shrink-0 place-items-center rounded-md border border-line bg-canvas px-3.5 text-body-md font-semibold text-ink-muted',
                )}
              >
                +62
              </span>
              <Input
                id="phone"
                inputMode="tel"
                autoComplete="tel-national"
                value={phoneLocal}
                onChange={(e) => setPhoneLocal(e.target.value)}
                placeholder="812-3456-7890"
                className="flex-1"
              />
            </div>
          </Field>

          <Field label="Tanggal Lahir" htmlFor="birth">
            <div className="relative">
              <input
                id="birth"
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className={cn(inputClass, 'pr-11 [color-scheme:light] [&::-webkit-calendar-picker-indicator]:opacity-0')}
              />
              <Icon
                name="calendar_today"
                size={18}
                className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-ink-muted"
              />
            </div>
          </Field>

          <Field label="Jenis Kelamin">
            <div className="flex gap-2">
              {GENDER_OPTIONS.map((opt) => {
                const active = gender === opt.id
                return (
                  <button
                    key={opt.id}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setGender(active ? undefined : opt.id)}
                    className={cn(
                      'h-11 flex-1 rounded-md border text-label-md font-medium transition-colors duration-150',
                      active
                        ? 'border-brand bg-brand-light font-semibold text-brand-dark'
                        : 'border-line bg-surface text-ink-muted hover:border-brand/40 hover:text-ink',
                    )}
                  >
                    {opt.label}
                  </button>
                )
              })}
            </div>
          </Field>
        </section>

        {/* Keamanan */}
        <p className="flex items-start gap-2.5 rounded-xl border border-line bg-surface p-3.5 text-[11px] leading-relaxed text-ink-muted">
          <Icon name="lock" size={16} className="mt-0.5 shrink-0 text-brand" />
          <span>
            <span className="block font-bold text-ink">Keamanan Data OptiCare</span>
            Data pribadi Anda terlindungi dan digunakan untuk riwayat resep &amp; pemesanan
            kacamata OptiCare.
          </span>
        </p>
      </main>

      <StickyBar>
        <Button fullWidth size="lg" className="h-12 rounded-xl" leadingIcon="save" onClick={save}>
          Simpan Perubahan
        </Button>
      </StickyBar>

      <ToastHost />
    </>
  )
}
