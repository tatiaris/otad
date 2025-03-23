import Link from 'next/link';
import { marked } from 'marked';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@components/ui/breadcrumb';
import { Metadata } from 'next';
import { config } from 'src/config';
import {
  getArticleForDate,
  getPreviousDate,
  getNextDate,
  getMonthName,
  extractMetadataFromMarkdown
} from 'src/lib/utils';

// Update generateMetadata to use frontmatter extraction
export async function generateMetadata({ params }: { params: Promise<{ year: string; month: string; day: string }> }): Promise<Metadata> {
  const { year, month, day } = await params;
  const articleContent = await getArticleForDate(year, month, day);

  // Format date for title fallback
  const formattedDate = `${getMonthName(month)} ${day}, ${year}`;

  // Extract metadata from frontmatter
  const metadata = extractMetadataFromMarkdown(articleContent);

  // Use extracted data or fall back to defaults
  const title = `${metadata.title || formattedDate} | ${config.title}`;
  const description = metadata.description || config.description;
  const keywords = metadata.keywords ?
    [...config.keywords, ...metadata.keywords.split(',').map(tag => tag.trim())] :
    config.keywords;

  return {
    title: title,
    description: description,
    authors: config.authors,
    keywords: keywords,
    appleWebApp: {
      title: config.name,
    },
    openGraph: {
      title: title,
      description: description,
      type: "website",
      siteName: config.name,
      images: [`${process.env.NEXT_PUBLIC_HOST}/og?title=${encodeURIComponent(metadata.title || formattedDate)}&subtitle=${encodeURIComponent(description)}`],
    }
  };
}

export default async function DailyNewsPage({ params }: { params: Promise<{ year: string; month: string; day: string }> }) {
  const { year, month, day } = await params;
  const articleContent = await getArticleForDate(year, month, day);

  // Get previous and next dates for navigation
  const prevDate = await getPreviousDate(year, month, day);
  const nextDate = await getNextDate(year, month, day);

  return (
    <div className="py-8 px-8">
      <div className="lg:max-w-3xl mx-auto">
        {/* Breadcrumb navigation */}
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href={`/${year}`}>{year}</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href={`/${year}/${month}`}>{getMonthName(month)}</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{day}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <article className="prose">
          {articleContent ? (
            <div dangerouslySetInnerHTML={{ __html: marked(articleContent) }} />
          ) : (
            <div>
              <h1>No Content Available</h1>
              <p>{`There's no content for this day.`}</p>
            </div>
          )}
        </article>

        {/* Navigation buttons */}
        <div className="mt-8 flex justify-between">
          {prevDate ? (
            <Link href={`/${prevDate.year}/${prevDate.month}/${prevDate.day}`} className="text-primary hover:underline">
              ← Previous Day
            </Link>
          ) : <div></div>}

          {nextDate ? (
            <Link href={`/${nextDate.year}/${nextDate.month}/${nextDate.day}`} className="text-primary hover:underline">
              Next Day →
            </Link>
          ) : (
            <div></div>
          )}
        </div>
      </div>
    </div>
  );
}
