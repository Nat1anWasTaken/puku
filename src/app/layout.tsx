import { Navbar } from "@/components/navbar";
import { QueryProvider } from "@/components/providers/query-provider";
import { Provider } from "@/components/ui/provider";
import { Toaster } from "@/components/ui/toaster";
import { Box, Flex } from "@chakra-ui/react";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"]
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"]
});

export const metadata: Metadata = {
  title: "Puku | 譜庫",
  description: "Puku 是一個分享樂譜的平台"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Provider>
          <QueryProvider>
            <Flex direction="column" h="vh" w="vw">
              <Navbar />
              <Box flex="1">{children}</Box>
            </Flex>
            <Toaster />
          </QueryProvider>
        </Provider>
      </body>
    </html>
  );
}
