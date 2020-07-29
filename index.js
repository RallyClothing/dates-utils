import isEmpty from "lodash.isempty";

/*
  "start": string "2020-06-21"
  "end": string "2020-06-30"
  "inclusive": bool for if we want the start and the end in the array

  returns: ["2020-06-21",  "2020-06-22",  ...]

  Inspired by: https://stackoverflow.com/questions/4413590/javascript-get-array-of-dates-between-2-dates
  Author: Catherine Lai
*/
const getDaysArray = ({ start, end, inclusive = true }) => {
  const arr = [];
  for (
    let dt = new Date(start);
    dt <= new Date(end);
    dt.setDate(dt.getDate() + 1)
  ) {
    // slice to use the year, month, and date
    // example: arr.push("2018-05-01")
    arr.push(dt.toISOString().slice(0, 10));
  }
  if (inclusive) {
    return arr;
  }
  if (arr.length > 2) {
    return arr.slice(1, arr.length - 1);
  }
  return [];
};

/*
  "blockedDays": Object with keys that are strings like "2020-06-18"
  "start": Date object
  "end": Date object

  This function uses Javascript magic to convert Date.parse(day) into
  a primitive number, and though "start" is a Date object, Javascript
  knows to convert "start" into a primitive number as well, then compares the two
*/
const hasBlockedDatesInBetweenStartAndEnd = ({ blockedDays, start, end }) => {
  Object.keys(blockedDays).some(
    (day) => start < Date.parse(day) && Date.parse(day) < end
  );
};

/*
  "markedDates": an object

  Example:
    {
      '2020-07-21': { startingDay: true, selected: true, color: 'red' },
      '2020-07-22': { endingDay: true, selected: true, color: 'red' },
      '2020-07-23': { disabled: true, disableTouchEvent: true },
      ...
    }
*/
const findStartingDayAndEndingDay = (markedDates) => {
  const dateKeyStrings = Object.keys(markedDates);

  return dateKeyStrings.reduce((accumulator, dateString) => {
    const dateObject = markedDates[dateString];
    const dateObjectKeys = Object.keys(dateObject);
    if (dateObjectKeys.includes("startingDay")) accumulator.start = dateString;
    if (dateObjectKeys.includes("endingDay")) accumulator.end = dateString;

    return accumulator;
  }, {});
};

/*
  "blockedDays": Array of rentals objects { start: '2020-06-21', end: '2020-06-23' }

  Returns: flat array of strings from start and end dates of rentals
  like ["2020-07-21", "2020-07-22", ...]
*/
const convertRentalObjectsToArrayOfDateStrings = (blockedDays) => {
  const daysArray = blockedDays.map((rentalObject) => {
    const arr = getDaysArray({
      start: rentalObject.start,
      end: rentalObject.end,
    });
    return arr;
  });
  return daysArray.flat();
};

/*
  "blockedDays": Array of rentals objects { start: '2020-06-21', end: '2020-06-23' }

  Uses above function convertRentalObjectsToArrayOfDateStrings() to get a flat array.
  Then converts that flat array of dates ["2020-07-21", "2020-07-22", ...]
  into a markedDays object via reduce.

  Returns:

  {
    "2020-07-21":{"disabled":true,"disableTouchEvent":true},
    "2020-07-22":{"disabled":true,"disableTouchEvent":true},
    "2020-07-23":{"disabled":true,"disableTouchEvent":true},
    ...
  }

  See https://github.com/wix/react-native-calendars
*/
const convertBlockedDaysToMarkedDaysProp = (blockedDays) => {
  if (isEmpty(blockedDays)) return {};
  const blockedDatesStringArray = convertRentalObjectsToArrayOfDateStrings(
    blockedDays
  );
  const markedDays = blockedDatesStringArray.reduce(
    (accumulator, currentDateString) => {
      accumulator[currentDateString] = {
        disabled: true,
        disableTouchEvent: true,
      };
      return accumulator;
    },
    {}
  );
  return markedDays;
};

module.exports = {
  findStartingDayAndEndingDay,
  convertRentalObjectsToArrayOfDateStrings,
  convertBlockedDaysToMarkedDaysProp,
  getDaysArray,
  hasBlockedDatesInBetweenStartAndEnd,
};
