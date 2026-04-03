import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import Loader from "@/components/Loader";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: "admin" | "seller";
}

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { firebaseUser, userData, loading } = useAuth();

  if (loading) return <Loader fullScreen text="Authenticating..." />;

  if (!firebaseUser) return <Navigate to="/login" replace />;

  if (requiredRole && userData?.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
