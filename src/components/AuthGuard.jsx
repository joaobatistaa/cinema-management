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
    console.log("[AuthGuard] Effect triggered");
    console.log("user:", user);
    console.log("loading:", loading);
    console.log("pathname:", pathname);
    console.log("checked:", checked);

    if (loading) {
      console.log("[AuthGuard] Loading is true, waiting...");
      return;
    }

    if (user) {
      if (pathname === "/" || pathname === "/login") {
        console.log(
          "[AuthGuard] User logged in but on public page, redirecting to /home"
        );
        router.push("/home");
        return;
      } else {
        if (!checked) {
          console.log(
            "[AuthGuard] User logged in and on protected page, setting checked true"
          );
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
          console.log(
            "[AuthGuard] User not logged in but on public path, setting checked true"
          );
          setChecked(true);
        }
      } else {
        console.log(
          "[AuthGuard] User not logged in and on protected page, redirecting to /"
        );
        router.replace("/");
      }
    }
  }, [user, router, pathname, loading, checked]);

  if (loading || !checked) {
    console.log("[AuthGuard] Showing loader");
    return (
      <div className="flex flex-1 items-center justify-center h-full w-full">
        <CircularProgress color="error" />
      </div>
    );
  }

  console.log("[AuthGuard] Rendering children");
  return children;
}
