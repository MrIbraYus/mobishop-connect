import { ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="border-t bg-card">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="flex flex-col items-center gap-4 text-center">
          <Link to="/" className="flex items-center gap-2">
            <div className="gradient-primary flex h-8 w-8 items-center justify-center rounded-lg">
              <ShoppingBag className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-heading text-lg font-bold">MobiShop</span>
          </Link>
          <p className="max-w-md text-sm text-muted-foreground">
            The modern marketplace for mobile commerce. Start selling today and grow your business.
          </p>
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} MobiShop. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
