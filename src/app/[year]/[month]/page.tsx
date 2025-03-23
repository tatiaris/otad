import Link from 'next/link';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@components/ui/breadcrumb';
import { getDaysInMonth, getNextMonth, getMonthName, getPreviousMonth } from 'src/lib/utils';
import NotFound from '@components/not-found';

export default async function MonthPage({ params }: { params: Promise<{ year: string; month: string }> }) {
  const { year, month } = await params;
  const days = await getDaysInMonth(year, month);

  if (!days) return <NotFound />;

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
                  className="block text-primary font-medium hover:underline"
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
            <Link href={`/${prevMonth.year}/${prevMonth.month}`} className="text-primary hover:underline">
              ← Previous Month
            </Link>
          ) : (
            <div></div>
          )}

          {nextMonth ? (
            <Link href={`/${nextMonth.year}/${nextMonth.month}`} className="text-primary hover:underline">
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
