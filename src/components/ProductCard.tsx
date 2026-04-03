import type { Product } from "@/services/database";
import { motion } from "framer-motion";
import { ImageIcon, Tag } from "lucide-react";

interface ProductCardProps {
  product: Product;
  index?: number;
  onEdit?: () => void;
  onDelete?: () => void;
  showActions?: boolean;
}

export default function ProductCard({ product, index = 0, onEdit, onDelete, showActions }: ProductCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="group overflow-hidden rounded-2xl border bg-card transition-all hover:shadow-elevated"
    >
      <div className="relative aspect-square overflow-hidden bg-muted">
        {product.image ? (
          <img src={product.image} alt={product.name} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <ImageIcon className="h-10 w-10 text-muted-foreground" />
          </div>
        )}
        {product.category && (
          <div className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-background/80 px-2 py-0.5 text-xs font-medium backdrop-blur-sm">
            <Tag className="h-3 w-3" /> {product.category}
          </div>
        )}
      </div>
      <div className="p-3">
        <h3 className="truncate font-heading text-sm font-semibold text-foreground">{product.name}</h3>
        <p className="mt-0.5 text-sm font-bold text-gradient">GHS {product.price.toFixed(2)}</p>
        {product.description && (
          <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{product.description}</p>
        )}
        {showActions && (
          <div className="mt-3 flex gap-2">
            {onEdit && (
              <button onClick={onEdit} className="flex-1 rounded-lg bg-accent px-3 py-1.5 text-xs font-medium text-accent-foreground transition-colors hover:bg-primary hover:text-primary-foreground">
                Edit
              </button>
            )}
            {onDelete && (
              <button onClick={onDelete} className="rounded-lg bg-destructive/10 px-3 py-1.5 text-xs font-medium text-destructive transition-colors hover:bg-destructive hover:text-destructive-foreground">
                Delete
              </button>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
