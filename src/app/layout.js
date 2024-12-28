import "./globals.css";
import { AuthProvider } from "@/components/context/authContext";


export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="app-container">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
