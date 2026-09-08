import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { Footer } from "@/components/Footer";
import { auth, signOut } from "@/server/auth/auth.config";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Tienda de Importación",
  description: "Compramos y te enviamos lo que necesites importar desde tus tiendas favoritas.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const session = await auth();

  return (
    <html lang="es" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        <nav className="nav">
          <Link href="/">Tienda Importación</Link>
          <div className="links">
            <Link href="/solicitar">Solicitar</Link>
            <Link href="/#como-funciona">Cómo funciona</Link>
            <Link href="/#faq">FAQ</Link>
            {session?.user ? (
              <>
                <Link href="/dashboard">Mi cuenta</Link>
                {(session.user.role === "STAFF" ||
                  session.user.role === "ADMIN") && (
                  <Link href="/admin/catalogo">Panel admin</Link>
                )}
                <form
                  action={async () => {
                    "use server";
                    await signOut({ redirectTo: "/" });
                  }}
                >
                  <button className="button secondary" type="submit">
                    Salir
                  </button>
                </form>
              </>
            ) : (
              <>
                <Link href="/login">Iniciar sesión</Link>
                <Link href="/registro" className="button">
                  Crear cuenta
                </Link>
              </>
            )}
          </div>
        </nav>
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
