import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Package, Plus, Settings, CreditCard, Trash2, Edit3, Upload, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import Loader from "@/components/Loader";
import EmptyState from "@/components/EmptyState";
import ProductCard from "@/components/ProductCard";
import { getProductsByShop, addProduct, updateProduct, deleteProduct, getShop, updateShop, type Product, type Shop } from "@/services/database";
import { uploadImage } from "@/services/cloudinary";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";

interface ProductForm {
  name: string;
  description: string;
  price: number;
  category: string;
}

export default function SellerDashboard() {
  const { userData } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [shop, setShop] = useState<Shop | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"overview" | "products" | "settings" | "payments">("overview");
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const { register, handleSubmit, reset, setValue } = useForm<ProductForm>();

  useEffect(() => {
    if (!userData?.shopId) return;
    async function load() {
      try {
        const [p, s] = await Promise.all([
          getProductsByShop(userData!.shopId),
          getShop(userData!.shopId),
        ]);
        setProducts(p);
        setShop(s);
      } catch {
        toast.error("Failed to load data");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [userData]);

  const onSubmitProduct = async (data: ProductForm) => {
    if (!userData?.shopId) return;
    setUploading(true);
    try {
      let imageUrl = editingProduct?.image || "";
      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
      }

      if (editingProduct) {
        await updateProduct(editingProduct.id, { ...data, price: Number(data.price), image: imageUrl });
        setProducts((prev) => prev.map((p) => (p.id === editingProduct.id ? { ...p, ...data, price: Number(data.price), image: imageUrl } : p)));
        toast.success("Product updated!");
      } else {
        const newProduct = await addProduct(userData.shopId, { ...data, price: Number(data.price), image: imageUrl, shopId: userData.shopId });
        setProducts((prev) => [...prev, newProduct]);
        toast.success("Product added!");
      }
      reset();
      setImageFile(null);
      setEditingProduct(null);
      setShowForm(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to save product");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      toast.success("Product deleted");
    } catch {
      toast.error("Failed to delete");
    }
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setValue("name", product.name);
    setValue("description", product.description);
    setValue("price", product.price);
    setValue("category", product.category);
    setShowForm(true);
  };

  const handleShopUpdate = async (field: string, file: File) => {
    if (!userData?.shopId) return;
    try {
      const url = await uploadImage(file);
      await updateShop(userData.shopId, { [field]: url });
      setShop((prev) => prev ? { ...prev, [field]: url } : prev);
      toast.success(`${field} updated!`);
    } catch {
      toast.error("Upload failed");
    }
  };

  if (loading) return <Loader fullScreen text="Loading dashboard..." />;

  const tabs = [
    { key: "overview", label: "Overview", icon: Package },
    { key: "products", label: "Products", icon: Package },
    { key: "settings", label: "Settings", icon: Settings },
    { key: "payments", label: "Payments", icon: CreditCard },
  ] as const;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="mx-auto max-w-7xl px-4 py-8">
        <h1 className="mb-6 font-heading text-2xl font-bold">Seller Dashboard</h1>

        {/* Tabs */}
        <div className="mb-8 flex gap-2 overflow-x-auto">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all ${
                tab === t.key ? "gradient-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              <t.icon className="h-4 w-4" /> {t.label}
            </button>
          ))}
        </div>

        {/* Overview */}
        {tab === "overview" && (
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border bg-card p-6">
              <p className="text-sm text-muted-foreground">Total Products</p>
              <p className="mt-1 font-heading text-3xl font-bold">{products.length}</p>
            </div>
            <div className="rounded-2xl border bg-card p-6">
              <p className="text-sm text-muted-foreground">Subscription</p>
              <p className="mt-1 font-heading text-lg font-bold capitalize">{userData?.subscription || "N/A"}</p>
            </div>
            <div className="rounded-2xl border bg-card p-6">
              <p className="text-sm text-muted-foreground">Shop Status</p>
              <p className={`mt-1 font-heading text-lg font-bold ${shop?.approved ? "text-primary" : "text-secondary"}`}>
                {shop?.approved ? "Approved" : "Pending"}
              </p>
            </div>
          </div>
        )}

        {/* Products */}
        {tab === "products" && (
          <>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-heading text-lg font-semibold">Your Products</h2>
              <button
                onClick={() => { reset(); setEditingProduct(null); setShowForm(true); }}
                className="gradient-primary flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium text-primary-foreground"
              >
                <Plus className="h-4 w-4" /> Add Product
              </button>
            </div>

            {/* Product Form Modal */}
            {showForm && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6 rounded-2xl border bg-card p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="font-heading font-semibold">{editingProduct ? "Edit Product" : "Add Product"}</h3>
                  <button onClick={() => setShowForm(false)}><X className="h-5 w-5 text-muted-foreground" /></button>
                </div>
                <form onSubmit={handleSubmit(onSubmitProduct)} className="space-y-4">
                  <input {...register("name", { required: true })} placeholder="Product Name" className="w-full rounded-xl border bg-background px-4 py-3 text-sm outline-none focus:border-primary" />
                  <textarea {...register("description")} placeholder="Description" className="w-full rounded-xl border bg-background px-4 py-3 text-sm outline-none focus:border-primary" rows={3} />
                  <div className="grid grid-cols-2 gap-4">
                    <input {...register("price", { required: true })} type="number" step="0.01" placeholder="Price (GHS)" className="w-full rounded-xl border bg-background px-4 py-3 text-sm outline-none focus:border-primary" />
                    <input {...register("category")} placeholder="Category" className="w-full rounded-xl border bg-background px-4 py-3 text-sm outline-none focus:border-primary" />
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="flex cursor-pointer items-center gap-2 rounded-xl border bg-background px-4 py-3 text-sm text-muted-foreground hover:border-primary">
                      <Upload className="h-4 w-4" /> {imageFile ? imageFile.name : "Upload Image"}
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => setImageFile(e.target.files?.[0] || null)} />
                    </label>
                  </div>
                  <button type="submit" disabled={uploading} className="gradient-primary w-full rounded-xl py-3 text-sm font-semibold text-primary-foreground disabled:opacity-50">
                    {uploading ? "Saving..." : editingProduct ? "Update Product" : "Add Product"}
                  </button>
                </form>
              </motion.div>
            )}

            {products.length === 0 ? (
              <EmptyState title="No products yet" description="Add your first product to get started" />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {products.map((p, i) => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    index={i}
                    showActions
                    onEdit={() => handleEditProduct(p)}
                    onDelete={() => handleDelete(p.id)}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {/* Settings */}
        {tab === "settings" && shop && (
          <div className="space-y-6">
            <div className="rounded-2xl border bg-card p-6">
              <h3 className="mb-4 font-heading font-semibold">Shop Settings</h3>
              <div className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm text-muted-foreground">Shop Logo</label>
                  <label className="flex cursor-pointer items-center gap-2 rounded-xl border bg-background px-4 py-3 text-sm hover:border-primary">
                    <Upload className="h-4 w-4" /> Upload Logo
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleShopUpdate("logo", e.target.files[0])} />
                  </label>
                  {shop.logo && <img src={shop.logo} alt="Logo" className="mt-2 h-16 w-16 rounded-xl object-cover" />}
                </div>
                <div>
                  <label className="mb-1 block text-sm text-muted-foreground">Shop Banner</label>
                  <label className="flex cursor-pointer items-center gap-2 rounded-xl border bg-background px-4 py-3 text-sm hover:border-primary">
                    <Upload className="h-4 w-4" /> Upload Banner
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleShopUpdate("banner", e.target.files[0])} />
                  </label>
                  {shop.banner && <img src={shop.banner} alt="Banner" className="mt-2 h-32 w-full rounded-xl object-cover" />}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Payments */}
        {tab === "payments" && (
          <div className="rounded-2xl border bg-card p-6">
            <h3 className="mb-2 font-heading font-semibold">Subscription</h3>
            <p className="text-sm text-muted-foreground">
              Current plan: <span className="font-medium capitalize text-foreground">{userData?.subscription || "None"}</span>
            </p>
            <a href="/pricing" className="mt-4 inline-block gradient-primary rounded-xl px-6 py-2 text-sm font-medium text-primary-foreground">
              Upgrade Plan
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
