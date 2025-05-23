import { useAuth } from "@/src/contexts/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import CircularProgress from "@mui/material/CircularProgress";

export default function AuthGuard({ children }) {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (user && (pathname === "/" || pathname === "/login")) {
      router.replace("/home");
      return;
    }

    if (
      pathname === "/" ||
      pathname === "/login" ||
      pathname === "/register" ||
      pathname === "/movies"
    ) {
      setChecked(true);
      return;
    }

    if (!user) {
      router.replace("/");
    } else {
      setChecked(true);
    }
  }, [user, router, pathname]);

  if (user === undefined || !checked) {
    return (
      <div className="flex flex-1 items-center justify-center h-full w-full">
        <CircularProgress color="error" />
      </div>
    );
  }

  return children;
}
