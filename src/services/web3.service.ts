import { captureException, captureMessage, withScope } from '@sentry/browser';
import { action, observable, when } from 'mobx';
import Web3 from 'web3';
// @ts-ignore
import * as Web3PromiEvent from 'web3-core-promievent';
import PromiEventType from 'web3/promiEvent';
import { TransactionReceipt } from 'web3/types';
import Utils from 'web3/utils';

import ABI from './ABI.json';


// @ts-ignore
const imToken = window.imToken;
const UPDATE_TIME = 1000;

export interface TxPayload {
  // The address for the sending account.
  // Uses the web3.eth.defaultAccount property, if not specified.
  from: string;

  // The destination address of the message,
  // left undefined for a contract-creation transaction.
  to?: string;

  // The value transferred for the transaction in Wei,
  // also the endowment if it's a contract-creation transaction.
  value?: number | string;

  // The amount of gas to use for the transaction
  // (unused gas is refunded).
  gas?: number | string;

  // The price of gas for this transaction in wei,
  // defaults to the mean network gas price.
  gasPrice?: number | string;

  // Either a byte string containing the associated data of the message,
  // or in the case of a contract-creation transaction,
  // the initialisation code.
  data?: string;

  // Integer of a nonce.
  // This allows to overwrite your own pending transactions that
  // use the same nonce.
  nonce?: number;
}

class Web3Service {
  // Providers
  @observable isMetaMask = false;
  @observable isTrust = false;
  @observable isToshi = false;
  @observable isCipher = false;
  @observable isImToken = false;
  @observable isCobo = false;

  // Initialization steps
  @observable hasSupportedProvider = false;  // 1
  @observable isMainNetwork = false;         // 2
  @observable isLoggedIn = false;            // 3
  @observable isAccountReady = false;        // 4 - final step
  @observable isInitializationError = false;  // error

  // Balance in wei string.
  @observable etherBalance = '';

  utils: Utils = Web3.utils;
  private web3: Web3;

  constructor() {
    this.web3 = new Web3();

    if (document.readyState === 'complete') {
      this.checkWeb3Provider();
    } else {
      window.addEventListener('load', () => {
        this.checkWeb3Provider();
      });
    }
  }

  async whenReady() {
    return await when(() => this.isAccountReady);
  }

  async wallet(): Promise<string> {
    return await this.whenReady()
      .then(() => {
        return this.web3.eth.defaultAccount
      })
  }

  getWallet(): string {
    return this.web3.eth.defaultAccount;
  }

  async getTokenBalance(contractAddress: string): Promise<string> {
    const contract = new this.web3.eth.Contract(ABI, contractAddress);
    const wallet = this.getWallet();

    return contract.methods.balanceOf(wallet).call()
      .catch((e) => {
        // todo: show error to user (alert or notification or smth else).
        captureException(e);
        throw e;
      });
  }

  getGasPrice(...args: any[]) {
    return this.web3.eth.getGasPrice(...args);
  }

  getProviderTitle() {
    if (this.isMetaMask) {
      return 'MetaMask';
    }
    if (this.isTrust) {
      return 'Trust Wallet';
    }
    if (this.isToshi) {
      return 'Coinbase Wallet';
    }
    if (this.isCipher) {
      return 'Cipher Wallet';
    }
    return 'wallet';
  }

  sendTx(txData: TxPayload): PromiEventType<TransactionReceipt> {
    if (this.isImToken) {
      const promiEvent = Web3PromiEvent();

      imToken.callAPI('transaction.tokenPay', txData, (error: Error, txHash: string) => {
        if (error) {
          promiEvent.reject(error);
          promiEvent.eventEmitter.emit('error', error);
        } else {
          promiEvent.resolve(txHash);
          promiEvent.eventEmitter.emit('transactionHash', txHash);
        }
      });

      return promiEvent.eventEmitter;
    }

    return this.web3.eth.sendTransaction(txData)
      .on('error', (e) => {
        captureException(e);
      });
  }

  private async getEtherBalance(): Promise<string> {
    const wallet = this.getWallet();
    return this.web3.eth.getBalance(wallet)
      .then((balance: any) => {
        if (balance === null) return '';

        // Use fromWei to wei just because of wrong typings in @types/web3.
        return this.web3.utils.fromWei(balance, 'wei').toString();
      });
  }

  @action
  private updateEtherBalance() {
    if (this.isAccountReady) {
      this.getEtherBalance()
        .then((balance) => {
          this.etherBalance = balance;
          window.setTimeout(() => this.updateEtherBalance(), UPDATE_TIME);
        })
        .catch((e) => {
          this.etherBalance = '';
          window.setTimeout(() => this.updateEtherBalance(), UPDATE_TIME);
          // todo: show error to user (alert or notification or smth else).
          captureException(e);
          throw e;
        });
    } else {
      this.etherBalance = '';
      window.setTimeout(() => this.updateEtherBalance(), UPDATE_TIME);
    }
  }

  private async checkLoggedIn() {
    // Special for imToken.
    if (web3.eth.defaultAccount) {
      this.isLoggedIn = true;
      this.web3.eth.defaultAccount = web3.eth.defaultAccount;
    } else {
      // Other wallets
      let accounts;
      try {
        accounts = await this.web3.eth.getAccounts();
      } catch (e) {
        captureException(e);
      }
      accounts = accounts || [];
      this.isLoggedIn = accounts.length > 0;
      this.web3.eth.defaultAccount = accounts.length > 0 ? accounts[0] : '';
    }

    this.checkAccountReady();
    window.setTimeout(() => this.checkLoggedIn(), UPDATE_TIME);
  }

  private async checkMainNetwork() {
    try {
      const networkId = await this.web3.eth.net.getId();
      if (networkId === 1) {
        this.isMainNetwork = true;
      }
    } catch (e) {
      this.isInitializationError = true;
      captureException(e);
    }
    // We don't need to track changes because of the MetaMask reloads a page.
  }

  private checkAccountReady() {
    this.isAccountReady = (
      this.hasSupportedProvider
      && this.isLoggedIn
      && this.isMainNetwork
    );
  }

  private isSupportedProvider(provider: any) {
    this.isMetaMask = !!provider.isMetaMask; // MetaMask Extension
    this.isTrust = !!provider.isTrust; // Trust Wallet
    this.isToshi = !!provider.isToshi; // CoinBase Wallet (ex. Toshi)
    this.isCipher = !!provider.isCipher; // Cipher Browser
    this.isCobo = !!provider.isCobo; // imToken
    // @ts-ignore
    this.isImToken = !!window.imToken; // imToken

    this.hasSupportedProvider =
      this.isMetaMask || this.isTrust ||
      this.isToshi ||this.isCipher ||
      this.isImToken || this.isCobo;

    return this.hasSupportedProvider;
  }

  private async initWeb3Provider() {
    if (!this.isSupportedProvider(web3.currentProvider)) {
      withScope(scope => {
        scope.setTag('service', 'Web3Service');
        scope.setTag('method', 'initWeb3Provider');
        scope.setExtra('web3_provider', web3.currentProvider);
        captureMessage('Web3 provider is not supported');
      });
      return;
    }

    // @ts-ignore
    if (typeof window.ethereum !== 'undefined') {
      // @ts-ignore
      await window.ethereum.enable();
    } else if (web3.currentProvider.enable) {
      await web3.currentProvider.enable();
      // todo: handle exception.
    }

    this.web3.setProvider(web3.currentProvider);

    try {
      await this.checkLoggedIn();
      await this.checkMainNetwork();

      this.checkAccountReady();
      this.updateEtherBalance();

    } catch (e) {
      this.isInitializationError = true;
      captureException(e);
    }
  }

  private checkWeb3Provider() {
    // Check if Web3 has been injected.
    if (window.hasOwnProperty('web3')) {
      this.initWeb3Provider();
      return
    }

    window.setTimeout(() => { this.checkWeb3Provider() }, 100);
  }
}

const web3Service = new Web3Service();

export default web3Service;
