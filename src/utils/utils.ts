import { camelCase, isArray, isObject, mapKeys, mapValues } from 'lodash-es';

import { MultiCoinDetail, MultiCoinItem, MultiCoinShort } from '../services/multicoin.service';
import { MultiToken, MultiTokenDetail, MultiTokenItem } from '../services/multitoken.service';


/**
 * Returns true if the specified value is not undefined.
 *
 * @param val Variable to test.
 * @return Whether variable is defined.
 */
export function isDef<T>(val: T): val is Exclude<T, undefined> {
  // void 0 always evaluates to undefined and hence we do not need to depend on
  // the definition of the global variable named 'undefined'.
  return val !== void 0;
}

export function sanitizeNumber(value: string) {
  return value
    .replace(',', '.')
    // delete all non-numeric symbols
    .replace(/[^0-9.]+/, '')
    // delete all the extra decimal points
    .replace(/(\.+.*?)\.+/, '$1');
}

interface CustomErrorParams {
  message: string;
  code: string;
  request?: object;
  response?: object;
}

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error#ES6_Custom_Error_Class
export class CustomError extends Error {
  constructor(data: CustomErrorParams, ...params: any[]) {
    // Pass remaining arguments (including vendor specific ones) to parent constructor
    super(...params);

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, CustomError);
    }

    // Custom debugging information
    Object.assign(this, data);
  }
}

// https://github.com/lodash/lodash/issues/1244#issuecomment-338139221
export function mapKeysDeep(obj: any, cb: any): any {
  if (isArray(obj)) {
    return obj.map(innerObj => mapKeysDeep(innerObj, cb));
  }
  else if (isObject(obj)) {
    return mapValues(
      mapKeys(obj, cb),
      val => mapKeysDeep(val, cb),
    )
  } else {
    return obj;
  }
}

export const camelize = (v: any, k: string) => camelCase(k);

export function isUserDenied(message: string) {
  return message === 'Returned error: Error: MetaMask Tx Signature: User denied transaction signature.'
    || message === 'cancelled' // Trust
    || message === 'User denied transaction signature.' // Cipher
    || message === 'User denied transaction signature' // Coinbase
    || message === 'Actions cancelled by user' // imToken
}

export function isToken(token: MultiTokenItem | MultiCoinItem): token is MultiTokenItem {
  return (token as MultiTokenItem).token !== undefined;
}
export function isCoin(coin: MultiTokenItem | MultiCoinItem): coin is MultiCoinItem {
  return (coin as MultiCoinItem).coin !== undefined;
}
export function isMultiToken(token: MultiToken | MultiCoinShort): token is MultiToken {
  return (token as MultiToken).isToken;
}
export function isMultiCoin(token: MultiToken | MultiCoinShort): token is MultiCoinShort {
  return (token as MultiCoinShort).isCoin;
}
export function isMultiTokenDetail(token: MultiTokenDetail | MultiCoinDetail): token is MultiTokenDetail {
  return (token as MultiTokenDetail).isToken;
}
export function isMultiCoinDetail(token: MultiTokenDetail | MultiCoinDetail): token is MultiCoinDetail {
  return (token as MultiCoinDetail).isCoin;
}

/**
 * Go-lang style for try-catching.
 * @see https://blog.grossman.io/how-to-write-async-await-without-try-catch-blocks-in-javascript/
 *
 * @example
 * let [err, user] = await to(UserModel.findById(1));
 * if(!user) throw new CustomerError('No user found');
 *
 */
export function to<T>(promise: Promise<T>) {
  return promise
    .then((data: T) => {
      return [null, data];
    })
    .catch((err: Error | any) => [err])
}
