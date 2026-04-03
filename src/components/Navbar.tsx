import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { logoutUser } from "@/services/auth";
import { ShoppingBag, Menu, X, LogOut, LayoutDashboard, User } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

export default function Navbar() {
  const { firebaseUser, userData, loading } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logoutUser();
      toast.success("Logged out successfully");
      navigate("/");
    } catch {
      toast.error("Failed to log out");
    }
  };

  const dashboardPath = userData?.role === "admin" ? "/admin" : "/dashboard";

  return (
    <nav className="sticky top-0 z-50 glass-card border-b">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="gradient-primary flex h-9 w-9 items-center justify-center rounded-xl">
            <ShoppingBag className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-heading text-xl font-bold text-foreground">
            Mobi<span className="text-gradient">Shop</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-6 md:flex">
          <Link to="/" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            Home
          </Link>
          <Link to="/pricing" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            Pricing
          </Link>

          {!loading && (
            <>
              {firebaseUser ? (
                <div className="flex items-center gap-3">
                  <Link
                    to={dashboardPath}
                    className="gradient-primary inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium text-primary-foreground transition-all hover:shadow-glow"
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Link
                    to="/login"
                    className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                  >
                    Log in
                  </Link>
                  <Link
                    to="/register"
                    className="gradient-primary inline-flex rounded-xl px-4 py-2 text-sm font-medium text-primary-foreground transition-all hover:shadow-glow"
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden rounded-lg p-2 text-muted-foreground hover:bg-muted"
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t md:hidden"
          >
            <div className="flex flex-col gap-2 p-4">
              <Link to="/" onClick={() => setMenuOpen(false)} className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-muted">Home</Link>
              <Link to="/pricing" onClick={() => setMenuOpen(false)} className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-muted">Pricing</Link>
              {firebaseUser ? (
                <>
                  <Link to={dashboardPath} onClick={() => setMenuOpen(false)} className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-muted flex items-center gap-2">
                    <LayoutDashboard className="h-4 w-4" /> Dashboard
                  </Link>
                  <button onClick={() => { handleLogout(); setMenuOpen(false); }} className="rounded-lg px-3 py-2 text-left text-sm font-medium text-destructive hover:bg-muted flex items-center gap-2">
                    <LogOut className="h-4 w-4" /> Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setMenuOpen(false)} className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-muted flex items-center gap-2">
                    <User className="h-4 w-4" /> Log in
                  </Link>
                  <Link to="/register" onClick={() => setMenuOpen(false)} className="gradient-primary rounded-xl px-3 py-2 text-center text-sm font-medium text-primary-foreground">
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
