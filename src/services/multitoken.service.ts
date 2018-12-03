import { captureException, captureMessage, withScope } from '@sentry/browser';
import axios from 'axios';

import { ChartPeriod, HttpStatus } from '../utils/enums';
import { camelize, mapKeysDeep } from '../utils/utils';

import web3Service from './web3.service';


export interface HistoryPrice {
  date: string;
  price: number;
}

export interface MultiToken {
  address: string;
  historyPrices: HistoryPrice[];
  icon: string;
  items: MultiTokenItem[],
  marketCap: number;
  name: string;
  percentChange24H: number;
  price: number;
  symbol: string;
  uid: string;

  isCoin: undefined;
  isToken: boolean;
}

export interface Token {
  address: string;
  icon: string;
  marketCap: number;
  name: string;
  percentChange24H: number;
  price: number;
  symbol: string;
  uid: string;
}

export interface MultiTokenItem {
  percent: number;
  token: Token;
}

export interface MultiTokenDetail {
  address: string;
  description: string;
  icon: string;
  items: MultiTokenItem[],
  name: string;
  percentChange24H: number;
  price: number;
  symbol: string;
  uid: string;

  isCoin: undefined;
  isToken: boolean;
}

export interface PriceHistory {
  price: number
  date: string
}

// RESPONSES //
interface TokenResponse {
  address: string;
  icon: string;
  market_cap: number;
  name: string;
  percent_change_24h: number;
  price: number;
  symbol: string;
  uid: string;
}

interface HistoryPriceResponse {
  date: string;
  price: number;
}

interface MultiTokenResponse {
  address: string;
  history_prices: HistoryPriceResponse[];
  icon: string;
  items: MultiTokenItemResponse[],
  market_cap: number;
  name: string;
  percent_change_24h: number;
  price: number;
  symbol: string;
  uid: string;
}

interface MultiTokenItemResponse {
  percent: number;
  token: TokenResponse;
}

interface MultiTokenDetailResponse {
  address: string;
  description: string;
  icon: string;
  items: MultiTokenItemResponse[],
  name: string;
  percent_change_24h: number;
  price: number;
  symbol: string;
  uid: string;
}


interface TxDataItemResponse {
  from_address: string
  to_address: string
  data: string
  value: string
  gas_price: string
  gas_limit: string
}

interface TxDataResponse {
  transactions: TxDataItemResponse[]
}

interface PriceHistoryItemResponse {
  price: number
  date: string
}

interface PriceHistoryResponse {
  readonly [index: number]: PriceHistoryItemResponse;
}


class MultiTokenService {
  static MULTI_TOKENS_URL = '/api/v1/multi-tokens';
  static MULTI_TOKEN_URL = '/api/v1/multi-tokens/{address}';
  static PREPARE_BUY_TX_URL = '/api/v1/multi-tokens/{address}/buy';
  static PREPARE_SELL_TX_URL = '/api/v1/multi-tokens/{address}/sell';
  static PRICES_URL = '/api/v1/multi-tokens/{address}/prices/{period}';

  getWallet() {
    return web3Service.getWallet();
  }

  prepareBuyTx(fromAmount: string, toAddress: string) {
    const url = MultiTokenService.PREPARE_BUY_TX_URL.replace('{address}', toAddress);
    const wallet = this.getWallet();

    return axios
      .post<TxDataResponse>(url, {
        address: wallet,
        from_amount: fromAmount,
        // from_currency_code: fromSymbol,
      })
      .catch((e) => {
        captureException(e);
        throw e;
      });
  }

  prepareSellTx(fromAmount: string, toAddress: string) {
    const url = MultiTokenService.PREPARE_SELL_TX_URL.replace('{address}', toAddress);
    const wallet = this.getWallet();

    return axios
      .post<TxDataResponse>(url, {
        address: wallet,
        from_amount: fromAmount,
        // from_currency_code: fromSymbol,
      })
      .catch((e) => {
        captureException(e);
        throw e;
      });
  }

  getMultiTokens(): Promise<MultiToken[]> {
    const url = MultiTokenService.MULTI_TOKENS_URL;
    return axios
      .get<MultiTokenResponse[]>(url)
      .then((response) => {
        return mapKeysDeep(response.data, camelize);
      })
      .then((tokens) => {
        return tokens.map((token: MultiToken) => {
          return {
            ...token,
            isToken: true,
          }
        });
      })
      .catch((e) => {
        captureException(e);
        throw e;
      })
  }

  getMultiToken(address: string): Promise<MultiTokenDetail> {
    const url = MultiTokenService.MULTI_TOKEN_URL.replace('{address}', address);
    return axios
      .get<MultiTokenDetailResponse>(url)
      .then((response) => {
        return mapKeysDeep(response.data, camelize);
      })
      .then((token: MultiTokenDetail) => {
        return {
          ...token,
          isToken: true,
        }
      })
      .catch((e) => {
        // todo: maybe we don't need to capture message. (just rely on captureException)
        if (e.response && e.response.status === HttpStatus.NOT_FOUND) {
          withScope(scope => {
            scope.setTag('service', 'MultiTokenService');
            scope.setTag('method', 'getMultiToken');
            scope.setExtra('multi_token_address', address);
            captureMessage('MultiToken not found');
          });
        }

        captureException(e);
        throw e;
      })
  }

  getPrice(address: string, period: ChartPeriod): Promise<PriceHistory[]> {
    const url = MultiTokenService.PRICES_URL
      .replace('{address}', address)
      .replace('{period}', period);

    return axios
      .get<PriceHistoryResponse>(url)
      .then((response) => {
        return mapKeysDeep(response.data, camelize);
      })
      .catch((e) => {
        if (e.response && e.response.status === HttpStatus.NOT_FOUND) {
          withScope(scope => {
            scope.setTag('service', 'MultiTokenService');
            scope.setTag('method', 'getPrice');
            scope.setExtra('multi_token_address', address);
            captureMessage('MultiToken or price not found');
          });
        }

        // todo: show error to user (alert or notification or smth else).
        captureException(e);
        throw e;
      })
  }
}

const multiTokenService = new MultiTokenService();
export { multiTokenService };
