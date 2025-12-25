/**
 * Date utility functions for IST (UTC+5:30) timezone handling
 */

const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

/**
 * Converts an IST date string (YYYY-MM-DD) to UTC timestamp for start of day (00:00:00 IST)
 * @param istDateString - Date string in YYYY-MM-DD format (represents IST date)
 * @returns ISO string in UTC for the start of the IST day
 */
export function istDateToUTCStart(istDateString: string): string {
  const [year, month, day] = istDateString.split('-').map(Number);
  const istDate = new Date(year, month - 1, day, 0, 0, 0, 0);
  const utcTimestamp = istDate.getTime() - IST_OFFSET_MS;
  return new Date(utcTimestamp).toISOString();
}

/**
 * Converts an IST date string (YYYY-MM-DD) to UTC timestamp for end of day (23:59:59 IST)
 * @param istDateString - Date string in YYYY-MM-DD format (represents IST date)
 * @returns ISO string in UTC for the end of the IST day
 */
export function istDateToUTCEnd(istDateString: string): string {
  const [year, month, day] = istDateString.split('-').map(Number);
  const istDate = new Date(year, month - 1, day, 23, 59, 59, 999);
  const utcTimestamp = istDate.getTime() - IST_OFFSET_MS;
  return new Date(utcTimestamp).toISOString();
}

/**
 * Converts a UTC ISO string to IST date string (YYYY-MM-DD)
 * @param utcISOString - UTC timestamp as ISO string
 * @returns Date string in YYYY-MM-DD format representing the IST date
 */
export function utcToISTDate(utcISOString: string): string {
  const utcDate = new Date(utcISOString);
  const istTimestamp = utcDate.getTime() + IST_OFFSET_MS;
  const istDate = new Date(istTimestamp);

  const year = istDate.getUTCFullYear();
  const month = String(istDate.getUTCMonth() + 1).padStart(2, '0');
  const day = String(istDate.getUTCDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

/**
 * Converts a UTC ISO string to IST date-time string for display
 * @param utcISOString - UTC timestamp as ISO string
 * @returns Formatted date-time string in IST
 */
export function utcToISTDateTime(utcISOString: string): string {
  const utcDate = new Date(utcISOString);
  const istTimestamp = utcDate.getTime() + IST_OFFSET_MS;
  const istDate = new Date(istTimestamp);

  return istDate.toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });
}

/**
 * Gets current date in IST as YYYY-MM-DD string
 * @returns Current IST date string
 */
export function getCurrentISTDate(): string {
  const now = new Date();
  const istTimestamp = now.getTime() + IST_OFFSET_MS;
  const istDate = new Date(istTimestamp);

  const year = istDate.getUTCFullYear();
  const month = String(istDate.getUTCMonth() + 1).padStart(2, '0');
  const day = String(istDate.getUTCDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

/**
 * Formats a date string for display in Indian format (DD-MM-YYYY)
 * @param dateString - Date string in YYYY-MM-DD format
 * @returns Formatted date in DD-MM-YYYY format
 */
export function formatDateForDisplay(dateString: string): string {
  const [year, month, day] = dateString.split('-');
  return `${day}-${month}-${year}`;
}

/**
 * Converts UTC timestamp to IST and formats for display
 * @param utcISOString - UTC timestamp as ISO string
 * @returns Formatted date string in Indian format
 */
export function formatUTCDateForDisplay(utcISOString: string): string {
  const istDate = utcToISTDate(utcISOString);
  return formatDateForDisplay(istDate);
}

/**
 * Formats a UTC timestamp to IST date and time display format
 * @param dateString - UTC timestamp as ISO string
 * @returns Formatted date-time string as "DD-MM-YYYY | hh:mm am/pm"
 */
export function formatDateTimeIST(dateString: string): string {
  const date = new Date(dateString);
  const istOffset = 5.5 * 60 * 60 * 1000;
  const istDate = new Date(date.getTime() + istOffset);

  const day = String(istDate.getUTCDate()).padStart(2, '0');
  const month = String(istDate.getUTCMonth() + 1).padStart(2, '0');
  const year = istDate.getUTCFullYear();

  let hours = istDate.getUTCHours();
  const minutes = String(istDate.getUTCMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'pm' : 'am';

  hours = hours % 12;
  hours = hours ? hours : 12;

  return `${day}-${month}-${year} | ${hours}:${minutes} ${ampm}`;
}
