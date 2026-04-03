import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Store, Package, Users, Search, Sparkles, Rocket } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ShopCard from "@/components/ShopCard";
import Loader from "@/components/Loader";
import EmptyState from "@/components/EmptyState";
import { getAllShops, getStats, getCategories, type Shop } from "@/services/database";

export default function HomePage() {
  const [shops, setShops] = useState<Shop[]>([]);
  const [stats, setStats] = useState({ totalShops: 0, totalProducts: 0, totalUsers: 0 });
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const [s, st, c] = await Promise.all([getAllShops(), getStats(), getCategories()]);
        setShops(s);
        setStats(st);
        setCategories(c);
      } catch {
        // Firebase not configured yet — show empty state
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const featuredShops = shops.filter((s) => s.featured && s.approved);
  const approvedShops = shops.filter((s) => s.approved);
  const filteredShops = approvedShops.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="gradient-hero relative overflow-hidden px-4 py-20 md:py-32">
        <div className="mx-auto max-w-4xl text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary-foreground">
              <Sparkles className="h-4 w-4" /> The Future of Mobile Commerce
            </div>
            <h1 className="font-heading text-4xl font-extrabold leading-tight tracking-tight text-primary-foreground md:text-6xl">
              Build Your Online Shop,{" "}
              <span className="text-gradient-gold">Sell Anywhere</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-primary-foreground/70">
              MobiShop empowers sellers across Ghana to create beautiful online stores, manage products, and accept payments — all from one platform.
            </p>
            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link
                to="/register"
                className="gradient-gold inline-flex items-center gap-2 rounded-2xl px-8 py-3.5 font-heading text-sm font-bold text-primary-foreground shadow-elevated transition-all hover:scale-105"
              >
                Start Selling Free <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/pricing"
                className="inline-flex items-center gap-2 rounded-2xl border border-primary-foreground/20 px-8 py-3.5 text-sm font-medium text-primary-foreground/80 transition-all hover:bg-primary-foreground/10"
              >
                View Pricing
              </Link>
            </div>
          </motion.div>
        </div>
        <div className="pointer-events-none absolute -bottom-20 left-1/2 h-40 w-[600px] -translate-x-1/2 rounded-full bg-primary/20 blur-[100px]" />
      </section>

      {/* Stats */}
      <section className="border-b bg-card px-4 py-12">
        <div className="mx-auto grid max-w-4xl grid-cols-3 gap-6">
          {[
            { icon: Store, label: "Shops", value: stats.totalShops },
            { icon: Package, label: "Products", value: stats.totalProducts },
            { icon: Users, label: "Sellers", value: stats.totalUsers },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="text-center"
            >
              <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-accent">
                <s.icon className="h-6 w-6 text-primary" />
              </div>
              <p className="font-heading text-2xl font-bold text-foreground">{s.value}</p>
              <p className="text-sm text-muted-foreground">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Marketplace */}
      <section className="px-4 py-16">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-heading text-2xl font-bold text-foreground">Marketplace</h2>
              <p className="text-sm text-muted-foreground">Discover shops from sellers across Ghana</p>
            </div>
            <div className="relative max-w-xs">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search shops..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border bg-card py-2.5 pl-10 pr-4 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          {loading ? (
            <Loader text="Loading shops..." />
          ) : filteredShops.length === 0 ? (
            <EmptyState
              title="No shops yet"
              description="Be the first to create a shop on MobiShop!"
              action={
                <Link to="/register" className="gradient-primary rounded-xl px-6 py-2 text-sm font-medium text-primary-foreground">
                  Create Your Shop
                </Link>
              }
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {featuredShops.map((shop, i) => (
                <ShopCard key={shop.id} shop={shop} index={i} />
              ))}
              {filteredShops
                .filter((s) => !s.featured)
                .map((shop, i) => (
                  <ShopCard key={shop.id} shop={shop} index={i + featuredShops.length} />
                ))}
            </div>
          )}
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="border-t bg-card px-4 py-16">
          <div className="mx-auto max-w-7xl">
            <h2 className="mb-8 font-heading text-2xl font-bold text-foreground">Categories</h2>
            <div className="flex flex-wrap gap-3">
              {categories.map((cat) => (
                <span key={cat} className="rounded-full border bg-accent px-4 py-2 text-sm font-medium text-accent-foreground">
                  {cat}
                </span>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="gradient-hero px-4 py-20">
        <div className="mx-auto max-w-3xl text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <Rocket className="mx-auto mb-4 h-10 w-10 text-primary-foreground/80" />
            <h2 className="font-heading text-3xl font-bold text-primary-foreground">
              Ready to Launch Your Shop?
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-primary-foreground/70">
              Join thousands of sellers on MobiShop. Get started with our free 14-day trial — no credit card required.
            </p>
            <Link
              to="/register"
              className="mt-8 inline-flex items-center gap-2 gradient-gold rounded-2xl px-8 py-3.5 font-heading text-sm font-bold text-primary-foreground shadow-elevated transition-all hover:scale-105"
            >
              Get Started Free <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
