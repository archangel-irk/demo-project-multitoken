import { Alert } from 'antd';
import React, { Component } from 'react';

import { isAndroid, isIOS } from '../../../../utils/browser';

import s from './InstallWalletMobile.pcss';
import logoCoinbase from './logo-coinbase-512px.png';
import logoCipher from './logo-copher-460px.png';
import logoImToken from './logo-imtoken.svg';
import logoTrust from './logo-trustwallet.svg';


export const title = 'Please install a mobile wallet with DApp browser';

interface Props {
  className?: string;
}

class InstallWalletMobile extends Component<Props, {}> {
  constructor(props: Props) {
    super(props);
  }

  getTrustLink() {
    if (isIOS) {
      return 'https://itunes.apple.com/us/app/trust-ethereum-wallet/id1288339409';
    }

    if (isAndroid) {
      return 'https://play.google.com/store/apps/details?id=com.wallet.crypto.trustapp';
    }

    return 'https://trustwalletapp.com/';
  }

  getCoinbaseLink() {
    if (isIOS) {
      return 'https://itunes.apple.com/app/coinbase-wallet/id1278383455';
    }

    if (isAndroid) {
      return 'https://play.google.com/store/apps/details?id=org.toshi';
    }

    return 'https://wallet.coinbase.com/';
  }

  getImTokenLink() {
    if (isIOS) {
      return 'https://itunes.apple.com/us/app/imtoken2/id1384798940';
    }

    if (isAndroid) {
      return 'https://play.google.com/store/apps/details?id=im.token.app';
    }

    return 'https://token.im';
  }

  getCipherLink() {
    if (isIOS) {
      return 'https://itunes.apple.com/app/cipher-browser-for-ethereum/id1294572970';
    }

    if (isAndroid) {
      return 'https://play.google.com/store/apps/details?id=com.cipherbrowser.cipher';
    }

    return 'https://www.cipherbrowser.com/';
  }

  render() {
    return (
      <div className={`${s.container} ${this.props.className}`}>
        <div className={s.description}>
          <ul className={s.walletList}>
            <li>
              <a href={this.getTrustLink()} target="_blank">
                <img className={s.logoImg} alt="Trust Wallet logo" src={logoTrust} />
                Get the Trust Wallet
              </a>
            </li>
            <li>
              <a href={this.getCoinbaseLink()} target="_blank">
                <img className={s.logoImg} alt="Coinbase Wallet logo" src={logoCoinbase} />
                Get the Coinbase Wallet
              </a>
            </li>
            <li>
              <a href={this.getImTokenLink()} target="_blank">
                <img className={s.logoImg} alt="imToken Wallet logo" src={logoImToken} />
                Get the imToken Wallet
              </a>
            </li>
            <li>
              <a href={this.getCipherLink()} target="_blank">
                <img className={s.logoImg} alt="Cipher Wallet logo" src={logoCipher} />
                Get the Cipher Wallet
              </a>
            </li>
          </ul>

          <Alert
            className={s.why}
            message="Why do we need mobile wallet?"
            description={
              <ul className={s.whyList}>
                <li>Your private key only stored locally</li>
                <li>Full support for any ERC20 and ERC223 tokens on Ethereum network</li>
                <li>We will never access any of your personal information</li>
              </ul>
            }
            type="info"
          />
        </div>
      </div>
    );
  }
}

export default InstallWalletMobile;
