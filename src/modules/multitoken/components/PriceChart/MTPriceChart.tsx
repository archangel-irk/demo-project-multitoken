// Typings under WIP.
// https://github.com/highcharts/highcharts/issues/4876
// @ts-ignore
import * as Highcharts from 'highcharts/highstock';
import { cloneDeep, defaultsDeep } from 'lodash-es';
import { observer } from 'mobx-react';
import React, { Component, RefObject } from 'react';

import { BreakPoints } from '../../../../utils/browser';
import { ChartPeriod } from '../../../../utils/enums';

import { MTPriceChartModel } from './MTPriceChart.model';
import s from './MTPriceChart.pcss';


// const BITCOIN_COLOR = '#ffd484';
const MULTI_TOKEN_COLOR = '#a049ff';

interface Props {
  // address for MultiTokens or uid for MultiCoins
  id: string,
  symbol: string,
  isCoin?: boolean;
}

// https://github.com/highcharts/highcharts-react/blob/master/src/HighchartsReact.js
@observer
class MTPriceChart extends Component<Props, any> {
  model: MTPriceChartModel;
  chart: any;
  chartContainer: RefObject<any>;
  chartOptionsDefault: {};

  constructor(props: Props) {
    super(props);

    this.model = new MTPriceChartModel(props.id, props.symbol, props.isCoin);
    this.chartContainer = React.createRef();

    const self = this;
    this.chartOptionsDefault = {
      chart: {
        height: 300,
      },
      credits: {
        enabled: false,
        href: 'https://multitoken.io/',
        text: 'MultiToken',
      },
      rangeSelector: {
        allButtonsEnabled: true,
        buttons: [
          {
            type: 'day',
            count: 1,
            text: '1d',
            events: {
              click() {
                // Note: `this` is a button config object.

                self.model.period = ChartPeriod.ONE_DAY;
                self.loadChartData();

                // Return false to stop default button's click action.
                return false;
              }
            },
          },
          {
            type: 'day',
            count: 7,
            text: '7d',
            events: {
              click() {
                self.model.period = ChartPeriod.SEVEN_DAYS;
                self.loadChartData();
                return false;
              }
            },
          },
          {
            type: 'month',
            count: 1,
            text: '1m',
            events: {
              click() {
                self.model.period = ChartPeriod.ONE_MONTH;
                self.loadChartData();
                return false;
              }
            },
          },
          {
            type: 'month',
            count: 3,
            text: '3m',
            events: {
              click() {
                self.model.period = ChartPeriod.THREE_MONTHS;
                self.loadChartData();
                return false;
              }
            },
          },
          {
            type: 'year',
            count: 1,
            text: '1y',
            events: {
              click() {
                self.model.period = ChartPeriod.ONE_YEAR;
                self.loadChartData();
                return false;
              }
            },
          },
        ],
        buttonPosition: {
          align: 'right',
        },
        inputEnabled: false,
        labelStyle: {
          display: 'none',
        },
      },
      navigator: {
        enabled: false,
      },
      scrollbar: {
        enabled: false,
      },
      tooltip: {
        valueDecimals: 6,
      },
      title: {
        align: 'left',
        // floating: true,
        text: 'Token Price',
        margin: 0,
        style: {
          'font-family': 'Roboto, "Chinese Quote", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Helvetica Neue", Helvetica, Arial, sans-serif',
          'font-size': '24px',
          'color': '#2d2f32',
        },
        x: -10,
      },
      responsive: {
        rules: [
          {
            condition: {
              maxWidth: BreakPoints.SM,
            },
            chartOptions: {
              chart: {
                pinchType: '', // disable zoom on mobile devices
              },
              title: {
                floating: false,
              },
              rangeSelector: {
                buttonTheme: {
                  padding: 10,
                },
                verticalAlign: 'bottom',
                y: 10,
              },
            },
          },
          {
            condition: {
              minWidth: BreakPoints.SM,
            },
            chartOptions: {
              title: {
                // floating: true,
              },
              rangeSelector: {
                verticalAlign: 'top',
                y: -20,
                // x: -100, // bug fix for second series
              },
              yAxis: [
                {
                  labels: {
                    align: 'left',
                  },
                }
              ],
            },
          },
          {
            condition: {
              minWidth: BreakPoints.LG,
            },
            chartOptions: {
              chart: {
                height: 400,
              },
            },
          },
        ]
      },
      xAxis: {
        labels: {
          style: {
            color: '#8e9eb2',
          },
        },
      },
    }
  }

  getOptions() {
    return defaultsDeep(
      {
        series: [
          {
            name: this.model.symbol,
            data: this.model.mtHistory,
            color: MULTI_TOKEN_COLOR,
            tooltip: {
              valuePrefix: '$',
            },
          },
          // {
          //   name: 'BTC',
          //   data: this.model.btcHistory,
          //   yAxis: 1,
          //   color: BITCOIN_COLOR,
          //   tooltip: {
          //     valueDecimals: 2,
          //     valuePrefix: '$',
          //   },
          // },
        ],
        yAxis: [
          {
            title: {
              // text: 'Price MultiToken (USD)',
              text: 'Price (USD)',
              style: {
                color: MULTI_TOKEN_COLOR,
              },
            },
            labels: {
              format: '${value:.2f}',
              style: {
                color: MULTI_TOKEN_COLOR,
              },
            },
            // opposite: false,
          },
          // {
          //   title: {
          //     text: 'Price Bitcoin',
          //     style: {
          //       color: BITCOIN_COLOR,
          //     },
          //   },
          //   labels: {
          //     format: '${value:,.0f}',
          //     style: {
          //       color: BITCOIN_COLOR,
          //     }
          //   },
          //   opposite: true,
          // },
        ],
      },
      this.chartOptionsDefault,
    );
  }

  loadChartData() {
    this.chart.showLoading();
    this.model.load()
      .then(() => {
        this.chartUpdate();
        this.chart.hideLoading();
      });

    // this.model.loadBTC()
    //   .then(() => {
    //     this.chartUpdate();
    //   })

    // http://localhost:3000/api/v1/multi-coins/BTC/prices/1d
    // https://api-staging.multitoken.io/v1/coins/BTC/prices/1d
  }

  chartUpdate() {
    // Docs https://api.highcharts.com/class-reference/Highcharts.Chart#update
    const redraw = true;
    const oneToOne = true;
    const animation = true;

    this.chart.update(
      this.getOptions(),
      redraw,
      oneToOne,
      animation,
    );
  }

  componentDidMount() {
    this.chart = Highcharts.stockChart(
      this.chartContainer.current,
      cloneDeep(this.chartOptionsDefault),
    );

    this.loadChartData();
  }

  componentWillUnmount() {
    this.chart.destroy();
  }

  render() {
    return (
      <div className={s.container} ref={this.chartContainer} />
    );
  }
}

export default MTPriceChart;
