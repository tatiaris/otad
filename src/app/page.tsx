import fs from 'fs';
import path from 'path';
import Link from 'next/link';

// Get list of articles from the hierarchical db directory structure
async function getRecentArticles() {
  const baseDir = path.join(process.cwd(), 'src', 'app', 'db');
  const articles: Array<{
    date: Date;
    path: string;
    year: string;
    month: string;
    day: string;
  }> = [];

  try {
    // Get all year directories
    const yearDirs = await fs.promises.readdir(baseDir);

    for (const year of yearDirs) {
      if (!fs.statSync(path.join(baseDir, year)).isDirectory()) continue;

      // Get all month directories within the year
      const monthsPath = path.join(baseDir, year);
      const monthDirs = await fs.promises.readdir(monthsPath);

      for (const month of monthDirs) {
        if (!fs.statSync(path.join(monthsPath, month)).isDirectory()) continue;

        // Get all day files within the month
        const daysPath = path.join(monthsPath, month);
        const dayFiles = await fs.promises.readdir(daysPath);

        for (const dayFile of dayFiles) {
          if (!dayFile.endsWith('.md')) continue;

          // Extract the day from the filename (remove .md extension)
          const day = dayFile.replace('.md', '');

          // Create date object
          const dateObj = new Date(`${year}-${month}-${day}`);

          articles.push({
            date: dateObj,
            path: `/${year}/${month}/${day}`,
            year,
            month,
            day
          });
        }
      }
    }

    // Sort by date (newest first)
    return articles.sort((a, b) => b.date.getTime() - a.date.getTime());
  } catch (error) {
    console.error('Error reading articles directory:', error);
    return [];
  }
}

export default async function Home() {
  const articles = await getRecentArticles();

  return (
    <div className="py-8 px-8">
      <div className="lg:max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-1">One Thing A Day</h1>
        <h2 className="text-muted-foreground font-semibold mb-6">To make the world a better place.</h2>

        <div className="space-y-4">
          {articles.length > 0 ? (
            articles.map(article => (
              <Link key={article.path} href={article.path} className="block text-blue-700 font-medium hover:underline">
                {article.date.toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </Link>
            ))
          ) : (
            <p>No articles found</p>
          )}
        </div>

        <div className="mt-8 flex space-x-4">
          <Link href="/today" className="text-blue-600 hover:underline">
            {`Go to today's news →`}
          </Link>

          {articles.length > 0 && articles[0].year && (
            <Link href={`/${articles[0].year}`} className="text-blue-600 hover:underline">
              Browse archives →
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
