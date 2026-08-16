import AppError from '../utils/AppError.js';

export const dateFilters = ({ filter, startDate, endDate }) => {
  switch (filter) {
    case "pastWeek":
      startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      endDate = new Date(Date.now());
      break;
    case "pastMonth":
      startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      endDate = new Date(Date.now());
      break;
    case "lastThreeMonth":
      startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
      endDate = new Date(Date.now());
      break;
    case "custom":
      if (!startDate || !endDate) {
        throw new AppError("Please enter a date", 400);
      }
      startDate = new Date(startDate);
      endDate = new Date(endDate);
      if (startDate > endDate) throw new AppError("Please enter a valid date", 400);
      break;
    default:
      throw new AppError("Please enter a valid filter", 400);
  }
  return { startDate, endDate };
};