import { Poppins } from "next/font/google";
import "./globals.css";

import AppLayout from "./components/layouts/AppLayout";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/src/contexts/AuthContext";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"]
});

export const metadata = {
  title: "Cinema Management",
  description: ""
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={poppins.variable}>
        <AuthProvider>
          <AppLayout>{children}</AppLayout>
          <Toaster
            containerStyle={{
              top: 760,
              left: 850,
              bottom: 20,
              right: 0
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
