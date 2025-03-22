import { config } from "src/config";
import { Metadata } from "next";
import "src/global.css";

export const metadata: Metadata = {
  title: config.name,
  description: config.description,
  authors: config.authors,
  icons: config.favicon,
  keywords: config.keywords,
}

/**
 * Root layout component
 */
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
