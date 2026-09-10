import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Life Price｜时间价格计算器",
  description: "把商品价格换算成你需要交换的工作时间。",
  other: {
    "codex-preview": "development",
  },
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
    <html lang="zh-CN">
      <body className="antialiased">{children}</body>
    </html>
  );
}
