import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Users, Store, CreditCard, BarChart3, CheckCircle, XCircle, Star, StarOff } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import Loader from "@/components/Loader";
import EmptyState from "@/components/EmptyState";
import { getAllUsers, getAllShops, getAllPayments, approveShop, featureShop, updateUser, type Shop, type Payment } from "@/services/database";
import { type UserData } from "@/services/auth";
import toast from "react-hot-toast";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

export default function AdminDashboard() {
  const { userData } = useAuth();
  const [users, setUsers] = useState<UserData[]>([]);
  const [shops, setShops] = useState<Shop[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"users" | "shops" | "payments" | "analytics">("users");

  useEffect(() => {
    async function load() {
      try {
        const [u, s, p] = await Promise.all([getAllUsers(), getAllShops(), getAllPayments()]);
        setUsers(u as UserData[]);
        setShops(s);
        setPayments(p);
      } catch {
        toast.error("Failed to load data");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleApprove = async (shopId: string) => {
    await approveShop(shopId);
    setShops((prev) => prev.map((s) => (s.id === shopId ? { ...s, approved: true } : s)));
    toast.success("Shop approved");
  };

  const handleFeature = async (shopId: string, featured: boolean) => {
    await featureShop(shopId, featured);
    setShops((prev) => prev.map((s) => (s.id === shopId ? { ...s, featured } : s)));
    toast.success(featured ? "Shop featured" : "Shop unfeatured");
  };

  if (loading) return <Loader fullScreen text="Loading admin panel..." />;

  const tabs = [
    { key: "users", label: "Users", icon: Users },
    { key: "shops", label: "Shops", icon: Store },
    { key: "payments", label: "Payments", icon: CreditCard },
    { key: "analytics", label: "Analytics", icon: BarChart3 },
  ] as const;

  const COLORS = ["hsl(160,84%,39%)", "hsl(40,96%,53%)", "hsl(200,70%,50%)", "hsl(0,84%,60%)"];

  const roleData = [
    { name: "Sellers", value: users.filter((u) => u.role === "seller").length },
    { name: "Admins", value: users.filter((u) => u.role === "admin").length },
  ];

  const paymentData = payments.reduce<Record<string, number>>((acc, p) => {
    acc[p.plan] = (acc[p.plan] || 0) + p.amount;
    return acc;
  }, {});
  const chartData = Object.entries(paymentData).map(([plan, amount]) => ({ plan, amount }));

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="mx-auto max-w-7xl px-4 py-8">
        <h1 className="mb-6 font-heading text-2xl font-bold">Admin Dashboard</h1>

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

        {/* Users */}
        {tab === "users" && (
          users.length === 0 ? (
            <EmptyState title="No users yet" />
          ) : (
            <div className="overflow-x-auto rounded-2xl border bg-card">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Name</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Email</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Role</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Subscription</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className="border-b last:border-0">
                      <td className="px-4 py-3 font-medium">{u.name}</td>
                      <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
                      <td className="px-4 py-3"><span className="rounded-full bg-accent px-2 py-0.5 text-xs font-medium capitalize">{u.role}</span></td>
                      <td className="px-4 py-3 capitalize">{u.subscription || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}

        {/* Shops */}
        {tab === "shops" && (
          shops.length === 0 ? (
            <EmptyState title="No shops yet" />
          ) : (
            <div className="space-y-3">
              {shops.map((shop) => (
                <div key={shop.id} className="flex items-center justify-between rounded-2xl border bg-card p-4">
                  <div className="flex items-center gap-3">
                    {shop.logo ? (
                      <img src={shop.logo} alt="" className="h-10 w-10 rounded-xl object-cover" />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent"><Store className="h-5 w-5 text-primary" /></div>
                    )}
                    <div>
                      <p className="font-medium">{shop.name}</p>
                      <p className="text-xs text-muted-foreground">{shop.approved ? "Approved" : "Pending"}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {!shop.approved && (
                      <button onClick={() => handleApprove(shop.id)} className="rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary hover:text-primary-foreground">
                        <CheckCircle className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      onClick={() => handleFeature(shop.id, !shop.featured)}
                      className={`rounded-lg px-3 py-1.5 text-xs font-medium ${shop.featured ? "bg-secondary/20 text-secondary" : "bg-muted text-muted-foreground"}`}
                    >
                      {shop.featured ? <StarOff className="h-4 w-4" /> : <Star className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {/* Payments */}
        {tab === "payments" && (
          payments.length === 0 ? (
            <EmptyState title="No payments yet" />
          ) : (
            <div className="overflow-x-auto rounded-2xl border bg-card">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Reference</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Amount</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Plan</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((p) => (
                    <tr key={p.id} className="border-b last:border-0">
                      <td className="px-4 py-3 font-mono text-xs">{p.reference}</td>
                      <td className="px-4 py-3 font-medium">GHS {p.amount}</td>
                      <td className="px-4 py-3 capitalize">{p.plan}</td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${p.status === "success" ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive"}`}>
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}

        {/* Analytics */}
        {tab === "analytics" && (
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl border bg-card p-6">
              <h3 className="mb-4 font-heading font-semibold">Revenue by Plan</h3>
              {chartData.length === 0 ? (
                <EmptyState title="No data" />
              ) : (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="plan" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="amount" fill="hsl(160,84%,39%)" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
            <div className="rounded-2xl border bg-card p-6">
              <h3 className="mb-4 font-heading font-semibold">User Roles</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={roleData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label>
                    {roleData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
