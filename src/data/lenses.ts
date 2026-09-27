import type { LensOption } from '../types'

export const lensOptions: LensOption[] = [
  {
    id: 'clear',
    name: 'Single Vision',
    shortName: 'Single Vision',
    description:
      'Untuk kebutuhan rabun jauh (minus) atau rabun dekat (plus) dengan satu titik fokus penglihatan.',
    price: 250_000,
    priceFrom: 250_000,
    recommended: true,
    icon: 'visibility',
  },
  {
    id: 'blue-light',
    name: 'Blue Light Filter',
    shortName: 'Blue Light',
    description:
      'Membantu mengurangi paparan cahaya biru dari laptop, smartphone, dan perangkat digital agar mata tidak cepat lelah.',
    price: 350_000,
    priceFrom: 350_000,
    icon: 'desktop_windows',
  },
  {
    id: 'photochromic',
    name: 'Photochromic',
    shortName: 'Photochromic',
    description:
      'Lensa adaptif pintar yang berubah menjadi lebih gelap secara otomatis ketika terkena sinar matahari luar ruangan.',
    price: 550_000,
    priceFrom: 550_000,
    icon: 'wb_sunny',
  },
  {
    id: 'progressive',
    name: 'Progressive',
    shortName: 'Progressive',
    description:
      'Satu lensa dengan multi-fokus tanpa garis pembatas untuk melihat jarak dekat, menengah, dan jauh sekaligus.',
    price: 850_000,
    priceFrom: 850_000,
    icon: 'layers',
  },
  {
    id: 'office',
    name: 'Office / Anti Fatigue',
    shortName: 'Office',
    description:
      'Lensa khusus kerja dekat dan layar, membantu mata rileks saat menatap monitor berjam-jam.',
    price: 450_000,
    priceFrom: 450_000,
    icon: 'keyboard',
  },
]

export function getLens(id: string | null | undefined): LensOption | undefined {
  if (!id) return undefined
  return lensOptions.find((l) => l.id === id)
}
