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
        <h3 className="text-muted-foreground font-semibold mb-4">To make the world a better place.</h3>
        <Link href="/today" className="text-blue-700 font-medium hover:underline">{`Today's article →`}</Link>
        <h3 className="text-muted-foreground font-semibold mb-2 mt-4">Recent Articles</h3>
        <div className="space-y-2">
          {articles.length > 0 ? (
            <ul className="list-none pl-0 space-y-1">
              {articles.slice(0, 3).map(article => (
                <li key={article.path} className="flex items-center">
                  <span className="mr-2 text-muted-foreground">-</span>
                  <Link href={article.path} className="text-blue-700 hover:underline">
                    {article.date.toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p>No articles found</p>
          )}
        </div>

        <div className="mt-4 flex space-x-4">
          {articles.length > 0 && articles[0].year && (
            <Link href={`/${articles[0].year}`} className="text-blue-700 font-medium hover:underline">
              Browse archives →
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
