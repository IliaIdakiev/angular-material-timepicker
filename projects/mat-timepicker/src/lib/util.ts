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

  const unixCheckDate = +checkDate;
  const result = (!minDate || +minDate <= unixCheckDate) && (!maxDate || unixCheckDate <= +maxDate);
  return result;
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



// export function isAvailable(
//   value: number,
//   meridiem: any,
//   formattedHours: any,
//   minValue: ITimeData,
//   maxValue: ITimeData,
//   mode: ClockViewType,
//   hours?: number
// ) {
//   if (!minValue && !maxValue) { return true; }
//   if (mode === '12h' && meridiem === 'AM' && value === 12) {
//     value = 0;
//   }


//   const valueDate = new Date();
//   if (mode === 'minutes') {
//     hours = hours || formattedHours;
//     valueDate.setHours(
//       meridiem === 'AM' ?
//         hours === 12 ? 0 : hours : hours < 12 ? hours + 12 : hours
//     );
//     valueDate.setMinutes(value);
//     if (valueDate.getDay() !== (new Date()).getDay() && value !== 0) { return false; }
//   } else {
//     value = mode === '24h' ? value : meridiem === 'AM' ? value : value < 12 ? value + 12 : value;
//     valueDate.setHours(value);
//     valueDate.setMinutes(0);
//   }
//   valueDate.setSeconds(0);
//   valueDate.setMilliseconds(0);

//   let minDate: Date = null;
//   let maxDate: Date = null;
//   if (minValue) {
//     minDate = new Date();
//     minDate.setHours(minValue.hours);
//     if (mode === 'minutes') {
//       minDate.setMinutes(minValue.minutes);
//     } else {
//       minDate.setMinutes(0);
//     }
//     minDate.setSeconds(0);
//     minDate.setMilliseconds(0);
//   }
//   if (maxValue) {
//     maxDate = new Date();
//     maxDate.setHours(maxValue.hours);
//     if (maxValue.hours === 24) {
//       maxDate = addDays(maxDate, 1);
//     }
//     if (mode === 'minutes') {
//       maxDate.setMinutes(maxValue.minutes);
//     } else {
//       maxDate.setMinutes(0);
//     }
//     maxDate.setSeconds(0);
//     maxDate.setMilliseconds(0);
//   }

//   if (
//     maxValue && maxValue.meridiem === 'PM' && ((valueDate.getDay() !== (new Date()).getDay() && value === 0) ||
//       maxValue.hours === 12 && value === 12 && meridiem === 'PM')
//   ) {
//     return true;
//   }

//   return ((!minDate || minDate <= valueDate) && (!maxDate || maxDate >= valueDate));
// }
