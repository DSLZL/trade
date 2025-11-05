
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      header: {
        title: "CryptoSim",
        welcome: "Welcome, Trader!",
        homeLink: "CryptoSim homepage",
        languageSwitcher: "Language switcher",
        userProfile: "User profile",
        login: "Login",
        logout: "Logout",
        nav: {
            dashboard: "Dashboard",
            history: "History"
        },
        tooltips: {
          switchToEn: "Switch to English",
          switchToZh: "Switch to Chinese"
        }
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
        loading: "Loading...",
        tooltips: {
          totalValue: "Your total portfolio value (USD Balance + BTC Holdings at current price).",
          usdBalance: "Your available virtual cash for trading.",
          btcHoldings: "The total amount of virtual Bitcoin you own."
        }
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
        sellBtc: "Sell BTC",
        tooltips: {
            max: "Fill with your maximum available balance.",
            amountInput: "Enter the amount you wish to trade.",
            tradeDisabled: "Please enter a valid amount to trade.",
            buyConfirm: "Review and confirm your BTC purchase.",
            sellConfirm: "Review and confirm selling your BTC."
        },
        confirmation: {
          title: "Confirm Your Order",
          action: "Action",
          price: "Price",
          amount: "Amount",
          total: "Total"
        }
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
        noMatch: "No transactions match your filters.",
        type: "Type",
        amount: "Amount",
        value: "Value",
        filters: {
          type: "Type",
          all: "All",
          buy: "Buy",
          sell: "Sell",
          startDate: "Start Date",
          endDate: "End Date",
          clear: "Clear"
        },
        tooltips: {
            viewDetails: "Click to view transaction details"
        }
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
      liveTradeFeed: {
        title: "Live Market Trades",
        price: "Price (USDT)",
        amount: "Amount (BTC)",
        time: "Time"
      },
      errorBoundary: {
        title: "Oops! Something went wrong.",
        message: "We're having trouble loading this section. Please try refreshing the page."
      },
      notifications: {
        insufficientUsd: "Insufficient USD balance.",
        insufficientBtc: "Insufficient BTC balance.",
        buySuccess: "Successfully bought {{amount}} {{currency}}.",
        sellSuccess: "Successfully sold {{amount}} {{currency}}."
      },
      common: {
        buy: "Buy",
        sell: "Sell",
        confirm: "Confirm",
        cancel: "Cancel",
        connected: "Connected",
        disconnected: "Disconnected",
        waitingForTrades: "Waiting for trades...",
        connecting: "Connecting...",
        authenticating: "Authenticating..."
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
        welcome: "欢迎，交易员！",
        homeLink: "CryptoSim 首页",
        languageSwitcher: "语言切换器",
        userProfile: "用户资料",
        login: "登录",
        logout: "登出",
        nav: {
            dashboard: "仪表盘",
            history: "交易历史"
        },
        tooltips: {
          switchToEn: "切换到英语",
          switchToZh: "切换到中文"
        }
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
        loading: "加载中...",
        tooltips: {
          totalValue: "您的总投资组合价值（美元余额 + 当前价格的比特币持有量）。",
          usdBalance: "您可用于交易的虚拟现金余额。",
          btcHoldings: "您拥有的虚拟比特币总量。"
        }
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
        sellBtc: "卖出 BTC",
        tooltips: {
            max: "填入您的全部可用余额。",
            amountInput: "请输入您希望交易的金额。",
            tradeDisabled: "请输入有效的交易金额。",
            buyConfirm: "检查并确认您的比特币购买订单。",
            sellConfirm: "检查并确认您的比特币卖出订单。"
        },
        confirmation: {
          title: "确认您的订单",
          action: "操作",
          price: "价格",
          amount: "数量",
          total: "总计"
        }
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
        noMatch: "没有符合筛选条件的交易。",
        type: "类型",
        amount: "数量",
        value: "价值",
        filters: {
          type: "类型",
          all: "全部",
          buy: "买入",
          sell: "卖出",
          startDate: "开始日期",
          endDate: "结束日期",
          clear: "清除"
        },
        tooltips: {
            viewDetails: "点击查看交易详情"
        }
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
      liveTradeFeed: {
        title: "实时市场交易",
        price: "价格 (USDT)",
        amount: "数量 (BTC)",
        time: "时间"
      },
      errorBoundary: {
        title: "哎呀！出错了。",
        message: "加载此部分时遇到问题。请尝试刷新页面。"
      },
      notifications: {
        insufficientUsd: "美元余额不足。",
        insufficientBtc: "比特币余额不足。",
        buySuccess: "成功买入 {{amount}} {{currency}}。",
        sellSuccess: "成功卖出 {{amount}} {{currency}}。"
      },
      common: {
        buy: "买入",
        sell: "卖出",
        confirm: "确认",
        cancel: "取消",
        connected: "已连接",
        disconnected: "已断开",
        waitingForTrades: "等待交易...",
        connecting: "连接中...",
        authenticating: "认证中..."
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
