import { Navbar } from "@/components/navbar";
import { QueryProvider } from "@/components/providers/query-provider";
import { Provider } from "@/components/ui/provider";
import { Toaster } from "@/components/ui/toaster";
import { Box, Flex } from "@chakra-ui/react";
import type { Metadata } from "next";
import { Noto_Sans_TC } from "next/font/google";
import "./globals.css";

// Setup Noto Sans TC for Traditional Chinese
const notoSansTC = Noto_Sans_TC({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "700"],
  display: "swap"
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
      <body className={`${notoSansTC.className} antialiased`}>
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
