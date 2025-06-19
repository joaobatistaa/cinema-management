import { useAuth } from "@/src/contexts/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import CircularProgress from "@mui/material/CircularProgress";

export default function AuthGuard({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (loading) {
      return;
    }

    if (user) {
      if (pathname === "/" || pathname === "/login") {
        router.push("/home");
        return;
      } else {
        if (!checked) {
          setChecked(true);
        }
      }
    } else {
      const publicPaths = ["/", "/login", "/register", "/movies", "/bar"];

      const isPublicPath =
        publicPaths.includes(pathname) ||
        pathname.startsWith("/movies/") ||
        pathname.startsWith("/sessions") ||
        pathname.startsWith("/confirmEmail") ||
        pathname.startsWith("/forgotPassword") ||
        pathname.startsWith("/resetPassword");

      if (isPublicPath) {
        if (!checked) {
          setChecked(true);
        }
      } else {
        router.replace("/");
      }
    }
  }, [user, router, pathname, loading, checked]);

  if (loading || !checked) {
    return (
      <div className="flex flex-1 items-center justify-center h-full w-full">
        <CircularProgress color="error" />
      </div>
    );
  }

  return children;
}
