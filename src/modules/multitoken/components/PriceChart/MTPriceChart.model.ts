import {
  action,
  observable,
} from 'mobx';

import { coinService } from '../../../../services/coin.service';
import { multiCoinService } from '../../../../services/multicoin.service';
import {
  multiTokenService,
} from '../../../../services/multitoken.service';
import { ChartPeriod, HttpStatus } from '../../../../utils/enums';


const PERIOD_DEFAULT = ChartPeriod.SEVEN_DAYS;

interface PriceHistoryMapped {
  x: number; // Timestamp
  y: number; // Value
}

export class MTPriceChartModel {
  @observable isLoading = false;
  @observable isError = false;
  @observable isNotFound = false;
  @observable period: ChartPeriod = PERIOD_DEFAULT;
  @observable mtHistory: PriceHistoryMapped[] = [];
  @observable btcHistory: PriceHistoryMapped[] = [];

  // address for MultiTokens or uid for MultiCoins
  id: string;
  symbol: string;
  isCoin = false;

  constructor(id: string, symbol: string, isCoin?: boolean) {
    this.id = id;
    this.symbol = symbol;
    this.isCoin = !!isCoin;
  }

  @action
  load() {
    return this.isCoin ? this.loadCoinPrice() : this.loadTokenPrice();
  }

  @action
  loadBTC() {
    return coinService.getPrice('BTC', this.period)
      .then((data) => {
        this.btcHistory = data.map(value => {
          return {
            x: Date.parse(value.date),
            y: value.price,
          }
        });
      })
      .catch((e) => {
        // todo: handle error: alert or notification or smth else.
      })
  }

  @action
  private loadTokenPrice() {
    this.isLoading = true;
    return multiTokenService.getPrice(this.id, this.period)
      .then((data) => {
        this.isLoading = false;
        this.mtHistory = data.map(value => {
          return {
            x: Date.parse(value.date),
            y: value.price,
          }
        });
      })
      .catch((e) => {
        this.isLoading = false;
        this.isError = true;

        if (e.response && e.response.status === HttpStatus.NOT_FOUND) {
          this.isNotFound = true;
        }

        // todo: handle error: alert or notification or smth else.
      })
  }

  @action
  private loadCoinPrice() {
    this.isLoading = true;
    return multiCoinService.getPrice(this.id, this.period)
      .then((data) => {
        this.isLoading = false;
        this.mtHistory = data.map(value => {
          return {
            x: Date.parse(value.date),
            y: value.price,
          }
        });
      })
      .catch((e) => {
        this.isLoading = false;
        this.isError = true;

        if (e.response && e.response.status === HttpStatus.NOT_FOUND) {
          this.isNotFound = true;
        }

        // todo: handle error: alert or notification or smth else.
      })
  }
}
