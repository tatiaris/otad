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

// Function to get all months in a year
async function getMonthsInYear(year: string) {
  const yearPath = path.join(process.cwd(), 'src', 'app', 'db', year);

  try {
    // Check if year directory exists
    if (!fs.existsSync(yearPath)) {
      return null;
    }

    // Get all month directories
    const monthDirs = await fs.promises.readdir(yearPath);

    // Filter only directories and sort numerically
    const validMonths = monthDirs
      .filter(month => fs.statSync(path.join(yearPath, month)).isDirectory())
      .sort((a, b) => parseInt(a) - parseInt(b));

    return validMonths;
  } catch (error) {
    console.error(`Error reading months for year ${year}:`, error);
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

// Check if a year exists in the database
async function yearExists(year: string) {
  const yearPath = path.join(process.cwd(), 'src', 'app', 'db', year);
  return fs.existsSync(yearPath);
}

// Get previous year that has content
async function getPreviousYear(year: string) {
  const prevYear = (parseInt(year) - 1).toString();
  if (await yearExists(prevYear)) {
    return prevYear;
  }
  return null;
}

// Get next year that has content
async function getNextYear(year: string) {
  const nextYear = (parseInt(year) + 1).toString();
  if (await yearExists(nextYear)) {
    return nextYear;
  }
  return null;
}

export default async function YearPage({
  params,
}: {
  params: { year: string };
}) {
  const { year } = await params;
  const months = await getMonthsInYear(year);

  if (!months) {
    notFound();
  }

  // Get previous and next years for navigation
  const prevYear = await getPreviousYear(year);
  const nextYear = await getNextYear(year);

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
              <BreadcrumbPage>{year}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <h1 className="text-3xl font-bold mb-6">Archives for {year}</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {months.length > 0 ? (
            months.map(month => (
              <Link
                key={month}
                href={`/${year}/${month}`}
                className="block text-blue-700 font-medium hover:underline"
              >
                {getMonthName(month)}
              </Link>
            ))
          ) : (
            <p className="col-span-3">No content available for this year.</p>
          )}
        </div>

        {/* Navigation buttons */}
        <div className="mt-8 flex justify-between">
          {prevYear ? (
            <Link href={`/${prevYear}`} className="text-blue-700 hover:underline">
              ← Previous Year
            </Link>
          ) : (
            <div></div>
          )}

          {nextYear ? (
            <Link href={`/${nextYear}`} className="text-blue-700 hover:underline">
              Next Year →
            </Link>
          ) : (
            <div></div>
          )}
        </div>
      </div>
    </div>
  );
}
