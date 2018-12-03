import { Modal } from 'antd';
import * as React from 'react';

const telegramLink = <a href="https://t.me/MultiToken" target="_blank">Telegram</a>;
const intercomLink = (
  <a onClick={() => {Intercom('showNewMessage');}}>Intercom</a>
);

function getSupportLink() {
  return Intercom ?
    intercomLink :
    telegramLink;
}

export function alertTransactionRefused() {
  Modal.info({
    title: 'You have refused the transaction',
    content: (
      <>
        If something wrong, just try again or contact our team in {getSupportLink()}.
      </>
    ),
  });
}

export function alertErrorUnknown() {
  Modal.error({
    title: 'Whooops! Something went wrong',
    content: (
      <>
        Please try again later or contact our team in {getSupportLink()}.
      </>
    ),
  });
}

export function alertPreparingTxFailed() {
  Modal.error({
    title: 'Whooops! Something went wrong',
    content: (
      <>
        Preparing transaction was failed. Please try again later or contact our team in {getSupportLink()}.
      </>
    ),
  });
}

export function alertMultipleTx() {
  Modal.error({
    title: 'Whooops! Something went wrong',
    // todo: correct message
    content: (
      <>
        Bancor is not available. Please try again later or contact our team in {getSupportLink()}.
      </>
    ),
  });
}

export function alertTxCreated(txHash: string) {
  Modal.success({
    title: 'Congratulation!',
    content: (
      <div>
        Pending transaction
        <br />
        <a href={`https://etherscan.io/tx/${txHash}`} target="_blank">{txHash}</a>
      </div>
    ),
  });
}
