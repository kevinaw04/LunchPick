import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LunchPick — Group Lunch Decision Made Easy",
  description: "Smart group lunch ordering — match everyone's preferences, dietary needs, and budget.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-gray-900">
        {children}
      </body>
    </html>
  );
}
