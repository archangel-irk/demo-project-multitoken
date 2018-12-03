import {
  action,
  observable,
} from 'mobx';

import { WalletMultiTokenExtra, walletService } from '../../../../services/wallet.service';


export class MTMyListModel {
  @observable isLoading = false;
  @observable data: WalletMultiTokenExtra[] = [];

  @action
  load() {
    this.isLoading = true;

    return walletService.getMultiTokens()
      .then((data) => {
        this.isLoading = false;
        this.data = data;
      })
      .catch((e) => {
        this.isLoading = false;
        // todo: show error to user (alert or notification or smth else).
      })
  }
}
