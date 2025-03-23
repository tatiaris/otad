import fs from 'fs';
import path from 'path';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@components/ui/breadcrumb';

// Function to get all days in a month
async function getDaysInMonth(year: string, month: string) {
  const monthPath = path.join(process.cwd(), 'src', 'app', 'db', year, month);

  try {
    // Check if month directory exists
    if (!fs.existsSync(monthPath)) {
      return null;
    }

    // Get all day files
    const dayFiles = await fs.promises.readdir(monthPath);

    // Extract day numbers from filenames and sort numerically
    const validDays = dayFiles
      .filter(file => file.endsWith('.md'))
      .map(file => file.replace('.md', ''))
      .sort((a, b) => parseInt(a) - parseInt(b));

    return validDays;
  } catch (error) {
    console.error(`Error reading days for ${year}/${month}:`, error);
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

// Check if a month exists in the database
async function monthExists(year: string, month: string) {
  const monthPath = path.join(process.cwd(), 'src', 'app', 'db', year, month);
  return fs.existsSync(monthPath) &&
    (await fs.promises.readdir(monthPath)).some(file => file.endsWith('.md'));
}

// Get previous month that has content
async function getPreviousMonth(year: string, month: string) {
  const currentDate = new Date(`${year}-${month}-01`);
  const prevDate = new Date(currentDate);
  prevDate.setMonth(currentDate.getMonth() - 1);

  const prevYear = prevDate.getFullYear().toString();
  const prevMonth = (prevDate.getMonth() + 1).toString();

  if (await monthExists(prevYear, prevMonth)) {
    return { year: prevYear, month: prevMonth };
  }

  return null;
}

// Get next month that has content
async function getNextMonth(year: string, month: string) {
  const currentDate = new Date(`${year}-${month}-01`);
  const nextDate = new Date(currentDate);
  nextDate.setMonth(currentDate.getMonth() + 1);

  const nextYear = nextDate.getFullYear().toString();
  const nextMonth = (nextDate.getMonth() + 1).toString();

  if (await monthExists(nextYear, nextMonth)) {
    return { year: nextYear, month: nextMonth };
  }

  return null;
}

export default async function MonthPage({
  params,
}: {
  params: Promise<{ year: string; month: string }>;
}) {
  const { year, month } = await params;
  const days = await getDaysInMonth(year, month);

  if (!days) {
    notFound();
  }

  // Get previous and next months for navigation
  const prevMonth = await getPreviousMonth(year, month);
  const nextMonth = await getNextMonth(year, month);

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
              <BreadcrumbPage>{getMonthName(month)}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <h1 className="text-3xl font-bold mb-6">
          {getMonthName(month)} {year}
        </h1>

        <div className="space-y-2">
          {days.length > 0 ? (
            days.map(day => {
              const date = new Date(`${year}-${month}-${day}`);
              return (
                <Link
                  key={day}
                  href={`/${year}/${month}/${day}`}
                  className="block text-blue-700 font-medium hover:underline"
                >
                  {date.toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric'
                  })}
                </Link>
              );
            })
          ) : (
            <p>No articles available for this month.</p>
          )}
        </div>

        {/* Navigation buttons */}
        <div className="mt-8 flex justify-between">
          {prevMonth ? (
            <Link href={`/${prevMonth.year}/${prevMonth.month}`} className="text-blue-700 hover:underline">
              ← Previous Month
            </Link>
          ) : (
            <div></div>
          )}

          {nextMonth ? (
            <Link href={`/${nextMonth.year}/${nextMonth.month}`} className="text-blue-700 hover:underline">
              Next Month →
            </Link>
          ) : (
            <div></div>
          )}
        </div>
      </div>
    </div>
  );
}
