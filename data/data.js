window.GALOK_DATA = {
  // 2020–2023 is defined as the pandemic window and rendered as a highlighted band
  // across every chart on this page.
  pandemicRange: { start: 2020, end: 2023, label: "疫情三年 · 2020–2023" },

  indicators: [
    {
      id: "gdp",
      series: "macro",
      name: "GDP 增速",
      nameEn: "Real GDP growth",
      unit: "%",
      source: "国家统计局 · National Bureau of Statistics",
      sourceUrl: "https://www.stats.gov.cn/",
      note: "年度实际GDP同比增速",
      status: "complete",
      values: {
        2000: 8.5, 2001: 8.3, 2002: 9.1, 2003: 10.0, 2004: 10.1,
        2005: 11.4, 2006: 12.7, 2007: 14.2, 2008: 9.7, 2009: 9.4,
        2010: 10.6, 2011: 9.6, 2012: 7.9, 2013: 7.8, 2014: 7.3,
        2015: 6.9, 2016: 6.7, 2017: 6.9, 2018: 6.7, 2019: 6.0,
        2020: 2.2, 2021: 8.4, 2022: 3.0, 2023: 5.2, 2024: 5.0, 2025: 5.0
      }
    },
    {
      id: "cpi",
      series: "scene",
      name: "CPI 涨幅",
      nameEn: "Consumer Price Index, YoY",
      unit: "%",
      source: "国家统计局 · National Bureau of Statistics",
      sourceUrl: "https://www.stats.gov.cn/",
      note: "居民消费价格指数，上年=100，同比涨跌幅",
      status: "complete",
      values: {
        2000: 0.4, 2001: 0.7, 2002: -0.8, 2003: 1.2, 2004: 3.9,
        2005: 1.8, 2006: 1.5, 2007: 4.8, 2008: 5.9, 2009: -0.7,
        2010: 3.3, 2011: 5.4, 2012: 2.6, 2013: 2.6, 2014: 2.0,
        2015: 1.4, 2016: 2.0, 2017: 1.6, 2018: 2.1, 2019: 2.9,
        2020: 2.5, 2021: 0.9, 2022: 2.0, 2023: 0.2, 2024: 0.2, 2025: 0.0
      }
    },
    {
      id: "ppi",
      series: "frame",
      name: "PPI 涨幅",
      nameEn: "Producer Price Index, YoY",
      unit: "%",
      source: "国家统计局 · National Bureau of Statistics",
      sourceUrl: "https://www.stats.gov.cn/",
      note: "工业生产者出厂价格指数，同比涨跌幅。完整2000–2025序列尚未核验，当前仅收录已确认年份，其余留空——用 /scripts/scrape_nbs.py 从国家统计局补全。",
      status: "partial",
      values: {
        2008: 6.9,
        2009: -5.4,
        2025: -2.7
      }
    },
    {
      id: "retail",
      series: "macro",
      name: "社会消费品零售总额增速",
      nameEn: "Retail sales of consumer goods, YoY",
      unit: "%",
      source: "国家统计局 · National Bureau of Statistics",
      sourceUrl: "https://www.stats.gov.cn/",
      note: "社会消费品零售总额同比增速。完整2000–2025序列尚未核验，当前仅收录已确认年份——用 /scripts/scrape_nbs.py 从国家统计局补全。",
      status: "partial",
      values: {
        2020: -3.9,
        2021: 12.5,
        2022: -0.2,
        2023: 7.2,
        2025: 3.7
      }
    }
  ]
};
