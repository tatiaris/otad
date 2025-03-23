import Link from 'next/link';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@components/ui/breadcrumb';
import {
  getMonthsInYear,
  getPreviousYear,
  getNextYear,
  getMonthName,
} from 'src/lib/utils';
import NotFound from '@components/not-found';

export default async function YearPage({ params }: { params: Promise<{ year: string }> }) {
  const { year } = await params;
  const months = await getMonthsInYear(year);

  if (!months) return <NotFound />;

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

        <h1 className="text-3xl font-bold mb-6">{year}</h1>

        <div className="space-y-2">
          {months.length > 0 ? (
            months.map(month => (
              <Link
                key={month}
                href={`/${year}/${month}`}
                className="block text-primary font-medium hover:underline"
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
            <Link href={`/${prevYear}`} className="text-primary hover:underline">
              ← Previous Year
            </Link>
          ) : (
            <div></div>
          )}

          {nextYear ? (
            <Link href={`/${nextYear}`} className="text-primary hover:underline">
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
