import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      header: {
        title: "CryptoSim",
        welcome: "Welcome, Trader!"
      },
      footer: {
        rights: "CryptoSim © 2024. All rights reserved.",
        credit: "Prices powered by Binance API."
      },
      dashboard: {
        title: "My Portfolio",
        totalValue: "Total Value",
        usdBalance: "USD Balance",
        btcHoldings: "Bitcoin Holdings",
        loading: "Loading..."
      },
      tradePanel: {
        title: "Trade Bitcoin",
        currentPrice: "Current Price",
        buyTab: "Buy",
        sellTab: "Sell",
        amountIn: "Amount in {{currency}}",
        max: "Max",
        youWillGet: "You will get",
        youWillReceive: "You will receive",
        insufficientFunds: "Insufficient Funds",
        buyBtc: "Buy BTC",
        sellBtc: "Sell BTC"
      },
      priceChart: {
        loading: "Loading Chart...",
        resetZoom: "Reset Zoom",
        tooltip: {
          price: "Price",
          open: "Open",
          high: "High",
          low: "Low",
          volume: "Volume",
          change: "Change"
        }
      },
      priceChange: {
        calculating: "Calculating...",
        hours: "24h"
      },
      transactionHistory: {
        title: "Transaction History",
        noTransactions: "No transactions yet.",
        type: "Type",
        amount: "Amount",
        value: "Value"
      },
      transactionDetailModal: {
        title: "Transaction Details",
        id: "Transaction ID",
        type: "Type",
        date: "Date",
        time: "Time",
        pricePerBtc: "Price per BTC",
        btcAmount: "BTC Amount",
        totalUsdValue: "Total USD Value"
      },
      errorBoundary: {
        title: "Oops! Something went wrong.",
        message: "We're having trouble loading this section. Please try refreshing the page."
      },
      common: {
        buy: "Buy",
        sell: "Sell"
      },
      languages: {
        en: "English",
        zh: "中文"
      }
    }
  },
  'zh-CN': {
    translation: {
      header: {
        title: "加密模拟",
        welcome: "欢迎，交易员！"
      },
      footer: {
        rights: "加密模拟 © 2024. 版权所有。",
        credit: "价格由币安 API 提供。"
      },
      dashboard: {
        title: "我的投资组合",
        totalValue: "总价值",
        usdBalance: "美元余额",
        btcHoldings: "比特币持有量",
        loading: "加载中..."
      },
      tradePanel: {
        title: "交易比特币",
        currentPrice: "当前价格",
        buyTab: "买入",
        sellTab: "卖出",
        amountIn: "金额 ({{currency}})",
        max: "最大",
        youWillGet: "你将得到",
        youWillReceive: "你将收到",
        insufficientFunds: "资金不足",
        buyBtc: "买入 BTC",
        sellBtc: "卖出 BTC"
      },
      priceChart: {
        loading: "图表加载中...",
        resetZoom: "重置缩放",
        tooltip: {
          price: "价格",
          open: "开盘价",
          high: "最高价",
          low: "最低价",
          volume: "成交量",
          change: "涨跌幅"
        }
      },
      priceChange: {
        calculating: "计算中...",
        hours: "24小时"
      },
      transactionHistory: {
        title: "交易历史",
        noTransactions: "暂无交易记录。",
        type: "类型",
        amount: "数量",
        value: "价值"
      },
      transactionDetailModal: {
        title: "交易详情",
        id: "交易ID",
        type: "类型",
        date: "日期",
        time: "时间",
        pricePerBtc: "单价 (BTC)",
        btcAmount: "BTC 数量",
        totalUsdValue: "总价值 (USD)"
      },
      errorBoundary: {
        title: "哎呀！出错了。",
        message: "加载此部分时遇到问题。请尝试刷新页面。"
      },
      common: {
        buy: "买入",
        sell: "卖出"
      },
      languages: {
        en: "English",
        zh: "中文"
      }
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    lng: 'zh-CN', // Set default language to Chinese
    fallbackLng: 'zh-CN',
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['queryString', 'cookie', 'localStorage', 'sessionStorage', 'navigator', 'htmlTag'],
      caches: ['cookie'],
    },
  });

export default i18n;
