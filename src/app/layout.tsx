import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "IELTS Prep | منصة التحضير لاختبار الآيلتس",
  description:
    "منصة عربية موجهة للطلاب الجزائريين للتحضير لاختبار IELTS مع تفعيل يدوي ولوحة إدارة ومراجعة بالذكاء الاصطناعي.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className={`${cairo.className} h-full`}>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
