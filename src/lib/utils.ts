import fs from "fs";
import path from "path";

// Utility to read markdown file for a specific date
export async function getArticleForDate(year: string, month: string, day: string) {
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
export function getMonthName(month: string) {
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return monthNames[parseInt(month) - 1];
}

// Check if content exists for a specific date
export async function contentExistsForDate(year: string, month: string, day: string) {
  const filePath = path.join(process.cwd(), 'src', 'app', 'db', year, month, `${day}.md`);
  return fs.existsSync(filePath);
}

// Get previous date for navigation
export async function getPreviousDate(year: string, month: string, day: string) {
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
export async function getNextDate(year: string, month: string, day: string) {
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

// Extract metadata from markdown frontmatter
export function extractMetadataFromMarkdown(content: string | null): Record<string, string> {
  if (!content) return {};

  const metadata: Record<string, string> = {};

  // Match the frontmatter comment section
  const frontmatterMatch = content.match(/<!---\s*([\s\S]*?)\s*-->/);

  if (frontmatterMatch && frontmatterMatch[1]) {
    const frontmatter = frontmatterMatch[1];

    // Extract each metadata key-value pair
    const titleMatch = frontmatter.match(/title:\s*(.*)/);
    const actionMatch = frontmatter.match(/action:\s*(.*)/);
    const tagsMatch = frontmatter.match(/tags:\s*(.*)/);

    if (titleMatch && titleMatch[1]) metadata.title = titleMatch[1].trim();
    if (actionMatch && actionMatch[1]) metadata.description = actionMatch[1].trim();
    if (tagsMatch && tagsMatch[1]) metadata.keywords = tagsMatch[1].trim();
  }

  // Fallback to existing extraction methods if frontmatter is missing
  if (!metadata.title) {
    const extractedTitle = extractTitleFromMarkdown(content);
    if (extractedTitle) metadata.title = extractedTitle;
  }

  if (!metadata.description) {
    const extractedDescription = extractDescriptionFromMarkdown(content);
    if (extractedDescription) metadata.description = extractedDescription;
  }

  return metadata;
}

// Extract title from markdown content (usually the first heading)
export function extractTitleFromMarkdown(content: string | null): string | null {
  if (!content) return null;

  // Try to find the first heading (# Title)
  const titleMatch = content.match(/^#\s+(.+)$/m);
  if (titleMatch && titleMatch[1]) {
    return titleMatch[1].trim();
  }

  return null;
}

// Extract description from markdown content (usually the "One thing you can do today" line)
export function extractDescriptionFromMarkdown(content: string | null): string | null {
  if (!content) return null;

  // Try to find the "One thing you can do today:" line
  const oneThingMatch = content.match(/One thing you can do today:(.+)$/m);
  if (oneThingMatch && oneThingMatch[1]) {
    return oneThingMatch[1].trim();
  }

  // Fallback: try to get the first paragraph after any heading
  const firstParaMatch = content.match(/^(?!#)(.+\S.+)$/m);
  if (firstParaMatch && firstParaMatch[1]) {
    return firstParaMatch[1].trim();
  }

  return null;
}

// Function to get all days in a month
export async function getDaysInMonth(year: string, month: string) {
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

export async function monthExists(year: string, month: string) {
  const monthPath = path.join(process.cwd(), 'src', 'app', 'db', year, month);
  return fs.existsSync(monthPath) &&
    (await fs.promises.readdir(monthPath)).some(file => file.endsWith('.md'));
}

// Get previous month that has content
export async function getPreviousMonth(year: string, month: string) {
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
export async function getNextMonth(year: string, month: string) {
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

// Function to get all months in a year
export async function getMonthsInYear(year: string) {
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

// Check if a year exists in the database
export async function yearExists(year: string) {
  const yearPath = path.join(process.cwd(), 'src', 'app', 'db', year);
  return fs.existsSync(yearPath);
}

// Get previous year that has content
export async function getPreviousYear(year: string) {
  const prevYear = (parseInt(year) - 1).toString();
  if (await yearExists(prevYear)) {
    return prevYear;
  }
  return null;
}

// Get next year that has content
export async function getNextYear(year: string) {
  const nextYear = (parseInt(year) + 1).toString();
  if (await yearExists(nextYear)) {
    return nextYear;
  }
  return null;
}