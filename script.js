(function () {
  const content = window.GALOK_CONTENT || { essays: [], series: {} };
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const pinyinByGlyph = {
    "\u89c6": "shi",
    "\u8996": "shi",
    "\u52bf": "shi",
    "\u6846": "kuang",
    "\u5bdf": "cha"
  };
  const seriesAccent = {
    macro: "#9e2a2b",
    view: "#9e2a2b",
    frame: "#2f5d7c",
    observe: "#c9a227",
    scene: "#c9a227"
  };
  const departureFlagCodes = "af ax al dz as ad ao ai aq ag ar am aw au at az bs bh bd bb by be bz bj bm bt bo bq ba bw bv br io bn bg bf bi cv kh cm ca ky cf td cl cn cx cc co km ck cr hr cu cw cy cz ci cd dk dj dm do ec eg sv gq er ee sz et fk fo fm fj fi fr gf pf tf ga gm ge de gh gi gr gl gd gp gu gt gg gn gw gy ht hm va hn hk hu is in id ir iq ie im il it jm jp je jo kz ke ki kw kg la lv lb ls lr ly li lt lu mo mg mw my mv ml mt mh mq mr mu yt mx md mc mn me ms ma mz mm na nr np nl nc nz ni ne ng nu nf kp mk mp no om pk pw pa pg py pe ph pn pl pt pr qa cg ro ru rw re bl sh kn lc mf pm vc ws sm st sa sn rs sc sl sg sx sk si sb so za gs kr ss es lk ps sd sr sj se ch sy tw tj tz th tl tg tk to tt tn tm tc tv tr ug ua ae gb um us uy uz vu ve vn vg vi wf eh ye zm zw".split(" ");
  const departureCountryCodes = [
    "jp", "kr", "my", "sg", "th",
    "gb", "fr", "dk", "no", "se", "de", "it", "ch", "es", "pt",
    "ca", "us", "br", "ar", "au"
  ];
  const departureAirports = {
    jfk: { id: "jfk", countryCode: "us", country: "UNITED STATES", city: "NEW YORK", code: "JFK", airport: "JOHN F. KENNEDY", latitude: 40.6413, longitude: -73.7781, x: 396.99, y: 158.86, labelX: -24, labelY: -24, labelAnchor: "end" },
    lax: { id: "lax", countryCode: "us", country: "UNITED STATES", city: "LOS ANGELES", code: "LAX", airport: "LOS ANGELES INTERNATIONAL", latitude: 33.9416, longitude: -118.4085, x: 265.31, y: 182.1, labelX: -24, labelY: 39, labelAnchor: "end" },
    iad: { id: "iad", countryCode: "us", country: "UNITED STATES", city: "WASHINGTON", code: "IAD", airport: "DULLES INTERNATIONAL", latitude: 38.9531, longitude: -77.4565, x: 385.29, y: 164.7, labelX: -24, labelY: 39, labelAnchor: "end" },
    nrt: { id: "nrt", countryCode: "jp", country: "JAPAN", city: "TOKYO", code: "NRT", airport: "NARITA INTERNATIONAL", latitude: 35.7719, longitude: 140.3929, x: 994.17, y: 175.74, labelX: 24, labelY: 40, labelAnchor: "start" },
    icn: { id: "icn", countryCode: "kr", country: "SOUTH KOREA", city: "SEOUL", code: "ICN", airport: "INCHEON INTERNATIONAL", latitude: 37.4602, longitude: 126.4407, x: 952.66, y: 169.87, labelX: 24, labelY: -24, labelAnchor: "start" },
    kul: { id: "kul", countryCode: "my", country: "MALAYSIA", city: "KUALA LUMPUR", code: "KUL", airport: "KUALA LUMPUR INTERNATIONAL", latitude: 2.7456, longitude: 101.7072, x: 904.15, y: 290.5, labelX: -24, labelY: 40, labelAnchor: "end" },
    sin: { id: "sin", countryCode: "sg", country: "SINGAPORE", city: "SINGAPORE", code: "SIN", airport: "CHANGI", latitude: 1.3644, longitude: 103.9915, x: 911.06, y: 295.28, labelX: 24, labelY: 40, labelAnchor: "start" },
    bkk: { id: "bkk", countryCode: "th", country: "THAILAND", city: "BANGKOK", code: "BKK", airport: "SUVARNABHUMI", latitude: 13.69, longitude: 100.7501, x: 898.77, y: 252.58, labelX: -24, labelY: 40, labelAnchor: "end" },
    lhr: { id: "lhr", countryCode: "gb", country: "UNITED KINGDOM", city: "LONDON", code: "LHR", airport: "HEATHROW", latitude: 51.47, longitude: -0.4543, x: 598.82, y: 122.06, labelX: -24, labelY: 40, labelAnchor: "end" },
    cdg: { id: "cdg", countryCode: "fr", country: "FRANCE", city: "PARIS", code: "CDG", airport: "CHARLES DE GAULLE", latitude: 49.0097, longitude: 2.5479, x: 606.72, y: 130.29, labelX: 24, labelY: -24, labelAnchor: "start" },
    cph: { id: "cph", countryCode: "dk", country: "DENMARK", city: "COPENHAGEN", code: "CPH", airport: "COPENHAGEN", latitude: 55.6181, longitude: 12.656, x: 632, y: 108.41, labelX: -24, labelY: -24, labelAnchor: "end" },
    osl: { id: "osl", countryCode: "no", country: "NORWAY", city: "OSLO", code: "OSL", airport: "OSLO GARDERMOEN", latitude: 60.1939, longitude: 11.1004, x: 627.15, y: 93.76, labelX: -24, labelY: -24, labelAnchor: "end" },
    arn: { id: "arn", countryCode: "se", country: "SWEDEN", city: "STOCKHOLM", code: "ARN", airport: "ARLANDA", latitude: 59.6519, longitude: 17.9186, x: 644.01, y: 95.47, labelX: 24, labelY: -24, labelAnchor: "start" },
    ber: { id: "ber", countryCode: "de", country: "GERMANY", city: "BERLIN", code: "BER", airport: "BERLIN BRANDENBURG", latitude: 52.3667, longitude: 13.5033, x: 634.88, y: 119.08, labelX: 24, labelY: 40, labelAnchor: "start" },
    fco: { id: "fco", countryCode: "it", country: "ITALY", city: "ROME", code: "FCO", airport: "FIUMICINO", latitude: 41.8003, longitude: 12.2389, x: 633.5, y: 154.86, labelX: 24, labelY: 40, labelAnchor: "start" },
    brn: { id: "brn", countryCode: "ch", country: "SWITZERLAND", city: "BERN", code: "BRN", airport: "BERN", latitude: 46.9141, longitude: 7.4972, x: 620, y: 137.37, labelX: -24, labelY: 40, labelAnchor: "end" },
    mad: { id: "mad", countryCode: "es", country: "SPAIN", city: "MADRID", code: "MAD", airport: "ADOLFO SUAREZ MADRID-BARAJAS", latitude: 40.4983, longitude: -3.5676, x: 590.18, y: 159.35, labelX: -24, labelY: 40, labelAnchor: "end" },
    lis: { id: "lis", countryCode: "pt", country: "PORTUGAL", city: "LISBON", code: "LIS", airport: "HUMBERTO DELGADO", latitude: 38.7742, longitude: -9.1342, x: 574.66, y: 165.32, labelX: -24, labelY: 40, labelAnchor: "end" },
    yow: { id: "yow", countryCode: "ca", country: "CANADA", city: "OTTAWA", code: "YOW", airport: "OTTAWA INTERNATIONAL", latitude: 45.3225, longitude: -75.6692, x: 396.44, y: 142.79, labelX: -24, labelY: -24, labelAnchor: "end" },
    bsb: { id: "bsb", countryCode: "br", country: "BRAZIL", city: "BRASILIA", code: "BSB", airport: "BRASILIA INTERNATIONAL", latitude: -15.8697, longitude: -47.9208, x: 458.33, y: 354.98, labelX: 24, labelY: 40, labelAnchor: "start" },
    eze: { id: "eze", countryCode: "ar", country: "ARGENTINA", city: "BUENOS AIRES", code: "EZE", airport: "MINISTRO PISTARINI", latitude: -34.8222, longitude: -58.5358, x: 435.07, y: 420.96, labelX: -24, labelY: 40, labelAnchor: "end" },
    cbr: { id: "cbr", countryCode: "au", country: "AUSTRALIA", city: "CANBERRA", code: "CBR", airport: "CANBERRA", latitude: -35.3069, longitude: 149.195, x: 1019.62, y: 422.65, labelX: 24, labelY: 40, labelAnchor: "start" },
    pek: { id: "pek", countryCode: "cn", country: "CHINA", city: "BEIJING", code: "PEK", airport: "BEIJING CAPITAL", latitude: 40.0799, longitude: 116.6031, x: 921.66, y: 160.8, labelX: -24, labelY: -24, labelAnchor: "end" },
    pvg: { id: "pvg", countryCode: "cn", country: "CHINA", city: "SHANGHAI", code: "PVG", airport: "PUDONG", latitude: 31.1443, longitude: 121.8083, x: 947.57, y: 191.85, labelX: 24, labelY: 40, labelAnchor: "start" },
    xiy: { id: "xiy", countryCode: "cn", country: "CHINA", city: "XI’AN", code: "XIY", airport: "XI’AN XIANYANG", latitude: 34.4471, longitude: 108.7516, x: 906.84, y: 180.34, labelX: -24, labelY: 40, labelAnchor: "end" },
    szx: { id: "szx", countryCode: "cn", country: "CHINA", city: "SHENZHEN", code: "SZX", airport: "SHENZHEN BAO’AN", latitude: 22.6393, longitude: 113.8107, x: 932.27, y: 221.48, labelX: 24, labelY: 40, labelAnchor: "start" },
    dlu: { id: "dlu", countryCode: "cn", country: "CHINA", city: "DALI", code: "DLU", airport: "DALI FENGYI", latitude: 25.6494, longitude: 100.3194, x: 890.8, y: 211, labelX: -24, labelY: 40, labelAnchor: "end" },
    xmn: { id: "xmn", countryCode: "cn", country: "CHINA", city: "XIAMEN", code: "XMN", airport: "XIAMEN GAOQI", latitude: 24.544, longitude: 118.1277, x: 943.36, y: 214.85, labelX: 24, labelY: -24, labelAnchor: "start" }
  };
  const departureCountries = {
    jp: { code: "jp", name: "JAPAN", region: "ASIA", cities: ["nrt"] },
    kr: { code: "kr", name: "SOUTH KOREA", region: "ASIA", cities: ["icn"] },
    my: { code: "my", name: "MALAYSIA", region: "ASIA", cities: ["kul"] },
    sg: { code: "sg", name: "SINGAPORE", region: "ASIA", cities: ["sin"] },
    th: { code: "th", name: "THAILAND", region: "ASIA", cities: ["bkk"] },
    gb: { code: "gb", name: "UNITED KINGDOM", region: "EUROPE", cities: ["lhr"] },
    fr: { code: "fr", name: "FRANCE", region: "EUROPE", cities: ["cdg"] },
    dk: { code: "dk", name: "DENMARK", region: "EUROPE", cities: ["cph"] },
    no: { code: "no", name: "NORWAY", region: "EUROPE", cities: ["osl"] },
    se: { code: "se", name: "SWEDEN", region: "EUROPE", cities: ["arn"] },
    de: { code: "de", name: "GERMANY", region: "EUROPE", cities: ["ber"] },
    it: { code: "it", name: "ITALY", region: "EUROPE", cities: ["fco"] },
    ch: { code: "ch", name: "SWITZERLAND", region: "EUROPE", cities: ["brn"] },
    es: { code: "es", name: "SPAIN", region: "EUROPE", cities: ["mad"] },
    pt: { code: "pt", name: "PORTUGAL", region: "EUROPE", cities: ["lis"] },
    ca: { code: "ca", name: "CANADA", region: "NORTH AMERICA", cities: ["yow"] },
    us: { code: "us", name: "UNITED STATES", region: "NORTH AMERICA", cities: ["iad", "jfk", "lax"] },
    br: { code: "br", name: "BRAZIL", region: "SOUTH AMERICA", cities: ["bsb"] },
    ar: { code: "ar", name: "ARGENTINA", region: "SOUTH AMERICA", cities: ["eze"] },
    au: { code: "au", name: "AUSTRALIA", region: "OCEANIA", cities: ["cbr"] }
  };
  const departureDestinations = {
    beijing: departureAirports.pek,
    shanghai: departureAirports.pvg,
    xian: departureAirports.xiy,
    shenzhen: departureAirports.szx,
    dali: departureAirports.dlu,
    xiamen: departureAirports.xmn
  };
  const standardVisaFreePolicy = {
    status: "VISA-FREE VISIT",
    body: "Ordinary passport holders may enter China visa-free for eligible stays of up to 30 days. Confirm current conditions before travel.",
    link: "https://us.china-embassy.gov.cn/eng/lsfw/zj/notice/202412/t20241224_11516392.htm"
  };
  const mutualVisaFreePolicy = {
    status: "VISA-FREE VISIT",
    body: "Ordinary passport holders may enter China visa-free for eligible stays of up to 30 days under a mutual exemption agreement. Confirm current conditions before travel.",
    link: "https://cs.mfa.gov.cn/gyls/lsgz/fwxx/202504/t20250414_11594222.shtml"
  };
  const departureEntryPolicies = {
    us: {
      status: "VISA REQUIRED",
      body: "US ordinary passport holders generally need a visa for an ordinary visit to China. Entry rules depend on passport and purpose, not the departure city.",
      link: "http://us.china-embassy.gov.cn/eng/lsfw/zj/qz2021/"
    },
    jp: standardVisaFreePolicy,
    kr: standardVisaFreePolicy,
    gb: standardVisaFreePolicy,
    fr: standardVisaFreePolicy,
    dk: standardVisaFreePolicy,
    no: standardVisaFreePolicy,
    se: standardVisaFreePolicy,
    de: standardVisaFreePolicy,
    it: standardVisaFreePolicy,
    ch: standardVisaFreePolicy,
    es: standardVisaFreePolicy,
    pt: standardVisaFreePolicy,
    ca: standardVisaFreePolicy,
    br: standardVisaFreePolicy,
    ar: standardVisaFreePolicy,
    au: standardVisaFreePolicy,
    my: {
      status: "VISA-FREE VISIT",
      body: "Malaysian ordinary passport holders may enter visa-free for eligible stays of up to 30 days under the mutual exemption agreement.",
      link: "https://my.china-embassy.gov.cn/eng/fwzc/lsyw/qz/202508/t20250801_11681401.htm"
    },
    sg: mutualVisaFreePolicy,
    th: mutualVisaFreePolicy
  };
  const departureFlightTimes = {
    jfk: { pek: "APPROX. 14H 10M", pvg: "APPROX. 15H", xiy: "APPROX. 20–24H" },
    lax: { pek: "APPROX. 12H 40M", pvg: "APPROX. 13H 40M", xiy: "APPROX. 17–21H" },
    iad: { pek: "APPROX. 14H 20M", pvg: "APPROX. 18–22H", xiy: "APPROX. 18–22H" },
    nrt: { pek: "APPROX. 4H 20M", pvg: "APPROX. 3H 20M", xiy: "APPROX. 5H 30M" },
    icn: { pek: "APPROX. 2H 15M", pvg: "APPROX. 2H 10M", xiy: "APPROX. 3H 30M" },
    kul: { pek: "APPROX. 6H 20M", pvg: "APPROX. 5H 40M", xiy: "APPROX. 5H 15M" },
    sin: { pek: "APPROX. 6H 20M", pvg: "APPROX. 5H 25M", xiy: "APPROX. 5H 30M" }
  };
  const departureTransfers = {
    "jfk-xiy": "pvg",
    "lax-xiy": "pvg",
    "iad-pvg": "pek",
    "iad-xiy": "pek"
  };
  const departureLegTimes = {
    "jfk-pvg": "APPROX. 15H",
    "lax-pvg": "APPROX. 13H 40M",
    "iad-pek": "APPROX. 14H 20M",
    "pek-pvg": "APPROX. 2H 15M",
    "pek-xiy": "APPROX. 2H 15M",
    "pvg-xiy": "APPROX. 2H 30M"
  };

  function departureDistance(from, to) {
    const radians = (degrees) => degrees * Math.PI / 180;
    const earthRadius = 6371;
    const latitudeDelta = radians(to.latitude - from.latitude);
    const longitudeDelta = radians(to.longitude - from.longitude);
    const value = Math.sin(latitudeDelta / 2) ** 2
      + Math.cos(radians(from.latitude)) * Math.cos(radians(to.latitude)) * Math.sin(longitudeDelta / 2) ** 2;
    return Math.round((earthRadius * 2 * Math.atan2(Math.sqrt(value), Math.sqrt(1 - value))) / 100) * 100;
  }

  function departurePath(from, to) {
    const deltaX = to.x - from.x;
    const deltaY = to.y - from.y;
    const distance = Math.hypot(deltaX, deltaY);
    const lift = Math.min(140, Math.max(30, distance * 0.24));
    if (Math.abs(deltaX) > 320) {
      const controlY = Math.max(30, Math.min(from.y, to.y) - lift);
      return `M${from.x} ${from.y} C${(from.x + deltaX * 0.28).toFixed(2)} ${controlY.toFixed(2)} ${(from.x + deltaX * 0.72).toFixed(2)} ${controlY.toFixed(2)} ${to.x} ${to.y}`;
    }
    const midpointX = (from.x + to.x) / 2;
    const midpointY = (from.y + to.y) / 2 - lift;
    return `M${from.x} ${from.y} Q${midpointX.toFixed(2)} ${midpointY.toFixed(2)} ${to.x} ${to.y}`;
  }

  function departureSegment(from, to) {
    const distance = Math.hypot(to.x - from.x, to.y - from.y);
    return {
      from,
      to,
      path: departurePath(from, to),
      duration: Math.round(Math.max(2800, Math.min(5600, 2300 + distance * 5.1))),
      drawDuration: Math.round(Math.max(1300, Math.min(2000, 1000 + distance * 1.6)))
    };
  }

  function departureFlightMinutes(from, to) {
    const distance = departureDistance(from, to);
    return Math.max(60, Math.round(((distance / 820) * 60 + 45) / 10) * 10);
  }

  function departureTimeLabel(minutes) {
    const hours = Math.floor(minutes / 60);
    const remaining = minutes % 60;
    return `APPROX. ${hours}H${remaining ? ` ${remaining}M` : ""}`;
  }

  function departureJourneyWindow(segments) {
    const flightMinutes = segments.reduce((total, segment) => total + departureFlightMinutes(segment.from, segment.to), 0);
    const low = Math.max(1, Math.floor((flightMinutes + 120) / 60));
    const high = Math.max(low + 2, Math.ceil((flightMinutes + 360) / 60));
    return `APPROX. ${low}–${high}H`;
  }

  function buildDepartureRoute(origin, destinationKey) {
    const destination = departureDestinations[destinationKey];
    const transferId = departureTransfers[`${origin.id}-${destination.id}`]
      || (["xian", "shenzhen", "dali", "xiamen"].includes(destinationKey) ? "pvg" : null);
    const transfer = transferId ? departureAirports[transferId] : null;
    const stops = transfer ? [origin, transfer, destination] : [origin, destination];
    const segments = stops.slice(0, -1).map((stop, index) => departureSegment(stop, stops[index + 1]));
    const distance = segments.reduce((total, segment) => total + departureDistance(segment.from, segment.to), 0);
    const routeTime = departureFlightTimes[origin.id]?.[destination.id]
      || (transfer ? departureJourneyWindow(segments) : departureTimeLabel(departureFlightMinutes(origin, destination)));
    const destinationNumber = { beijing: "01", shanghai: "02", xian: "03", shenzhen: "04", dali: "05", xiamen: "06" }[destinationKey];
    const routeLabel = `${origin.code} → ${destination.code}`;
    const transferLabel = transfer ? `${transfer.city} / ${transfer.code}` : null;
    const facts = transfer ? [
      { label: "1 TRANSFER", value: transferLabel },
      { label: "FIRST LEG", value: `${origin.code} → ${transfer.code}`, detail: departureLegTimes[`${origin.id}-${transfer.id}`] || departureTimeLabel(departureFlightMinutes(origin, transfer)) },
      { label: "SECOND LEG", value: `${transfer.code} → ${destination.code}`, detail: departureLegTimes[`${transfer.id}-${destination.id}`] || departureTimeLabel(departureFlightMinutes(transfer, destination)) },
      { label: "TOTAL JOURNEY", value: routeTime, detail: "DEPENDING ON CONNECTION" }
    ] : [
      { label: "NONSTOP", value: routeLabel },
      { label: "FLIGHT TIME", value: routeTime },
      { label: "DISTANCE", value: `APPROX. ${distance.toLocaleString("en-US")} KM` },
      { label: "ROUTE TYPE", value: "REPRESENTATIVE DIRECT" }
    ];
    return {
      key: `${origin.id}-${destinationKey}`,
      number: destinationNumber,
      origin,
      transfer,
      destination,
      destinationKey,
      segments,
      entry: departureEntryPolicies[origin.countryCode],
      summary: {
        destinationAirport: destination.airport,
        mapStatus: transfer ? `TRANSFER · ${transferLabel}` : "DIRECT FLIGHT",
        mode: transfer ? `1 TRANSFER · ${transferLabel}` : `NONSTOP · ${routeLabel}`,
        arriveLabel: `ARRIVE IN ${destination.city}`,
        description: transfer
          ? `A representative connecting route from ${origin.airport} to ${destination.airport} via ${transfer.airport}.`
          : `A representative direct route from ${origin.airport} to ${destination.airport}.`,
        facts
      }
    };
  }

  const departureRoutes = {};
  Object.values(departureCountries).forEach((country) => {
    country.cities.forEach((originId) => {
      Object.keys(departureDestinations).forEach((destinationKey) => {
        const route = buildDepartureRoute(departureAirports[originId], destinationKey);
        departureRoutes[route.key] = route;
      });
    });
  });
  window.GALOK_DEPARTURE_ROUTES = departureRoutes;
  window.GALOK_DEPARTURE_DATA = {
    airports: departureAirports,
    countries: departureCountries,
    countryCodes: departureCountryCodes,
    flagCodes: departureFlagCodes,
    destinations: departureDestinations
  };
  let activeVisualNote = null;

  document.documentElement.classList.toggle("motion-ready", !reduceMotion);

  function seriesFor(key) {
    return content.series[key] || {};
  }

  function pinyinFor(value) {
    return pinyinByGlyph[value] || "";
  }

  function glyph(value, className = "", pinyin = pinyinFor(value)) {
    return `<span class="glyph-draw ${className}" data-glyph="${value}" data-pinyin="${pinyin}" aria-hidden="true">${value}</span>`;
  }

  function essayCard(essay) {
    const series = seriesFor(essay.series);
    return `
      <a class="essay-card" href="${essay.url}" style="--accent:${series.color}" data-series="${essay.series}" data-reveal>
        <div class="essay-meta">
          <span>${glyph(series.glyph, "glyph-inline", series.pinyin)} ${series.en}</span>
          <span>${essay.date}</span>
          <span>${essay.readingTime}</span>
        </div>
        ${glyph(essay.anchor, "anchor")}
        <div class="deck">${essay.deck}</div>
        <h3>${essay.title}</h3>
        <p>${essay.excerpt}</p>
      </a>
    `;
  }

  document.querySelectorAll("[data-essay-list]").forEach((mount) => {
    const filter = mount.dataset.filter || "all";
    const limit = Number(mount.dataset.limit || 0);
    let essays = content.essays.filter((essay) => filter === "all" || essay.series === filter);
    if (limit > 0) {
      essays = essays.slice(0, limit);
    }
    mount.innerHTML = essays.map(essayCard).join("");
  });

  function renderCoffeeIcon() {
    return `
      <div class="visual-note-head">
        <span class="visual-note-logo" aria-hidden="true">G</span>
        <span class="visual-note-wordmark">Galok field note</span>
      </div>
      <svg class="visual-note-svg" viewBox="0 0 184 126" aria-hidden="true" focusable="false">
        <path class="visual-note-fill visual-note-fill-main" d="M45 59h66v25c0 16-13 28-29 28h-8c-16 0-29-12-29-28V59Z"></path>
        <path class="visual-note-fill visual-note-fill-soft" d="M32 108c24 9 82 9 106 0"></path>
        <path class="visual-note-line" style="--draw-delay:0ms" pathLength="1" d="M45 59h66v25c0 16-13 28-29 28h-8c-16 0-29-12-29-28V59Z"></path>
        <path class="visual-note-line" style="--draw-delay:90ms" pathLength="1" d="M111 66h12c12 0 20 8 20 18s-8 19-21 19h-11"></path>
        <path class="visual-note-line" style="--draw-delay:180ms" pathLength="1" d="M32 108c24 9 82 9 106 0"></path>
        <path class="visual-note-line" style="--draw-delay:270ms" pathLength="1" d="M66 43c-7-8 7-14 0-23"></path>
        <path class="visual-note-line" style="--draw-delay:360ms" pathLength="1" d="M84 43c-7-8 7-14 0-23"></path>
        <path class="visual-note-line visual-note-receipt" style="--draw-delay:450ms" pathLength="1" d="M135 24h30v49l-5-4-5 4-5-4-5 4-5-4-5 4V24Z"></path>
        <path class="visual-note-line visual-note-receipt" style="--draw-delay:540ms" pathLength="1" d="M142 36h16M142 48h12M142 60h16"></path>
        <circle class="visual-note-dot" cx="32" cy="32" r="3"></circle>
        <circle class="visual-note-dot" cx="42" cy="26" r="2.5"></circle>
      </svg>
      <div class="visual-note-label">coffee as price evidence</div>
    `;
  }

  const visualNoteIcons = {
    coffee: renderCoffeeIcon
  };

  function visualNoteShell(label, svg) {
    return `
      <div class="visual-note-head">
        <span class="visual-note-logo" aria-hidden="true">G</span>
        <span class="visual-note-wordmark">Galok field note</span>
      </div>
      ${svg}
      <div class="visual-note-label">${label}</div>
    `;
  }

  function renderWinterIcon() {
    return visualNoteShell("winter as proof spectacle", `
      <svg class="visual-note-svg visual-note-svg-winter" viewBox="0 0 184 126" aria-hidden="true" focusable="false">
        <path class="visual-note-fill visual-note-fill-main" d="M64 86h56l-12 18H76Z"></path>
        <path class="visual-note-line" style="--draw-delay:0ms" pathLength="1" d="M48 104h88"></path>
        <path class="visual-note-line" style="--draw-delay:90ms" pathLength="1" d="M64 86h56l-12 18H76Z"></path>
        <path class="visual-note-line" style="--draw-delay:180ms" pathLength="1" d="M76 86c-2-18 4-34 18-47 14 13 20 29 18 47"></path>
        <path class="visual-note-line" style="--draw-delay:270ms" pathLength="1" d="M70 64h48M77 50h34M86 38h16"></path>
        <path class="visual-note-line" style="--draw-delay:360ms" pathLength="1" d="M38 32l10 10m0-10L38 42M44 27v20M34 37h20"></path>
        <path class="visual-note-line" style="--draw-delay:450ms" pathLength="1" d="M136 43l8 8m0-8-8 8M140 38v18M131 47h18"></path>
        <circle class="visual-note-dot" cx="58" cy="33" r="2.6"></circle>
        <circle class="visual-note-dot" cx="126" cy="68" r="2.4"></circle>
      </svg>
    `);
  }

  function renderMalatangIcon() {
    return visualNoteShell("malatang as food-driven traffic", `
      <svg class="visual-note-svg visual-note-svg-malatang" viewBox="0 0 184 126" aria-hidden="true" focusable="false">
        <path class="visual-note-fill visual-note-fill-main" d="M44 66h96l-9 32c-3 10-14 17-29 17H82c-15 0-26-7-29-17Z"></path>
        <path class="visual-note-fill visual-note-fill-soft" d="M54 72c18 10 58 10 76 0"></path>
        <path class="visual-note-line" style="--draw-delay:0ms" pathLength="1" d="M44 66h96l-9 32c-3 10-14 17-29 17H82c-15 0-26-7-29-17Z"></path>
        <path class="visual-note-line" style="--draw-delay:80ms" pathLength="1" d="M54 72c18 10 58 10 76 0"></path>
        <path class="visual-note-line" style="--draw-delay:160ms" pathLength="1" d="M67 53c-8-10 8-15 0-26M91 53c-8-10 8-15 0-26M115 53c-8-10 8-15 0-26"></path>
        <path class="visual-note-line" style="--draw-delay:260ms" pathLength="1" d="M42 38l56 20M144 34 92 59"></path>
        <circle class="visual-note-dot broth-dot" cx="75" cy="84" r="4"></circle>
        <circle class="visual-note-dot broth-dot" cx="94" cy="88" r="3.4"></circle>
        <circle class="visual-note-dot broth-dot" cx="113" cy="82" r="3.7"></circle>
        <path class="visual-note-line" style="--draw-delay:520ms" pathLength="1" d="M62 105h60"></path>
      </svg>
    `);
  }

  function renderBarbecueIcon() {
    return visualNoteShell("barbecue as city trust test", `
      <svg class="visual-note-svg visual-note-svg-barbecue" viewBox="0 0 184 126" aria-hidden="true" focusable="false">
        <path class="visual-note-fill visual-note-fill-main" d="M54 78h78v22H54Z"></path>
        <path class="visual-note-line" style="--draw-delay:0ms" pathLength="1" d="M42 100h102M56 100l-8 15M130 100l8 15"></path>
        <path class="visual-note-line" style="--draw-delay:90ms" pathLength="1" d="M54 78h78v22H54Z"></path>
        <path class="visual-note-line" style="--draw-delay:170ms" pathLength="1" d="M61 86h64M61 94h64"></path>
        <path class="visual-note-line" style="--draw-delay:250ms" pathLength="1" d="M45 43l92 36M49 31l92 36M55 19l92 36"></path>
        <path class="visual-note-line visual-note-skewer" style="--draw-delay:340ms" pathLength="1" d="M72 49l12-5 9 9-12 5Z M96 58l12-5 9 9-12 5Z"></path>
        <path class="visual-note-line visual-note-skewer" style="--draw-delay:430ms" pathLength="1" d="M70 36l11-5 9 9-11 5Z M94 45l11-5 9 9-11 5Z"></path>
        <path class="visual-note-line visual-note-skewer" style="--draw-delay:520ms" pathLength="1" d="M76 25l10-5 8 8-10 5Z M100 34l10-5 8 8-10 5Z"></path>
        <path class="visual-note-line visual-note-flame" style="--draw-delay:610ms" pathLength="1" d="M76 78c-7-10 7-12 1-23M93 78c-6-9 8-13 2-24M111 78c-6-8 7-12 2-22"></path>
      </svg>
    `);
  }

  function renderGooseLegIcon() {
    return visualNoteShell("goose-leg as narrative evidence", `
      <svg class="visual-note-svg visual-note-svg-goose-leg" viewBox="0 0 184 126" aria-hidden="true" focusable="false">
        <path class="visual-note-fill visual-note-fill-main" d="M61 65c7-23 30-36 54-29 17 5 30 18 34 34 4 17-6 30-22 33-16 3-30-5-40-18l-16 16c-5 5-13 5-18 0s-5-13 0-18Z"></path>
        <path class="visual-note-line" style="--draw-delay:0ms" pathLength="1" d="M61 65c7-23 30-36 54-29 17 5 30 18 34 34 4 17-6 30-22 33-16 3-30-5-40-18"></path>
        <path class="visual-note-line" style="--draw-delay:100ms" pathLength="1" d="M88 84 72 100c-5 5-13 5-18 0s-5-13 0-18l17-17"></path>
        <path class="visual-note-line" style="--draw-delay:200ms" pathLength="1" d="M57 91c-7 0-12-5-12-11s5-11 12-11"></path>
        <path class="visual-note-line" style="--draw-delay:300ms" pathLength="1" d="M73 99c0 7-5 12-11 12s-11-5-11-12"></path>
        <path class="visual-note-line" style="--draw-delay:400ms" pathLength="1" d="M97 51c15-4 29 2 36 15M92 62c13-4 25 1 31 12M91 74c12-2 21 1 27 9"></path>
        <path class="visual-note-line visual-note-label-line" style="--draw-delay:520ms" pathLength="1" d="M33 35h46M33 45h34M113 20h30M113 29h24"></path>
        <circle class="visual-note-dot" cx="148" cy="71" r="3"></circle>
        <circle class="visual-note-dot" cx="37" cy="80" r="2.8"></circle>
      </svg>
    `);
  }

  function renderChinaZunIcon() {
    return visualNoteShell("China Zun as vertical evidence", `
      <svg class="visual-note-svg visual-note-svg-china-zun" viewBox="0 0 184 126" aria-hidden="true" focusable="false">
        <path class="visual-note-fill visual-note-fill-main" d="M74 112 84 20h18l10 92Z"></path>
        <path class="visual-note-line" style="--draw-delay:0ms" pathLength="1" d="M74 112 84 20h18l10 92Z"></path>
        <path class="visual-note-line" style="--draw-delay:90ms" pathLength="1" d="M86 20c5 8 14 8 20 0"></path>
        <path class="visual-note-line" style="--draw-delay:180ms" pathLength="1" d="M82 42h24M80 58h28M78 74h32M76 90h36"></path>
        <path class="visual-note-line" style="--draw-delay:300ms" pathLength="1" d="M92 23v88M100 23v88"></path>
        <path class="visual-note-line visual-note-zun-cordon" style="--draw-delay:430ms" pathLength="1" d="M38 100h108M46 100l-8 16M138 100l8 16M54 100l20 16M86 100l20 16M118 100l20 16"></path>
        <path class="visual-note-line visual-note-zun-signal" style="--draw-delay:560ms" pathLength="1" d="M124 34c10 6 16 14 18 24M132 25c16 10 26 24 30 42"></path>
        <circle class="visual-note-dot" cx="96" cy="19" r="2.8"></circle>
        <circle class="visual-note-dot" cx="144" cy="65" r="2.4"></circle>
      </svg>
    `);
  }

  Object.assign(visualNoteIcons, {
    winter: renderWinterIcon,
    malatang: renderMalatangIcon,
    barbecue: renderBarbecueIcon,
    "goose-leg": renderGooseLegIcon,
    "china-zun": renderChinaZunIcon
  });

  function resolveKeywordAccent(element) {
    if (element.dataset.accent) return element.dataset.accent;

    const explicitSeries = (element.dataset.series || "").toLowerCase();
    if (seriesAccent[explicitSeries]) return seriesAccent[explicitSeries];

    const seriesParent = element.closest("[data-series]");
    const parentSeries = (seriesParent?.dataset.series || "").toLowerCase();
    if (seriesAccent[parentSeries]) return seriesAccent[parentSeries];

    const computedAccent = getComputedStyle(element).getPropertyValue("--accent").trim();
    if (computedAccent) return computedAccent;

    return getComputedStyle(document.documentElement).getPropertyValue("--ink").trim() || "#171717";
  }

  function positionVisualNote(popover, anchor) {
    const anchorRect = anchor.getBoundingClientRect();
    const noteRect = popover.getBoundingClientRect();
    const noteWidth = popover.offsetWidth || noteRect.width || 196;
    const noteHeight = popover.offsetHeight || noteRect.height || 164;
    const margin = 16;
    const navBottom = document.querySelector(".site-nav")?.getBoundingClientRect().bottom || 0;
    const titleRect = anchor.closest(".article-title")?.getBoundingClientRect();
    const isDesktop = finePointer && window.innerWidth >= 760;

    function clampCandidate(candidate) {
      return {
        x: Math.max(margin, Math.min(candidate.x, window.innerWidth - noteWidth - margin)),
        y: Math.max(navBottom + 8, Math.min(candidate.y, window.innerHeight - noteHeight - margin))
      };
    }

    function overlapsTitle(candidate) {
      if (!titleRect) return false;
      const rect = {
        left: candidate.x,
        right: candidate.x + noteWidth,
        top: candidate.y,
        bottom: candidate.y + noteHeight
      };
      return rect.left < titleRect.right &&
        rect.right > titleRect.left &&
        rect.top < titleRect.bottom &&
        rect.bottom > titleRect.top;
    }

    const rightX = anchorRect.right + 14;
    const leftX = anchorRect.left - noteWidth - 14;
    const titleAbove = titleRect ? titleRect.top - noteHeight - 12 : anchorRect.top - noteHeight - 12;
    const titleBelow = titleRect ? titleRect.bottom + 12 : anchorRect.bottom + 12;
    const titleAvoidanceCandidates = titleRect ? [
      { x: rightX, y: titleAbove },
      { x: anchorRect.right - noteWidth * 0.18, y: titleAbove },
      { x: rightX, y: titleBelow },
      { x: anchorRect.right - noteWidth * 0.18, y: titleBelow }
    ] : [];
    const desktopCandidates = [
      { x: rightX, y: anchorRect.top - 18 },
      { x: rightX, y: anchorRect.top + anchorRect.height / 2 - noteHeight / 2 },
      { x: anchorRect.right - noteWidth * 0.18, y: titleAbove },
      { x: leftX, y: anchorRect.top - 18 }
    ];
    const mobileCandidates = [
      { x: anchorRect.left, y: anchorRect.bottom + 10 },
      { x: anchorRect.left, y: anchorRect.top - noteHeight - 10 },
      { x: anchorRect.left + anchorRect.width / 2 - noteWidth / 2, y: anchorRect.bottom + 10 }
    ];
    const candidates = [
      ...titleAvoidanceCandidates,
      ...(isDesktop ? desktopCandidates : mobileCandidates)
    ];

    const clampedCandidates = candidates.map(clampCandidate);
    const chosen = clampedCandidates.find((candidate) => !overlapsTitle(candidate)) || clampedCandidates[0];
    const { x, y } = chosen;

    popover.style.setProperty("--note-x", `${Math.round(x)}px`);
    popover.style.setProperty("--note-y", `${Math.round(y)}px`);
  }

  function hideVisualNote({ immediate = false } = {}) {
    if (!activeVisualNote) return;
    const { anchor, popover } = activeVisualNote;
    activeVisualNote = null;
    anchor.classList.remove("is-note-open");
    if (!popover.isConnected) return;
    if (immediate || reduceMotion) {
      popover.remove();
      return;
    }
    popover.classList.add("is-leaving");
    window.setTimeout(() => popover.remove(), 240);
  }

  function showVisualNote(element) {
    const visual = element.dataset.visual;
    const renderIcon = visualNoteIcons[visual];
    if (!renderIcon) return;

    hideVisualNote({ immediate: true });

    const accent = resolveKeywordAccent(element);
    const popover = document.createElement("div");
    popover.className = `visual-note-popover visual-note-popover-${visual}`;
    if (reduceMotion) popover.classList.add("is-static");
    popover.setAttribute("aria-hidden", "true");
    popover.style.setProperty("--note-accent", accent);
    popover.style.visibility = "hidden";
    popover.innerHTML = renderIcon();
    document.body.appendChild(popover);

    positionVisualNote(popover, element);
    popover.style.visibility = "visible";
    element.classList.add("is-note-open");
    activeVisualNote = { anchor: element, popover };
  }

  document.querySelectorAll(".keyword-note").forEach((note) => {
    note.style.setProperty("--keyword-note-accent", resolveKeywordAccent(note));
    let hoverTimer = 0;
    note.addEventListener("pointerenter", () => {
      if (!finePointer) return;
      window.clearTimeout(hoverTimer);
      hoverTimer = window.setTimeout(() => showVisualNote(note), 240);
    });
    note.addEventListener("pointerleave", () => {
      window.clearTimeout(hoverTimer);
      if (finePointer && activeVisualNote?.anchor === note) hideVisualNote();
    });
    note.addEventListener("mouseenter", () => {
      if (!finePointer) return;
      window.clearTimeout(hoverTimer);
      hoverTimer = window.setTimeout(() => showVisualNote(note), 240);
    });
    note.addEventListener("mouseleave", () => {
      window.clearTimeout(hoverTimer);
      if (finePointer && activeVisualNote?.anchor === note) hideVisualNote();
    });
    note.addEventListener("focus", () => showVisualNote(note));
    note.addEventListener("blur", () => hideVisualNote());
    note.addEventListener("click", (event) => {
      event.stopPropagation();
      window.clearTimeout(hoverTimer);
      showVisualNote(note);
    });
    note.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        window.clearTimeout(hoverTimer);
        showVisualNote(note);
      }
    });
  });

  document.addEventListener("pointerdown", (event) => {
    if (!activeVisualNote || !(event.target instanceof Element)) return;
    if (event.target.closest(".keyword-note")) return;
    hideVisualNote();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") hideVisualNote();
  });

  window.addEventListener("resize", () => hideVisualNote({ immediate: true }));
  window.addEventListener("scroll", () => hideVisualNote({ immediate: true }), { passive: true });

  const filterGroup = document.querySelector(".filters");
  const essayList = document.querySelector("[data-essay-list]");
  if (filterGroup && essayList) {
    const filterButtons = Array.from(filterGroup.querySelectorAll(".filter-button[data-filter]"));
    const essayCards = Array.from(essayList.querySelectorAll(".essay-card[data-series]"));
    const filterStatus = document.querySelector("[data-filter-status]");
    let activeFilter = essayList.dataset.filter || "all";
    let filterRun = 0;
    let commitTimer = 0;
    let cleanupTimer = 0;

    function clearFilterTimers() {
      window.clearTimeout(commitTimer);
      window.clearTimeout(cleanupTimer);
    }

    function finishFilterMotion(run) {
      if (run !== filterRun) return;
      essayCards.forEach((card) => {
        card.classList.remove("is-filter-entering", "is-filter-leaving");
        card.style.removeProperty("--filter-order");
      });
      essayList.removeAttribute("aria-busy");
    }

    function announceFilter(filter, count) {
      if (!filterStatus) return;
      const selected = filterButtons.find((item) => item.dataset.filter === filter);
      const label = selected ? selected.textContent.trim().replace(/^\S+\s+/, "") : "selected";
      filterStatus.textContent = filter === "all"
        ? `Showing all ${count} essays.`
        : `Showing ${count} ${label} ${count === 1 ? "essay" : "essays"}.`;
    }

    function showFilterResults(filter, run, animate) {
      if (run !== filterRun) return;
      const matchingCards = [];

      essayCards.forEach((card) => {
        const matches = filter === "all" || card.dataset.series === filter;
        card.classList.remove("is-filter-entering", "is-filter-leaving");
        card.hidden = !matches;
        if (matches) {
          card.removeAttribute("aria-hidden");
          card.classList.add("is-visible");
          matchingCards.push(card);
        } else {
          card.setAttribute("aria-hidden", "true");
        }
      });

      announceFilter(filter, matchingCards.length);

      if (!animate || reduceMotion) {
        finishFilterMotion(run);
        return;
      }

      matchingCards.forEach((card, index) => {
        card.style.setProperty("--filter-order", String(index));
      });
      void essayList.offsetWidth;
      matchingCards.forEach((card) => card.classList.add("is-filter-entering"));

      const stagger = Math.min(Math.max(0, matchingCards.length - 1), 5) * 55;
      cleanupTimer = window.setTimeout(() => finishFilterMotion(run), 520 + stagger);
    }

    function applyFilter(filter, { animate = true } = {}) {
      if (!filterButtons.some((item) => item.dataset.filter === filter)) return;
      if (filter === activeFilter && !essayList.hasAttribute("aria-busy")) return;

      activeFilter = filter;
      essayList.dataset.filter = filter;
      const run = ++filterRun;
      clearFilterTimers();
      essayCards.forEach((card) => card.classList.remove("is-filter-entering", "is-filter-leaving"));

      filterButtons.forEach((item) => {
        item.setAttribute("aria-pressed", String(item.dataset.filter === filter));
      });

      essayList.setAttribute("aria-busy", "true");
      const visibleCards = essayCards.filter((card) => !card.hidden);

      if (animate && !reduceMotion && visibleCards.length) {
        visibleCards.forEach((card) => card.classList.add("is-filter-leaving"));
        commitTimer = window.setTimeout(() => showFilterResults(filter, run, true), 150);
      } else {
        showFilterResults(filter, run, false);
      }
    }

    filterButtons.forEach((button) => {
      button.addEventListener("click", () => applyFilter(button.dataset.filter || "all"));
    });
  }

  function initInteractiveCharts() {
    document.querySelectorAll(".interactive-chart").forEach((chart) => {
      const detail = chart.querySelector(".chart-detail");
      const controls = chart.querySelectorAll("[data-detail]");

      function activate(control) {
        if (!control || !detail) return;
        const group = control.closest(".interactive-chart");
        group?.querySelectorAll("[data-detail].is-active").forEach((item) => item.classList.remove("is-active"));
        control.classList.add("is-active");
        detail.textContent = control.dataset.detail || "";
      }

      controls.forEach((control) => {
        control.addEventListener("click", () => activate(control));
        control.addEventListener("focus", () => activate(control));
        control.addEventListener("pointerenter", () => {
          if (finePointer) activate(control);
        });
      });

      const loopCore = chart.querySelector(".loop-core");
      if (loopCore) {
        loopCore.addEventListener("click", () => {
          chart.classList.remove("is-expanded");
          chart.classList.add("is-collapsed");
          window.requestAnimationFrame(() => {
            void chart.offsetWidth;
            chart.classList.remove("is-collapsed");
            chart.classList.add("is-expanded");
            if (detail) detail.textContent = "The feed creates desire, then turns that desire into public evidence.";
          });
        });
        loopCore.addEventListener("focus", () => {
          if (detail) detail.textContent = "Public receipt: the platform makes the story around a product visible.";
        });
      }
    });
  }

  initInteractiveCharts();

  function initSpatialHero() {
    const hero = document.querySelector("[data-spatial-hero]");
    if (!hero) return;

    const depthLayers = Array.from(hero.querySelectorAll("[data-depth]"));
    const chapters = Array.from(hero.querySelectorAll("[data-spatial-chapter]"));
    const sceneRuler = hero.querySelector(".spatial-scene-ruler");
    const sceneLabel = hero.querySelector("[data-scene-label]");
    let frame = 0;
    let lastPointer = null;
    let leaveTimer = 0;

    function resetField() {
      window.clearTimeout(leaveTimer);
      hero.classList.remove("is-interacting");
      hero.style.setProperty("--tilt-x", "0deg");
      hero.style.setProperty("--tilt-y", "0deg");
      hero.style.setProperty("--backdrop-x", "0px");
      hero.style.setProperty("--backdrop-y", "0px");
      depthLayers.forEach((layer) => {
        layer.style.setProperty("--shift-x", "0px");
        layer.style.setProperty("--shift-y", "0px");
        layer.style.setProperty("--shift-z", "0px");
      });
    }

    function paintField() {
      frame = 0;
      if (!lastPointer) return;

      const rect = hero.getBoundingClientRect();
      const normalizedX = Math.max(-1, Math.min(1, ((lastPointer.clientX - rect.left) / rect.width - 0.5) * 2));
      const normalizedY = Math.max(-1, Math.min(1, ((lastPointer.clientY - rect.top) / rect.height - 0.5) * 2));

      hero.classList.add("is-interacting");
      hero.style.setProperty("--tilt-x", `${(-normalizedY * 0.72).toFixed(3)}deg`);
      hero.style.setProperty("--tilt-y", `${(normalizedX * 0.92).toFixed(3)}deg`);
      hero.style.setProperty("--backdrop-x", `${(-normalizedX * 3.4).toFixed(2)}px`);
      hero.style.setProperty("--backdrop-y", `${(-normalizedY * 2.6).toFixed(2)}px`);

      depthLayers.forEach((layer) => {
        const depth = Number(layer.dataset.depth || 1);
        layer.style.setProperty("--shift-x", `${(-normalizedX * depth * 7.5).toFixed(2)}px`);
        layer.style.setProperty("--shift-y", `${(-normalizedY * depth * 5.5).toFixed(2)}px`);
        layer.style.setProperty("--shift-z", `${(depth * 5).toFixed(2)}px`);
      });
    }

    if (!reduceMotion && finePointer) {
      hero.addEventListener("pointermove", (event) => {
        lastPointer = event;
        if (!frame) frame = window.requestAnimationFrame(paintField);
      });

      hero.addEventListener("pointerleave", () => {
        lastPointer = null;
        if (frame) window.cancelAnimationFrame(frame);
        frame = 0;
        leaveTimer = window.setTimeout(resetField, 40);
      });
    }

    function setChapter(chapter) {
      chapters.forEach((item) => item.classList.toggle("is-active", item === chapter));
      if (sceneLabel) sceneLabel.textContent = `Scene ${chapter?.dataset.spatialChapter || "00"} / 03`;
      sceneRuler?.classList.toggle("is-active", Boolean(chapter));
    }

    chapters.forEach((chapter) => {
      chapter.addEventListener("pointerenter", () => setChapter(chapter));
      chapter.addEventListener("pointerleave", () => setChapter(null));
      chapter.addEventListener("focus", () => setChapter(chapter));
      chapter.addEventListener("blur", () => setChapter(null));
    });

    if (!reduceMotion && window.gsap) {
      const motion = window.gsap.matchMedia();
      motion.add("(max-width: 900px)", () => {
        const timeline = window.gsap.timeline({
          defaults: { duration: 0.48, ease: "power2.out" }
        });

        timeline.from(hero.querySelector(".spatial-backdrop"), {
          autoAlpha: 0.28,
          scale: 1.018,
          duration: 0.92,
          ease: "power3.out",
          transformOrigin: "50% 50%"
        }, 0.12);

        timeline.from(".spatial-nav .nav-links a", {
          autoAlpha: 0,
          y: -10,
          duration: 0.42,
          stagger: 0.055,
          ease: "power2.out"
        }, 0.2);

        return () => timeline.kill();
      });
    }
  }

  initSpatialHero();

  function initHomepageActionFlow() {
    const seriesSection = document.querySelector("#series");
    const seriesCards = Array.from(document.querySelectorAll("[data-series-key]"));
    const seriesTriggers = Array.from(document.querySelectorAll("[data-series-jump]"));
    if (!seriesSection || seriesTriggers.length === 0) return;

    let clearTimer = 0;

    function clearSeriesGuide() {
      window.clearTimeout(clearTimer);
      seriesTriggers.forEach((trigger) => trigger.classList.remove("is-active"));
      seriesCards.forEach((card) => card.classList.remove("is-spotlit", "is-dimmed"));
      seriesSection.querySelector(".series-grid")?.classList.remove("is-guided");
    }

    function guideSeries(key, trigger) {
      clearSeriesGuide();
      seriesSection.querySelector(".series-grid")?.classList.add("is-guided");
      trigger?.classList.add("is-active");

      const showAll = key === "all";
      seriesCards.forEach((card) => {
        const match = showAll || card.dataset.seriesKey === key;
        card.classList.toggle("is-spotlit", match);
        card.classList.toggle("is-dimmed", !match);
      });

      clearTimer = window.setTimeout(clearSeriesGuide, showAll ? 2400 : 3200);
    }

    seriesTriggers.forEach((trigger) => {
      trigger.addEventListener("click", (event) => {
        const key = trigger.dataset.seriesJump || "all";
        const localTarget = trigger.getAttribute("href")?.startsWith("#");
        if (localTarget) {
          event.preventDefault();
          seriesSection.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
          window.setTimeout(() => guideSeries(key, trigger), reduceMotion ? 0 : 360);
        } else {
          guideSeries(key, trigger);
        }
      });
    });
  }

  initHomepageActionFlow();

  document.querySelectorAll("[data-identity-toggle]").forEach((button) => {
    const film = button.closest("[data-logo-reel]");
    if (!film) return;

    button.addEventListener("click", () => {
      const paused = film.classList.toggle("is-paused");
      button.setAttribute("aria-pressed", paused ? "true" : "false");
      button.setAttribute("aria-label", paused ? "Play identity animation" : "Pause identity animation");
    });
  });

  if (!reduceMotion && finePointer) {
    const cursor = document.createElement("div");
    cursor.className = "glyph-cursor";
    cursor.setAttribute("aria-hidden", "true");
    document.body.appendChild(cursor);

    let activeGlyph = null;
    let typeTimer = 0;
    let finalTimer = 0;

    function moveCursor(event) {
      cursor.style.transform = `translate3d(${event.clientX + 16}px, ${event.clientY + 18}px, 0) scale(1)`;
    }

    function clearGlyphTimers() {
      window.clearInterval(typeTimer);
      window.clearTimeout(finalTimer);
    }

    function typeThenResolve(target) {
      clearGlyphTimers();
      const glyphValue = target.dataset.glyph || target.textContent.trim();
      const pinyin = target.dataset.pinyin || pinyinFor(glyphValue);
      cursor.classList.remove("is-final");
      cursor.textContent = "";
      let index = 0;
      typeTimer = window.setInterval(() => {
        index += 1;
        cursor.textContent = pinyin.slice(0, index);
        if (index >= pinyin.length) {
          window.clearInterval(typeTimer);
          finalTimer = window.setTimeout(() => {
            cursor.textContent = glyphValue;
            cursor.classList.add("is-final");
          }, 240);
        }
      }, 58);
    }

    function showGlyphCue(target, event) {
      if (!target || target === activeGlyph) {
        if (event) moveCursor(event);
        return;
      }
      if (activeGlyph) activeGlyph.classList.remove("is-glyph-hovered");
      activeGlyph = target;
      activeGlyph.classList.add("is-glyph-hovered");
      cursor.style.setProperty("--glyph-color", getComputedStyle(target).color);
      moveCursor(event);
      cursor.classList.add("is-visible");
      typeThenResolve(target);
    }

    function hideGlyphCue() {
      clearGlyphTimers();
      if (activeGlyph) activeGlyph.classList.remove("is-glyph-hovered");
      activeGlyph = null;
      cursor.classList.remove("is-visible", "is-final");
      cursor.textContent = "";
    }

    function glyphTargetFromEvent(event) {
      if (!(event.target instanceof Element)) return null;
      if (event.target.closest(".keyword-note")) return null;
      const direct = event.target.closest(".glyph-draw");
      if (direct) return direct;
      const scope = event.target.closest(".essay-card, .series-card, .filter-button, .article-hero, .page-kicker, .series-pill, .hero-system span");
      return scope ? scope.querySelector(".glyph-draw") : null;
    }

    document.addEventListener("pointerover", (event) => {
      const target = glyphTargetFromEvent(event);
      if (target) showGlyphCue(target, event);
    });

    document.addEventListener("mouseover", (event) => {
      const target = glyphTargetFromEvent(event);
      if (target) showGlyphCue(target, event);
    });

    document.addEventListener("pointermove", (event) => {
      if (activeGlyph) moveCursor(event);
    });

    document.addEventListener("mousemove", (event) => {
      if (activeGlyph) moveCursor(event);
    });

    document.addEventListener("pointerout", (event) => {
      if (!activeGlyph) return;
      const next = event.relatedTarget;
      if (next instanceof Element && activeGlyph.contains(next)) return;
      const current = glyphTargetFromEvent(event);
      const nextGlyph = next instanceof Element ? (next.closest(".glyph-draw") || next.closest(".essay-card, .series-card, .filter-button, .article-hero, .page-kicker, .series-pill, .hero-system span")?.querySelector(".glyph-draw")) : null;
      if (current === activeGlyph && nextGlyph !== activeGlyph) hideGlyphCue();
    });

    document.addEventListener("mouseout", (event) => {
      if (!activeGlyph) return;
      const next = event.relatedTarget;
      if (next instanceof Element && activeGlyph.contains(next)) return;
      const current = glyphTargetFromEvent(event);
      const nextGlyph = next instanceof Element ? (next.closest(".glyph-draw") || next.closest(".essay-card, .series-card, .filter-button, .article-hero, .page-kicker, .series-pill, .hero-system span")?.querySelector(".glyph-draw")) : null;
      if (current === activeGlyph && nextGlyph !== activeGlyph) hideGlyphCue();
    });
  }

  const revealItems = () => document.querySelectorAll("[data-reveal]");
  if (!reduceMotion) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px" }
    );
    revealItems().forEach((item) => observer.observe(item));
    setTimeout(() => revealItems().forEach((item) => observer.observe(item)), 50);
  } else {
    revealItems().forEach((item) => item.classList.add("is-visible"));
  }

  document.querySelectorAll("[data-current-year]").forEach((node) => {
    node.textContent = String(new Date().getFullYear());
  });
})();

(function initFieldSystem() {
  const content = window.GALOK_CONTENT || { essays: [], series: {} };
  const departureRoutes = window.GALOK_DEPARTURE_ROUTES || {};
  const departureData = window.GALOK_DEPARTURE_DATA || { airports: {}, countries: {}, countryCodes: [], flagCodes: [], destinations: {} };
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const body = document.body;
  const siteNav = document.querySelector(".site-nav");

  function enhanceNavigation() {
    if (!siteNav) return;

    const navInner = siteNav.querySelector(".nav-inner");
    const brand = siteNav.querySelector(".brand");
    const links = siteNav.querySelector(".nav-links");
    if (!navInner || !brand || !links) return;

    if (!brand.querySelector(".brand-lockup")) {
      brand.innerHTML = `
        <img class="brand-mark" src="/assets/galok-mark.svg" alt="" aria-hidden="true">
        <span class="brand-lockup"><b>GALOK</b><small>Field notes</small></span>
      `;
    }

    let toggle = navInner.querySelector(".nav-menu-toggle");
    if (!toggle) {
      toggle = document.createElement("button");
      toggle.className = "nav-menu-toggle";
      toggle.type = "button";
      toggle.textContent = "Menu";
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "Open navigation");
      navInner.appendChild(toggle);
    }

    function setMenu(open) {
      body.classList.toggle("nav-open", open);
      toggle.textContent = open ? "Close" : "Menu";
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
    }

    toggle.addEventListener("click", () => setMenu(!body.classList.contains("nav-open")));
    links.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => setMenu(false)));
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && body.classList.contains("nav-open")) setMenu(false);
    });

    const syncNavTone = () => siteNav.classList.toggle("is-scrolled", window.scrollY > 24);
    syncNavTone();
    window.addEventListener("scroll", syncNavTone, { passive: true });
  }

  function labelInteriorPage() {
    const hero = document.querySelector(".page-hero");
    if (!hero) return;
    const path = window.location.pathname;
    let index = "01";
    if (path.includes("/series/")) index = "02";
    if (path.includes("/visual-notes/")) index = "03";
    if (path.includes("/about/")) index = "04";
    hero.dataset.sectionIndex = index;
  }

  function initArticleProgress() {
    const article = document.querySelector(".article-content");
    if (!article) return;

    const progress = document.createElement("div");
    progress.className = "article-read-progress";
    progress.setAttribute("aria-hidden", "true");
    progress.innerHTML = "<span></span>";
    body.appendChild(progress);
    const bar = progress.querySelector("span");

    function updateProgress() {
      const rect = article.getBoundingClientRect();
      const articleTop = window.scrollY + rect.top;
      const readable = Math.max(1, article.offsetHeight - window.innerHeight * 0.55);
      const read = Math.min(1, Math.max(0, (window.scrollY - articleTop + window.innerHeight * 0.28) / readable));
      bar.style.width = `${(read * 100).toFixed(2)}%`;
    }

    updateProgress();
    window.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("resize", updateProgress);
  }

  function initGlobalContactModule() {
    document.querySelectorAll('a[href="https://x.com/galok"]').forEach((link) => {
      link.href = "https://x.com/galokview";
    });

    const footer = document.querySelector("footer.footer");
    if (!footer || document.querySelector(".site-contact")) return;

    const contact = document.createElement("section");
    contact.className = "site-contact";
    contact.setAttribute("aria-label", "Contact Galok");
    contact.innerHTML = `
      <div class="site-contact-inner">
        <p>CONTACT / GALOK</p>
        <h2>Contact me with email:</h2>
        <a href="mailto:galokview@outlook.com">galokview@outlook.com</a>
      </div>
    `;
    footer.before(contact);
  }

  function initFieldHeroCarousel() {
    const hero = document.querySelector("[data-field-hero]");
    if (!hero) return;

    const stage = hero.querySelector("[data-field-hero-stage]");
    const slides = Array.from(hero.querySelectorAll("[data-field-hero-slide]"));
    const videos = slides.map((slide) => slide.querySelector("[data-field-hero-video]"));
    const dots = Array.from(hero.querySelectorAll("[data-field-hero-dot]"));
    const progress = hero.querySelector("[data-field-hero-progress]");
    const toggle = hero.querySelector("[data-field-hero-toggle]");
    const fields = {
      note: hero.querySelector("[data-field-hero-note]"),
      place: hero.querySelector("[data-field-hero-place]"),
      coordinate: hero.querySelector("[data-field-hero-coordinate]"),
      kicker: hero.querySelector("[data-field-hero-kicker]"),
      titleOne: hero.querySelector("[data-field-hero-title-one]"),
      titleTwo: hero.querySelector("[data-field-hero-title-two]"),
      copy: hero.querySelector("[data-field-hero-copy]"),
      number: hero.querySelector("[data-field-hero-number]"),
      lens: hero.querySelector("[data-field-hero-lens]"),
      subject: hero.querySelector("[data-field-hero-subject]")
    };
    if (!stage || slides.length < 2 || videos.some((video) => !video) || Object.values(fields).some((field) => !field)) return;

    let activeIndex = 0;
    let copyTimer = 0;
    let fallbackTimer = 0;
    let swipeStartX = null;
    let userPaused = reduceMotion;
    let heroInView = true;

    function syncCopy(slide) {
      Object.entries(fields).forEach(([key, field]) => {
        field.textContent = slide.dataset[key] || "";
      });
    }

    function clearFallback() {
      window.clearTimeout(fallbackTimer);
      fallbackTimer = 0;
    }

    function updateToggle() {
      if (!toggle) return;
      const video = videos[activeIndex];
      const isPaused = userPaused || !video || video.paused;
      toggle.textContent = isPaused ? "Play" : "Pause";
      toggle.setAttribute("aria-label", isPaused ? "Play hero video" : "Pause hero video");
      toggle.setAttribute("aria-pressed", String(isPaused));
    }

    function resetProgress() {
      if (progress) progress.style.width = "0%";
    }

    function scheduleFallbackAdvance() {
      clearFallback();
      if (userPaused || document.hidden || !heroInView) return;
      fallbackTimer = window.setTimeout(() => showSlide(activeIndex + 1), 6200);
    }

    function playActive({ restart = false } = {}) {
      const activeVideo = videos[activeIndex];
      videos.forEach((video, index) => {
        if (index !== activeIndex) video.pause();
      });
      if (!activeVideo) return;

      clearFallback();
      activeVideo.muted = true;
      if (restart) {
        try {
          activeVideo.currentTime = 0;
        } catch (error) {
          // The poster remains visible until metadata is ready.
        }
      }

      if (userPaused || document.hidden || !heroInView) {
        activeVideo.pause();
        updateToggle();
        return;
      }

      const playPromise = activeVideo.play();
      if (playPromise && typeof playPromise.then === "function") {
        playPromise.then(updateToggle).catch(() => {
          updateToggle();
          scheduleFallbackAdvance();
        });
      } else {
        updateToggle();
      }
    }

    function showSlide(nextIndex, instant = false) {
      const normalized = (nextIndex + slides.length) % slides.length;
      const nextSlide = slides[normalized];
      if (!nextSlide) return;

      activeIndex = normalized;
      const preloadIndex = (activeIndex + 1) % slides.length;
      hero.dataset.heroActive = String(activeIndex + 1);
      slides.forEach((slide, index) => {
        const active = index === activeIndex;
        slide.classList.toggle("is-active", active);
        videos[index].preload = active || index === preloadIndex ? "auto" : "metadata";
        if (!active) {
          videos[index].pause();
          try {
            videos[index].currentTime = 0;
          } catch (error) {
            // Metadata may not be available yet.
          }
        }
      });
      dots.forEach((dot, index) => {
        const active = index === activeIndex;
        dot.classList.toggle("is-active", active);
        dot.setAttribute("aria-pressed", String(active));
      });

      window.clearTimeout(copyTimer);
      if (reduceMotion || instant) {
        syncCopy(nextSlide);
        hero.classList.remove("is-copy-changing");
      } else {
        hero.classList.add("is-copy-changing");
        copyTimer = window.setTimeout(() => {
          syncCopy(nextSlide);
          hero.classList.remove("is-copy-changing");
        }, 260);
      }

      resetProgress();
      playActive({ restart: true });
    }

    dots.forEach((dot) => dot.addEventListener("click", () => showSlide(Number(dot.dataset.fieldHeroDot))));
    hero.querySelector("[data-field-hero-prev]")?.addEventListener("click", () => showSlide(activeIndex - 1));
    hero.querySelector("[data-field-hero-next]")?.addEventListener("click", () => showSlide(activeIndex + 1));
    toggle?.addEventListener("click", () => {
      const activeVideo = videos[activeIndex];
      if (!activeVideo) return;

      if (userPaused || activeVideo.paused) {
        userPaused = false;
        playActive();
      } else {
        userPaused = true;
        clearFallback();
        activeVideo.pause();
        updateToggle();
      }
    });

    videos.forEach((video, index) => {
      video.addEventListener("timeupdate", () => {
        if (index !== activeIndex || !progress || !Number.isFinite(video.duration) || video.duration <= 0) return;
        const completion = Math.min(100, Math.max(0, (video.currentTime / video.duration) * 100));
        progress.style.width = `${completion.toFixed(2)}%`;
      });
      video.addEventListener("play", updateToggle);
      video.addEventListener("pause", updateToggle);
      video.addEventListener("ended", () => {
        if (index === activeIndex && !userPaused) showSlide(activeIndex + 1);
      });
      video.addEventListener("error", () => {
        if (index === activeIndex) scheduleFallbackAdvance();
      });
    });

    stage.addEventListener("pointerdown", (event) => {
      swipeStartX = event.clientX;
    });
    stage.addEventListener("pointerup", (event) => {
      if (swipeStartX === null) return;
      const delta = event.clientX - swipeStartX;
      swipeStartX = null;
      if (Math.abs(delta) >= 48) showSlide(activeIndex + (delta < 0 ? 1 : -1));
    });
    stage.addEventListener("pointercancel", () => { swipeStartX = null; });

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        clearFallback();
        videos[activeIndex]?.pause();
      } else {
        playActive();
      }
    });

    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver((entries) => {
        heroInView = entries[0]?.isIntersecting ?? true;
        if (heroInView) {
          playActive();
        } else {
          clearFallback();
          videos[activeIndex]?.pause();
        }
      }, { threshold: 0.12 });
      observer.observe(hero);
    }

    showSlide(0, true);
  }

  function initHomepageIndex() {
    const carousel = document.querySelector("[data-field-carousel]");
    const track = document.querySelector("[data-field-track]");
    const count = document.querySelector("[data-field-count]");
    const drawer = document.querySelector("[data-field-drawer]");
    if (!carousel || !track || !count || !drawer) return;

    const essayImages = [
      "/assets/visual-notes/city-road.webp",
      "/assets/visual-notes/ferry.webp",
      "/assets/visual-notes/old-street.webp",
      "/assets/visual-notes/botanical-02.webp",
      "/assets/visual-notes/return-01.webp",
      "/assets/visual-notes/gulangyu-08.webp"
    ];

    const essayItems = content.essays.map((essay, index) => ({
      eyebrow: content.series?.[essay.series]?.en || "Essay",
      title: essay.title,
      excerpt: essay.excerpt,
      href: essay.url,
      image: essayImages[index % essayImages.length],
      imageAlt: `Field image for ${essay.title}`,
      action: "Read the essay"
    }));

    const seriesItems = [
      {
        eyebrow: "View / 01",
        title: "Macro pressure becomes visible.",
        excerpt: "Follow policy, balance sheets and price signals back into ordinary choices.",
        href: "/series/macro/",
        image: "/assets/visual-notes/return-01.webp",
        imageAlt: "City and water at dusk",
        action: "Open View"
      },
      {
        eyebrow: "Frame / 02",
        title: "Scattered facts become a usable lens.",
        excerpt: "Maps, loops, receipts and concepts that keep working after the article ends.",
        href: "/series/frame/",
        image: "/assets/visual-notes/city-road.webp",
        imageAlt: "Urban road and infrastructure",
        action: "Open Frame"
      },
      {
        eyebrow: "Observe / 03",
        title: "A small scene carries the system.",
        excerpt: "Street-level evidence from stores, platforms, cities and repeated routines.",
        href: "/series/scene/",
        image: "/assets/visual-notes/old-street.webp",
        imageAlt: "Old street with lanterns",
        action: "Open Observe"
      }
    ];

    const noteItems = [
      {
        eyebrow: "Xiamen / 01",
        title: "The old street edits itself for the camera.",
        excerpt: "Lanterns, shade, storefronts and the tourist-facing texture of an alley.",
        href: "/visual-notes/xiamen/",
        image: "/assets/visual-notes/old-street.webp",
        imageAlt: "Lanterns in an old Xiamen street",
        action: "Open the note"
      },
      {
        eyebrow: "Xiamen / 02",
        title: "Infrastructure becomes the daily stage.",
        excerpt: "A road curve holds movement, greenery, concrete and summer heat in one frame.",
        href: "/visual-notes/xiamen/",
        image: "/assets/visual-notes/city-road.webp",
        imageAlt: "Road curving beneath a bridge",
        action: "Open the note"
      },
      {
        eyebrow: "Xiamen / 03",
        title: "Water turns distance into composition.",
        excerpt: "Ferry routes, skyline edges and the quiet infrastructure of arrival and return.",
        href: "/visual-notes/xiamen/",
        image: "/assets/visual-notes/ferry.webp",
        imageAlt: "Ferry on blue water",
        action: "Open the note"
      }
    ];

    const collections = { essays: essayItems, series: seriesItems, notes: noteItems };
    const labels = { essays: "ESSAYS", series: "SERIES", notes: "VISUAL NOTES" };
    let activeKey = "essays";
    let activeItems = collections[activeKey];
    let activeIndex = 0;
    let drawerIndex = 0;
    let returnFocus = null;
    let swipeStartX = null;
    let closeTimer = 0;

    function pad(value) {
      return String(value).padStart(2, "0");
    }

    function renderCards() {
      track.innerHTML = activeItems.map((item, index) => `
        <article class="field-story-card" aria-label="${item.title}">
          <div class="field-story-card-media">
            <img src="${item.image}" alt="${item.imageAlt}" loading="${index === 0 ? "eager" : "lazy"}">
          </div>
          <div class="field-story-card-copy">
            <div><span>${item.eyebrow}</span><span>${pad(index + 1)} / ${pad(activeItems.length)}</span></div>
            <h3>${item.title}</h3>
            <p>${item.excerpt}</p>
            <div class="field-card-actions">
              <a class="field-primary field-primary--light" href="${item.href}">${item.action}</a>
              <button class="field-card-preview" type="button" data-story-preview="${index}">Preview</button>
            </div>
          </div>
        </article>
      `).join("");
      activeIndex = 0;
      syncCarousel();
    }

    function syncCarousel() {
      track.style.transform = `translate3d(${-activeIndex * 100}%, 0, 0)`;
      count.textContent = `${pad(activeIndex + 1)} / ${pad(activeItems.length)}`;
    }

    function moveCarousel(direction) {
      activeIndex = (activeIndex + direction + activeItems.length) % activeItems.length;
      syncCarousel();
    }

    function updateDrawer() {
      const item = activeItems[drawerIndex];
      if (!item) return;
      drawer.querySelector("[data-drawer-meta]").textContent = `${pad(drawerIndex + 1)} / ${labels[activeKey]}`;
      drawer.querySelector("[data-drawer-series]").textContent = item.eyebrow;
      drawer.querySelector("[data-drawer-title]").textContent = item.title;
      drawer.querySelector("[data-drawer-excerpt]").textContent = item.excerpt;
      drawer.querySelector("[data-drawer-count]").textContent = `${pad(drawerIndex + 1)} / ${pad(activeItems.length)}`;
      const image = drawer.querySelector("[data-drawer-image]");
      image.src = item.image;
      image.alt = item.imageAlt;
      const link = drawer.querySelector("[data-drawer-link]");
      link.href = item.href;
      link.textContent = item.action;
    }

    function openDrawer(index, trigger) {
      window.clearTimeout(closeTimer);
      drawerIndex = Number.isFinite(index) ? index : activeIndex;
      returnFocus = trigger || document.activeElement;
      updateDrawer();
      drawer.hidden = false;
      body.classList.add("field-drawer-open");
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          drawer.classList.add("is-open");
          drawer.querySelector("header [data-story-close]")?.focus({ preventScroll: true });
        });
      });
    }

    function closeDrawer() {
      drawer.classList.remove("is-open");
      body.classList.remove("field-drawer-open");
      closeTimer = window.setTimeout(() => {
        drawer.hidden = true;
        if (returnFocus instanceof HTMLElement) returnFocus.focus({ preventScroll: true });
      }, reduceMotion ? 0 : 640);
    }

    document.querySelectorAll("[data-field-tab]").forEach((tab) => {
      tab.addEventListener("click", () => {
        activeKey = tab.dataset.fieldTab;
        activeItems = collections[activeKey];
        document.querySelectorAll("[data-field-tab]").forEach((item) => {
          item.setAttribute("aria-selected", String(item === tab));
        });
        renderCards();
      });
    });

    document.querySelector("[data-field-prev]")?.addEventListener("click", () => moveCarousel(-1));
    document.querySelector("[data-field-next]")?.addEventListener("click", () => moveCarousel(1));

    track.addEventListener("pointerdown", (event) => {
      swipeStartX = event.clientX;
    });
    track.addEventListener("pointerup", (event) => {
      if (swipeStartX === null) return;
      const delta = event.clientX - swipeStartX;
      swipeStartX = null;
      if (Math.abs(delta) < 48) return;
      moveCarousel(delta < 0 ? 1 : -1);
    });
    track.addEventListener("pointercancel", () => { swipeStartX = null; });

    document.addEventListener("click", (event) => {
      if (!(event.target instanceof Element)) return;
      const preview = event.target.closest("[data-story-preview]");
      if (preview) openDrawer(Number(preview.dataset.storyPreview), preview);
      const heroOpen = event.target.closest("[data-story-open]");
      if (heroOpen) openDrawer(Number(heroOpen.dataset.storyOpen), heroOpen);
    });

    drawer.querySelectorAll("[data-story-close]").forEach((button) => button.addEventListener("click", closeDrawer));
    drawer.querySelector("[data-story-prev]")?.addEventListener("click", () => {
      drawerIndex = (drawerIndex - 1 + activeItems.length) % activeItems.length;
      updateDrawer();
    });
    drawer.querySelector("[data-story-next]")?.addEventListener("click", () => {
      drawerIndex = (drawerIndex + 1) % activeItems.length;
      updateDrawer();
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !drawer.hidden) closeDrawer();
    });

    renderCards();
  }

  function initViewerHeroCarousel() {
    const hero = document.querySelector("[data-viewer-hero]");
    if (!hero) return;

    const stage = hero.querySelector("[data-viewer-hero-stage]");
    const slides = Array.from(hero.querySelectorAll("[data-viewer-slide]"));
    const videos = slides.map((slide) => slide.querySelector("[data-viewer-video]"));
    const dots = Array.from(hero.querySelectorAll("[data-viewer-dot]"));
    const progress = hero.querySelector("[data-viewer-progress]");
    const toggle = hero.querySelector("[data-viewer-toggle]");
    const cityStops = Array.from(document.querySelectorAll(".viewer-city-list span"));
    const fields = {
      city: hero.querySelector("[data-viewer-city]"),
      kicker: hero.querySelector("[data-viewer-kicker]"),
      copy: hero.querySelector("[data-viewer-copy]"),
      place: hero.querySelector("[data-viewer-place]"),
      coordinate: hero.querySelector("[data-viewer-coordinate]"),
      number: hero.querySelector("[data-viewer-number]"),
      region: hero.querySelector("[data-viewer-region]"),
      subject: hero.querySelector("[data-viewer-subject]")
    };
    if (!stage || slides.length < 2 || videos.some((video) => !video) || Object.values(fields).some((field) => !field)) return;

    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    let activeIndex = 0;
    let copyTimer = 0;
    let fallbackTimer = 0;
    let pointerFrame = 0;
    let pointerStart = null;
    let userPaused = reduceMotion;
    let heroInView = true;

    function syncCopy(slide) {
      Object.entries(fields).forEach(([key, field]) => {
        field.textContent = slide.dataset[key] || "";
      });
    }

    function clearFallback() {
      window.clearTimeout(fallbackTimer);
      fallbackTimer = 0;
    }

    function updateToggle() {
      if (!toggle) return;
      const video = videos[activeIndex];
      const paused = userPaused || !video || video.paused;
      toggle.textContent = paused ? "Play" : "Pause";
      toggle.setAttribute("aria-label", paused ? "Play travel video" : "Pause travel video");
      toggle.setAttribute("aria-pressed", String(paused));
    }

    function scheduleFallback() {
      clearFallback();
      if (userPaused || document.hidden || !heroInView) return;
      fallbackTimer = window.setTimeout(() => showSlide(activeIndex + 1), 5600);
    }

    function playActive({ restart = false } = {}) {
      const activeVideo = videos[activeIndex];
      videos.forEach((video, index) => {
        if (index !== activeIndex) video.pause();
      });
      if (!activeVideo) return;

      clearFallback();
      activeVideo.muted = true;
      if (restart) {
        try {
          activeVideo.currentTime = 0;
        } catch (error) {
          // The city poster remains visible while metadata loads.
        }
      }

      if (userPaused || document.hidden || !heroInView) {
        activeVideo.pause();
        updateToggle();
        return;
      }

      const promise = activeVideo.play();
      if (promise && typeof promise.then === "function") {
        promise.then(updateToggle).catch(() => {
          updateToggle();
          scheduleFallback();
        });
      } else {
        updateToggle();
      }
    }

    function showSlide(nextIndex, instant = false) {
      const normalized = (nextIndex + slides.length) % slides.length;
      const slide = slides[normalized];
      if (!slide) return;

      activeIndex = normalized;
      const preloadIndex = (activeIndex + 1) % slides.length;
      hero.dataset.viewerActive = String(activeIndex + 1);
      slides.forEach((item, index) => {
        const active = index === activeIndex;
        item.classList.toggle("is-active", active);
        videos[index].preload = active || index === preloadIndex ? "auto" : "metadata";
        if (index === preloadIndex && videos[index].readyState === 0) videos[index].load();
        if (!active) {
          videos[index].pause();
          try {
            videos[index].currentTime = 0;
          } catch (error) {
            // Metadata may not be ready yet.
          }
        }
      });
      dots.forEach((dot, index) => {
        const active = index === activeIndex;
        dot.classList.toggle("is-active", active);
        dot.setAttribute("aria-pressed", String(active));
      });
      cityStops.forEach((stop, index) => {
        const active = index === activeIndex;
        stop.classList.toggle("is-current", active);
        if (active) stop.setAttribute("aria-current", "true");
        else stop.removeAttribute("aria-current");
      });

      window.clearTimeout(copyTimer);
      if (reduceMotion || instant) {
        syncCopy(slide);
        hero.classList.remove("is-copy-changing");
      } else {
        hero.classList.add("is-copy-changing");
        copyTimer = window.setTimeout(() => {
          syncCopy(slide);
          hero.classList.remove("is-copy-changing");
        }, 260);
      }

      if (progress) progress.style.width = "0%";
      playActive({ restart: true });
    }

    function applyDepth(event, strength = 1) {
      window.cancelAnimationFrame(pointerFrame);
      pointerFrame = window.requestAnimationFrame(() => {
        const rect = hero.getBoundingClientRect();
        const x = Math.max(-1, Math.min(1, ((event.clientX - rect.left) / rect.width) * 2 - 1));
        const y = Math.max(-1, Math.min(1, ((event.clientY - rect.top) / rect.height) * 2 - 1));
        hero.style.setProperty("--viewer-stage-rx", `${(-y * 1.9 * strength).toFixed(2)}deg`);
        hero.style.setProperty("--viewer-stage-ry", `${(x * 2.6 * strength).toFixed(2)}deg`);
        hero.style.setProperty("--viewer-stage-x", `${(-x * 5 * strength).toFixed(2)}px`);
        hero.style.setProperty("--viewer-stage-y", `${(-y * 4 * strength).toFixed(2)}px`);
      });
    }

    function resetDepth() {
      window.cancelAnimationFrame(pointerFrame);
      hero.classList.remove("is-interacting", "is-pressing");
      hero.style.setProperty("--viewer-stage-rx", "0deg");
      hero.style.setProperty("--viewer-stage-ry", "0deg");
      hero.style.setProperty("--viewer-stage-x", "0px");
      hero.style.setProperty("--viewer-stage-y", "0px");
    }

    dots.forEach((dot) => dot.addEventListener("click", () => showSlide(Number(dot.dataset.viewerDot))));
    hero.querySelector("[data-viewer-prev]")?.addEventListener("click", () => showSlide(activeIndex - 1));
    hero.querySelector("[data-viewer-next]")?.addEventListener("click", () => showSlide(activeIndex + 1));
    toggle?.addEventListener("click", () => {
      const video = videos[activeIndex];
      if (!video) return;
      if (userPaused || video.paused) {
        userPaused = false;
        playActive();
      } else {
        userPaused = true;
        clearFallback();
        video.pause();
        updateToggle();
      }
    });

    videos.forEach((video, index) => {
      video.addEventListener("timeupdate", () => {
        if (index !== activeIndex || !progress || !Number.isFinite(video.duration) || video.duration <= 0) return;
        progress.style.width = `${Math.min(100, Math.max(0, (video.currentTime / video.duration) * 100)).toFixed(2)}%`;
      });
      video.addEventListener("play", updateToggle);
      video.addEventListener("pause", updateToggle);
      video.addEventListener("ended", () => {
        if (index === activeIndex && !userPaused) showSlide(activeIndex + 1);
      });
      video.addEventListener("error", () => {
        if (index === activeIndex) scheduleFallback();
      });
    });

    hero.addEventListener("pointerdown", (event) => {
      if (event.target instanceof Element && event.target.closest("button, a")) return;
      pointerStart = { x: event.clientX, y: event.clientY, id: event.pointerId };
      hero.classList.add("is-pressing");
      applyDepth(event, finePointer ? 1 : 0.72);
    });
    hero.addEventListener("pointermove", (event) => {
      if (pointerStart && pointerStart.id === event.pointerId) {
        applyDepth(event, finePointer ? 1 : 0.72);
      } else if (finePointer) {
        hero.classList.add("is-interacting");
        applyDepth(event, 1);
      }
    });
    hero.addEventListener("pointerup", (event) => {
      if (!pointerStart || pointerStart.id !== event.pointerId) return;
      const deltaX = event.clientX - pointerStart.x;
      pointerStart = null;
      resetDepth();
      if (Math.abs(deltaX) >= 48) showSlide(activeIndex + (deltaX < 0 ? 1 : -1));
    });
    hero.addEventListener("pointercancel", () => {
      pointerStart = null;
      resetDepth();
    });
    hero.addEventListener("pointerleave", () => {
      if (!pointerStart) resetDepth();
    });

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        clearFallback();
        videos[activeIndex]?.pause();
      } else {
        playActive();
      }
    });

    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver((entries) => {
        heroInView = entries[0]?.isIntersecting ?? true;
        if (heroInView) playActive();
        else {
          clearFallback();
          videos[activeIndex]?.pause();
        }
      }, { threshold: 0.12 });
      observer.observe(hero);
    }

    showSlide(0, true);
  }

  function initDepartureRoutes() {
    const module = document.querySelector("[data-departure-module]");
    if (!module) return;

    const stage = module.querySelector("[data-departure-stage]");
    const routeLayer = module.querySelector("[data-route-layer]");
    const routeMap = module.querySelector("[data-route-map]");
    const mapViewport = module.querySelector("[data-map-viewport]");
    const routeCard = module.querySelector("[data-route-card]");
    const factsMount = module.querySelector("[data-route-facts]");
    const optionButtons = Array.from(module.querySelectorAll("[data-route-option]"));
    const transferChip = module.querySelector("[data-transfer-chip]");
    const announcer = module.querySelector("[data-route-announcer]");
    const originTrigger = module.querySelector("[data-origin-trigger]");
    const originBrowser = module.querySelector("[data-origin-browser]");
    const originClose = module.querySelector("[data-origin-close]");
    const countrySearch = module.querySelector("[data-country-search]");
    const countryList = module.querySelector("[data-country-list]");
    const originFeedback = module.querySelector("[data-origin-feedback]");
    const originCityPicker = module.querySelector("[data-origin-city-picker]");
    const originCityTitle = module.querySelector("[data-origin-city-title]");
    const originCityOptions = module.querySelector("[data-origin-city-options]");
    const destinationTrigger = module.querySelector("[data-destination-trigger]");
    const destinationBrowser = module.querySelector("[data-destination-browser]");
    const destinationClose = module.querySelector("[data-destination-close]");
    const arrivalExperience = document.querySelector("[data-arrival-experience]");
    const arrivalLoading = arrivalExperience?.querySelector("[data-arrival-loading]");
    const arrivalLoadingTitle = arrivalExperience?.querySelector("[data-arrival-loading-title]");
    const arrivalLoadingCopy = arrivalExperience?.querySelector("[data-arrival-loading-copy]");
    const arrivalMount = arrivalExperience?.querySelector("[data-arrival-mount]");
    const mapControls = {
      zoomIn: module.querySelector("[data-map-zoom-in]"),
      zoomOut: module.querySelector("[data-map-zoom-out]"),
      route: module.querySelector("[data-map-show-route]"),
      city: module.querySelector("[data-map-show-city]")
    };
    const fields = {
      originFlag: module.querySelector("[data-origin-flag]"),
      originCountry: module.querySelector("[data-origin-country]"),
      originCity: module.querySelector("[data-origin-city]"),
      originAirport: module.querySelector("[data-origin-airport]"),
      destinationCity: module.querySelector("[data-destination-city]"),
      destinationAirport: module.querySelector("[data-destination-airport]"),
      mapOrigin: module.querySelector("[data-map-origin]"),
      mapStatus: module.querySelector("[data-map-status]"),
      mapDestination: module.querySelector("[data-map-destination]"),
      mapDescription: module.querySelector("[data-map-description]"),
      mapTitle: module.querySelector("#departure-map-title"),
      transferLabel: module.querySelector("[data-transfer-label]"),
      routeNumber: module.querySelector("[data-route-number]"),
      cardOrigin: module.querySelector("[data-card-origin]"),
      cardDestination: module.querySelector("[data-card-destination]"),
      routeMode: module.querySelector("[data-route-mode]"),
      entryStatus: module.querySelector(".departure-entry-note strong"),
      entryBody: module.querySelector(".departure-entry-note span"),
      transitReturn: module.querySelector("[data-transit-return]"),
      policyLink: module.querySelector("[data-entry-policy-link]"),
      arriveButton: module.querySelector("[data-arrive-route]"),
      replayButton: module.querySelector("[data-replay-route]")
    };
    const essentials = [
      stage, routeLayer, routeMap, mapViewport, routeCard, factsMount, transferChip, announcer,
      originTrigger, originBrowser, originClose, countrySearch, countryList, originFeedback,
      originCityPicker, originCityTitle, originCityOptions, destinationTrigger, destinationBrowser, destinationClose,
      arrivalExperience, arrivalLoading, arrivalLoadingTitle, arrivalLoadingCopy, arrivalMount,
      ...Object.values(mapControls), ...Object.values(fields)
    ];
    if (essentials.some((field) => !field) || optionButtons.length !== 6 || !departureRoutes["iad-shanghai"]) return;

    const svgNamespace = "http://www.w3.org/2000/svg";
    const worldWidth = 1200;
    const worldHeight = 600;
    const flagColumns = 16;
    const flagRows = 16;
    const countryDisplayNames = typeof Intl.DisplayNames === "function"
      ? new Intl.DisplayNames(["en"], { type: "region" })
      : null;
    let activeOriginId = "iad";
    let activeDestinationKey = "shanghai";
    let activeKey = `${activeOriginId}-${activeDestinationKey}`;
    let activeVisual = null;
    let runToken = 0;
    let stageInView = false;
    let hasAutoplayed = false;
    let isAnimating = false;
    let browserCloseTimer = 0;
    let destinationCloseTimer = 0;
    let arrivalLoadPromise = null;
    let cameraFrame = 0;
    let mapUserControlled = false;
    let mapView = { x: 0, y: 0, width: worldWidth, height: worldHeight };
    let panState = null;
    let pinchState = null;
    const pointers = new Map();
    const pendingTimers = new Map();

    function svgNode(tagName, attributes = {}) {
      const node = document.createElementNS(svgNamespace, tagName);
      Object.entries(attributes).forEach(([name, value]) => node.setAttribute(name, String(value)));
      return node;
    }

    function countryName(code) {
      const known = departureData.countries[code]?.name;
      if (known) return known;
      try {
        return (countryDisplayNames?.of(code.toUpperCase()) || code).toLocaleUpperCase("en-US");
      } catch (error) {
        return code.toUpperCase();
      }
    }

    function setFlagPosition(node, code) {
      const index = departureData.flagCodes.indexOf(code);
      if (!node || index < 0) return;
      const column = index % flagColumns;
      const row = Math.floor(index / flagColumns);
      node.style.setProperty("--flag-x", `${(column / (flagColumns - 1)) * 100}%`);
      node.style.setProperty("--flag-y", `${(row / (flagRows - 1)) * 100}%`);
      node.dataset.flagCode = code;
    }

    function makeFlag(code, className = "departure-country-flag") {
      const flag = document.createElement("span");
      flag.className = className;
      flag.setAttribute("aria-hidden", "true");
      setFlagPosition(flag, code);
      return flag;
    }

    function cancelRouteAnimation() {
      runToken += 1;
      isAnimating = false;
      pendingTimers.forEach((resolve, timer) => {
        window.clearTimeout(timer);
        resolve(false);
      });
      pendingTimers.clear();
    }

    function cancelCameraAnimation() {
      window.cancelAnimationFrame(cameraFrame);
      cameraFrame = 0;
    }

    function waitFor(ms, token) {
      return new Promise((resolve) => {
        const timer = window.setTimeout(() => {
          pendingTimers.delete(timer);
          resolve(token === runToken);
        }, ms);
        pendingTimers.set(timer, resolve);
      });
    }

    function scrollToArrival() {
      window.requestAnimationFrame(() => {
        arrivalExperience.scrollIntoView({
          behavior: reduceMotion ? "auto" : "smooth",
          block: "start"
        });
      });
    }

    function closeArrivalExperience() {
      if (arrivalExperience.hidden) return;
      arrivalExperience.hidden = true;
      module.classList.remove("has-arrival-open");
      fields.arriveButton.setAttribute("aria-expanded", "false");
    }

    function showArrivalFailure(message = "The Xi’an city story could not be loaded.") {
      arrivalExperience.dataset.state = "error";
      arrivalLoading.hidden = false;
      arrivalMount.hidden = true;
      arrivalLoadingTitle.textContent = "CITY STORY UNAVAILABLE";
      arrivalLoadingCopy.textContent = message;
    }

    async function loadXianArrival() {
      if (arrivalExperience.dataset.state === "ready") return;
      if (arrivalLoadPromise) return arrivalLoadPromise;

      arrivalExperience.dataset.state = "loading";
      arrivalLoading.hidden = false;
      arrivalMount.hidden = true;
      arrivalLoadingTitle.textContent = "PREPARING THE CITY STORY";
      arrivalLoadingCopy.textContent = "The Terracotta Army is coming into view.";

      arrivalLoadPromise = (async () => {
        const response = await fetch("/be-a-viewer/xian/", { headers: { Accept: "text/html" } });
        if (!response.ok) throw new Error(`Xi’an story request failed with ${response.status}`);

        const source = new DOMParser().parseFromString(await response.text(), "text/html");
        const sourceMain = source.querySelector(".xian-page-main");
        if (!sourceMain) throw new Error("Xi’an story markup was not found");

        const content = Array.from(sourceMain.children).map((node) => document.importNode(node, true));
        arrivalMount.replaceChildren(...content);
        arrivalLoading.hidden = true;
        arrivalMount.hidden = false;
        arrivalExperience.dataset.state = "ready";

        await new Promise((resolve) => window.requestAnimationFrame(resolve));
        try {
          await import("/be-a-viewer/xian/xian.js?v=3");
        } catch (error) {
          console.error("Xi’an arrival experience failed to initialize:", error);
          const modelError = arrivalMount.querySelector("[data-model-error]");
          const modelStatus = arrivalMount.querySelector("[data-model-status]");
          if (modelError) modelError.hidden = false;
          if (modelStatus) modelStatus.setAttribute("aria-hidden", "true");
        }
      })();

      try {
        await arrivalLoadPromise;
      } catch (error) {
        console.error("Xi’an arrival story failed to load:", error);
        showArrivalFailure();
      } finally {
        arrivalLoadPromise = null;
      }
    }

    async function openXianArrival() {
      arrivalExperience.hidden = false;
      module.classList.add("has-arrival-open");
      fields.arriveButton.setAttribute("aria-expanded", "true");
      scrollToArrival();
      await loadXianArrival();
    }

    function routeNodes(route) {
      const nodes = [{ ...route.origin, kind: "origin" }];
      if (route.transfer) nodes.push({ ...route.transfer, kind: "transfer" });
      nodes.push({ ...route.destination, kind: "destination" });
      return nodes;
    }

    function normalizeView(view) {
      const width = Math.max(135, Math.min(worldWidth, view.width));
      const height = Math.max(90, Math.min(worldHeight, view.height));
      const x = width >= worldWidth ? 0 : Math.max(0, Math.min(worldWidth - width, view.x));
      const y = height >= worldHeight ? 0 : Math.max(0, Math.min(worldHeight - height, view.y));
      return { x, y, width, height };
    }

    function applyView(view) {
      mapView = normalizeView(view);
      routeMap.setAttribute("viewBox", `${mapView.x.toFixed(2)} ${mapView.y.toFixed(2)} ${mapView.width.toFixed(2)} ${mapView.height.toFixed(2)}`);
    }

    function animateView(target, duration = 720) {
      const destination = normalizeView(target);
      cancelCameraAnimation();
      if (reduceMotion || duration <= 0) {
        applyView(destination);
        return;
      }
      const startView = { ...mapView };
      const start = performance.now();
      function frame(now) {
        const progress = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - progress, 3);
        applyView({
          x: startView.x + (destination.x - startView.x) * eased,
          y: startView.y + (destination.y - startView.y) * eased,
          width: startView.width + (destination.width - startView.width) * eased,
          height: startView.height + (destination.height - startView.height) * eased
        });
        if (progress < 1) cameraFrame = window.requestAnimationFrame(frame);
        else cameraFrame = 0;
      }
      cameraFrame = window.requestAnimationFrame(frame);
    }

    function mapAspect() {
      const rect = mapViewport.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0 ? rect.width / rect.height : 2;
    }

    function routeView(route) {
      const nodes = routeNodes(route);
      const minX = Math.min(...nodes.map((node) => node.x));
      const maxX = Math.max(...nodes.map((node) => node.x));
      const minY = Math.min(...nodes.map((node) => node.y));
      const maxY = Math.max(...nodes.map((node) => node.y));
      const padding = Math.abs(maxX - minX) > 400 ? 118 : 150;
      let width = Math.max(410, maxX - minX + padding * 2);
      let height = Math.max(220, maxY - minY + padding * 1.25);
      const aspect = mapAspect();
      if (width / height > aspect) height = width / aspect;
      else width = height * aspect;
      return normalizeView({
        x: (minX + maxX) / 2 - width / 2,
        y: (minY + maxY) / 2 - height / 2,
        width,
        height
      });
    }

    function cityView(route) {
      const aspect = mapAspect();
      const width = mapViewport.clientWidth < 560 ? 360 : 300;
      const height = width / aspect;
      return normalizeView({
        x: route.destination.x - width / 2,
        y: route.destination.y - height / 2,
        width,
        height
      });
    }

    function focusRoute(route, animate = true) {
      animateView(routeView(route), animate ? 720 : 0);
    }

    function focusCity(route, animate = true) {
      animateView(cityView(route), animate ? 820 : 0);
    }

    function clientToMap(clientX, clientY) {
      const rect = mapViewport.getBoundingClientRect();
      return {
        x: mapView.x + ((clientX - rect.left) / rect.width) * mapView.width,
        y: mapView.y + ((clientY - rect.top) / rect.height) * mapView.height
      };
    }

    function zoomMap(factor, clientX, clientY, userInitiated = true) {
      if (!Number.isFinite(factor) || factor <= 0) return;
      cancelCameraAnimation();
      const anchor = clientToMap(clientX, clientY);
      const width = mapView.width / factor;
      const height = mapView.height / factor;
      const relativeX = (anchor.x - mapView.x) / mapView.width;
      const relativeY = (anchor.y - mapView.y) / mapView.height;
      applyView({
        x: anchor.x - relativeX * width,
        y: anchor.y - relativeY * height,
        width,
        height
      });
      if (userInitiated) mapUserControlled = true;
    }

    function panMap(deltaX, deltaY) {
      cancelCameraAnimation();
      const rect = mapViewport.getBoundingClientRect();
      applyView({
        ...mapView,
        x: mapView.x - deltaX * mapView.width / rect.width,
        y: mapView.y - deltaY * mapView.height / rect.height
      });
      mapUserControlled = true;
    }

    function buildMap(route) {
      routeLayer.replaceChildren();
      const paths = [];
      const nodes = new Map();

      route.segments.forEach((segment, index) => {
        const shadow = svgNode("path", {
          class: "departure-route-line-shadow",
          d: segment.path,
          "data-route-segment-shadow": index,
          "aria-hidden": "true"
        });
        const line = svgNode("path", {
          class: "departure-route-line",
          d: segment.path,
          "data-route-segment": index,
          "aria-hidden": "true"
        });
        routeLayer.append(shadow, line);
        const length = line.getTotalLength();
        [shadow, line].forEach((path) => {
          path.style.strokeDasharray = `${length}`;
          path.style.strokeDashoffset = `${length}`;
        });
        paths.push({ line, shadow, length, segment });
      });

      routeNodes(route).forEach((nodeData) => {
        const group = svgNode("g", {
          class: `departure-node departure-node--${nodeData.kind}`,
          transform: `translate(${nodeData.x} ${nodeData.y})`,
          "data-route-node": nodeData.id,
          "aria-hidden": "true"
        });
        const halo = svgNode("circle", { class: "departure-node-halo", cx: 0, cy: 0, r: 29 });
        const core = svgNode("circle", { class: "departure-node-core", cx: 0, cy: 0, r: 12 });
        const label = svgNode("text", {
          class: "departure-node-label",
          x: nodeData.labelX,
          y: nodeData.labelY,
          "text-anchor": nodeData.labelAnchor
        });
        const code = svgNode("tspan", { x: nodeData.labelX });
        code.textContent = nodeData.code;
        const city = svgNode("tspan", { x: nodeData.labelX, dy: 27 });
        city.textContent = nodeData.city;
        label.append(code, city);
        group.append(halo, core, label);
        routeLayer.append(group);
        nodes.set(nodeData.id, group);
      });

      const plane = svgNode("g", { class: "departure-plane", "data-route-plane": "", "aria-hidden": "true" });
      const planeImage = svgNode("image", {
        href: "/assets/be-a-viewer/plane.svg",
        x: -28,
        y: -25,
        width: 56,
        height: 50
      });
      plane.append(planeImage);
      routeLayer.append(plane);
      activeVisual = { paths, nodes, plane };
    }

    function renderFacts(route) {
      const fragment = document.createDocumentFragment();
      route.summary.facts.forEach((fact) => {
        const row = document.createElement("dl");
        row.className = "departure-route-fact";
        const term = document.createElement("dt");
        term.textContent = fact.label;
        const value = document.createElement("dd");
        value.textContent = fact.value;
        if (fact.detail) {
          const detail = document.createElement("span");
          detail.textContent = fact.detail;
          value.append(detail);
        }
        row.append(term, value);
        fragment.append(row);
      });
      factsMount.replaceChildren(fragment);
    }

    function renderAirportLabel(route) {
      fields.destinationAirport.replaceChildren();
      fields.destinationAirport.append(`${route.summary.destinationAirport} / `);
      const code = document.createElement("b");
      code.textContent = route.destination.code;
      fields.destinationAirport.append(code);
    }

    function syncRouteCopy(route) {
      setFlagPosition(fields.originFlag, route.origin.countryCode);
      fields.originCountry.textContent = route.origin.country;
      fields.originCity.textContent = route.origin.city;
      fields.originAirport.replaceChildren();
      fields.originAirport.append(`${route.origin.airport} / `);
      const originCode = document.createElement("b");
      originCode.textContent = route.origin.code;
      fields.originAirport.append(originCode);
      fields.destinationCity.textContent = route.destination.city;
      renderAirportLabel(route);
      fields.mapOrigin.textContent = `${route.origin.city} / ${route.origin.code}`;
      fields.mapStatus.textContent = route.summary.mapStatus;
      fields.mapDestination.textContent = `${route.destination.city} / ${route.destination.code}`;
      fields.mapDescription.textContent = route.summary.description;
      fields.mapTitle.textContent = `Representative route from ${route.origin.city} to ${route.destination.city}`;
      fields.transferLabel.textContent = route.transfer ? `${route.transfer.city} ${route.transfer.code}` : "";
      fields.routeNumber.textContent = route.number;
      fields.cardOrigin.textContent = route.origin.city;
      fields.cardDestination.textContent = route.destination.city;
      fields.routeMode.textContent = route.summary.mode;
      fields.entryStatus.textContent = route.entry.status;
      fields.entryBody.textContent = route.entry.body;
      const originCountryLabel = route.origin.country.toLocaleLowerCase("en-US").split(" ").map((word) => `${word.charAt(0).toUpperCase()}${word.slice(1)}`).join(" ");
      fields.transitReturn.textContent = `A return journey between ${originCountryLabel} and China alone does not automatically qualify as third-country transit.`;
      fields.policyLink.href = route.entry.link;
      fields.arriveButton.textContent = route.summary.arriveLabel;
      const arrivalAvailable = route.destinationKey === "xian";
      fields.arriveButton.dataset.arrivalAvailable = String(arrivalAvailable);
      fields.arriveButton.setAttribute(
        "aria-label",
        arrivalAvailable
          ? `${route.summary.arriveLabel}. Reveal the Xi’an city story below.`
          : `${route.summary.arriveLabel}. City story coming soon.`
      );
      if (!arrivalAvailable) closeArrivalExperience();
      renderFacts(route);
      optionButtons.forEach((button) => {
        const selected = button.dataset.routeOption === route.destinationKey;
        button.classList.toggle("is-active", selected);
        button.setAttribute("aria-checked", String(selected));
        button.tabIndex = selected ? 0 : -1;
      });
    }

    function placePlane(pathInfo, progress) {
      if (!activeVisual) return;
      const length = pathInfo.length;
      const position = Math.max(0, Math.min(length, length * progress));
      const point = pathInfo.line.getPointAtLength(position);
      const lookDistance = Math.max(3, length * 0.012);
      const lookPosition = position >= length - lookDistance ? Math.max(0, position - lookDistance) : Math.min(length, position + lookDistance);
      const lookPoint = pathInfo.line.getPointAtLength(lookPosition);
      const angle = position >= length - lookDistance
        ? Math.atan2(point.y - lookPoint.y, point.x - lookPoint.x) * (180 / Math.PI)
        : Math.atan2(lookPoint.y - point.y, lookPoint.x - point.x) * (180 / Math.PI);
      activeVisual.plane.setAttribute("transform", `translate(${point.x.toFixed(2)} ${point.y.toFixed(2)}) rotate(${angle.toFixed(2)})`);
    }

    function resetRouteVisual(route) {
      if (!activeVisual) return;
      module.classList.remove("is-playing", "is-card-visible");
      Object.keys(departureData.destinations).forEach((key) => module.classList.remove(`is-arrived-${key}`));
      module.dataset.routePhase = "ready";
      delete module.dataset.transferVisited;
      activeVisual.paths.forEach((pathInfo) => {
        [pathInfo.shadow, pathInfo.line].forEach((path) => {
          path.style.strokeDasharray = `${pathInfo.length}`;
          path.style.strokeDashoffset = `${pathInfo.length}`;
        });
      });
      activeVisual.nodes.forEach((node) => node.classList.remove("is-complete", "is-pulsing"));
      activeVisual.nodes.get(route.origin.id)?.classList.add("is-complete");
      activeVisual.plane.classList.remove("is-visible");
      activeVisual.plane.classList.remove("is-arrived");
      const firstPath = activeVisual.paths[0];
      if (firstPath) placePlane(firstPath, 0);
      if (transferChip) transferChip.hidden = true;
      announcer.textContent = `Route ready: ${route.origin.city} to ${route.destination.city}.`;
    }

    function completeRoute(route, announce = true, shouldFocusCity = true) {
      if (!activeVisual) return;
      activeVisual.paths.forEach((pathInfo) => {
        pathInfo.shadow.style.strokeDashoffset = "0";
        pathInfo.line.style.strokeDashoffset = "0";
      });
      activeVisual.nodes.forEach((node) => {
        node.classList.remove("is-pulsing");
        node.classList.add("is-complete");
      });
      const finalPath = activeVisual.paths[activeVisual.paths.length - 1];
      if (finalPath) {
        placePlane(finalPath, 1);
        activeVisual.plane.classList.add("is-visible", "is-arrived");
      }
      if (transferChip) transferChip.hidden = true;
      module.classList.remove("is-playing");
      Object.keys(departureData.destinations).forEach((key) => module.classList.remove(`is-arrived-${key}`));
      module.classList.add("is-card-visible", `is-arrived-${route.destinationKey}`);
      module.dataset.routePhase = "arrived";
      isAnimating = false;
      if (shouldFocusCity && !mapUserControlled && !reduceMotion) focusCity(route);
      if (announce) announcer.textContent = `Arrived in ${route.destination.city}. Route information is now available.`;
    }

    function animateSegment(pathInfo, token) {
      return new Promise((resolve) => {
        const start = performance.now();
        activeVisual.plane.classList.add("is-visible");

        function frame(now) {
          if (token !== runToken || !stageInView) {
            resolve(false);
            return;
          }
          const elapsed = now - start;
          const routeProgress = Math.min(1, elapsed / pathInfo.segment.duration);
          const drawProgress = Math.min(1, elapsed / pathInfo.segment.drawDuration);
          const easedRoute = routeProgress < 0.5
            ? 4 * routeProgress * routeProgress * routeProgress
            : 1 - Math.pow(-2 * routeProgress + 2, 3) / 2;
          const easedDraw = 1 - Math.pow(1 - drawProgress, 3);
          const offset = pathInfo.length * (1 - easedDraw);
          pathInfo.shadow.style.strokeDashoffset = `${offset}`;
          pathInfo.line.style.strokeDashoffset = `${offset}`;
          placePlane(pathInfo, easedRoute);

          if (routeProgress < 1) {
            window.requestAnimationFrame(frame);
          } else {
            pathInfo.shadow.style.strokeDashoffset = "0";
            pathInfo.line.style.strokeDashoffset = "0";
            resolve(true);
          }
        }

        window.requestAnimationFrame(frame);
      });
    }

    async function playRoute() {
      const route = departureRoutes[activeKey];
      if (!route || !activeVisual) return;
      cancelRouteAnimation();
      const token = runToken;
      resetRouteVisual(route);

      if (reduceMotion || !stageInView) {
        completeRoute(route, false);
        return;
      }

      isAnimating = true;
      module.classList.add("is-playing");
      module.dataset.routePhase = "departing";
      const originNode = activeVisual.nodes.get(route.origin.id);
      originNode?.classList.add("is-pulsing");
      announcer.textContent = `Departing ${route.origin.city}, ${route.origin.code}.`;
      if (!(await waitFor(360, token))) return;

      for (let index = 0; index < activeVisual.paths.length; index += 1) {
        const pathInfo = activeVisual.paths[index];
        const segment = route.segments[index];
        module.dataset.routePhase = `leg-${index + 1}`;
        announcer.textContent = `Flying from ${segment.from.city} to ${segment.to.city}.`;
        const completed = await animateSegment(pathInfo, token);
        if (!completed || token !== runToken) return;
        activeVisual.nodes.get(segment.to.id)?.classList.add("is-complete");

        if (route.transfer && segment.to.id === route.transfer.id) {
          module.dataset.routePhase = "transfer";
          module.dataset.transferVisited = "true";
          if (transferChip) transferChip.hidden = false;
          announcer.textContent = `Transfer at ${route.transfer.city}, ${route.transfer.code}.`;
          if (!(await waitFor(1200, token))) return;
          if (transferChip) transferChip.hidden = true;
        }
      }

      originNode?.classList.remove("is-pulsing");
      completeRoute(route);
    }

    function renderRoute(nextKey, shouldPlay = false) {
      const route = departureRoutes[nextKey];
      if (!route) return;
      cancelRouteAnimation();
      activeKey = nextKey;
      activeOriginId = route.origin.id;
      activeDestinationKey = route.destinationKey;
      mapUserControlled = false;
      syncRouteCopy(route);
      buildMap(route);
      resetRouteVisual(route);
      focusRoute(route, false);
      if (shouldPlay) playRoute();
      else if (reduceMotion) completeRoute(route, false);
    }

    function selectRoute(nextDestinationKey) {
      const nextKey = `${activeOriginId}-${nextDestinationKey}`;
      if (!departureRoutes[nextKey]) return;
      hasAutoplayed = true;
      renderRoute(nextKey, stageInView && !reduceMotion);
      if (!stageInView || reduceMotion) completeRoute(departureRoutes[nextKey], false);
    }

    optionButtons.forEach((button, buttonIndex) => {
      button.addEventListener("click", () => {
        selectRoute(button.dataset.routeOption);
        closeDestinationBrowser(true);
      });
      button.addEventListener("keydown", (event) => {
        let nextIndex = buttonIndex;
        if (event.key === "ArrowRight" || event.key === "ArrowDown") nextIndex = (buttonIndex + 1) % optionButtons.length;
        else if (event.key === "ArrowLeft" || event.key === "ArrowUp") nextIndex = (buttonIndex - 1 + optionButtons.length) % optionButtons.length;
        else if (event.key === "Home") nextIndex = 0;
        else if (event.key === "End") nextIndex = optionButtons.length - 1;
        else return;
        event.preventDefault();
        optionButtons[nextIndex].focus();
        optionButtons[nextIndex].click();
      });
    });

    function renderOriginCities(countryCode, anchorButton = null) {
      const country = departureData.countries[countryCode];
      if (!country) return;
      originCityTitle.textContent = `AVAILABLE FROM ${country.name}`;
      originCityPicker.hidden = false;
      if (anchorButton) anchorButton.insertAdjacentElement("afterend", originCityPicker);
      const fragment = document.createDocumentFragment();
      country.cities.forEach((airportId) => {
        const airport = departureData.airports[airportId];
        const button = document.createElement("button");
        const selected = airport.id === activeOriginId;
        button.type = "button";
        button.className = selected ? "is-active" : "";
        button.setAttribute("role", "radio");
        button.setAttribute("aria-checked", String(selected));
        button.innerHTML = `<strong>${airport.city}</strong><span>${airport.airport} / ${airport.code}</span>`;
        button.addEventListener("click", () => {
          const nextKey = `${airport.id}-${activeDestinationKey}`;
          if (!departureRoutes[nextKey]) return;
          originFeedback.textContent = `${airport.city} selected. Route to ${departureData.destinations[activeDestinationKey].city} is ready.`;
          renderRoute(nextKey, stageInView && !reduceMotion);
          if (!stageInView || reduceMotion) completeRoute(departureRoutes[nextKey], false);
          closeOriginBrowser(true);
        });
        fragment.append(button);
      });
      originCityOptions.replaceChildren(fragment);
      const cityButtons = Array.from(originCityOptions.querySelectorAll("button"));
      cityButtons.forEach((button, index) => {
        button.addEventListener("keydown", (event) => {
          let nextIndex = index;
          if (event.key === "ArrowRight" || event.key === "ArrowDown") nextIndex = (index + 1) % cityButtons.length;
          else if (event.key === "ArrowLeft" || event.key === "ArrowUp") nextIndex = (index - 1 + cityButtons.length) % cityButtons.length;
          else return;
          event.preventDefault();
          cityButtons[nextIndex].focus();
        });
      });
    }

    function renderCountryList() {
      const regionOrder = ["ASIA", "EUROPE", "NORTH AMERICA", "SOUTH AMERICA", "OCEANIA"];
      const countries = departureData.countryCodes.map((code) => departureData.countries[code]).filter(Boolean);
      const fragment = document.createDocumentFragment();
      regionOrder.forEach((regionName) => {
        const regionCountries = countries.filter((country) => country.region === regionName);
        if (!regionCountries.length) return;
        const region = document.createElement("section");
        region.className = "departure-country-region";
        region.dataset.countryRegion = regionName;
        const heading = document.createElement("p");
        heading.textContent = regionName;
        const grid = document.createElement("div");
        grid.className = "departure-country-region-grid";

        regionCountries.forEach((country) => {
          const button = document.createElement("button");
          button.type = "button";
          button.className = "departure-country-option is-available";
          button.dataset.countryCode = country.code;
          button.dataset.countryName = country.name;
          button.setAttribute("aria-label", `${country.name}. Choose a departure city.`);
          button.append(makeFlag(country.code));
          const text = document.createElement("span");
          const name = document.createElement("strong");
          const status = document.createElement("small");
          name.textContent = country.name;
          status.textContent = country.cities.length > 1 ? `${country.cities.length} DEPARTURE CITIES` : "CAPITAL DEPARTURE";
          text.append(name, status);
          button.append(text);
          button.addEventListener("click", () => {
            countryList.querySelectorAll(".is-selected").forEach((item) => item.classList.remove("is-selected"));
            button.classList.add("is-selected");
            renderOriginCities(country.code, button);
            originFeedback.textContent = `Choose a departure city in ${country.name}.`;
            originCityOptions.querySelector("button")?.focus();
          });
          grid.append(button);
        });
        region.append(heading, grid);
        fragment.append(region);
      });
      countryList.replaceChildren(fragment);
    }

    function filterCountries() {
      const query = countrySearch.value.trim().toLocaleUpperCase("en-US");
      let visible = 0;
      countryList.querySelectorAll("[data-country-name]").forEach((button) => {
        const matches = !query || button.dataset.countryName.includes(query) || button.dataset.countryCode.toUpperCase().includes(query);
        button.hidden = !matches;
        if (matches) visible += 1;
      });
      countryList.querySelectorAll("[data-country-region]").forEach((region) => {
        region.hidden = !Array.from(region.querySelectorAll("[data-country-name]")).some((button) => !button.hidden);
      });
      const selectedCountry = countryList.querySelector(".departure-country-option.is-selected");
      if (selectedCountry) originCityPicker.hidden = Boolean(query && selectedCountry.hidden);
      originFeedback.textContent = query
        ? `${visible} DEPARTURE COUNTRIES MATCH “${query}”.`
        : "Twenty departure countries are available across five regions.";
    }

    function openOriginBrowser() {
      closeDestinationBrowser(false);
      window.clearTimeout(browserCloseTimer);
      originBrowser.hidden = false;
      originTrigger.setAttribute("aria-expanded", "true");
      const activeCountryCode = departureData.airports[activeOriginId].countryCode;
      const activeCountryButton = countryList.querySelector(`[data-country-code="${activeCountryCode}"]`);
      countryList.querySelectorAll(".is-selected").forEach((item) => item.classList.remove("is-selected"));
      activeCountryButton?.classList.add("is-selected");
      renderOriginCities(activeCountryCode, activeCountryButton);
      window.requestAnimationFrame(() => originBrowser.classList.add("is-open"));
      window.setTimeout(() => {
        if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) countrySearch.focus();
        else activeCountryButton?.focus();
      }, reduceMotion ? 0 : 260);
    }

    function closeOriginBrowser(returnFocus = false) {
      if (originBrowser.hidden) return;
      originBrowser.classList.remove("is-open");
      originTrigger.setAttribute("aria-expanded", "false");
      window.clearTimeout(browserCloseTimer);
      browserCloseTimer = window.setTimeout(() => {
        originBrowser.hidden = true;
        if (returnFocus) originTrigger.focus();
      }, reduceMotion ? 0 : 280);
    }

    function openDestinationBrowser() {
      closeOriginBrowser(false);
      window.clearTimeout(destinationCloseTimer);
      destinationBrowser.hidden = false;
      destinationTrigger.setAttribute("aria-expanded", "true");
      window.requestAnimationFrame(() => destinationBrowser.classList.add("is-open"));
      window.setTimeout(() => optionButtons.find((button) => button.classList.contains("is-active"))?.focus(), reduceMotion ? 0 : 260);
    }

    function closeDestinationBrowser(returnFocus = false) {
      if (destinationBrowser.hidden) return;
      destinationBrowser.classList.remove("is-open");
      destinationTrigger.setAttribute("aria-expanded", "false");
      window.clearTimeout(destinationCloseTimer);
      destinationCloseTimer = window.setTimeout(() => {
        destinationBrowser.hidden = true;
        if (returnFocus) destinationTrigger.focus();
      }, reduceMotion ? 0 : 280);
    }

    renderCountryList();
    originTrigger.addEventListener("click", () => {
      if (originBrowser.hidden) openOriginBrowser();
      else closeOriginBrowser(true);
    });
    originClose.addEventListener("click", () => closeOriginBrowser(true));
    countrySearch.addEventListener("input", filterCountries);
    originBrowser.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeOriginBrowser(true);
      }
    });
    destinationTrigger.addEventListener("click", () => {
      if (destinationBrowser.hidden) openDestinationBrowser();
      else closeDestinationBrowser(true);
    });
    destinationClose.addEventListener("click", () => closeDestinationBrowser(true));
    destinationBrowser.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeDestinationBrowser(true);
      }
    });

    mapViewport.addEventListener("wheel", (event) => {
      event.preventDefault();
      const factor = Math.exp(-event.deltaY * 0.0016);
      zoomMap(Math.max(0.55, Math.min(1.8, factor)), event.clientX, event.clientY);
    }, { passive: false });

    mapViewport.addEventListener("pointerdown", (event) => {
      if (event.target.closest("button")) return;
      event.preventDefault();
      mapViewport.setPointerCapture?.(event.pointerId);
      pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
      mapViewport.classList.add("is-grabbing");
      if (pointers.size === 1) panState = { x: event.clientX, y: event.clientY };
      if (pointers.size === 2) {
        const points = Array.from(pointers.values());
        pinchState = {
          distance: Math.hypot(points[1].x - points[0].x, points[1].y - points[0].y),
          midpoint: { x: (points[0].x + points[1].x) / 2, y: (points[0].y + points[1].y) / 2 }
        };
      }
    });

    mapViewport.addEventListener("pointermove", (event) => {
      if (!pointers.has(event.pointerId)) return;
      event.preventDefault();
      pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
      if (pointers.size === 1 && panState) {
        panMap(event.clientX - panState.x, event.clientY - panState.y);
        panState = { x: event.clientX, y: event.clientY };
      } else if (pointers.size === 2) {
        const points = Array.from(pointers.values());
        const distance = Math.hypot(points[1].x - points[0].x, points[1].y - points[0].y);
        const midpoint = { x: (points[0].x + points[1].x) / 2, y: (points[0].y + points[1].y) / 2 };
        if (pinchState?.distance > 0) {
          panMap(midpoint.x - pinchState.midpoint.x, midpoint.y - pinchState.midpoint.y);
          zoomMap(distance / pinchState.distance, midpoint.x, midpoint.y);
        }
        pinchState = { distance, midpoint };
      }
    });

    function releasePointer(event) {
      pointers.delete(event.pointerId);
      if (pointers.size === 0) {
        mapViewport.classList.remove("is-grabbing");
        panState = null;
        pinchState = null;
      } else if (pointers.size === 1) {
        const point = Array.from(pointers.values())[0];
        panState = { ...point };
        pinchState = null;
      }
    }
    mapViewport.addEventListener("pointerup", releasePointer);
    mapViewport.addEventListener("pointercancel", releasePointer);
    mapViewport.addEventListener("lostpointercapture", releasePointer);

    mapViewport.addEventListener("keydown", (event) => {
      const rect = mapViewport.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      if (event.key === "+" || event.key === "=") zoomMap(1.35, centerX, centerY);
      else if (event.key === "-" || event.key === "_") zoomMap(1 / 1.35, centerX, centerY);
      else if (event.key === "ArrowLeft") panMap(70, 0);
      else if (event.key === "ArrowRight") panMap(-70, 0);
      else if (event.key === "ArrowUp") panMap(0, 70);
      else if (event.key === "ArrowDown") panMap(0, -70);
      else if (event.key === "Home") {
        mapUserControlled = true;
        focusRoute(departureRoutes[activeKey]);
      } else if (event.key === "End") {
        mapUserControlled = true;
        focusCity(departureRoutes[activeKey]);
      } else return;
      event.preventDefault();
    });

    mapControls.zoomIn.addEventListener("click", () => {
      const rect = mapViewport.getBoundingClientRect();
      zoomMap(1.45, rect.left + rect.width / 2, rect.top + rect.height / 2);
    });
    mapControls.zoomOut.addEventListener("click", () => {
      const rect = mapViewport.getBoundingClientRect();
      zoomMap(1 / 1.45, rect.left + rect.width / 2, rect.top + rect.height / 2);
    });
    mapControls.route.addEventListener("click", () => {
      mapUserControlled = true;
      focusRoute(departureRoutes[activeKey]);
    });
    mapControls.city.addEventListener("click", () => {
      mapUserControlled = true;
      focusCity(departureRoutes[activeKey]);
    });

    fields.replayButton.addEventListener("click", () => {
      const rect = stage.getBoundingClientRect();
      stageInView = rect.bottom > 0 && rect.top < window.innerHeight;
      mapUserControlled = false;
      focusRoute(departureRoutes[activeKey]);
      if (stageInView && !reduceMotion) playRoute();
      else completeRoute(departureRoutes[activeKey]);
    });

    fields.arriveButton.addEventListener("click", () => {
      const route = departureRoutes[activeKey];
      if (!route) return;
      if (route.destinationKey !== "xian") {
        announcer.textContent = `${route.destination.city} city story is coming soon.`;
        return;
      }
      openXianArrival();
    });

    document.addEventListener("visibilitychange", () => {
      if (!document.hidden || !isAnimating) return;
      cancelRouteAnimation();
      completeRoute(departureRoutes[activeKey], false, false);
    });

    module.classList.add("is-enhanced");
    renderRoute(activeKey);

    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver((entries) => {
        const visible = entries[0]?.isIntersecting ?? false;
        stageInView = visible;
        if (visible && !hasAutoplayed) {
          hasAutoplayed = true;
          playRoute();
        } else if (!visible && isAnimating) {
          cancelRouteAnimation();
          completeRoute(departureRoutes[activeKey], false, false);
        }
      }, { threshold: 0.18 });
      observer.observe(stage);
    } else {
      stageInView = true;
      hasAutoplayed = true;
      playRoute();
    }
  }

  function initBeAViewerDepth() {
    const cards = Array.from(document.querySelectorAll("[data-viewer-card]"));
    if (!cards.length || reduceMotion) return;

    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

    cards.forEach((card) => {
      let pointerFrame = 0;

      function resetCard() {
        window.cancelAnimationFrame(pointerFrame);
        card.classList.remove("is-interacting", "is-touching");
        card.style.setProperty("--viewer-rx", "0deg");
        card.style.setProperty("--viewer-ry", "0deg");
        card.style.setProperty("--viewer-image-x", "0px");
        card.style.setProperty("--viewer-image-y", "0px");
      }

      if (finePointer) {
        card.addEventListener("pointerenter", () => card.classList.add("is-interacting"));
        card.addEventListener("pointermove", (event) => {
          window.cancelAnimationFrame(pointerFrame);
          pointerFrame = window.requestAnimationFrame(() => {
            const rect = card.getBoundingClientRect();
            const x = Math.max(-1, Math.min(1, ((event.clientX - rect.left) / rect.width) * 2 - 1));
            const y = Math.max(-1, Math.min(1, ((event.clientY - rect.top) / rect.height) * 2 - 1));
            card.style.setProperty("--viewer-rx", `${(-y * 3.4).toFixed(2)}deg`);
            card.style.setProperty("--viewer-ry", `${(x * 4.6).toFixed(2)}deg`);
            card.style.setProperty("--viewer-image-x", `${(-x * 7).toFixed(2)}px`);
            card.style.setProperty("--viewer-image-y", `${(-y * 5).toFixed(2)}px`);
          });
        });
        card.addEventListener("pointerleave", resetCard);
        card.addEventListener("pointercancel", resetCard);
      } else {
        let touching = false;
        card.addEventListener("pointerdown", (event) => {
          touching = true;
          card.classList.add("is-touching");
          const rect = card.getBoundingClientRect();
          const x = Math.max(-1, Math.min(1, ((event.clientX - rect.left) / rect.width) * 2 - 1));
          const y = Math.max(-1, Math.min(1, ((event.clientY - rect.top) / rect.height) * 2 - 1));
          card.style.setProperty("--viewer-rx", `${(-y * 1.7).toFixed(2)}deg`);
          card.style.setProperty("--viewer-ry", `${(x * 2.2).toFixed(2)}deg`);
          card.style.setProperty("--viewer-image-x", `${(-x * 4).toFixed(2)}px`);
          card.style.setProperty("--viewer-image-y", `${(-y * 3).toFixed(2)}px`);
        });
        card.addEventListener("pointermove", (event) => {
          if (!touching) return;
          const rect = card.getBoundingClientRect();
          const x = Math.max(-1, Math.min(1, ((event.clientX - rect.left) / rect.width) * 2 - 1));
          const y = Math.max(-1, Math.min(1, ((event.clientY - rect.top) / rect.height) * 2 - 1));
          card.style.setProperty("--viewer-rx", `${(-y * 1.7).toFixed(2)}deg`);
          card.style.setProperty("--viewer-ry", `${(x * 2.2).toFixed(2)}deg`);
          card.style.setProperty("--viewer-image-x", `${(-x * 4).toFixed(2)}px`);
          card.style.setProperty("--viewer-image-y", `${(-y * 3).toFixed(2)}px`);
        });
        const endTouch = () => {
          touching = false;
          resetCard();
        };
        card.addEventListener("pointerup", endTouch);
        card.addEventListener("pointercancel", endTouch);
        card.addEventListener("pointerleave", endTouch);
      }
    });

    let scrollFrame = 0;
    function syncViewerScroll() {
      scrollFrame = 0;
      cards.forEach((card) => {
        const rect = card.getBoundingClientRect();
        if (rect.bottom < 0 || rect.top > window.innerHeight) return;
        const cardCenter = rect.top + rect.height / 2;
        const viewportCenter = window.innerHeight / 2;
        const progress = Math.max(-1, Math.min(1, (cardCenter - viewportCenter) / window.innerHeight));
        card.style.setProperty("--viewer-scroll-y", `${(-progress * 9).toFixed(2)}px`);
      });
    }

    function requestViewerScroll() {
      if (scrollFrame) return;
      scrollFrame = window.requestAnimationFrame(syncViewerScroll);
    }

    syncViewerScroll();
    window.addEventListener("scroll", requestViewerScroll, { passive: true });
    window.addEventListener("resize", requestViewerScroll);
  }

  enhanceNavigation();
  initGlobalContactModule();
  labelInteriorPage();
  initArticleProgress();
  initFieldHeroCarousel();
  initHomepageIndex();
  initViewerHeroCarousel();
  initDepartureRoutes();
  initBeAViewerDepth();
})();
