import { Link } from "react-router-dom";
import type { Shop } from "@/services/database";
import { motion } from "framer-motion";
import { Store, Star } from "lucide-react";

interface ShopCardProps {
  shop: Shop;
  index?: number;
}

export default function ShopCard({ shop, index = 0 }: ShopCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Link
        to={`/shop/${shop.id}`}
        className="group relative block overflow-hidden rounded-2xl border bg-card transition-all hover:shadow-elevated"
      >
        <div className="relative h-32 w-full overflow-hidden bg-muted">
          {shop.banner ? (
            <img src={shop.banner} alt={shop.name} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
          ) : (
            <div className="gradient-card flex h-full w-full items-center justify-center">
              <Store className="h-10 w-10 text-muted-foreground" />
            </div>
          )}
          {shop.featured && (
            <div className="absolute right-2 top-2 flex items-center gap-1 rounded-full gradient-gold px-2 py-0.5 text-xs font-semibold text-primary-foreground">
              <Star className="h-3 w-3" /> Featured
            </div>
          )}
        </div>
        <div className="flex items-center gap-3 p-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-accent">
            {shop.logo ? (
              <img src={shop.logo} alt="" className="h-full w-full object-cover" />
            ) : (
              <Store className="h-5 w-5 text-primary" />
            )}
          </div>
          <div className="min-w-0">
            <h3 className="truncate font-heading text-sm font-semibold text-foreground">{shop.name}</h3>
            {shop.description && (
              <p className="truncate text-xs text-muted-foreground">{shop.description}</p>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
