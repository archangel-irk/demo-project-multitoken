import { Alert, Button, Form, Icon, Input, Modal, Select, Tooltip } from 'antd';
import { FormComponentProps } from 'antd/lib/form';
import { ValidationRule } from 'antd/lib/form/Form';
import { SelectValue } from 'antd/lib/select';
import { debounce } from 'lodash-es';
import { observer } from 'mobx-react';
import React, { ChangeEvent, Component, FormEvent } from 'react';

import { MultiToken, MultiTokenDetail } from '../../../../services/multitoken.service';
import { WalletMultiToken } from '../../../../services/wallet.service';
import web3Service from '../../../../services/web3.service';
import {
  alertErrorUnknown, alertMultipleTx, alertPreparingTxFailed,
  alertTransactionRefused,
  alertTxCreated
} from '../../../../utils/alerts';
import { sendEvent } from '../../../../utils/analytics';
import { isMobile } from '../../../../utils/browser';
import { truncateDecimals } from '../../../../utils/format';
import { Locale } from '../../../../utils/locale';
import { isUserDenied, sanitizeNumber, to } from '../../../../utils/utils';

import { MTBuyFormModel } from './MTBuyForm.model';
import s from './MTBuyForm.pcss';


const Option = Select.Option;

const FormItem = Form.Item;
const INPUT_DECIMALS = 18;

function hasErrors(fieldsError: object) {
  return Object.keys(fieldsError).some(field => fieldsError[field]);
}

const amountRules:ValidationRule[] = [
  {
    message: 'Please enter a number (more than zero).',
    required: true,
    validator: (rule, inputString, cb) => {
      const value = parseFloat(inputString);

      if (isNaN(value)) return cb(new Error());
      if (value <= 0) return cb(new Error());

      return cb();
    },
  },
];

function handlePaymentCurrencyChange(value: SelectValue, option: React.ReactElement<any>) {
  if (value === 'ETH') {
    return;
  }

  sendEvent(
    'MultiToken',
    'Buy - Change Payment Currency',
    `${option.props['data-name']} (${value.toString()})`
  );

  Modal.info({
    title: 'Selected token is not supported yet',
    content: 'Please select another one.',
  });
}

const paymentCurrencies = (
  <Select value="ETH" style={{ width: 80 }} onSelect={handlePaymentCurrencyChange}>
    <Option value="ETH">ETH</Option>
    <Option value="USDT" data-name="Tether">USDT</Option>
    <Option value="BNB" data-name="Binance Coin">BNB</Option>
    <Option value="MKR" data-name="Maker">MKR</Option>
    <Option value="ZRX" data-name="0x">ZRX</Option>
    <Option value="OMG" data-name="OmiseGO">OMG</Option>
    <Option value="AE" data-name="Aeternity">AE</Option>
    <Option value="ZIL" data-name="Zilliqa">ZIL</Option>
    <Option value="BAT" data-name="Basic Attention Token">BAT</Option>
    <Option value="NPXS" data-name="Pundi X">NPXS</Option>
    <Option value="TUSD" data-name="TrueUSD">TUSD</Option>
  </Select>
);

interface Props extends FormComponentProps {
  className?: string;
  multiToken: MultiToken | MultiTokenDetail | WalletMultiToken;
  onTransactionHash?: (hash: string) => void;
}

// todo: create MTExchangeForm

@observer
class MTBuyFormComponent extends Component<Props, any> {
  model: MTBuyFormModel;

  constructor(props: Props) {
    super(props);

    this.model = new MTBuyFormModel(props.multiToken);

    this.updateBuyingRate = debounce(this.updateBuyingRate, 250);
    this.updateSellingRate = debounce(this.updateSellingRate, 250);
  }

  componentDidMount() {
    // To disabled submit button at the beginning.
    // this.props.form.validateFields();
  }

  updateBuyingRate(fromAmount: string) {
    const { resetFields, setFieldsValue } = this.props.form;

    this.model.fromAmount = fromAmount;
    this.model.updateBuyingRate()
      .then(() => {
        setFieldsValue({
          fromAmount,
          toAmount: truncateDecimals(this.model.toAmount, INPUT_DECIMALS),
        });
      })
      .catch(() => {
        resetFields(['toAmount']);
      });
  }

  updateSellingRate(toAmount: string) {
    const { resetFields, setFieldsValue } = this.props.form;

    this.model.toAmount = toAmount;
    this.model.updateSellingRate()
      .then(() => {
        setFieldsValue({
          fromAmount: truncateDecimals(this.model.fromAmount, INPUT_DECIMALS),
          toAmount,
        });
      })
      .catch(() => {
        resetFields(['fromAmount']);
      });
  }

  cancelRateUpdatingIfNeeded() {
    this.model.cancelBuyingRateRequestIfNeeded();
    this.model.cancelSellingRateRequestIfNeeded();
  }

  handleFromAmountChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { resetFields, setFieldsValue } = this.props.form;
    const value = sanitizeNumber(e.target.value);

    this.cancelRateUpdatingIfNeeded();
    // Sync sanitized value with input field.
    // Always do it because of cancelling request call above.
    setTimeout(() => {
      setFieldsValue({
        fromAmount: value,
      });
    }, 0);

    this.model.fromAmount = '0';
    this.model.toAmount = '0';
    resetFields(['toAmount']);

    const valueFloat = parseFloat(value);
    if (isNaN(valueFloat)) return;
    if (valueFloat <= 0) return;

    // Sync truncated value with input field.
    // keep trailing decimal point
    const valueTruncated = truncateDecimals(value, INPUT_DECIMALS);
    const val1 = valueTruncated.replace('.', '');
    const val2 = value.replace('.', '');
    if (val1 !== val2) {
      setTimeout(() => {
        setFieldsValue({
          fromAmount: valueTruncated,
        });
      }, 0);
    }

    this.updateBuyingRate(valueTruncated);
  }

  handleToAmountChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { resetFields, setFieldsValue } = this.props.form;
    const value = sanitizeNumber(e.target.value);

    this.cancelRateUpdatingIfNeeded();
    // Sync sanitized value with input field.
    // Always do it because of cancelling request call above.
    setTimeout(() => {
      setFieldsValue({
        toAmount: value,
      });
    }, 0);

    this.model.fromAmount = '0';
    this.model.toAmount = '0';
    resetFields(['fromAmount']);

    const valueFloat = parseFloat(value);
    if (isNaN(valueFloat)) return;
    if (valueFloat <= 0) return;

    // Sync truncated value with input field.
    // keep trailing decimal point
    const valueTruncated = truncateDecimals(value, INPUT_DECIMALS);
    const val1 = valueTruncated.replace('.', '');
    const val2 = value.replace('.', '');
    if (val1 !== val2) {
      setTimeout(() => {
        setFieldsValue({
          toAmount: valueTruncated,
        });
      }, 0);
    }

    this.updateSellingRate(valueTruncated);
  }

  alertSuccess(txHash: string) {
    alertTxCreated(txHash);
  }

  handleTransactionHash = (hash: string) => {
    this.alertSuccess(hash);
    if (this.props.onTransactionHash) {
      this.props.onTransactionHash(hash);
    }
  }

  handleTransactionError = (e: Error) => {
    if (isUserDenied(e.message)) {
      alertTransactionRefused();
    } else {
      alertErrorUnknown();
    }
  };

  async buy() {
    if (!this.model.isAccountReady) return;

    const [e, txPayload] = await to(this.model.prepareTx());
    if (e) {
      if (e.code === 'MT0001') {
        alertMultipleTx();
      } else {
        alertPreparingTxFailed();
      }
      return;
    }

    this.model.sendTx(txPayload)
      .on('transactionHash', this.handleTransactionHash)
      .on('error', this.handleTransactionError)
  }

  handleBalanceButtonClick = async () => {
    const { resetFields, setFieldsValue } = this.props.form;
    this.cancelRateUpdatingIfNeeded();
    this.model.fromAmount = '0';
    this.model.toAmount = '0';
    resetFields(['fromAmount', 'toAmount']);
    const feeBN = await this.model.getEstimatedFee();
    const balanceBN = web3Service.utils.toBN(this.model.balanceWei);
    const fromAmountBN = balanceBN.sub(feeBN);

    let fromAmount = '0';
    if (!fromAmountBN.isNeg()) {
      fromAmount = web3Service.utils.fromWei(fromAmountBN.toString(), 'ether').toString();
    }

    setFieldsValue({
      fromAmount,
    });
    this.updateBuyingRate(fromAmount);
  }

  handleSubmit = (e:FormEvent) => {
    e.preventDefault();
    const { validateFields } = this.props.form;
    validateFields((validationError: any, values: any) => {
      if (validationError) return;

      this.buy();
    });
  }

  getSubmitText() {
    if (this.model.isTxPreparing) {
      return 'Preparing transaction...';
    }

    if (this.model.isWaitingForApprove) {
      return 'Waiting for approve...';
    }

    return Locale.BUY;
  }

  isSubmitDisabled() {
    const { getFieldsError } = this.props.form;

    if (this.model.fromAmount === '0'
      || this.model.toAmount  === '0') {
      return true;
    }

    return hasErrors(getFieldsError()) || !this.model.isAccountReady;
  }

  renderBalanceButton() {
    return (
      <Tooltip
        title={
          <div>
            Click to fill<br />The estimated gas fee will account
          </div>
        }
      >
        <button type="button" onClick={this.handleBalanceButtonClick}>
          MAX: {this.model.formattedBalance}
        </button>
      </Tooltip>
    )
  }

  renderFromLabel() {
    return (
      <div className={s.fromLabel}>
        <div className={s.fromLabelText}>Send</div>
        <Tooltip title="The average gas for bundling is $5" placement="right">
          <Icon type="info-circle" theme="outlined" />
        </Tooltip>
        <div className={s.balance}>
          {this.renderBalanceButton()}
        </div>
      </div>
    );
  }

  renderFromPrefix() {
    return this.model.isSellingRateLoaderShow
      ? <Icon type="loading" />
      : null
  }

  renderFromPlaceholder() {
    return this.model.isSellingRateLoaderShow
      ? ''
      : 'Enter amount';
  }

  renderFromSuffix() {
    return '';
    // return <span style={{ color: 'rgba(0,0,0,.35)' }}>{this.model.fromSymbol}</span>
  }

  renderToPlaceholder() {
    return this.model.isBuyingRateLoaderShow
      ? ''
      : 'Enter amount';
  }

  renderToPrefix() {
    return this.model.isBuyingRateLoaderShow
      ? <Icon type="loading" />
      : null
  }

  renderToSuffix() {
    return <span style={{ color: 'rgba(0,0,0,.35)' }}>{this.model.toSymbol}</span>
  }

  render() {
    const { getFieldDecorator, getFieldError, isFieldTouched } = this.props.form;

    // Only show error after a field is touched.
    const fromAmountError = isFieldTouched('fromAmount') && getFieldError('fromAmount');
    const toAmountError = isFieldTouched('toAmount') && getFieldError('toAmount');

    return (
      <Form
        layout="vertical"
        hideRequiredMark={true}
        onSubmit={this.handleSubmit}
        className={`${s.container} ${this.props.className}`}
      >
        <FormItem
          label={this.renderFromLabel()}
          // @ts-ignore: '' - do not show errors while the first opening.
          validateStatus={fromAmountError ? 'error' : ''}
          help={fromAmountError || ''}
        >
          {getFieldDecorator('fromAmount', {
            rules: amountRules,
            // Disable automatic validation.
            // Validate only when call `props.validateFields()`.
            validateTrigger: '',
          })(
            <Input
              addonAfter={paymentCurrencies}
              autoComplete="off"
              autoFocus={!isMobile}
              onInput={this.handleFromAmountChange}
              placeholder={this.renderFromPlaceholder()}
              prefix={this.renderFromPrefix()}
              suffix={this.renderFromSuffix()}
            />
          )}
        </FormItem>
        <FormItem
          label="Receive"
          // @ts-ignore: '' - do not show errors while the first opening.
          validateStatus={toAmountError ? 'error' : ''}
          help={toAmountError || ''}
          extra="The fees are fixed and don't depend on the amount of receiving tokens."
        >
          {getFieldDecorator('toAmount', {
            rules: amountRules,
            // Disable automatic validation.
            // Validate only when call `props.validateFields()`.
            validateTrigger: '',
          })(
            <Input
              autoComplete="off"
              onChange={this.handleToAmountChange}
              placeholder={this.renderToPlaceholder()}
              prefix={this.renderToPrefix()}
              suffix={this.renderToSuffix()}
            />
          )}
        </FormItem>
        <div className={s.rate}>
          <span>Rate&nbsp;</span>
          <span>1 {this.model.toSymbol}</span>
          <span>&nbsp;=&nbsp;</span>
          <span>{this.model.rates.ETH}&nbsp;ETH&nbsp;</span>
          <span className={s.rateUsd}>(${this.model.rates.USD})</span>
        </div>
        <div style={{ marginBottom: 20 }}>
          Max Price Slippage: 2%
        </div>
        <FormItem>
          <Alert
            className={s.gasNotice}
            message="Gas Price Notice"
            description="Changing gas price value will result in a failed transaction."
            type="warning"
          />
        </FormItem>
        <FormItem>
          <Button
            type="primary"
            htmlType="submit"
            size="large"
            style={{ width: '100%' }}
            disabled={this.isSubmitDisabled()}
            loading={this.model.isTxPreparing || this.model.isWaitingForApprove}
          >
            {this.getSubmitText()}
          </Button>
        </FormItem>
      </Form>
    );
  }
}

const MTBuyForm = Form.create()(MTBuyFormComponent);

export default MTBuyForm;
