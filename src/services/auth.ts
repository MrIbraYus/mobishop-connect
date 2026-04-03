import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendEmailVerification,
  sendPasswordResetEmail,
  updateProfile,
  type User,
} from "firebase/auth";
import { ref, set, get } from "firebase/database";
import { auth, database } from "./firebase";

export interface UserData {
  id: string;
  name: string;
  email: string;
  role: "admin" | "seller";
  subscription: string;
  shopId: string;
  createdAt: number;
}

const ADMIN_SECRET_CODE = "MOBISHOP_ADMIN_2024";

export async function registerUser(
  name: string,
  email: string,
  password: string,
  adminCode?: string
) {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  const user = credential.user;

  await updateProfile(user, { displayName: name });
  await sendEmailVerification(user);

  const role = adminCode === ADMIN_SECRET_CODE ? "admin" : "seller";
  const shopId = role === "seller" ? `shop_${user.uid}` : "";

  const userData: UserData = {
    id: user.uid,
    name,
    email,
    role,
    subscription: role === "seller" ? "free_trial" : "",
    shopId,
    createdAt: Date.now(),
  };

  await set(ref(database, `users/${user.uid}`), userData);

  if (role === "seller") {
    await set(ref(database, `shops/${shopId}`), {
      id: shopId,
      ownerId: user.uid,
      name: `${name}'s Shop`,
      logo: "",
      banner: "",
      description: "",
      featured: false,
      approved: false,
      createdAt: Date.now(),
    });
  }

  return userData;
}

export async function loginUser(email: string, password: string) {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  const snapshot = await get(ref(database, `users/${credential.user.uid}`));
  return snapshot.val() as UserData;
}

export async function logoutUser() {
  await signOut(auth);
}

export async function resetPassword(email: string) {
  await sendPasswordResetEmail(auth, email);
}

export async function getUserData(uid: string): Promise<UserData | null> {
  const snapshot = await get(ref(database, `users/${uid}`));
  return snapshot.exists() ? (snapshot.val() as UserData) : null;
}
