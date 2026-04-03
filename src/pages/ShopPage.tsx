import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Store, MessageCircle } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Loader from "@/components/Loader";
import EmptyState from "@/components/EmptyState";
import ProductCard from "@/components/ProductCard";
import { getShop, getProductsByShop, type Shop, type Product } from "@/services/database";

export default function ShopPage() {
  const { shopId } = useParams<{ shopId: string }>();
  const [shop, setShop] = useState<Shop | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!shopId) return;
    async function load() {
      try {
        const [s, p] = await Promise.all([getShop(shopId!), getProductsByShop(shopId!)]);
        setShop(s);
        setProducts(p);
      } catch {
        // handle error
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [shopId]);

  if (loading) return <Loader fullScreen text="Loading shop..." />;

  if (!shop) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <EmptyState title="Shop not found" description="This shop doesn't exist or has been removed." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Banner */}
      <div className="relative h-48 w-full overflow-hidden bg-muted md:h-64">
        {shop.banner ? (
          <img src={shop.banner} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="gradient-hero h-full w-full" />
        )}
      </div>

      <div className="mx-auto max-w-7xl px-4">
        {/* Shop Info */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="-mt-10 mb-8 flex items-end gap-4">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-4 border-background bg-card shadow-elevated">
            {shop.logo ? (
              <img src={shop.logo} alt="" className="h-full w-full object-cover" />
            ) : (
              <Store className="h-8 w-8 text-primary" />
            )}
          </div>
          <div className="pb-1">
            <h1 className="font-heading text-2xl font-bold">{shop.name}</h1>
            {shop.description && <p className="text-sm text-muted-foreground">{shop.description}</p>}
          </div>
          {shop.whatsapp && (
            <a
              href={`https://wa.me/${shop.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-auto flex items-center gap-2 rounded-xl bg-primary/10 px-4 py-2 text-sm font-medium text-primary hover:bg-primary hover:text-primary-foreground"
            >
              <MessageCircle className="h-4 w-4" /> WhatsApp
            </a>
          )}
        </motion.div>

        {/* Products */}
        {products.length === 0 ? (
          <EmptyState title="No products yet" description="This shop hasn't added any products." />
        ) : (
          <div className="grid gap-4 pb-16 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
