import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BenQ Monitor Test",
  description:
    "A full-screen frontend monitor diagnostic for pixels, uniformity, gradients, sharpness, viewing angle, gamma, and response time.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
