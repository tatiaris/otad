import fs from 'fs';
import path from 'path';
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

// Utility to read markdown file for a specific date
async function getArticleForDate(year: string, month: string, day: string) {
  // Updated path structure to match new hierarchy: db/year/month/day.md
  const filePath = path.join(process.cwd(), 'src', 'app', 'db', year, month, `${day}.md`);

  try {
    const content = await fs.promises.readFile(filePath, 'utf8');
    return content;
  } catch (error) {
    return null;
  }
}

// Function to get month name from number
function getMonthName(month: string) {
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return monthNames[parseInt(month) - 1];
}

// Check if content exists for a specific date
async function contentExistsForDate(year: string, month: string, day: string) {
  const filePath = path.join(process.cwd(), 'src', 'app', 'db', year, month, `${day}.md`);
  return fs.existsSync(filePath);
}

// Get previous date for navigation
async function getPreviousDate(year: string, month: string, day: string) {
  const currentDate = new Date(`${year}-${month}-${day}`);
  const prevDate = new Date(currentDate);
  prevDate.setDate(currentDate.getDate() - 1);

  const prevYear = prevDate.getFullYear().toString();
  const prevMonth = (prevDate.getMonth() + 1).toString();
  const prevDay = prevDate.getDate().toString();

  // Check if content exists for previous date
  if (await contentExistsForDate(prevYear, prevMonth, prevDay)) {
    return { year: prevYear, month: prevMonth, day: prevDay };
  }

  return null;
}

// Get next date for navigation
async function getNextDate(year: string, month: string, day: string) {
  const currentDate = new Date(`${year}-${month}-${day}`);
  const nextDate = new Date(currentDate);
  nextDate.setDate(currentDate.getDate() + 1);

  const nextYear = nextDate.getFullYear().toString();
  const nextMonth = (nextDate.getMonth() + 1).toString();
  const nextDay = nextDate.getDate().toString();

  // Check if content exists for next date
  if (await contentExistsForDate(nextYear, nextMonth, nextDay)) {
    return { year: nextYear, month: nextMonth, day: nextDay };
  }

  return null;
}

export default async function DailyNewsPage({
  params,
}: {
  params: { year: string; month: string; day: string };
}) {
  const { year, month, day } = await params;
  const articleContent = await getArticleForDate(year, month, day);

  // Get previous and next dates for navigation
  const prevDate = await getPreviousDate(year, month, day);
  const nextDate = await getNextDate(year, month, day);

  const date = new Date(`${year}-${month}-${day}`);

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
            <Link href={`/${prevDate.year}/${prevDate.month}/${prevDate.day}`} className="text-blue-700 hover:underline">
              ← Previous Day
            </Link>
          ) : <div></div>}

          {nextDate ? (
            <Link href={`/${nextDate.year}/${nextDate.month}/${nextDate.day}`} className="text-blue-700 hover:underline">
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
