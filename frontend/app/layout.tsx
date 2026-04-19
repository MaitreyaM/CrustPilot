import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CrustPilot",
  description: "Prompt-driven people search powered by OpenAI Agents SDK and Crustdata.",
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
