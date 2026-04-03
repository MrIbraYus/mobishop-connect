import { ref, get, set, update, remove, push, query, orderByChild, equalTo } from "firebase/database";
import { database } from "./firebase";

// ---- Products ----
export interface Product {
  id: string;
  shopId: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  createdAt: number;
}

export async function addProduct(shopId: string, product: Omit<Product, "id" | "createdAt">) {
  const newRef = push(ref(database, `products`));
  const data = { ...product, id: newRef.key!, shopId, createdAt: Date.now() };
  await set(newRef, data);
  return data;
}

export async function updateProduct(productId: string, updates: Partial<Product>) {
  await update(ref(database, `products/${productId}`), updates);
}

export async function deleteProduct(productId: string) {
  await remove(ref(database, `products/${productId}`));
}

export async function getProductsByShop(shopId: string): Promise<Product[]> {
  const snapshot = await get(query(ref(database, "products"), orderByChild("shopId"), equalTo(shopId)));
  if (!snapshot.exists()) return [];
  return Object.values(snapshot.val()) as Product[];
}

export async function getAllProducts(): Promise<Product[]> {
  const snapshot = await get(ref(database, "products"));
  if (!snapshot.exists()) return [];
  return Object.values(snapshot.val()) as Product[];
}

// ---- Shops ----
export interface Shop {
  id: string;
  ownerId: string;
  name: string;
  logo: string;
  banner: string;
  description: string;
  featured: boolean;
  approved: boolean;
  createdAt: number;
  whatsapp?: string;
}

export async function getShop(shopId: string): Promise<Shop | null> {
  const snapshot = await get(ref(database, `shops/${shopId}`));
  return snapshot.exists() ? (snapshot.val() as Shop) : null;
}

export async function getAllShops(): Promise<Shop[]> {
  const snapshot = await get(ref(database, "shops"));
  if (!snapshot.exists()) return [];
  return Object.values(snapshot.val()) as Shop[];
}

export async function updateShop(shopId: string, updates: Partial<Shop>) {
  await update(ref(database, `shops/${shopId}`), updates);
}

export async function approveShop(shopId: string) {
  await update(ref(database, `shops/${shopId}`), { approved: true });
}

export async function featureShop(shopId: string, featured: boolean) {
  await update(ref(database, `shops/${shopId}`), { featured });
}

// ---- Users (Admin) ----
export async function getAllUsers() {
  const snapshot = await get(ref(database, "users"));
  if (!snapshot.exists()) return [];
  return Object.values(snapshot.val());
}

export async function updateUser(uid: string, updates: Record<string, unknown>) {
  await update(ref(database, `users/${uid}`), updates);
}

// ---- Payments ----
export interface Payment {
  id: string;
  userId: string;
  reference: string;
  amount: number;
  plan: string;
  status: string;
  createdAt: number;
}

export async function savePayment(payment: Omit<Payment, "id" | "createdAt">) {
  const newRef = push(ref(database, "payments"));
  const data = { ...payment, id: newRef.key!, createdAt: Date.now() };
  await set(newRef, data);
  return data;
}

export async function getAllPayments(): Promise<Payment[]> {
  const snapshot = await get(ref(database, "payments"));
  if (!snapshot.exists()) return [];
  return Object.values(snapshot.val()) as Payment[];
}

// ---- Subscription Packages ----
export interface SubscriptionPackage {
  id: string;
  name: string;
  price: number;
  currency: string;
  productLimit: number | null;
  features: string[];
  icon: string;
  popular?: boolean;
}

export async function getSubscriptionPackages(): Promise<SubscriptionPackage[]> {
  const snapshot = await get(ref(database, "subscriptionPackages"));
  if (!snapshot.exists()) return [];
  return Object.values(snapshot.val()) as SubscriptionPackage[];
}

// ---- Stats ----
export async function getStats() {
  const [shops, products, users] = await Promise.all([
    get(ref(database, "shops")),
    get(ref(database, "products")),
    get(ref(database, "users")),
  ]);
  return {
    totalShops: shops.exists() ? Object.keys(shops.val()).length : 0,
    totalProducts: products.exists() ? Object.keys(products.val()).length : 0,
    totalUsers: users.exists() ? Object.keys(users.val()).length : 0,
  };
}

// ---- Categories ----
export async function getCategories(): Promise<string[]> {
  const products = await getAllProducts();
  const categories = [...new Set(products.map((p) => p.category).filter(Boolean))];
  return categories;
}
