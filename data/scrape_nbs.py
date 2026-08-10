"""
Fill data.js from the National Bureau of Statistics (国家统计局) data API.

WHY THIS SCRIPT EXISTS
-----------------------
This assistant's sandbox cannot reach data.stats.gov.cn (it's outside the
sandbox's network allowlist), so the PPI and retail-sales series in data.js
are incomplete — only years verified through public search are filled in.
You're in mainland China, so you can reach the API directly. Run this there.

WHAT IT DOES
------------
Queries data.stats.gov.cn's annual dataset (hgnd = 国家数据 年度数据) for a
given indicator code (zb), pulls 2000–present, and prints a Python dict you
can paste into data.js's `values` field.

BEFORE RUNNING
--------------
The `zb` (指标/series) codes below are the commonly-cited ones for these
four indicators as of this writing, but the NBS occasionally renumbers or
re-bases series — verify each one against https://data.stats.gov.cn/easyquery.htm?cn=C01
(年度数据 → search the indicator name) before trusting the output. If a code
returns nothing or looks wrong, open that page in a browser, find the
correct 指标 there, and copy its code from the request URL.

USAGE
-----
    pip install requests
    python scrape_nbs.py
"""

import json
import time
import requests

BASE_URL = "https://data.stats.gov.cn/easyquery.htm"

# NBS annual-data indicator codes — verify before trusting (see docstring above).
INDICATORS = {
    "gdp":    {"zb": "A020101", "label": "国内生产总值增长速度(%)"},
    "cpi":    {"zb": "A01030101", "label": "居民消费价格指数(上年=100)"},
    "ppi":    {"zb": "A01100101", "label": "工业生产者出厂价格指数(上年=100)"},
    "retail": {"zb": "A05010101", "label": "社会消费品零售总额增长速度(%)"},
}

HEADERS = {
    "User-Agent": "Mozilla/5.0 (compatible; galok-data-hub/1.0)",
    "Referer": "https://data.stats.gov.cn/easyquery.htm?cn=C01",
}


def fetch_annual_series(zb_code: str) -> dict:
    """Query one annual indicator and return {year: value}."""
    params = {
        "m": "QueryData",
        "dbcode": "hgnd",
        "rowcode": "sj",
        "colcode": "zb",
        "wds": "[]",
        "dfwds": json.dumps(
            [{"wdcode": "zb", "valuecode": zb_code}], ensure_ascii=False
        ),
        "k1": str(int(time.time() * 1000)),
    }
    resp = requests.get(BASE_URL, params=params, headers=HEADERS, timeout=20)
    resp.raise_for_status()
    payload = resp.json()

    values = {}
    nodes = payload.get("returndata", {}).get("datanodes", [])
    for node in nodes:
        wds = {w["wdcode"]: w["valuecode"] for w in node["wds"]}
        year_code = wds.get("sj", "")
        year = "".join(ch for ch in year_code if ch.isdigit())
        if not year:
            continue
        year = int(year[:4])
        if year < 2000:
            continue
        val = node["data"].get("data")
        if val is not None:
            values[year] = val
    return values


def main():
    result = {}
    for key, meta in INDICATORS.items():
        print(f"Fetching {key} ({meta['label']}, zb={meta['zb']}) ...")
        try:
            series = fetch_annual_series(meta["zb"])
            result[key] = series
            print(f"  -> {len(series)} years")
        except Exception as exc:
            print(f"  !! failed: {exc}")
            result[key] = {}
        time.sleep(1)  # be polite to the API

    print("\n" + "=" * 60)
    print("Paste the relevant year:value pairs into data.js's `values` field.")
    print("=" * 60)
    for key, series in result.items():
        print(f"\n// {key}")
        for year in sorted(series):
            print(f"  {year}: {series[year]},")

    with open("nbs_scrape_output.json", "w", encoding="utf-8") as f:
        json.dump(result, f, ensure_ascii=False, indent=2)
    print("\nAlso wrote nbs_scrape_output.json for reference.")


if __name__ == "__main__":
    main()
