import { FormEvent, useMemo, useState } from 'react';
import { Camera, DollarSign, ImagePlus, ShieldCheck, ShoppingBag, Store, Upload } from 'lucide-react';

type Listing = {
  id: number;
  title: string;
  category: string;
  price: number;
  license: string;
  image: string;
  status: 'Live' | 'Draft';
  sales: number;
};

const starterListings: Listing[] = [
  {
    id: 1,
    title: 'Golden Desert Dawn',
    price: 45,
    category: 'Landscape',
    license: 'Commercial license',
    image:
      'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=80',
    status: 'Live',
    sales: 18,
  },
  {
    id: 2,
    title: 'City Rain Reflection',
    price: 60,
    category: 'Street',
    license: 'Editorial use',
    image:
      'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=1200&q=80',
    status: 'Live',
    sales: 12,
  },
  {
    id: 3,
    title: 'Vintage Portrait Light',
    price: 55,
    category: 'Portrait',
    license: 'Commercial license',
    image:
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1200&q=80',
    status: 'Draft',
    sales: 0,
  },
];

export default function App() {
  const [listings, setListings] = useState<Listing[]>(starterListings);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Landscape');
  const [price, setPrice] = useState('39');
  const [license, setLicense] = useState('Commercial license');
  const [image, setImage] = useState('');
  const [search, setSearch] = useState('');

  const metrics = useMemo(() => {
    const photosListed = listings.length;
    const totalSales = listings.reduce((sum, listing) => sum + listing.sales, 0);
    const revenue = listings.reduce((sum, listing) => sum + listing.sales * listing.price, 0);
    const liveCount = listings.filter((listing) => listing.status === 'Live').length;

    return { photosListed, totalSales, revenue, liveCount };
  }, [listings]);

  const filteredListings = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) {
      return listings;
    }

    return listings.filter(
      (listing) =>
        listing.title.toLowerCase().includes(query) ||
        listing.category.toLowerCase().includes(query) ||
        listing.license.toLowerCase().includes(query),
    );
  }, [listings, search]);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!title.trim() || !price || Number(price) <= 0) {
      return;
    }

    const defaultImage =
      'https://images.unsplash.com/photo-1474302770737-173ee21bab63?auto=format&fit=crop&w=1200&q=80';

    const newListing: Listing = {
      id: Date.now(),
      title: title.trim(),
      category,
      price: Number(price),
      license,
      image: image.trim() || defaultImage,
      status: 'Live',
      sales: 0,
    };

    setListings((previous) => [newListing, ...previous]);
    setTitle('');
    setCategory('Landscape');
    setPrice('39');
    setLicense('Commercial license');
    setImage('');
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <header className="border-b border-zinc-800/80 bg-zinc-950/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2 text-lg font-semibold tracking-tight">
            <Camera className="h-5 w-5 text-amber-400" />
            SnapMarket
          </div>
          <button className="rounded-lg border border-zinc-700 px-4 py-2 text-sm font-semibold hover:border-zinc-500">
            Creator dashboard
          </button>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-10 px-6 py-10 lg:grid-cols-[380px_1fr]">
        <section className="h-fit rounded-3xl border border-zinc-800 bg-zinc-900/40 p-6">
          <p className="mb-2 inline-flex items-center gap-2 rounded-full border border-zinc-700 px-3 py-1 text-xs uppercase tracking-widest text-zinc-300">
            <Store className="h-3.5 w-3.5 text-amber-400" />
            Sell your photos
          </p>
          <h1 className="text-2xl font-bold">Create a new listing</h1>
          <p className="mt-2 text-sm text-zinc-400">
            Post your photo, set a price, and publish instantly so buyers can purchase digital downloads.
          </p>

          <form className="mt-6 space-y-4" onSubmit={onSubmit}>
            <label className="block text-sm">
              <span className="mb-1.5 block text-zinc-300">Photo title</span>
              <input
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm outline-none ring-amber-400 placeholder:text-zinc-500 focus:ring-2"
                placeholder="e.g. Snowy mountain sunrise"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
              />
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="block text-sm">
                <span className="mb-1.5 block text-zinc-300">Category</span>
                <select
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-400"
                  value={category}
                  onChange={(event) => setCategory(event.target.value)}
                >
                  <option>Landscape</option>
                  <option>Street</option>
                  <option>Portrait</option>
                  <option>Nature</option>
                  <option>Travel</option>
                </select>
              </label>

              <label className="block text-sm">
                <span className="mb-1.5 block text-zinc-300">Price (USD)</span>
                <input
                  type="number"
                  min="1"
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-400"
                  value={price}
                  onChange={(event) => setPrice(event.target.value)}
                />
              </label>
            </div>

            <label className="block text-sm">
              <span className="mb-1.5 block text-zinc-300">License</span>
              <select
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-400"
                value={license}
                onChange={(event) => setLicense(event.target.value)}
              >
                <option>Commercial license</option>
                <option>Editorial use</option>
                <option>Personal use</option>
              </select>
            </label>

            <label className="block text-sm">
              <span className="mb-1.5 block text-zinc-300">Image URL (optional)</span>
              <input
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm outline-none ring-amber-400 placeholder:text-zinc-500 focus:ring-2"
                placeholder="https://..."
                value={image}
                onChange={(event) => setImage(event.target.value)}
              />
            </label>

            <button
              type="submit"
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-amber-400 px-4 py-2.5 text-sm font-semibold text-zinc-900 hover:bg-amber-300"
            >
              <Upload className="h-4 w-4" /> Publish listing
            </button>
          </form>
        </section>

        <section className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <article className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4">
              <p className="text-xs uppercase tracking-wide text-zinc-400">Photos listed</p>
              <p className="mt-2 text-2xl font-bold">{metrics.photosListed}</p>
            </article>
            <article className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4">
              <p className="text-xs uppercase tracking-wide text-zinc-400">Live listings</p>
              <p className="mt-2 text-2xl font-bold">{metrics.liveCount}</p>
            </article>
            <article className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4">
              <p className="text-xs uppercase tracking-wide text-zinc-400">Total sales</p>
              <p className="mt-2 flex items-center gap-1 text-2xl font-bold">
                <ShoppingBag className="h-4 w-4 text-amber-400" />
                {metrics.totalSales}
              </p>
            </article>
            <article className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4">
              <p className="text-xs uppercase tracking-wide text-zinc-400">Revenue</p>
              <p className="mt-2 flex items-center gap-1 text-2xl font-bold">
                <DollarSign className="h-4 w-4 text-amber-400" />
                {metrics.revenue.toLocaleString()}
              </p>
            </article>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-xl font-semibold">Marketplace listings</h2>
              <input
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm outline-none ring-amber-400 placeholder:text-zinc-500 focus:ring-2 sm:w-64"
                placeholder="Search title, category, license"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {filteredListings.map((listing) => (
                <article key={listing.id} className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950/60">
                  <img src={listing.image} alt={listing.title} className="h-44 w-full object-cover" loading="lazy" />
                  <div className="space-y-3 p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-semibold">{listing.title}</h3>
                        <p className="text-xs text-zinc-400">{listing.category}</p>
                      </div>
                      <span className="rounded-full border border-zinc-700 px-2 py-0.5 text-[11px] text-zinc-300">
                        {listing.status}
                      </span>
                    </div>
                    <p className="text-sm text-zinc-400">{listing.license}</p>
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-semibold text-amber-400">${listing.price}</span>
                      <span className="text-zinc-400">{listing.sales} sales</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {filteredListings.length === 0 ? (
              <p className="mt-5 rounded-lg border border-dashed border-zinc-700 p-5 text-sm text-zinc-400">
                No listings matched your search.
              </p>
            ) : null}
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 text-sm text-zinc-300">
            <p className="mb-2 inline-flex items-center gap-2 font-semibold">
              <ImagePlus className="h-4 w-4 text-amber-400" /> Tips for higher conversions
            </p>
            <ul className="list-inside list-disc space-y-1 text-zinc-400">
              <li>Use descriptive titles with location or mood keywords.</li>
              <li>Keep preview images bright, sharp, and watermark-free.</li>
              <li>Offer both commercial and editorial licenses for flexibility.</li>
            </ul>
          </div>
        </section>
      </main>

      <footer className="border-t border-zinc-800">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-6 py-6 text-sm text-zinc-400 md:flex-row md:items-center md:justify-between">
          <p>© 2026 SnapMarket. Built for photographers.</p>
          <p className="flex items-center gap-1">
            <ShieldCheck className="h-4 w-4 text-emerald-400" /> Secure checkout & protected downloads
          </p>
        </div>
      </footer>
    </div>
  );
}
