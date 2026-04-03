import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff, LogIn, ShoppingBag } from "lucide-react";
import toast from "react-hot-toast";
import { loginUser } from "@/services/auth";
import { resetPassword } from "@/services/auth";
import { useAuth } from "@/context/AuthContext";
import Loader from "@/components/Loader";

interface LoginForm {
  email: string;
  password: string;
}

export default function LoginPage() {
  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resetMode, setResetMode] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const navigate = useNavigate();
  const { setUserData } = useAuth();

  const onSubmit = async (data: LoginForm) => {
    setLoading(true);
    try {
      const userData = await loginUser(data.email, data.password);
      setUserData(userData);
      toast.success("Welcome back!");
      navigate(userData.role === "admin" ? "/admin" : "/dashboard");
    } catch (err: any) {
      toast.error(err?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    if (!resetEmail) return toast.error("Enter your email");
    try {
      await resetPassword(resetEmail);
      toast.success("Password reset email sent!");
      setResetMode(false);
    } catch {
      toast.error("Failed to send reset email");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="mb-8 text-center">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="gradient-primary flex h-10 w-10 items-center justify-center rounded-xl">
              <ShoppingBag className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-heading text-2xl font-bold">MobiShop</span>
          </Link>
        </div>

        <div className="rounded-2xl border bg-card p-6 shadow-elevated">
          {resetMode ? (
            <>
              <h2 className="mb-4 font-heading text-lg font-bold">Reset Password</h2>
              <input
                type="email"
                placeholder="Enter your email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                className="mb-4 w-full rounded-xl border bg-background px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
              <button
                onClick={handleReset}
                className="gradient-primary w-full rounded-xl py-3 text-sm font-semibold text-primary-foreground"
              >
                Send Reset Link
              </button>
              <button onClick={() => setResetMode(false)} className="mt-3 w-full text-sm text-muted-foreground hover:text-foreground">
                Back to login
              </button>
            </>
          ) : (
            <>
              <h2 className="mb-1 font-heading text-lg font-bold">Welcome back</h2>
              <p className="mb-6 text-sm text-muted-foreground">Sign in to your account</p>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <input
                    type="email"
                    placeholder="Email"
                    {...register("email", { required: "Email is required" })}
                    className="w-full rounded-xl border bg-background px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                  {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email.message}</p>}
                </div>

                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    {...register("password", { required: "Password is required" })}
                    className="w-full rounded-xl border bg-background px-4 py-3 pr-10 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                  {errors.password && <p className="mt-1 text-xs text-destructive">{errors.password.message}</p>}
                </div>

                <div className="text-right">
                  <button type="button" onClick={() => setResetMode(true)} className="text-xs text-primary hover:underline">
                    Forgot password?
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="gradient-primary flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-primary-foreground transition-all hover:shadow-glow disabled:opacity-50"
                >
                  {loading ? <Loader /> : <><LogIn className="h-4 w-4" /> Sign In</>}
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-muted-foreground">
                Don&apos;t have an account?{" "}
                <Link to="/register" className="font-medium text-primary hover:underline">Sign up</Link>
              </p>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
