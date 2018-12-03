import { Alert, Button } from 'antd';
import React, { Component } from 'react';

import s from './InstallWalletDesktop.pcss';
import logoMetaMask from './logo-metamask.svg';


export const title = 'Please install MetaMask extension';

interface Props {
  className?: string;
}

class InstallWalletDesktop extends Component<Props, {}> {
  constructor(props: Props) {
    super(props);
  }

  render() {
    return (
      <div className={`${s.container} ${this.props.className}`}>
        <div className={s.description}>
          <img className={s.logoImg} alt="MetaMask logo" src={logoMetaMask} />
          <Alert
            className={s.why}
            message="Why do we need MetaMask?"
            description={
              <ul className={s.whyList}>
                <li>Your private key only stored locally</li>
                <li>Full support for any ERC20 and ERC223 tokens on Ethereum network</li>
                <li>We will never access any of your personal information</li>
              </ul>
            }
            type="info"
          />
          <a href="https://metamask.io/" target="_blank" className={s.installButton}>
            <Button type="primary">Install</Button>
          </a>
          <span className={s.buttonDescription}>Please reload the page after installation.</span>
          <span className={s.buttonDescription}>
            I already have MetaMask. <a onClick={() => window.location.reload()}>Reload page.</a>
          </span>
        </div>
      </div>
    );
  }
}

export default InstallWalletDesktop;
