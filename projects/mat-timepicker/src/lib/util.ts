import { ITimeData, ClockViewType, ClockMode } from './interfaces-and-types';

export function twoDigits(n) {
  return n < 10 ? `0${n}` : `${n}`;
}

export function addDays(date: Date, days: number) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function convertHoursForMode(hour: number, mode: ClockMode) {
  const isPm = hour >= 12;
  if (mode === '24h') {
    return { hour, isPm };
  } else if (hour === 0 || hour === 12) {
    return { hour: 12, isPm };
  } else if (hour < 12) {
    return { hour, isPm };
  }
  return { hour: hour - 12, isPm };
}

function mod(a, b) {
  return a - Math.floor(a / b) * b;
}

export function getShortestAngle(from, to) {
  const difference = to - from;
  return from + mod(difference + 180, 360) - 180;
}

export function isDateInRange(minDate: Date, maxDate: Date, current: Date) {
  const unixCurrentDate = +current;
  return (!minDate || +minDate <= unixCurrentDate) && (!maxDate || unixCurrentDate <= +maxDate);
}

export function isTimeInRange(minDate: Date, maxDate: Date, current: Date) {
  if (minDate instanceof Date) {
    const newMinDate = new Date();
    newMinDate.setHours(minDate.getHours());
    newMinDate.setMinutes(minDate.getMinutes());
    newMinDate.setSeconds(0);
    newMinDate.setMilliseconds(0);
    minDate = newMinDate;
  }
  if (maxDate instanceof Date) {
    const newMaxDate = new Date();
    newMaxDate.setHours(maxDate.getHours());
    newMaxDate.setMinutes(maxDate.getMinutes());
    newMaxDate.setSeconds(0);
    newMaxDate.setMilliseconds(0);
    maxDate = newMaxDate;
  }
  if (current instanceof Date) {
    const newCurrent = new Date();
    newCurrent.setHours(current.getHours());
    newCurrent.setMinutes(current.getMinutes());
    newCurrent.setSeconds(0);
    newCurrent.setMilliseconds(0);
    current = newCurrent;
  }
  const unixCurrentDate = +current;
  return (!minDate || +minDate <= unixCurrentDate) && (!maxDate || unixCurrentDate <= +maxDate);
}

// used when generating the allowed maps

export function isAllowed(
  hour: number,
  minutes: number,
  minDate: Date,
  maxDate: Date,
  clockMode: ClockMode,
  selectedMeridiem?: 'AM' | 'PM'
) {
  if (hour > 24 || hour < 0 || minutes > 60 || minutes < 0) { return false; }

  if (!minDate && !maxDate) { return true; }

  if (clockMode === '12h') {
    if (hour === 12 && selectedMeridiem === 'AM') { hour = 0; }
    if (hour > 12) { hour -= 12; }
  }
  const checkDate = new Date();

  checkDate.setHours(hour);
  checkDate.setMinutes(minutes);
  checkDate.setSeconds(0);
  checkDate.setMilliseconds(0);

  return isDateInRange(minDate, maxDate, checkDate);
}

// used by the clock component to visually disable the not allowed values

export function getIsAvailabeFn(allowed12HourMap, allowed24HourMap, mode: ClockMode) {
  return (value: number, viewType: ClockViewType, isPm: boolean, h?: number) => {
    const isHourCheck = viewType === 'hours';
    const [hour, minutes] = isHourCheck ? [value, null] : [h, value];

    if (mode === '12h') {
      if (!allowed12HourMap) { return true; }
      const meridiem = isPm ? 'pm' : 'am';
      if (isHourCheck) {
        return !!Object.values(allowed12HourMap[meridiem][hour]).find(v => v === true);
      }
      return allowed12HourMap[meridiem][hour][minutes];
    }

    if (!allowed24HourMap) { return true; }

    if (isHourCheck) {
      return !!Object.values(allowed24HourMap[hour]).find(v => v === true);
    }
    return allowed24HourMap[hour][minutes];
  };
}
