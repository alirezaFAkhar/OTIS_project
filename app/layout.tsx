import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const yekanBakh = localFont({
  src: [
    {
      path: "../public/Yekan/YekanBakhFamily/ttf/YekanBakh-Thin.ttf",
      weight: "100",
      style: "normal",
    },
    {
      path: "../public/Yekan/YekanBakhFamily/ttf/YekanBakh-Light.ttf",
      weight: "300",
      style: "normal",
    },
    {
      path: "../public/Yekan/YekanBakhFamily/ttf/YekanBakh-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/Yekan/YekanBakhFamily/ttf/YekanBakh-SemiBold.ttf",
      weight: "600",
      style: "normal",
    },
    {
      path: "../public/Yekan/YekanBakhFamily/ttf/YekanBakh-Bold.ttf",
      weight: "700",
      style: "normal",
    },
    {
      path: "../public/Yekan/YekanBakhFamily/ttf/YekanBakh-ExtraBold.ttf",
      weight: "800",
      style: "normal",
    },
    {
      path: "../public/Yekan/YekanBakhFamily/ttf/YekanBakh-Black.ttf",
      weight: "900",
      style: "normal",
    },
  ],
  variable: "--font-yekan",
  display: "swap",
});

export const metadata: Metadata = {
  title: "OTIS - سیستم احراز هویت",
  description: "سیستم احراز هویت با OTP",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl">
      <body className={`${yekanBakh.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
