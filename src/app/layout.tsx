import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Developer Manifesto",
  description: "A manifesto for developers, principles to build by.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:ital,wght@0,100..800;1,100..800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-mono bg-white text-manifesto-gray antialiased">
        {children}
      </body>
    </html>
  );
}
