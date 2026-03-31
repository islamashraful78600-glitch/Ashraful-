import { Camera, DollarSign, ImagePlus, ShieldCheck, ShoppingBag, Star, Store } from 'lucide-react';

const featuredPhotos = [
  { title: 'Golden Desert Dawn', price: '$45', category: 'Landscape' },
  { title: 'City Rain Reflection', price: '$60', category: 'Street' },
  { title: 'Arctic Horizon', price: '$80', category: 'Nature' },
  { title: 'Vintage Portrait Light', price: '$55', category: 'Portrait' },
  { title: 'Neon Night Drive', price: '$70', category: 'Automotive' },
  { title: 'Waves and Cliffs', price: '$50', category: 'Seascape' },
];

const steps = [
  {
    icon: ImagePlus,
    title: 'Upload your photos',
    description: 'Drag and drop your high-resolution images and organize them in collections.',
  },
  {
    icon: DollarSign,
    title: 'Set your prices',
    description: 'Choose one-time purchase pricing and licensing notes for each photo.',
  },
  {
    icon: ShoppingBag,
    title: 'Start selling',
    description: 'Buyers browse your catalog, purchase instantly, and download securely.',
  },
];

export default function App() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <header className="border-b border-zinc-800/80 bg-zinc-950/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2 text-lg font-semibold tracking-tight">
            <Camera className="h-5 w-5 text-amber-400" />
            SnapMarket
          </div>
          <button className="rounded-lg bg-amber-400 px-4 py-2 text-sm font-semibold text-zinc-900 hover:bg-amber-300">
            Start selling
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-12">
        <section className="mb-16 grid gap-8 rounded-3xl border border-zinc-800 bg-gradient-to-br from-zinc-900 to-zinc-950 p-8 md:grid-cols-2 md:p-12">
          <div className="space-y-5">
            <p className="inline-flex items-center gap-2 rounded-full border border-zinc-700 px-3 py-1 text-xs uppercase tracking-widest text-zinc-300">
              <Store className="h-3.5 w-3.5 text-amber-400" />
              Photo selling website
            </p>
            <h1 className="text-4xl font-bold leading-tight md:text-5xl">
              Sell your photos online with a clean, modern storefront.
            </h1>
            <p className="max-w-xl text-zinc-400">
              Upload your best shots, set your own price, and let customers buy digital downloads in minutes.
            </p>
            <div className="flex flex-wrap gap-3">
              <button className="rounded-lg bg-amber-400 px-5 py-3 text-sm font-semibold text-zinc-900 hover:bg-amber-300">
                Upload first photo
              </button>
              <button className="rounded-lg border border-zinc-700 px-5 py-3 text-sm font-semibold hover:border-zinc-500">
                View storefront
              </button>
            </div>
          </div>
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
            <p className="mb-4 text-sm font-medium text-zinc-300">Store performance</p>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl bg-zinc-800/60 p-4">
                <p className="text-xs uppercase tracking-wide text-zinc-400">Photos listed</p>
                <p className="mt-2 text-2xl font-bold">124</p>
              </div>
              <div className="rounded-xl bg-zinc-800/60 p-4">
                <p className="text-xs uppercase tracking-wide text-zinc-400">Sales</p>
                <p className="mt-2 text-2xl font-bold">342</p>
              </div>
              <div className="rounded-xl bg-zinc-800/60 p-4">
                <p className="text-xs uppercase tracking-wide text-zinc-400">Revenue</p>
                <p className="mt-2 text-2xl font-bold">$9,820</p>
              </div>
              <div className="rounded-xl bg-zinc-800/60 p-4">
                <p className="text-xs uppercase tracking-wide text-zinc-400">Rating</p>
                <p className="mt-2 flex items-center gap-1 text-2xl font-bold">
                  4.9 <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-16">
          <h2 className="mb-6 text-2xl font-semibold">How it works</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {steps.map(({ icon: Icon, title, description }) => (
              <article key={title} className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
                <Icon className="mb-4 h-6 w-6 text-amber-400" />
                <h3 className="mb-2 text-lg font-semibold">{title}</h3>
                <p className="text-sm text-zinc-400">{description}</p>
              </article>
            ))}
          </div>
        </section>

        <section>
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Featured photos for sale</h2>
            <button className="text-sm font-medium text-amber-400 hover:text-amber-300">Browse all</button>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featuredPhotos.map((photo, index) => (
              <article key={photo.title} className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/40">
                <div className="aspect-[4/3] bg-gradient-to-br from-zinc-700 via-zinc-800 to-zinc-900 p-4">
                  <div className="flex h-full items-end justify-between rounded-xl border border-zinc-700/70 p-3">
                    <span className="text-xs uppercase tracking-wider text-zinc-300">Sample #{index + 1}</span>
                    <span className="rounded-full border border-zinc-500 px-2 py-1 text-[10px] uppercase tracking-wide text-zinc-300">
                      {photo.category}
                    </span>
                  </div>
                </div>
                <div className="space-y-3 p-4">
                  <h3 className="font-semibold">{photo.title}</h3>
                  <div className="flex items-center justify-between">
                    <span className="text-amber-400">{photo.price}</span>
                    <button className="rounded-md border border-zinc-700 px-3 py-1.5 text-xs font-semibold hover:border-zinc-500">
                      Buy now
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>

      <footer className="mt-14 border-t border-zinc-800">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-6 py-8 text-sm text-zinc-400 md:flex-row md:items-center md:justify-between">
          <p>© 2026 SnapMarket. Built for photographers.</p>
          <p className="flex items-center gap-1">
            <ShieldCheck className="h-4 w-4 text-emerald-400" /> Secure checkout & protected downloads
          </p>
        </div>
      </footer>
    </div>
  );
}
