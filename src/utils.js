import dayjs from 'dayjs';

const DateTimeFormats = {
  DATETIME: 'DD/MM/YY HH:mm',
  DATE: 'YYYY-MM-DD',
  MONTHDAY: 'MMM DD',
  TIME: 'HH:mm',
};

const getFormattedDate = (date, format) => date ? dayjs(date).format(format) : '';

const getDatesDiff = (start, end) => start && end ? dayjs(end).diff(dayjs(start), 'd') : '';

const isDatesEqual = (dateA, dateB) => (dateA === null && dateB === null) || dayjs(dateA).isSame(dateB, 'D');

const snakeToCamel = (str) =>
  str.toLowerCase().replace(/([-_][a-z])/g, (group) =>
    group
      .toUpperCase()
      .replace('-', '')
      .replace('_', '')
  );

const camelize = (item) => {
  for (const key of Object.keys(item)) {
    if(key.includes('_')) {
      item[snakeToCamel(key)] = item[key];
      delete item[key];
    }
  }
  return item;
};

const capitalizeFirstLetter = (string) => string.charAt(0).toUpperCase() + string.slice(1);

export {DateTimeFormats, getFormattedDate, getDatesDiff, camelize, capitalizeFirstLetter, isDatesEqual};
