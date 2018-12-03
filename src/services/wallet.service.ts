import { captureException } from '@sentry/browser';
import axios from 'axios';

import { camelize, mapKeysDeep } from '../utils/utils';

import web3Service from './web3.service';


export interface WalletToken {
  address: string;
  icon: string;
  marketCap: number;
  name: string;
  percentChange24H: number;
  price: number;
  symbol: string;
  uid: string;
}

export interface WalletMultiTokenItem {
  percent: number;
  token: WalletToken;
}

export interface WalletMultiToken {
  address: string;
  icon: string;
  items: WalletMultiTokenItem[];
  name: string;
  percentChange24H: string;
  price: string;
  symbol: string;
  uid: string;
}

export interface WalletMultiTokenExtra {
  amount: string;
  multiToken: WalletMultiToken;
  profitEth: string;
  profitUsd: string;
}

// RESPONSES //
interface WalletTokenResponse {
  address: string;
  icon: string;
  market_cap: number;
  name: string;
  percent_change_24h: number;
  price: number;
  symbol: string;
  uid: string;
}

interface WalletMultiTokenItemResponse {
  percent: number;
  token: WalletTokenResponse;
}

interface WalletMultiTokenResponse {
  address: string;
  icon: string;
  items: WalletMultiTokenItemResponse[];
  name: string;
  percent_change_24h: string;
  price: string;
  symbol: string;
  uid: string;
}

interface WalletMultiTokensResponse {
  amount: string;
  multi_token: WalletMultiTokenResponse;
  profit_eth: string;
  profit_usd: string;
}


class WalletService {
  static MULTI_TOKENS_URL = '/api/v1/wallets/{address}/multi-tokens';
  static MULTI_TOKEN_URL = '/api/v1/wallets/{address}/multi-tokens/{multiTokenAddress}';

  async getMultiTokens(): Promise<WalletMultiTokenExtra[]> {
    const wallet = await web3Service.wallet();
    const url = WalletService.MULTI_TOKENS_URL
      .replace('{address}', wallet);

    return axios
      .get<WalletMultiTokensResponse[]>(url)
      .then((response) => {
        return mapKeysDeep(response.data, camelize);
      })
      .catch((e) => {
        captureException(e);
        throw e;
      })
  }

  async getMultiToken(multiTokenAddress: string): Promise<WalletMultiTokenExtra> {
    const wallet = await web3Service.wallet();
    const url = WalletService.MULTI_TOKEN_URL
      .replace('{address}', wallet)
      .replace('{multiTokenAddress}', multiTokenAddress);

    return axios
      .get<WalletMultiTokensResponse>(url)
      .then((response) => {
        return mapKeysDeep(response.data, camelize);
      })
      .catch((e) => {
        captureException(e);
        throw e;
      })
  }
}

const walletService = new WalletService();
export { walletService };
