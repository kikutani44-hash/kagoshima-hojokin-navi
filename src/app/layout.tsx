import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "補助金ナビ｜鹿児島守成みなみクリエイティ部",
  description: "鹿児島県の企業が利用できる補助金・支援制度をカテゴリ別に検索できます",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="antialiased">{children}</body>
    </html>
  );
}
