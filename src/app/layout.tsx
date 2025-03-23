import { config } from "src/config";
import { Metadata } from "next";
import "src/global.css";

export const metadata: Metadata = {
  title: config.title,
  description: config.description,
  authors: config.authors,
  keywords: config.keywords,
  appleWebApp: {
    title: config.name,
  },
  openGraph: {
    title: config.title,
    description: config.description,
    type: "website",
    siteName: config.name,
    images: [`${process.env.NEXT_PUBLIC_HOST}/og?title=${config.name}&subtitle=${config.description}`],
  }
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
