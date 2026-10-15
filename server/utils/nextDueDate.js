export const getNextDueDate = (currentDate, frequency, dayOfMonth) => {
  const date = new Date(currentDate);

  if (frequency === "Weekly") {
    date.setDate(date.getDate() + 7);
    return date;
  }

  if (frequency === "Yearly") {
    return new Date(date.getFullYear() + 1, date.getMonth(), date.getDate());
  }

  if (frequency === "Monthly") {
    const year = date.getFullYear();
    const nextMonth = date.getMonth() + 1;
    // day 0 of the month after nextMonth = last day of nextMonth
    const daysInNextMonth = new Date(year, nextMonth + 1, 0).getDate();
    const day = Math.min(dayOfMonth, daysInNextMonth);
    return new Date(year, nextMonth, day);
  }

  throw new Error(`Unknown frequency: ${frequency}`);
};