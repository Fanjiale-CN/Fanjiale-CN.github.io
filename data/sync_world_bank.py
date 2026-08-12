"""Fetch and validate the four annual series used by galok.me/data.

The page intentionally uses the latest common complete window across every
series. Run this script before extending the end year, then copy reviewed values
into data.js. It uses only Python's standard library.
"""

from __future__ import annotations

import json
import urllib.parse
import urllib.request


START_YEAR = 2000
INDICATORS = {
    "gdp": "NY.GDP.MKTP.KD.ZG",
    "cpi": "FP.CPI.TOTL.ZG",
    "consumption": "NE.CON.PRVT.KD.ZG",
    "capital": "NE.GDI.TOTL.KD.ZG",
}
API = "https://api.worldbank.org/v2/country/CHN/indicator/{code}"


def fetch_series(code: str) -> tuple[str, dict[int, float | None]]:
    query = urllib.parse.urlencode({"format": "json", "per_page": 100})
    request = urllib.request.Request(
        f"{API.format(code=code)}?{query}",
        headers={"User-Agent": "galok-data-audit/2.0"},
    )
    with urllib.request.urlopen(request, timeout=30) as response:
        metadata, rows = json.load(response)
    values = {
        int(row["date"]): row["value"]
        for row in rows
        if int(row["date"]) >= START_YEAR
    }
    return metadata["lastupdated"], values


def main() -> None:
    result = {}
    updates = set()
    for name, code in INDICATORS.items():
        updated, values = fetch_series(code)
        updates.add(updated)
        result[name] = values

    common_end = max(
        year
        for year in set.intersection(
            *(set(year for year, value in values.items() if value is not None) for values in result.values())
        )
        if year >= START_YEAR
    )
    expected_years = set(range(START_YEAR, common_end + 1))

    print(f"Latest common complete window: {START_YEAR}–{common_end}")
    print(f"Source update date(s): {', '.join(sorted(updates))}")
    for name, values in result.items():
        missing = sorted(year for year in expected_years if values.get(year) is None)
        status = "complete" if not missing else f"missing {missing}"
        print(f"{name:12} {status}")
        print(
            "  "
            + ", ".join(
                f"{year}: {values[year]:.3f}" for year in range(START_YEAR, common_end + 1)
            )
        )


if __name__ == "__main__":
    main()
