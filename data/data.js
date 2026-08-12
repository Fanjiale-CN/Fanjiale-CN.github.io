window.GALOK_DATA = {
  range: { start: 2000, end: 2024, label: "25 complete annual observations" },
  disruptionRange: { start: 2020, end: 2023, label: "Disruption window · 2020–2023" },
  lastUpdated: "2026-07-13",
  source: "World Bank — World Development Indicators",
  sourceUrl: "https://data.worldbank.org/country/china",
  license: "CC BY 4.0",

  indicators: [
    {
      id: "gdp",
      series: "macro",
      name: "GDP growth",
      nameEn: "Real GDP growth",
      unit: "%",
      indicatorCode: "NY.GDP.MKTP.KD.ZG",
      source: "World Development Indicators",
      sourceDetail: "Country official statistics, OECD national accounts files and World Bank estimates.",
      sourceUrl: "https://data.worldbank.org/indicator/NY.GDP.MKTP.KD.ZG?locations=CN",
      note: "Annual percentage growth of GDP at market prices, based on constant local currency.",
      values: {
        2000: 8.574, 2001: 8.324, 2002: 9.236, 2003: 10.114, 2004: 10.140,
        2005: 11.454, 2006: 12.675, 2007: 14.151, 2008: 9.669, 2009: 9.406,
        2010: 10.592, 2011: 9.462, 2012: 7.858, 2013: 7.778, 2014: 7.461,
        2015: 6.982, 2016: 6.774, 2017: 6.891, 2018: 6.758, 2019: 6.067,
        2020: 2.340, 2021: 8.570, 2022: 3.134, 2023: 5.416, 2024: 4.958
      }
    },
    {
      id: "cpi",
      series: "scene",
      name: "Consumer inflation",
      nameEn: "Inflation, consumer prices",
      unit: "%",
      indicatorCode: "FP.CPI.TOTL.ZG",
      source: "World Development Indicators / IMF IFS",
      sourceDetail: "International Monetary Fund, International Financial Statistics database.",
      sourceUrl: "https://data.worldbank.org/indicator/FP.CPI.TOTL.ZG?locations=CN",
      note: "Annual percentage change in the consumer price index.",
      values: {
        2000: 0.348, 2001: 0.719, 2002: -0.732, 2003: 1.128, 2004: 3.825,
        2005: 1.776, 2006: 1.649, 2007: 4.817, 2008: 5.925, 2009: -0.728,
        2010: 3.175, 2011: 5.554, 2012: 2.620, 2013: 2.621, 2014: 1.922,
        2015: 1.437, 2016: 2.000, 2017: 1.593, 2018: 2.075, 2019: 2.899,
        2020: 2.419, 2021: 0.981, 2022: 1.974, 2023: 0.235, 2024: 0.218
      }
    },
    {
      id: "consumption",
      series: "frame",
      name: "Household consumption",
      nameEn: "Household and NPISH final consumption",
      unit: "%",
      indicatorCode: "NE.CON.PRVT.KD.ZG",
      source: "World Development Indicators",
      sourceDetail: "Country official statistics, OECD national accounts files and World Bank estimates.",
      sourceUrl: "https://data.worldbank.org/indicator/NE.CON.PRVT.KD.ZG?locations=CN",
      note: "Annual real growth of household and nonprofit-institution final consumption expenditure.",
      values: {
        2000: 11.712, 2001: 7.208, 2002: 9.335, 2003: 6.354, 2004: 8.264,
        2005: 11.186, 2006: 10.369, 2007: 13.902, 2008: 8.910, 2009: 10.126,
        2010: 11.715, 2011: 15.045, 2012: 9.249, 2013: 8.923, 2014: 9.224,
        2015: 8.796, 2016: 9.487, 2017: 9.175, 2018: 8.322, 2019: 5.687,
        2020: -2.712, 2021: 13.138, 2022: 1.494, 2023: 9.654, 2024: 5.015
      }
    },
    {
      id: "capital",
      series: "observe",
      name: "Capital formation",
      nameEn: "Gross capital formation",
      unit: "%",
      indicatorCode: "NE.GDI.TOTL.KD.ZG",
      source: "World Development Indicators",
      sourceDetail: "Country official statistics, OECD national accounts files and World Bank estimates.",
      sourceUrl: "https://data.worldbank.org/indicator/NE.GDI.TOTL.KD.ZG?locations=CN",
      note: "Annual real growth of gross capital formation, including fixed assets and inventory changes.",
      values: {
        2000: 7.285, 2001: 20.806, 2002: 13.046, 2003: 23.840, 2004: 19.213,
        2005: 10.614, 2006: 15.270, 2007: 17.421, 2008: 13.875, 2009: 20.914,
        2010: 15.773, 2011: 8.736, 2012: 7.646, 2013: 9.462, 2014: 7.500,
        2015: 3.555, 2016: 6.921, 2017: 6.291, 2018: 6.760, 2019: 4.131,
        2020: 4.202, 2021: 3.966, 2022: 2.852, 2023: 3.437, 2024: 2.846
      }
    }
  ]
};
