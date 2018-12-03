import { AxiosResponse } from 'axios';
import { find } from 'lodash-es';
import {
  action,
  computed,
  observable,
} from 'mobx';

import { ExchangeRates, ExchangeService } from '../../../../services/exchange.service';
import {
  MultiToken,
  MultiTokenDetail,
  multiTokenService
} from '../../../../services/multitoken.service';
import { WalletMultiToken } from '../../../../services/wallet.service';
import web3Service, { TxPayload } from '../../../../services/web3.service';
import { formatWeiBalance, truncateDecimals } from '../../../../utils/format';
import { CustomError } from '../../../../utils/utils';


const ACCOUNT_BALANCE_DECIMALS = 6;
const RATE_TOKEN_DECIMALS = 8;
const RATE_USD_DECIMALS = 2;
const LOADER_DELAY = 500;

export class MTBuyFormModel {
  isBuyingRateLoading = false;
  isSellingRateLoading = false;
  buyingRateLoaderTimeout = NaN;
  sellingRateLoaderTimeout = NaN;
  @observable isBuyingRateLoaderShow = false;
  @observable isSellingRateLoaderShow = false;
  @observable isTxPreparing = false;
  @observable isWaitingForApprove = false;

  fromSymbol = 'ETH';
  fromAmount = '0';
  toMultiToken: MultiToken | MultiTokenDetail | WalletMultiToken;
  toAddress = '';
  toSymbol = '';
  toAmount = '0';

  @observable
  rates = {
    ETH: '--',
    USD: '--',
  };

  @computed
  get isAccountReady() { return web3Service.isAccountReady };

  @computed
  get balanceWei() {
    return web3Service.etherBalance === ''
      ? ''
      : web3Service.etherBalance;
  }

  @computed
  get balance() {
    return web3Service.etherBalance === ''
      ? ''
      : web3Service.utils.fromWei(web3Service.etherBalance, 'ether').toString();
  }

  @computed
  get formattedBalance() {
    return web3Service.etherBalance === ''
      ? '--'
      : formatWeiBalance(web3Service.etherBalance, ACCOUNT_BALANCE_DECIMALS);
  };

  constructor(multiToken: MultiToken | MultiTokenDetail | WalletMultiToken) {
    this.toMultiToken = multiToken;
    this.toAddress = multiToken.address;
    this.toSymbol = multiToken.symbol;
  }

  @action
  showBuyingRateLoader = () => {
    if (!this.isBuyingRateLoading) return;
    this.isBuyingRateLoaderShow = true;
  }

  @action
  showSellingRateLoader = () => {
    if (!this.isSellingRateLoading) return;
    this.isSellingRateLoaderShow = true;
  }

  @action
  updateBuyingRate() { // calcAmountToBeReceived
    this.isBuyingRateLoading = true;
    window.clearTimeout(this.buyingRateLoaderTimeout);
    this.buyingRateLoaderTimeout = window.setTimeout(this.showBuyingRateLoader, LOADER_DELAY);

    return ExchangeService
      .getBuyingRate(this.fromSymbol, this.fromAmount, this.toAddress)
      .then((response: AxiosResponse<ExchangeRates>) => {
        this.isBuyingRateLoading = false;
        this.isBuyingRateLoaderShow = false;
        // console.log(response.data);

        this.toAmount = response.data.value.toString();

        const rateEth = find(response.data.exchange_rates, ['currency', 'ETH']);
        const rateUsd = find(response.data.exchange_rates, ['currency', 'USD']);
        if (rateEth) {
          this.rates.ETH = truncateDecimals(rateEth.value, RATE_TOKEN_DECIMALS);
        }
        if (rateUsd) {
          this.rates.USD = truncateDecimals(rateUsd.value, RATE_USD_DECIMALS);
        }
      })
      .catch((e) => {
        this.isBuyingRateLoading = false;
        this.isBuyingRateLoaderShow = false;
        this.toAmount = '0';
        this.rates.ETH = '--';
        this.rates.USD = '--';

        // todo: show error to user (alert or notification or smth else).
      });
  }

  cancelBuyingRateRequestIfNeeded() {
    ExchangeService.cancelBuyingRateRequestIfNeeded();
  }

  @action
  updateSellingRate() { // calcAmountToPay
    this.isSellingRateLoading = true;
    window.clearTimeout(this.sellingRateLoaderTimeout);
    this.sellingRateLoaderTimeout = window.setTimeout(this.showSellingRateLoader, LOADER_DELAY);

    return ExchangeService
      .getSellingRate(this.toAddress, this.toAmount, this.fromSymbol)
      .then((response: AxiosResponse<ExchangeRates>) => {
        this.isSellingRateLoading = false;
        this.isSellingRateLoaderShow = false;
        // console.log(response.data);

        this.fromAmount = response.data.value.toString();

        const rateEth = find(response.data.exchange_rates, ['currency', 'ETH']);
        const rateUsd = find(response.data.exchange_rates, ['currency', 'USD']);
        if (rateEth) {
          this.rates.ETH = truncateDecimals(rateEth.value, RATE_TOKEN_DECIMALS);
        }
        if (rateUsd) {
          this.rates.USD = truncateDecimals(rateUsd.value, RATE_USD_DECIMALS);
        }
      })
      .catch((e) => {
        this.isSellingRateLoading = false;
        this.isSellingRateLoaderShow = false;
        this.fromAmount = '0';
        this.rates.ETH = '--';
        this.rates.USD = '--';

        // todo: show error to user (alert or notification or smth else).
      });
  }

  cancelSellingRateRequestIfNeeded(){
    ExchangeService.cancelSellingRateRequestIfNeeded();
  }

  prepareTx(): Promise<TxPayload> {
    this.isTxPreparing = true;
    return multiTokenService.prepareBuyTx(this.fromAmount, this.toAddress)
      .then((response) => {
        this.isTxPreparing = false;

        if (response.data.transactions.length > 1) {
          throw new CustomError({
            message: 'More than one transaction occurred.',
            code: 'MT0001',
          });
        }

        const tx = response.data.transactions[0];
        return {
          from: tx.from_address,
          to: tx.to_address,
          value: tx.value,
          gas: tx.gas_limit,
          gasPrice: tx.gas_price,
          data: tx.data,
        };
      })
      .catch((e) => {
        this.isTxPreparing = false;
        // todo: show error to user (alert or notification or smth else).
        throw e;
      })
  }

  sendTx(payload: TxPayload) {
    this.isWaitingForApprove = true;
    return web3Service.sendTx(payload)
      .on('transactionHash', (hash) => {
        this.isWaitingForApprove = false;
      })
      .on('error', (e) => {
        this.isWaitingForApprove = false;
      })
  }

  getEstimatedFee() {
    const TOKENS_COUNT_DEFAULT = 1;
    const tokensCount = this.toMultiToken.items.length || TOKENS_COUNT_DEFAULT;
    const gas = 1_800_000 + tokensCount * 200_000;

    return web3Service.getGasPrice()
      .then((gasPrice) => {
        // Plus 10 percent.
        const gasPriceWithExtra = web3Service.utils.toBN(gasPrice).divn(100).muln(110);
        return web3Service.utils.toBN(gas).mul(gasPriceWithExtra);
      })
      .catch((e) => {
        // todo: show error to user (alert or notification or smth else).
        throw e;
      })
  }
}
