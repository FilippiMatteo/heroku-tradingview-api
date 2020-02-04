import {Component, OnInit, Input} from '@angular/core';
import {HttpClient} from '@angular/common/http';

import {createChart, CrosshairMode, PriceScaleMode} from 'lightweight-charts';


@Component({
  selector: 'app-chart',
  templateUrl: './chart.component.html',
})
export class ChartComponent implements OnInit {

  constructor(private httpClient: HttpClient) {
  }

  // private url = 'https://api.cryptowat.ch/markets/kraken/btcusd/ohlc?periods=3600&after=1577836800';

  // tslint:disable-next-line:ban-types
  bars: Object = [];
  literalBars = [];
  volumes = [];
  market = [
    {time: 'kraken', label: 'kraken'},
    {time: 'bitstamp', label: 'bitstamp'},
    {time: 'bitfinex', label: 'bitfinex'},
    {time: 'okcoin', label: 'okcoin'},
    {time: 'huobi', label: 'huobi'},
  ];
  currency = [
    {label: 'BTC/USD', value: 'btcusd'},
    {label: 'BTC/EUR', value: 'btceur'},
    {label: 'LTC/EUR', value: 'ltceur'},
    {label: 'LTC/USD', value: 'ltcusd'},
    {label: 'LTC/BTC', value: 'ltcbtc'},
    {label: 'ETH/BTC', value: 'ethbtc'},
    {label: 'ETH/USD', value: 'ethusd'},
    {label: 'DGC/BTC', value: 'dogebtc'},

  ];

  timeCandlesStick = [
    {time: '1800', label: '30m'},
    {time: '3600', label: '1h'},
    {time: '14400', label: '4h'},
    {time: '86400', label: '1D'},
    {time: '604800', label: '1W'},
  ];
  selected: any;

  // default value
  selectedTimeFrame = '1800';
  selectedMarket = 'kraken';
  selectedCurrency = 'btcusd';

  chart;
  candleSeries;
  volumeSeries;


  get_call() {
    // tslint:disable-next-line:max-line-length
    const url = `https://cryptowatch-server-api.herokuapp.com/api?market=${this.selectedMarket}&currency=${this.selectedCurrency}&timeFrame=${this.selectedTimeFrame}`;
    // const url = 'https://api.cryptowat.ch/markets/kraken/btcusd/ohlc?periods=3600&after=1577836800';
    return this.httpClient.get(url)
      .map(x => {
        // @ts-ignore
        this.bars = x.bars.result[this.selectedTimeFrame];
        this.createBars();
      });
  }


  createBars() {


    function dateToChartTime(date) {
      return Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds(), 0) / 1000;
    }

    // tslint:disable-next-line:one-variable-per-declaration
    let data;
    // @ts-ignore
    // tslint:disable-next-line:prefer-for-of
    for (let i = 0; i < this.bars.length; i++) {
      data = new Date((this.bars[i][0]) * 1000);
      this.literalBars.push(
        {
          /* time: {
             year: data.getFullYear(),
             month: data.getMonth() + 1,
             day: data.getDate(),
             hour: data.getHours(),
             minute: data.getMinutes()
           }, */
          time: dateToChartTime(data),
          open: this.bars[i][1],
          high: this.bars[i][2],
          low: this.bars[i][3],
          close: this.bars[i][4]
        }
      );
      this.volumes.push({
        /* time: {
           year: data.getFullYear(),
           month: data.getMonth() + 1,
           day: data.getDate(),
           hour: data.getHours(),
           minute: data.getMinutes()
         },*/
        time: dateToChartTime(data),

        // il volume = "taker buy base asset volume" + "taker sell base asset volume"
        value: this.bars[i][5] + this.bars[i][6],
        //  A green volume bar means that the stock closed higher on that day verses the previous day’s close.
        //  A red volume bar means that the stock closed lower on that day compared to the previous day’s close
        color: i > 0 && this.bars[i][5] + this.bars[i][6] < this.bars[i - 1][5] + this.bars[i - 1][6] ?
          'rgba(255,82,82, 0.8)' : 'rgba(0, 150, 136, 0.8)'
      });
    }

  }


  ngOnInit() {

    this.get_call()
      .subscribe(x => {
        this.candleSeries.setData(this.literalBars);
        this.volumeSeries.setData(this.volumes);

      });


    this.chart = createChart(document.body, {

      width: innerWidth - 15,
      height: innerHeight - 60,

      layout: {
        backgroundColor: '#000000',
        textColor: 'rgba(255, 255, 255, 0.9)',
      },
      grid: {
        vertLines: {
          color: 'rgba(197, 203, 206, 0.5)',
        },
        horzLines: {
          color: 'rgba(197, 203, 206, 0.5)',
        },
      },
      crosshair: {
        mode: CrosshairMode.Magnet,
      },
      priceScale: {
        borderColor: 'rgba(197, 203, 206, 0.8)',
        mode: PriceScaleMode.Logarithmic,
        scaleMargins: {
          top: 0.1,
          bottom: 0.1,
        },
      },
      timeScale: {
        borderColor: 'rgba(197, 203, 206, 0.8)',
        timeVisible: true,
        secondsVisible: false
      },
    });
    this.candleSeries = this.chart.addCandlestickSeries({
      upColor: 'rgb(0,255,3)',
      downColor: '#ff2000',
      borderDownColor: '#ff2000',
      borderUpColor: 'rgb(0,255,3)',
      wickDownColor: '#ff2000',
      wickUpColor: 'rgb(0,255,3)',
    });
    this.volumeSeries = this.chart.addHistogramSeries({
      color: '#26a69a',
      lineWidth: 2,
      priceFormat: {
        type: 'volume',
      },
      overlay: true,
      scaleMargins: {
        top: 0.8,
        bottom: 0,
      },
    });


  }

  selectMarketHandler(event: any) {
    this.selectedMarket = event.target.value;
    this.literalBars = [];
    this.volumes = [];
    // @ts-ignore
    this.get_call().subscribe(x => {
      this.resetchart();
    });
  }

  selectCurrencyHandler(event: any) {
    this.selectedCurrency = event.target.value;
    this.literalBars = [];
    this.volumes = [];
    // @ts-ignore
    this.get_call().subscribe(x => {
      this.resetchart();
    });
  }

  selectTimeHandler(event: any) {
    this.selectedTimeFrame = event.target.value;
    this.literalBars = [];
    this.volumes = [];
    // @ts-ignore
    this.get_call().subscribe(x => {
      this.resetchart();
    });
  }

  resetchart() {

    this.chart.timeScale().resetTimeScale();
    this.chart.timeScale().scrollPosition();
    this.chart.timeScale().fitContent();
    this.candleSeries.setData([]);
    this.volumeSeries.setData([]);
    this.candleSeries.setData(this.literalBars);
    this.volumeSeries.setData(this.volumes);
  }
}
