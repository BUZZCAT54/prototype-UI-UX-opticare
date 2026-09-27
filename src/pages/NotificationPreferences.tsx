import { useNavigate } from 'react-router-dom'
import { PageHeader } from '../components/layout/Layout'
import { BottomNav } from '../components/navigation/BottomNav'
import { IconButton } from '../components/ui/Button'
import { Icon } from '../components/ui/Icon'
import { Switch } from '../components/ui/Field'
import { ToastHost } from '../components/ui/Toast'
import { useProfile } from '../store/ProfileContext'
import { useToast } from '../store/ToastContext'
import type { NotificationSetting } from '../types'

const ROW_ICON: Record<string, string> = {
  'order-status': 'local_shipping',
  'appointment-reminder': 'calendar_month',
  promo: 'sell',
  'product-info': 'visibility',
}

function SettingRow({
  setting,
  onToggle,
}: {
  setting: NotificationSetting
  onToggle: () => void
}) {
  return (
    <div className="flex items-start gap-3 px-4 py-3.5">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-brand-light text-brand">
        <Icon name={ROW_ICON[setting.id] ?? 'notifications'} size={18} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-ink">{setting.label}</p>
        <p className="mt-0.5 text-[11px] leading-relaxed text-ink-muted">{setting.description}</p>
      </div>
      <Switch
        checked={setting.enabled}
        onChange={onToggle}
        label={`Notifikasi ${setting.label}`}
      />
    </div>
  )
}

export function NotificationPreferences() {
  const navigate = useNavigate()
  const { notifications, toggleNotification } = useProfile()
  const { push } = useToast()

  const handleToggle = (setting: NotificationSetting) => {
    toggleNotification(setting.id)
    push(
      `Notifikasi ${setting.label} ${setting.enabled ? 'dimatikan' : 'diaktifkan'}`,
      setting.enabled ? 'info' : 'success',
    )
  }

  return (
    <>
      <PageHeader
        title="Notifikasi"
        actions={
          <IconButton
            name="help_outline"
            label="Bantuan"
            onClick={() => push('Notifikasi dapat diatur ulang kapan saja', 'info')}
          />
        }
      />

      <main className="flex-1 space-y-4 px-5 pb-28 pt-4">
        {/* Intro */}
        <section className="rounded-xl border border-brand/30 bg-brand-light p-4">
          <div className="flex items-start gap-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-surface text-brand">
              <Icon name="notifications_active" size={22} />
            </span>
            <div className="min-w-0">
              <h2 className="text-sm font-bold text-ink">Pengaturan Pemberitahuan</h2>
              <p className="mt-1 text-[11px] leading-relaxed text-brand-dark/80">
                Pilih jenis informasi yang ingin kamu terima melalui push notification aplikasi dan
                pembaruan berkala.
              </p>
            </div>
          </div>
        </section>

        {/* Kategori */}
        <section>
          <h3 className="mb-2 px-1 text-[13px] font-bold uppercase tracking-wide text-ink-muted">
            Kategori Notifikasi
          </h3>
          <div className="divide-y divide-line overflow-hidden rounded-xl border border-line bg-surface">
            {notifications.map((setting) => (
              <SettingRow
                key={setting.id}
                setting={setting}
                onToggle={() => handleToggle(setting)}
              />
            ))}
          </div>
        </section>

        {/* Status ringkas */}
        <div className="flex items-center justify-between rounded-xl border border-line bg-surface px-4 py-3">
          <span className="flex items-center gap-2 text-xs text-ink-muted">
            <Icon name="notifications" size={16} className="text-brand" />
            {notifications.filter((n) => n.enabled).length} dari {notifications.length} kategori
            aktif
          </span>
          <button
            type="button"
            onClick={() => {
              notifications
                .filter((n) => !n.enabled)
                .forEach((n) => toggleNotification(n.id))
              push('Semua kategori notifikasi diaktifkan', 'success')
            }}
            className="text-xs font-semibold text-brand hover:underline"
          >
            Aktifkan Semua
          </button>
        </div>

        <p className="flex items-start gap-2 rounded-xl border border-line bg-surface p-3.5 text-[11px] leading-relaxed text-ink-muted">
          <Icon name="shield" size={16} className="mt-0.5 shrink-0 text-brand" />
          Notifikasi sistem keamanan akun dan transaksi penting tetap akan dikirimkan demi
          keamanan data optik Anda.
        </p>

        <button
          type="button"
          onClick={() => navigate('/profile')}
          className="mx-auto block text-xs font-semibold text-brand hover:underline"
        >
          Kembali ke Profil
        </button>
      </main>

      <BottomNav />
      <ToastHost />
    </>
  )
}
