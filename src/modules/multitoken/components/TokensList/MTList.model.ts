import {
  action,
  observable,
} from 'mobx';

import { multiCoinService, MultiCoinShort } from '../../../../services/multicoin.service';
import { MultiToken, multiTokenService } from '../../../../services/multitoken.service';


export class MTListModel {
  @observable isLoading = false;
  @observable data: Array<MultiToken | MultiCoinShort> = [];

  @action
  load(isLoadCoins: boolean = false) {
    this.isLoading = true;

    if (isLoadCoins) {
      return Promise.all([
          multiTokenService.getMultiTokens(),
          multiCoinService.getMultiCoins(),
        ])
        .then((result) => {
          this.isLoading = false;
          this.data = [
            ...result[0],
            ...result[1],
          ];
        })
        .catch((e) => {
          this.isLoading = false;
          // todo: show error to user (alert or notification or smth else).
        })
    }

    return multiTokenService.getMultiTokens()
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
