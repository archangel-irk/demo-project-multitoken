import { isNumber, isString } from 'lodash-es';

import web3Service from '../services/web3.service';

import { BreakPoints, viewPortWidth } from './browser';


const TOKEN_DECIMALS_MAX = 18;
const TOKEN_DECIMALS_MIDDLE = 6;
const TOKEN_DECIMALS_SMALL = 3; // for very small devices (iPhone 5s/SE)
const TOKEN_DECIMALS_SHORT = 2;
const PERCENT_DECIMALS_SHORT = 2;


// This function similar to .toFixed() but without rounding.
// Doesn't work with exponential notation.
export function truncateDecimals(
  val: string | number,
  maxDecimals: number = TOKEN_DECIMALS_MAX,
): string {
  const valString = isNumber(val) ? val.toString(): val;
  const [whole, fraction] =  valString.split('.');
  const valTruncated = `${whole}${fraction ? `.${fraction.slice(0, maxDecimals)}` : ''}`;

  // Process '-0.0000' case
  if (parseFloat(valTruncated) === 0) {
    return '0';
  }
  return valTruncated;
}


/**
 * Takes balance in wei and return formatted value in ether.
 *
 * @see https://github.com/MetaMask/metamask-extension/blob/develop/ui/app/util.js
 * @see https://github.com/ethjs/ethjs-unit/blob/master/src/index.js
 *
 * @param balanceWei Balance in wei.
 * @param maxDecimals Maximum decimals count.
 */
export function formatWeiBalance(
  balanceWei: string,
  maxDecimals: number = TOKEN_DECIMALS_MAX,
): string {
  const balanceEth = web3Service.utils.fromWei(balanceWei, 'ether').toString();
  return truncateDecimals(balanceEth, maxDecimals);
}


// Prefix in English words (financial).
// https://en.wikipedia.org/wiki/Metric_prefix
const metricPrefix = [
  '', // less then 1000 without prefix
  ' K', // thousand
  ' M', // million
  ' B', // billion/milliard
  ' T', // trillion
  ' P', // quadrillion
  ' E', // quintillion
  ' Z', // sextillion
  ' Y', // septillion
];

// http://xahlee.info/js/javascript_format_number.html
function formatPrefix(val: number, decimals = 2) {
  if (val > 1e24) return '> Yotta';
  let ii = 0;
  // tslint:disable-next-line:no-conditional-assignment
  while ((val = val / 1000) >= 1) { ii++; }
  return truncateDecimals((val * 1000), decimals) + metricPrefix[ii];
}


const formatterMiddle =
  new Intl.NumberFormat(
    'en-US',
    {
      minimumFractionDigits: TOKEN_DECIMALS_MIDDLE,
    },
  );

const formatterSmall =
  new Intl.NumberFormat(
    'en-US',
    {
      minimumFractionDigits: TOKEN_DECIMALS_SMALL,
    },
  );

const formatterShort =
  new Intl.NumberFormat(
    'en-US',
    {
      minimumFractionDigits: TOKEN_DECIMALS_SHORT,
    },
  );

const prefixMap = {
  'k': 1e3,
  'm': 1e6,
  'b': 1e9,
  't': 1e12,
  'p': 1e15,
  'e': 1e18,
  'z': 1e21,
  'y': 1e24,
  'Infinity': Infinity,
};

/**
 * Works with small numbers.
 * Doesn't work with exponential notation.
 *
 * @example
 * 12323.235123 // 12,323.23
 */
export function formatNumberShort(val: string | number, prefixStart = 'Infinity') {
  let valNumber = isString(val) ? parseFloat(val) : val;
  if (valNumber < 1) {
    if (viewPortWidth <= BreakPoints.XXS) {
      valNumber = parseFloat(truncateDecimals(val, TOKEN_DECIMALS_SMALL));
      if (valNumber === 0) return '0';
      return formatterSmall.format(valNumber);
    }

    valNumber = parseFloat(truncateDecimals(val, TOKEN_DECIMALS_MIDDLE));
    if (valNumber === 0) return '0';
    return formatterMiddle.format(valNumber);
  }

  if (valNumber > prefixMap[prefixStart]) {
    return formatPrefix(valNumber);
  }

  valNumber = parseFloat(truncateDecimals(val, TOKEN_DECIMALS_SHORT));
  return formatterShort.format(valNumber);
}


const percentFormatter =
  new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

// Doesn't work with exponential notation.
export function formatPercent(val: string | number) {
  const valNumber = parseFloat(truncateDecimals(val, PERCENT_DECIMALS_SHORT));
  return percentFormatter.format(valNumber);
}
