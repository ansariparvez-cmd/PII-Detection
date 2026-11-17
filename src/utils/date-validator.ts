function isValidDateComponent(
  year: number,
  month: number,
  day: number,
): boolean {
  if (
    !Number.isInteger(year) ||
    !Number.isInteger(month) ||
    !Number.isInteger(day)
  ) {
    return false;
  }

  if (year < 1 || month < 1 || month > 12 || day < 1) {
    return false;
  }

  const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

  const isLeapYear = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);

  if (isLeapYear) {
    daysInMonth[1] = 29;
  }

  return day <= (daysInMonth[month - 1] ?? 0);
}

export function isValidDate(value: string): boolean {
  const isoMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);

  if (isoMatch) {
    const year = Number(isoMatch[1]);
    const month = Number(isoMatch[2]);
    const day = Number(isoMatch[3]);

    return isValidDateComponent(year, month, day);
  }

  const usMatch = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(value);

  if (usMatch) {
    const month = Number(usMatch[1]);
    const day = Number(usMatch[2]);
    const year = Number(usMatch[3]);

    return isValidDateComponent(year, month, day);
  }

  return false;
}
