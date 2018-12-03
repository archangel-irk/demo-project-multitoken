import { Alert, Button, Modal } from 'antd';
import { observer } from 'mobx-react';
import React, { Component, CSSProperties } from 'react';

import { MultiToken, MultiTokenDetail } from '../../../../services/multitoken.service';
import { WalletMultiToken } from '../../../../services/wallet.service';
import web3Service from '../../../../services/web3.service';
import { isMobile } from '../../../../utils/browser';
import { Locale } from '../../../../utils/locale';
import { showBuyingNotice } from '../BuyingNotice/BuyingNotice';
import InstallWalletDesktop, { title as desktopTitle } from '../InstallWalletDesktop/InstallWalletDesktop';
import InstallWalletMobile, { title as mobileTitle } from '../InstallWalletMobile/InstallWalletMobile';
import MTBuyForm from '../MTBuyForm/MTBuyForm';

import s from './MTBuyButton.pcss';


interface Props {
  className?: string;
  buttonStyle?: CSSProperties;
  multiToken: MultiToken | MultiTokenDetail | WalletMultiToken;
}

@observer
class MTBuyButton extends Component<Props, {}> {
  static defaultProps: Partial<Props> = {
    buttonStyle: {},
  };

  state = {
    visible: false,
  }

  constructor(props: Props) {
    super(props);
  }

  showModal = () => {
    this.setState({ visible: true });
  }

  closeModal = () => {
    this.setState({ visible: false });
  }

  handleButtonClick = (e:React.MouseEvent) => {
    showBuyingNotice(this.showModal);
  }

  // todo: manage it!
  // handleOk = (e:React.MouseEvent) => {
  //   this.closeModal();
  // }

  handleCancel = (e:React.MouseEvent) => {
    this.closeModal();
  }

  handleTransactionHash = () => {
    this.closeModal();
  }

  renderInstallWallet() {
    if (web3Service.hasSupportedProvider) {
      return null;
    }

    if (isMobile) {
      return <InstallWalletMobile />;
    }

    return <InstallWalletDesktop />;
  }

  renderWeb3Alerts() {
    if (!web3Service.hasSupportedProvider) {
      return null;
    }

    if (!web3Service.isMainNetwork) {
      return (
        <Alert
          className={s.metaMaskAlert}
          message="Please set your WEB3 wallet to the main network."
          type="error"
        />
      );
    } else if (!web3Service.isLoggedIn) {
      return (
        <Alert
          className={s.metaMaskAlert}
          message={`Please log in to the ${web3Service.getProviderTitle()}.`}
          type="error"
        />
      );
    }
    return null;
  }

  getModalTitle() {
    if (web3Service.hasSupportedProvider) {
      return `${Locale.BUY} MultiToken`;
    }

    return isMobile ? mobileTitle : desktopTitle;
  }

  render() {
    return (
      <>
        <Button
          className={`${s.container} ${this.props.className}`}
          type="primary"
          onClick={this.handleButtonClick}
          style={this.props.buttonStyle}
        >
          {Locale.BUY}
        </Button>
        <Modal
          destroyOnClose={true}
          footer={null}
          onCancel={this.handleCancel}
          title={this.getModalTitle()}
          visible={this.state.visible}
        >
          {this.renderWeb3Alerts()}
          {this.renderInstallWallet()}
          {web3Service.hasSupportedProvider &&
            <MTBuyForm
              multiToken={this.props.multiToken}
              onTransactionHash={this.handleTransactionHash}
            />
          }
        </Modal>
      </>
    );
  }
}

export default MTBuyButton;
