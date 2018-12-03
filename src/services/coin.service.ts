import { captureException, captureMessage, withScope } from '@sentry/browser';
import axios from 'axios';

import { ChartPeriod, HttpStatus } from '../utils/enums';
import { camelize, mapKeysDeep } from '../utils/utils';


export interface PriceHistory {
  price: number
  date: string
}

// RESPONSES //
interface PriceHistoryItemResponse {
  price: number
  date: string
}

interface PriceHistoryResponse {
  readonly [index: number]: PriceHistoryItemResponse;
}


class CoinService {
  static PRICES_URL = '/api/v1/coins/{symbol}/prices/{period}';

  getPrice(symbol: string, period: ChartPeriod): Promise<PriceHistory[]> {
    const url = CoinService.PRICES_URL
      .replace('{symbol}', symbol)
      .replace('{period}', period);

    return axios
      .get<PriceHistoryResponse>(url)
      .then((response) => {
        return mapKeysDeep(response.data, camelize);
      })
      .catch((e) => {
        if (e.response && e.response.status === HttpStatus.NOT_FOUND) {
          withScope(scope => {
            scope.setTag('service', 'CoinService');
            scope.setTag('method', 'getPrice');
            scope.setExtra('multi_coin_id', symbol);
            captureMessage('Coin or price not found');
          });
        }

        // todo: show error to user (alert or notification or smth else).
        captureException(e);
        throw e;
      })
  }
}

const coinService = new CoinService();
export { coinService };
