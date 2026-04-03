import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Check, Sparkles, Briefcase, Rocket, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Loader from "@/components/Loader";
import EmptyState from "@/components/EmptyState";
import { getSubscriptionPackages, type SubscriptionPackage } from "@/services/database";
import { useAuth } from "@/context/AuthContext";
import { initializePaystack } from "@/services/paystack";
import { savePayment, updateUser } from "@/services/database";
import toast from "react-hot-toast";

const iconMap: Record<string, React.ReactNode> = {
  free: <Sparkles className="h-6 w-6" />,
  starter: <Briefcase className="h-6 w-6" />,
  pro: <Rocket className="h-6 w-6" />,
};

const fallbackPackages: SubscriptionPackage[] = [
  { id: "free_trial", name: "Free Trial", price: 0, currency: "GHS", productLimit: 25, icon: "free", features: ["Up to 25 products", "Basic shop page", "14-day trial"] },
  { id: "starter", name: "Starter", price: 10, currency: "GHS", productLimit: 200, icon: "starter", features: ["Up to 200 products", "Shop customization", "Basic analytics"], popular: true },
  { id: "pro", name: "Pro", price: 30, currency: "GHS", productLimit: null, icon: "pro", features: ["Unlimited products", "Advanced analytics", "Featured placement", "Priority support"] },
];

export default function PricingPage() {
  const [packages, setPackages] = useState<SubscriptionPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState<string | null>(null);
  const { firebaseUser, userData } = useAuth();

  useEffect(() => {
    async function load() {
      try {
        const pkgs = await getSubscriptionPackages();
        setPackages(pkgs.length > 0 ? pkgs : fallbackPackages);
      } catch {
        setPackages(fallbackPackages);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleSubscribe = (pkg: SubscriptionPackage) => {
    if (!firebaseUser || !userData) {
      toast.error("Please log in first");
      return;
    }
    if (pkg.price === 0) {
      toast.success("You're on the free trial!");
      return;
    }

    setPaying(pkg.id);
    try {
      initializePaystack({
        email: firebaseUser.email!,
        amount: pkg.price * 100,
        plan: pkg.id,
        onSuccess: async (reference) => {
          await savePayment({
            userId: userData.id,
            reference,
            amount: pkg.price,
            plan: pkg.id,
            status: "success",
          });
          await updateUser(userData.id, { subscription: pkg.id });
          toast.success(`Subscribed to ${pkg.name}!`);
          setPaying(null);
        },
        onClose: () => {
          toast.error("Payment cancelled");
          setPaying(null);
        },
      });
    } catch (err: any) {
      toast.error(err.message || "Payment failed");
      setPaying(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="px-4 py-16">
        <div className="mx-auto max-w-5xl">
          <div className="mb-12 text-center">
            <h1 className="font-heading text-3xl font-extrabold md:text-4xl">
              Simple, Transparent <span className="text-gradient">Pricing</span>
            </h1>
            <p className="mt-3 text-muted-foreground">Choose the plan that fits your business</p>
          </div>

          {loading ? (
            <Loader text="Loading plans..." />
          ) : packages.length === 0 ? (
            <EmptyState title="No plans available" description="Check back soon." />
          ) : (
            <div className="grid gap-6 md:grid-cols-3">
              {packages.map((pkg, i) => (
                <motion.div
                  key={pkg.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={`relative overflow-hidden rounded-2xl border bg-card p-6 transition-all hover:shadow-elevated ${
                    pkg.popular ? "border-primary shadow-glow" : ""
                  }`}
                >
                  {pkg.popular && (
                    <div className="absolute right-4 top-4 rounded-full gradient-primary px-3 py-1 text-xs font-bold text-primary-foreground">
                      Popular
                    </div>
                  )}
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-accent text-primary">
                    {iconMap[pkg.icon] || <Sparkles className="h-6 w-6" />}
                  </div>
                  <h3 className="font-heading text-lg font-bold">{pkg.name}</h3>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="font-heading text-3xl font-extrabold">
                      {pkg.price === 0 ? "Free" : `GHS ${pkg.price}`}
                    </span>
                    {pkg.price > 0 && <span className="text-sm text-muted-foreground">/month</span>}
                  </div>
                  <ul className="mt-6 space-y-3">
                    {pkg.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Check className="h-4 w-4 shrink-0 text-primary" /> {f}
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => handleSubscribe(pkg)}
                    disabled={paying === pkg.id}
                    className={`mt-6 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition-all ${
                      pkg.popular
                        ? "gradient-primary text-primary-foreground hover:shadow-glow"
                        : "border bg-accent text-accent-foreground hover:bg-primary hover:text-primary-foreground"
                    } disabled:opacity-50`}
                  >
                    {paying === pkg.id ? "Processing..." : <>Get Started <ArrowRight className="h-4 w-4" /></>}
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
      <Footer />
    </div>
  );
}
