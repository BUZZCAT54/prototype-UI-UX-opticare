import { useMemo, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { PageHeader, StickyBar } from '../components/layout/Layout'
import { BottomNav } from '../components/navigation/BottomNav'
import { Button, IconButton } from '../components/ui/Button'
import { Field, Input, Tabs } from '../components/ui/Field'
import { Icon } from '../components/ui/Icon'
import { Skeleton } from '../components/ui/Skeleton'
import { ToastHost } from '../components/ui/Toast'
import { getProduct } from '../data/products'
import { getLens } from '../data/lenses'
import { useCart } from '../store/CartContext'
import { usePrescriptions } from '../store/PrescriptionContext'
import { useToast } from '../store/ToastContext'
import { formatDateLong } from '../utils/format'
import { cn } from '../utils/cn'

type Tab = 'upload' | 'manual'
type UploadStatus = 'idle' | 'progress' | 'success' | 'error'

const SOURCE_OPTIONS = [
  { id: 'opticare', label: 'OptiCare Eye Check' },
  { id: 'doctor', label: 'Dokter Mata / Rumah Sakit' },
  { id: 'clinic', label: 'Klinik Mata Pratama' },
  { id: 'other', label: 'Optik Lain' },
]

const PARAM_GUIDE = [
  ['SPH (Sphere):', 'Ukuran kekuatan minus (-) atau plus (+).'],
  ['CYL (Cylinder):', 'Nilai silinder kelengkungan kornea.'],
  ['AXIS:', 'Derajat kemiringan silinder (1°–180°).'],
  ['PD:', 'Pupillary Distance / Jarak titik pusat pupil (mm).'],
]

interface ManualForm {
  odSph: string
  odCyl: string
  odAxis: string
  osSph: string
  osCyl: string
  osAxis: string
  add: string
  pd: string
}

const EMPTY_FORM: ManualForm = {
  odSph: '',
  odCyl: '',
  odAxis: '',
  osSph: '',
  osCyl: '',
  osAxis: '',
  add: '',
  pd: '',
}

function validateValue(value: string, kind: 'rx' | 'axis' | 'pd'): string | null {
  const v = value.trim()
  if (!v) return 'Wajib diisi'
  if (kind === 'axis') {
    const n = Number(v)
    if (Number.isNaN(n) || n < 1 || n > 180) return 'Axis 1–180°'
    return null
  }
  if (kind === 'pd') {
    const n = Number(v)
    if (Number.isNaN(n) || n < 40 || n > 90) return 'PD 40–90 mm'
    return null
  }
  if (!/^[+-]?\d{1,2}(\.\d{1,2})?$/.test(v)) return 'Format -1.50'
  const n = Number(v)
  if (Number.isNaN(n) || Math.abs(n) > 20) return 'Di luar rentang'
  return null
}

export function Prescription() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const { list, active, setActive, save } = usePrescriptions()
  const { add, setLens, items } = useCart()
  const { push } = useToast()

  const product = getProduct(params.get('product'))
  const lens = getLens(params.get('lens'))
  const cartItemId = params.get('item')
  const cartItem = cartItemId ? items.find((i) => i.id === cartItemId) : undefined

  const [tab, setTab] = useState<Tab>('upload')
  const [useSaved, setUseSaved] = useState(true)
  const [upload, setUpload] = useState<UploadStatus>('idle')
  const [fileName, setFileName] = useState('')
  const [fileSize, setFileSize] = useState('')
  const [form, setForm] = useState<ManualForm>(EMPTY_FORM)
  const [touched, setTouched] = useState(false)
  const [source, setSource] = useState('opticare')
  const fileRef = useRef<HTMLInputElement>(null)

  const errors = useMemo(() => {
    const e: Partial<Record<keyof ManualForm, string | null>> = {}
    e.odSph = validateValue(form.odSph, 'rx')
    e.odCyl = form.odCyl.trim() ? validateValue(form.odCyl, 'rx') : null
    e.odAxis = form.odAxis.trim() ? validateValue(form.odAxis, 'axis') : null
    e.osSph = validateValue(form.osSph, 'rx')
    e.osCyl = form.osCyl.trim() ? validateValue(form.osCyl, 'rx') : null
    e.osAxis = form.osAxis.trim() ? validateValue(form.osAxis, 'axis') : null
    e.add = form.add.trim() ? validateValue(form.add, 'rx') : null
    e.pd = validateValue(form.pd, 'pd')
    return e
  }, [form])

  const manualValid =
    !errors.odSph && !errors.osSph && !errors.pd &&
    !errors.odCyl && !errors.osCyl && !errors.odAxis && !errors.osAxis && !errors.add

  const canContinue =
    (tab === 'upload' && (upload === 'success' || useSaved)) ||
    (tab === 'manual' && manualValid)

  function handleFile(file: File) {
    const okType = ['image/jpeg', 'image/png', 'application/pdf'].includes(file.type)
    const okSize = file.size <= 5 * 1024 * 1024
    setFileName(file.name)
    setFileSize(`${(file.size / (1024 * 1024)).toFixed(1)} MB`)
    if (!okType || !okSize) {
      setUpload('error')
      return
    }
    setUpload('progress')
    window.setTimeout(() => setUpload('success'), 1200)
  }

  function continueToCart() {
    let rxId = active?.id ?? null
    if (tab === 'manual' && manualValid) {
      const created = save({
        label: `Resep manual · ${formatDateLong(new Date())}`,
        source: 'manual',
        doctor: SOURCE_OPTIONS.find((s) => s.id === source)?.label,
        od: { sph: form.odSph, cyl: form.odCyl || '0.00', axis: form.odAxis || '0', add: form.add || '-', pd: form.pd },
        os: { sph: form.osSph, cyl: form.osCyl || '0.00', axis: form.osAxis || '0', add: form.add || '-', pd: form.pd },
        createdAt: new Date().toISOString().slice(0, 10),
      })
      rxId = created.id
    } else if (useSaved && active) {
      rxId = active.id
      setActive(active.id)
    }

    const lensId = lens?.id ?? null
    if (cartItem) {
      setLens(cartItem.id, lensId, lens?.name ?? null, lens?.price ?? 0)
    } else if (product) {
      add({
        productId: product.id,
        brand: product.brand,
        name: product.name,
        image: product.images[0],
        colorId: params.get('color') ?? product.colors[0]?.id ?? '',
        colorName:
          product.colors.find((c) => c.id === params.get('color'))?.name ??
          product.colors[0]?.name ??
          '',
        price: product.price,
        lensId,
        lensName: lens?.name ?? null,
        lensPrice: lens?.price ?? 0,
      })
    }
    push('Resep tersimpan, lanjut ke keranjang')
    navigate('/cart')
    void rxId
  }

  const contextLabel = product
    ? `${product.brand} ${product.name} · Lensa ${lens?.name ?? 'belum dipilih'}`
    : cartItem
      ? `${cartItem.brand} ${cartItem.name} · Lensa ${cartItem.lensName ?? lens?.name ?? 'belum dipilih'}`
      : 'Belum ada frame dipilih'

  return (
    <>
      <PageHeader
        title="Resep Lensa"
        subtitle="Langkah 3 dari 3"
        tone="surface"
        actions={<IconButton name="help_outline" label="Bantuan" onClick={() => push('Geser untuk melihat panduan parameter resep di bawah', 'info')} />}
      />

      <main className="flex-1 overflow-y-auto space-y-6 px-5 pb-44 pt-4">
        {/* Konteks */}
        <section className="flex items-center justify-between rounded-xl border border-line bg-surface p-3">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-light text-brand">
              <Icon name="visibility" size={20} />
            </span>
            <div>
              <span className="block text-xs text-ink-muted">Bingkai &amp; Lensa Dipilih</span>
              <span className="text-sm text-ink">{contextLabel}</span>
            </div>
          </div>
          <Icon name="check_circle" size={18} className="text-line" />
        </section>

        {/* Resep tersimpan */}
        <section className="space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-ink">Gunakan Resep Tersimpan</h2>
            <button
              type="button"
              onClick={() => navigate('/profile/prescriptions')}
              className="text-xs font-semibold text-brand hover:underline"
            >
              Riwayat ({list.length})
            </button>
          </div>

          {active ? (
            <div
              className={cn(
                'rounded-xl border bg-surface p-4 transition-all',
                useSaved ? 'border-brand bg-brand-light/30' : 'border-line',
              )}
            >
              <div className="mb-2 flex items-center justify-between border-b border-line pb-2">
                <div className="flex items-center gap-2">
                  <Icon name="verified" size={18} className="text-brand" />
                  <span className="text-xs font-semibold text-ink">
                    Pemeriksaan Terakhir · {formatDateLong(active.createdAt)}
                  </span>
                </div>
                <span className="rounded-lg bg-brand-light px-2 py-0.5 text-xs font-semibold text-brand-dark">
                  Tervalidasi
                </span>
              </div>

              <div className="mb-3 grid grid-cols-2 gap-2 rounded-lg bg-canvas p-2.5 font-mono text-[11px] text-ink">
                <div className="space-y-1 border-r border-line pr-2">
                  <div className="font-sans font-semibold text-brand">OD (Kanan)</div>
                  {(
                    [
                      ['SPH', active.od.sph],
                      ['CYL', active.od.cyl],
                      ['AXIS', `${active.od.axis}°`],
                    ] as const
                  ).map(([k, v]) => (
                    <div key={k} className="flex justify-between font-sans text-ink-muted">
                      <span>{k}</span>
                      <span className="font-mono font-semibold text-ink">{v}</span>
                    </div>
                  ))}
                </div>
                <div className="space-y-1 pl-1">
                  <div className="font-sans font-semibold text-brand">OS (Kiri)</div>
                  {(
                    [
                      ['SPH', active.os.sph],
                      ['CYL', active.os.cyl],
                      ['AXIS', `${active.os.axis}°`],
                    ] as const
                  ).map(([k, v]) => (
                    <div key={k} className="flex justify-between font-sans text-ink-muted">
                      <span>{k}</span>
                      <span className="font-mono font-semibold text-ink">{v}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-0.5">
                <span className="text-xs text-ink-muted">
                  Jarak Pupil (PD): <span className="font-semibold text-ink">{active.od.pd} mm</span>
                </span>
                <button
                  type="button"
                  onClick={() => setUseSaved((v) => !v)}
                  className={cn(
                    'flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors',
                    useSaved
                      ? 'border-brand bg-brand text-white'
                      : 'border-line-input bg-surface text-brand hover:bg-brand-light',
                  )}
                >
                  <Icon name={useSaved ? 'check_circle' : 'radio_button_unchecked'} size={16} />
                  {useSaved ? 'Dipilih' : 'Gunakan Resep Ini'}
                </button>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-line-input bg-surface p-4 text-center">
              <p className="text-xs text-ink-muted">Belum ada resep tersimpan.</p>
            </div>
          )}
        </section>

        {/* Tabs */}
        <section className="space-y-4">
          <Tabs<Tab>
            variant="segment"
            className="rounded-xl"
            items={[
              { id: 'upload', label: 'Upload Resep' },
              { id: 'manual', label: 'Isi Manual' },
            ]}
            value={tab}
            onChange={(v) => setTab(v)}
          />

          {tab === 'upload' ? (
            <div className="space-y-4">
              <div className="flex flex-col items-center rounded-xl border-2 border-dashed border-line-input bg-surface p-6 text-center transition-colors hover:bg-brand-light/30">
                <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-brand-light text-brand">
                  <Icon name="document_scanner" size={28} />
                </span>
                <h3 className="mb-1 text-base font-semibold text-ink">Upload foto atau file resep mata</h3>
                <p className="mb-4 max-w-xs text-xs leading-relaxed text-ink-muted">
                  Format JPG, PNG, atau PDF (maks. 5MB). Pastikan tulisan dokter atau optometris
                  terbaca jelas.
                </p>
                <input
                  ref={fileRef}
                  type="file"
                  accept=".jpg,.jpeg,.png,.pdf"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0]
                    if (f) handleFile(f)
                    e.target.value = ''
                  }}
                />
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="inline-flex items-center gap-2 rounded-xl border border-line-input bg-surface px-4 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-canvas active:scale-95"
                >
                  <Icon name="add_photo_alternate" size={18} className="text-brand" />
                  Pilih File / Foto
                </button>
              </div>

              {upload === 'progress' && (
                <div className="rounded-xl border border-line bg-surface p-3">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-3 w-40" />
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-skeleton">
                        <div className="h-full w-2/3 animate-pulse rounded-full bg-brand" />
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-brand">67%</span>
                  </div>
                </div>
              )}

              {upload === 'success' && (
                <div className="flex items-center justify-between rounded-xl border border-line bg-surface p-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-canvas text-brand">
                      <Icon name="picture_as_pdf" size={22} />
                    </span>
                    <div className="text-left">
                      <p className="max-w-[190px] truncate text-xs font-semibold text-ink">{fileName}</p>
                      <p className="text-xs text-ink-muted">{fileSize} · Terunggah</p>
                    </div>
                  </div>
                  <span className="flex items-center gap-1 pr-1 text-xs font-semibold text-success">
                    <Icon name="check_circle" size={18} />
                    Siap
                  </span>
                </div>
              )}

              {upload === 'error' && (
                <div className="rounded-xl border border-error/40 bg-error-light p-4">
                  <div className="flex items-start gap-2">
                    <Icon name="error" size={20} className="mt-0.5 shrink-0 text-error" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-ink">File gagal diunggah</p>
                      <p className="mt-0.5 text-xs leading-relaxed text-ink-muted">
                        Format harus JPG, PNG, atau PDF dengan ukuran maksimal 5MB.
                      </p>
                      <div className="mt-3 flex gap-2">
                        <Button size="sm" onClick={() => fileRef.current?.click()}>
                          Coba Lagi
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setUpload('idle')}>
                          Batal
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {(
                [
                  { key: 'od', title: 'OD (Kanan)' },
                  { key: 'os', title: 'OS (Kiri)' },
                ] as const
              ).map((eye) => (
                <div key={eye.key} className="rounded-xl border border-line bg-surface p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-ink">{eye.title}</h3>
                    <span className="text-[11px] text-ink-muted">dalam dioptri (D)</span>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {(
                      [
                        { name: `${eye.key}Sph` as const, label: 'SPH' },
                        { name: `${eye.key}Cyl` as const, label: 'CYL' },
                        { name: `${eye.key}Axis` as const, label: 'AXIS' },
                      ] as const
                    ).map((f) => {
                      const err = touched ? errors[f.name] : null
                      return (
                        <Field
                          key={f.name}
                          label={f.label}
                          error={err ?? undefined}
                          hint={f.name.endsWith('Axis') ? '1–180' : undefined}
                        >
                          <Input
                            value={form[f.name]}
                            inputMode="decimal"
                            placeholder={f.name.endsWith('Axis') ? '180' : '-1.50'}
                            onChange={(e) => setForm((s) => ({ ...s, [f.name]: e.target.value }))}
                            className="h-11 px-3"
                          />
                        </Field>
                      )
                    })}
                  </div>
                </div>
              ))}

              <div className="rounded-xl border border-line bg-surface p-4">
                <h3 className="mb-3 text-sm font-semibold text-ink">Nilai Tambahan</h3>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="ADD (opsional)" error={touched ? errors.add ?? undefined : undefined}>
                    <Input
                      value={form.add}
                      inputMode="decimal"
                      placeholder="1.00"
                      onChange={(e) => setForm((s) => ({ ...s, add: e.target.value }))}
                      className="h-11 px-3"
                    />
                  </Field>
                  <Field label="PD (mm)" error={touched ? errors.pd ?? undefined : undefined}>
                    <Input
                      value={form.pd}
                      inputMode="decimal"
                      placeholder="62"
                      onChange={(e) => setForm((s) => ({ ...s, pd: e.target.value }))}
                      className="h-11 px-3"
                    />
                  </Field>
                </div>
                {touched && !manualValid && (
                  <p className="mt-2 text-xs text-error">
                    Periksa kembali kolom yang ditandai merah sebelum melanjutkan.
                  </p>
                )}
              </div>
            </div>
          )}
        </section>

        {/* Panduan */}
        <div className="rounded-xl border border-line bg-surface p-4">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Icon name="help_center" size={18} className="text-brand" />
              <h3 className="text-sm font-semibold text-ink">Panduan Parameter Resep</h3>
            </div>
            <span className="text-xs text-ink-muted">OD/OS</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[11px] text-ink-muted">
            {PARAM_GUIDE.map(([k, v]) => (
              <div key={k} className="rounded-lg bg-canvas p-2">
                <span className="font-bold text-ink">{k}</span> {v}
              </div>
            ))}
          </div>
        </div>

        {/* Info tambahan (hanya tab upload) */}
        {tab === 'upload' && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-ink">Informasi Tambahan Resep</h3>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-ink">Tanggal Resep</span>
              <div className="relative">
                <Input
                  type="date"
                  defaultValue={new Date().toISOString().slice(0, 10)}
                  className="h-12 pl-10"
                />
                <Icon
                  name="calendar_today"
                  size={20}
                  className="pointer-events-none absolute left-3 top-3.5 text-ink-muted"
                />
              </div>
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-ink">
                Sumber Resep (Opsional)
              </span>
              <div className="relative">
                <select
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  className="h-12 w-full appearance-none rounded-md border border-line-input bg-surface pl-10 pr-8 text-sm text-ink focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                >
                  {SOURCE_OPTIONS.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.label}
                    </option>
                  ))}
                </select>
                <Icon
                  name="local_hospital"
                  size={20}
                  className="pointer-events-none absolute left-3 top-3.5 text-ink-muted"
                />
                <Icon
                  name="expand_more"
                  size={20}
                  className="pointer-events-none absolute right-3 top-3.5 text-ink-muted"
                />
              </div>
            </label>
          </div>
        )}

        {/* Notice */}
        <div className="flex items-start gap-2 rounded-xl border border-line bg-brand-light/50 p-4">
          <Icon name="info" size={20} className="mt-0.5 shrink-0 text-brand" />
          <p className="text-xs leading-relaxed text-ink-muted">
            Pastikan resep yang digunakan masih sesuai dengan kondisi mata Anda (berlaku maksimal
            6–12 bulan). Jika penglihatan terasa ragu atau buram, periksakan mata Anda terlebih
            dahulu.
          </p>
        </div>
      </main>

      <StickyBar className="space-y-2">
        <Button
          fullWidth
          size="lg"
          className="h-[50px] rounded-xl"
          disabled={!canContinue}
          onClick={() => {
            if (tab === 'manual') setTouched(true)
            if (tab === 'manual' && !manualValid) {
              push('Lengkapi nilai resep terlebih dahulu', 'error')
              return
            }
            continueToCart()
          }}
          trailingIcon="arrow_forward"
        >
          Simpan &amp; Lanjutkan
        </Button>
        <p className="text-center text-xs text-ink-muted">
          Belum punya resep?{' '}
          <button
            type="button"
            onClick={() => navigate('/booking')}
            className="font-semibold text-brand underline"
          >
            Booking Pemeriksaan Mata Gratis
          </button>
        </p>
      </StickyBar>

      <BottomNav />
      <ToastHost />
    </>
  )
}
