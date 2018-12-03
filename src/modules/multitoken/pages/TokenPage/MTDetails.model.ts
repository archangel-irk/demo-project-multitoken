import {
  action,
  observable,
} from 'mobx';

import { MultiCoinDetail, multiCoinService } from '../../../../services/multicoin.service';
import { MultiTokenDetail, multiTokenService } from '../../../../services/multitoken.service';
import { WalletMultiTokenExtra, walletService } from '../../../../services/wallet.service';
import { HttpStatus } from '../../../../utils/enums';


export class MTDetailsModel {
  @observable isLoading = false;
  @observable isError = false;
  @observable isNotFound = false;
  @observable data?: MultiTokenDetail | MultiCoinDetail;
  @observable walletData?: WalletMultiTokenExtra;

  // address for MultiTokens or uid for MultiCoins
  id?: string;
  isCoin = false;

  constructor(id?: string, isCoin?: boolean) {
    this.id = id;
    this.isCoin = !!isCoin;
  }

  @action
  load() {
    if (this.id === undefined) {
      this.isNotFound = true;
      return;
    }

    if (this.isCoin) {
      this.loadCoin();
      return;
    }

    this.loadWallet();
    this.loadToken();
  }

  @action
  private loadToken() {
    if (this.id === undefined) return;

    this.isLoading = true;
    multiTokenService.getMultiToken(this.id)
      .then((data) => {
        this.isLoading = false;
        this.data = data;
      })
      .catch((e) => {
        this.isLoading = false;
        this.isError = true;

        if (e.response && e.response.status === HttpStatus.NOT_FOUND) {
          this.isNotFound = true;
        }
      })
  }

  @action
  private loadCoin() {
    if (this.id === undefined) return;

    this.isLoading = true;
    multiCoinService.getMultiCoin(this.id)
      .then((data) => {
        this.isLoading = false;
        this.data = data;
      })
      .catch((e) => {
        this.isLoading = false;
        this.isError = true;

        if (e.response && e.response.status === HttpStatus.NOT_FOUND) {
          this.isNotFound = true;
        }
      })
  }

  @action
  private loadWallet() {
    if (this.id === undefined) return;

    walletService.getMultiToken(this.id)
      .then((data) => {
        this.walletData = data;
      })
      .catch((e) => {
        // todo: show error to user (alert or notification or smth else).
      })
  }
}
