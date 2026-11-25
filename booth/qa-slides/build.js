const pptxgen = require("pptxgenjs");
const { applyTheme } = require("/root/.claude/skills/synced/c326d757-ddd9-4511-8943-35851afba68f_b15d348b-9255-4a0a-ab6e-b66d49e822b7/pptx/scripts/apply_theme.js");
const icon = require("./icons.js");

const HEAD = "Cormorant Garamond", BODY = "Inter";
const THEME = {
  name: "Deposera",
  headFontFace: HEAD,
  bodyFontFace: BODY,
  colors: {
    dk1: "17271F", lt1: "FFFFFF", dk2: "0B1D15", lt2: "F4EEE1",
    accent1: "21503C", accent2: "B8925A", accent3: "173A2B", accent4: "B5503F",
    accent5: "7D5F30", accent6: "D9CBAD", hlink: "21503C", folHlink: "7D5F30",
  },
};
const H = { dark: "0B1D15", ink: "17271F", green: "21503C", green2: "173A2B", mid: "2F6A50", gold: "B8925A", goldDark: "7D5F30", goldLight: "D9CBAD", cream: "F4EEE1", paper: "FBF8F1", line: "E9DFCA", soft: "4A5A51", red: "B5503F", white: "FFFFFF" };
const OUT = process.argv[2] || "Deposera-QA-slides.pptx";

(async () => {
  const pres = new pptxgen();
  pres.layout = "LAYOUT_16x9"; // 10 x 5.625, same as the main deck
  pres.title = "Deposera Q&A slides";
  pres.author = "Deposera";
  pres.theme = { headFontFace: HEAD, bodyFontFace: BODY };

  pres.defineSlideMaster({
    title: "Deposera QA",
    background: { color: H.paper },
    objects: [
      { image: { path: "logo.png", x: 9.17, y: 0.28, w: 0.33, h: 0.33 } },
      { text: { text: "Deposera  ·  Q&A slides", options: { x: 0.5, y: 5.28, w: 4, h: 0.22, fontSize: 8, color: H.soft, margin: 0, valign: "middle" } } },
      { placeholder: { options: { name: "kicker", type: "body", x: 0.5, y: 0.3, w: 8.4, h: 0.22, fontSize: 8.5, bold: true, charSpacing: 1.5, color: H.goldDark, margin: 0, valign: "middle" }, text: "KICKER" } },
      { placeholder: { options: { name: "title", type: "title", x: 0.5, y: 0.52, w: 8.5, h: 0.62, fontFace: HEAD, fontSize: 28, bold: true, color: H.dark, margin: 0, valign: "middle", align: "left" }, text: "Title" } },
    ],
    slideNumber: { x: 9.0, y: 5.28, w: 0.5, h: 0.22, fontSize: 8, color: H.soft, align: "right" },
  });

  const tb = (s, text, o) => s.addText(text, Object.assign({ margin: 0, isTextBox: true, fontFace: BODY }, o));
  const card = (s, x, y, w, h, fill, name) => s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, rectRadius: 0.08, fill: { color: fill }, line: { color: fill === H.white ? H.line : fill, width: 0.75 }, objectName: name });
  const source = (s, text) => tb(s, text, { x: 0.5, y: 5.02, w: 9.0, h: 0.22, fontSize: 7.5, italic: true, color: H.soft, valign: "middle", objectName: "Source note" });
  const head = (s, kicker, title) => { s.addText(kicker, { placeholder: "kicker" }); s.addText(title, { placeholder: "title" }); };
  const eur = (n) => "€" + Math.round(n).toLocaleString("en-US");

  /* ---------------- 1. The service ---------------- */
  pres.addSection({ title: "Product" });
  let s = pres.addSlide({ masterName: "Deposera QA", sectionTitle: "Product" });
  head(s, "Q&A  ·  PRODUCT", "One service, from signed lease to payout");
  const steps = [
    ["Register", "Agency or landlord adds the tenancy", "Deposera platform"],
    ["Pay in", "Tenant pays the deposit, after an ID check", "OPP escrow"],
    ["Move-in", "Dated photos; both sides add notes in 7 days, then sign", "Our inspector"],
    ["Hold", "Money stays apart from Deposera all tenancy", "OPP escrow"],
    ["Move-out", "Damage list first; tenant can fix it. Rest: landlord's firm, with invoice", "Inspector + repair firm"],
    ["Pay out", "In 14 days, or 30 with repairs. Disputes: reviewer, 15 working days", "OPP + reviewer"],
  ];
  const colW = 1.5, x0 = 0.5, yC = 1.55;
  s.addShape(pres.shapes.LINE, { x: x0 + colW / 2, y: yC + 0.21, w: colW * 5, h: 0, line: { color: H.goldLight, width: 1.5 }, objectName: "Timeline line" });
  steps.forEach(([t, d, who], i) => {
    const x = x0 + i * colW;
    s.addShape(pres.shapes.OVAL, { x: x + colW / 2 - 0.21, y: yC, w: 0.42, h: 0.42, fill: { color: H.green }, line: { color: H.paper, width: 2 }, objectName: `Step ${i + 1} circle` });
    tb(s, String(i + 1), { x: x + colW / 2 - 0.21, y: yC, w: 0.42, h: 0.42, fontFace: BODY, fontSize: 12, bold: true, color: H.goldLight, align: "center", valign: "middle", objectName: `Step ${i + 1} number` });
    tb(s, t, { x: x + 0.08, y: yC + 0.52, w: colW - 0.16, h: 0.3, fontSize: 11.5, bold: true, color: H.dark, align: "center", objectName: `Step ${i + 1} title` });
    tb(s, d, { x: x + 0.08, y: yC + 0.83, w: colW - 0.16, h: 0.78, fontSize: 8.5, color: H.soft, align: "center", valign: "top", objectName: `Step ${i + 1} text` });
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: x + 0.14, y: yC + 1.62, w: colW - 0.28, h: 0.26, rectRadius: 0.13, fill: { color: H.cream }, line: { color: H.line, width: 0.5 }, objectName: `Step ${i + 1} chip` });
    tb(s, who, { x: x + 0.14, y: yC + 1.62, w: colW - 0.28, h: 0.26, fontSize: 7.5, bold: true, color: H.goldDark, align: "center", valign: "middle", objectName: `Step ${i + 1} who` });
  });
  const opts = [
    [H.white, "AGENCIES  ·  FIXED PRICE", "from €70", "€70–€150 per home: photo reports at move-in and move-out, and the damage list."],
    [H.dark, "PRIVATE LANDLORD + TENANT", "from €85", "+€15: deposit held at OPP. €85–€165, paid together."],
  ];
  opts.forEach(([fill, label, val, txt], i) => {
    const x = 0.5 + i * 4.6, y = 3.78, w = 4.4, h = 1.12, dark = i === 1;
    card(s, x, y, w, h, fill, `Price card ${i + 1}`);
    tb(s, label, { x: x + 0.2, y: y + 0.14, w: w - 0.4, h: 0.2, fontSize: 7.5, bold: true, charSpacing: 1.2, color: dark ? H.gold : H.goldDark, objectName: `Price label ${i + 1}` });
    tb(s, val, { x: x + 0.2, y: y + 0.36, w: w - 0.4, h: 0.4, fontFace: BODY, fontSize: 20, bold: true, color: dark ? H.goldLight : H.green, objectName: `Price value ${i + 1}` });
    tb(s, txt, { x: x + 0.2, y: y + 0.76, w: w - 0.4, h: 0.3, fontSize: 8, color: dark ? H.line : H.soft, valign: "top", objectName: `Price text ${i + 1}` });
  });
  source(s, "OPP = Online Payment Platform, a payment institution licensed by DNB (Dutch central bank). Agencies pay a fixed price; a private landlord and tenant who book on their own pay together. Excl. 21% BTW.");

  /* ---------------- 2. The app ---------------- */
  s = pres.addSlide({ masterName: "Deposera QA", sectionTitle: "Product" });
  head(s, "Q&A  ·  PRODUCT", "The app prototype: the whole tenancy in one place");
  const shots = [
    ["app-home.png", "Home", "The next step, the deposit and the key dates"],
    ["app-damage.png", "Damage", "Choose “I’ll fix it” and see the money back update"],
    ["app-records.png", "Records", "A dated timeline and every document"],
  ];
  const ph = 3.25, pw = ph * 782 / 1672;
  shots.forEach(([file, t, d], i) => {
    const cx = 0.5 + i * 3.05;
    s.addImage({ path: file, x: cx, y: 1.3, w: pw, h: ph, altText: `App prototype: ${t} screen`, objectName: `Phone ${i + 1}` });
    const tx = cx + pw + 0.18, tw = 3.05 - pw - 0.35;
    tb(s, String(i + 1), { x: tx, y: 1.55, w: 0.5, h: 0.45, fontFace: BODY, fontSize: 20, bold: true, color: H.gold, objectName: `Screen ${i + 1} number` });
    tb(s, t, { x: tx, y: 2.0, w: tw, h: 0.3, fontSize: 12, bold: true, color: H.dark, objectName: `Screen ${i + 1} title` });
    tb(s, d, { x: tx, y: 2.32, w: tw, h: 1.0, fontSize: 9, color: H.soft, valign: "top", objectName: `Screen ${i + 1} text` });
  });
  card(s, 0.5, 4.62, 9.0, 0.38, H.dark, "Try it bar");
  tb(s, [
    { text: "Try it now   ", options: { bold: true, color: H.goldLight } },
    { text: "Website  ", options: { color: H.goldLight } },
    { text: "francis823.github.io/Deposera", options: { color: H.white, bold: true } },
    { text: "      App prototype  ", options: { color: H.goldLight } },
    { text: "francis823.github.io/Deposera/app", options: { color: H.white, bold: true } },
  ], { x: 0.7, y: 4.62, w: 8.6, h: 0.38, fontSize: 9, valign: "middle", objectName: "Try it text" });

  /* ---------------- 3. Prices and unit economics ---------------- */
  pres.addSection({ title: "Financial results" });
  s = pres.addSlide({ masterName: "Deposera QA", sectionTitle: "Financial results" });
  head(s, "Q&A  ·  PRICES", "One fixed price per home, and 64% of it is margin");
  const thc = (t, al = "center") => ({ text: t, options: { bold: true, color: H.cream, fill: { color: H.dark }, align: al, valign: "middle" } });
  const tdc = (t, o = {}) => ({ text: t, options: Object.assign({ color: H.ink, align: "center", valign: "middle" }, o) });
  const avg = { bold: true, fill: { color: H.cream } };
  s.addTable([
    [thc("Type of home (mix)", "left"), thc("Visit"), thc("Agency"), thc("Landlord + tenant"), thc("Margin")],
    [tdc("Room (30%)", { align: "left" }), tdc("20 min"), tdc("€70"), tdc("€85"), tdc("61–62%")],
    [tdc("Studio (25%)", { align: "left" }), tdc("30 min"), tdc("€80"), tdc("€95"), tdc("62–63%")],
    [tdc("Apartment (30%)", { align: "left" }), tdc("50 min"), tdc("€100"), tdc("€115"), tdc("63%")],
    [tdc("House (15%)", { align: "left" }), tdc("75 min"), tdc("€150"), tdc("€165"), tdc("69%")],
    [tdc("Average", Object.assign({ align: "left" }, avg)), tdc("40 min", avg), tdc("€93.50", avg), tdc("€108.50", avg), tdc("64%", Object.assign({}, avg, { color: H.green }))],
  ], { x: 0.5, y: 1.35, w: 5.1, colW: [1.45, 0.75, 1.0, 1.1, 0.8], rowH: 0.36, fontFace: BODY, fontSize: 9, border: { type: "solid", pt: 0.5, color: H.line }, fill: { color: H.white }, margin: [0.03, 0.08, 0.03, 0.08], objectName: "Price table" });
  card(s, 0.5, 3.75, 5.1, 1.15, H.white, "Price notes card");
  tb(s, [
    { text: "Who pays: ", options: { bold: true, color: H.green } },
    { text: "agencies pay a fixed price per home. A private landlord and tenant who book on their own pay together. 100% upfront.", options: { color: H.ink, breakLine: true } },
    { text: "Landlord + tenant ", options: { bold: true, color: H.green } },
    { text: "price adds €15 for holding the deposit (escrow, ID checks, payout). Expected for 75% of tenancies.", options: { color: H.ink, breakLine: true } },
    { text: "Same fee ", options: { bold: true, color: H.green } },
    { text: "whatever happens at move-out, so we gain nothing from deductions.", options: { color: H.ink } },
  ], { x: 0.7, y: 3.83, w: 4.7, h: 1.0, fontSize: 8.5, valign: "middle", paraSpaceAfter: 3, objectName: "Price notes" });

  // Right: what one average tenancy earns
  card(s, 5.85, 1.35, 3.65, 3.55, H.dark, "Unit economics card");
  tb(s, "ONE AVERAGE TENANCY", { x: 6.05, y: 1.5, w: 3.3, h: 0.2, fontSize: 7.5, bold: true, charSpacing: 1.2, color: H.gold, objectName: "Unit label" });
  tb(s, "€104.75", { x: 6.05, y: 1.72, w: 3.3, h: 0.55, fontFace: BODY, fontSize: 28, bold: true, color: H.goldLight, objectName: "Unit price" });
  tb(s, "average price: 25% agency, 75% landlord + tenant", { x: 6.05, y: 2.27, w: 3.3, h: 0.2, fontSize: 8, color: H.line, objectName: "Unit price note" });
  const parts = [
    ["Scooter travel (55 min + fuel)", 20.52, H.goldDark],
    ["Inspection labour (€20/hr)", 13.25, H.gold],
    ["Payment, escrow and ID fees", 3.89, H.goldLight],
    ["Contribution (64%)", 67.09, H.mid],
  ];
  const barX = 6.05, barW = 3.25, total = 104.75;
  let bx = barX;
  parts.forEach(([name, v, c], i) => {
    const w = barW * v / total;
    s.addShape(pres.shapes.RECTANGLE, { x: bx, y: 2.62, w, h: 0.32, fill: { color: c }, line: { color: H.dark, width: 0.75 }, objectName: `Unit bar ${i + 1}` });
    bx += w;
  });
  parts.forEach(([name, v, c], i) => {
    const y = 3.1 + i * 0.33, last = i === 3;
    s.addShape(pres.shapes.RECTANGLE, { x: 6.05, y: y + 0.06, w: 0.14, h: 0.14, fill: { color: c }, line: { color: c }, objectName: `Unit key ${i + 1}` });
    tb(s, name, { x: 6.27, y, w: 2.3, h: 0.26, fontSize: 8.5, bold: last, color: last ? H.white : H.line, valign: "middle", objectName: `Unit item ${i + 1}` });
    tb(s, "€" + v.toFixed(2), { x: 8.4, y, w: 0.9, h: 0.26, fontSize: 8.5, bold: true, color: last ? H.goldLight : H.white, align: "right", valign: "middle", objectName: `Unit value ${i + 1}` });
  });
  s.addShape(pres.shapes.LINE, { x: 6.05, y: 4.48, w: 3.25, h: 0, line: { color: H.green, width: 0.75 }, objectName: "Unit divider" });
  tb(s, "Variable cost per tenancy: €37.66 (two visits)", { x: 6.05, y: 4.52, w: 3.25, h: 0.25, fontSize: 8, color: H.line, valign: "middle", objectName: "Unit cost note" });
  source(s, "Prices per tenancy, excl. 21% BTW (VAT), for both visits (move-in and move-out). Source: Deposera 2-year financial forecast (Babiak, 2026).");

  /* ---------------- 4. Net profit and break-even ---------------- */
  s = pres.addSlide({ masterName: "Deposera QA", sectionTitle: "Financial results" });
  head(s, "Q&A  ·  FINANCIAL RESULTS", "Profitable from the first year: €7,071, then €26,171");
  const r = (label, a, b, o = {}) => [
    { text: label, options: Object.assign({ align: "left", color: H.ink }, o) },
    { text: a, options: Object.assign({ align: "right", color: H.ink }, o) },
    { text: b, options: Object.assign({ align: "right", color: H.ink }, o) },
  ];
  const sub = { bold: true, fill: { color: H.cream } };
  const net = { bold: true, color: H.white, fill: { color: H.green }, fontSize: 10 };
  s.addTable([
    [thc("Profit and loss", "left"), thc("Year 1", "right"), thc("Year 2", "right")],
    r("Tenancies", "208", "560"),
    r("Revenue", "€21,788", "€58,660", { bold: true }),
    r("Variable costs (inspections, travel, fees)", "–€7,833", "–€21,090"),
    r("Fixed costs*", "–€5,225", "–€5,260"),
    r("Profit before tax", "€8,729", "€32,310", sub),
    r("Corporate tax (VPB 19%)", "–€1,659", "–€6,139"),
    r("Net profit", "€7,071", "€26,171", net),
    r("Net margin", "32%", "45%", { color: H.soft, italic: true }),
  ], { x: 0.5, y: 1.35, w: 4.6, colW: [2.6, 1.0, 1.0], rowH: 0.34, fontFace: BODY, fontSize: 9, border: { type: "solid", pt: 0.5, color: H.line }, fill: { color: H.white }, margin: [0.03, 0.08, 0.03, 0.08], objectName: "Profit and loss table" });
  tb(s, "* Bank, hosting, insurance, accountant, marketing (€450–600 a quarter), scooter upkeep and depreciation; year 1 also includes €1,185 start-up costs. Founders take no salary.", { x: 0.5, y: 4.48, w: 4.6, h: 0.45, fontSize: 7.5, color: H.soft, valign: "top", objectName: "Fixed costs note" });

  card(s, 5.35, 1.35, 4.15, 3.55, H.white, "Break-even card");
  s.addChart(pres.charts.BAR, [
    { name: "Break-even", labels: ["Year 1", "Year 2"], values: [61, 79] },
    { name: "Bad (25%)", labels: ["Year 1", "Year 2"], values: [80, 300] },
    { name: "Expected", labels: ["Year 1", "Year 2"], values: [208, 560] },
    { name: "Good (25%)", labels: ["Year 1", "Year 2"], values: [350, 840] },
  ], {
    x: 5.45, y: 1.42, w: 3.95, h: 2.75, barDir: "col", barGrouping: "clustered", barGapWidthPct: 45,
    showTitle: true, title: "Tenancies a year: break-even vs scenarios", titleFontSize: 9.5, titleColor: H.dark, titleFontFace: "+mn-lt", titleBold: true,
    chartColors: [H.red, H.goldLight, H.green, H.mid],
    showValue: true, dataLabelPosition: "outEnd", dataLabelFontSize: 7.5, dataLabelColor: H.ink, dataLabelFontFace: "+mn-lt", dataLabelFormatCode: "#,##0",
    catAxisLabelColor: H.soft, catAxisLabelFontSize: 8.5, catAxisLabelFontFace: "+mn-lt", catAxisLineShow: false,
    valAxisHidden: true, valGridLine: { color: H.line, size: 0.5 }, catGridLine: { style: "none" },
    showLegend: true, legendPos: "b", legendFontSize: 7.5, legendColor: H.soft, legendFontFace: "+mn-lt", objectName: "Break-even chart",
  });
  tb(s, [
    { text: "Break-even: ", options: { bold: true, color: H.red } },
    { text: "16 tenancies a quarter in year 1, 20 in year 2 (fixed costs ÷ €67.09 contribution). Even the bad scenario is above it: safety margin 71% and 86%.", options: { color: H.ink } },
  ], { x: 5.55, y: 4.2, w: 3.75, h: 0.62, fontSize: 8, valign: "middle", objectName: "Break-even text" });
  source(s, "Excl. 21% BTW (VAT). Expected = 25% bad + 50% mid + 25% good scenario. Source: Deposera 2-year financial forecast (Babiak, 2026).");

  /* ---------------- 5. Cash in vs cash out ---------------- */
  s = pres.addSlide({ masterName: "Deposera QA", sectionTitle: "Financial results" });
  head(s, "Q&A  ·  CASH PLANNING", "Cash in beats cash out from the first quarter");
  const q = ["Pre", "Q1", "Q2", "Q3", "Q4", "Q5", "Q6", "Q7", "Q8"];
  const inflow = [4000, 2095, 3771, 6704, 9218, 11523, 13618, 15713, 17808];
  const outflow = [2385, 1365, 1698, 2280, 2778, 3878, 6222, 5452, 6273];
  const endCash = [1615, 2344, 4417, 8842, 15282, 22926, 30322, 40582, 52117];
  card(s, 0.5, 1.35, 5.75, 3.55, H.white, "Cash chart card");
  s.addChart([
    { type: pres.charts.BAR, data: [{ name: "Cash in", labels: q, values: inflow }, { name: "Cash out", labels: q, values: outflow }], options: { barGrouping: "clustered", barGapWidthPct: 40, chartColors: [H.green, H.gold] } },
    { type: pres.charts.LINE, data: [{ name: "Cash balance (end of quarter)", labels: q, values: endCash }], options: { chartColors: [H.dark], lineSize: 2, lineDataSymbol: "circle", lineDataSymbolSize: 5 } },
  ], {
    x: 0.6, y: 1.42, w: 5.55, h: 3.42,
    showTitle: true, title: "Euros per quarter", titleFontSize: 9.5, titleColor: H.dark, titleFontFace: "+mn-lt", titleBold: true,
    catAxisLabelColor: H.soft, catAxisLabelFontSize: 8, catAxisLabelFontFace: "+mn-lt",
    valAxisLabelColor: H.soft, valAxisLabelFontSize: 7.5, valAxisLabelFontFace: "+mn-lt", valAxisLabelFormatCode: "€#,##0",
    valGridLine: { color: H.line, size: 0.5 }, catGridLine: { style: "none" },
    showLegend: true, legendPos: "b", legendFontSize: 7.5, legendColor: H.soft, legendFontFace: "+mn-lt", objectName: "Cash flow chart",
  });
  card(s, 6.5, 1.35, 3.0, 1.95, H.dark, "Funding card");
  tb(s, "FUNDING NEED", { x: 6.7, y: 1.48, w: 2.6, h: 0.2, fontSize: 7.5, bold: true, charSpacing: 1.2, color: H.gold, objectName: "Funding label" });
  tb(s, "€4,000 for 10%", { x: 6.7, y: 1.68, w: 2.6, h: 0.45, fontFace: BODY, fontSize: 20, bold: true, color: H.goldLight, objectName: "Funding value" });
  const fund = [["Start-up", 1185, H.goldDark], ["Scooter", 1200, H.gold], ["Buffer", 1615, H.mid]];
  let fx = 6.7;
  fund.forEach(([n, v, c], i) => {
    const w = 2.6 * v / 4000;
    s.addShape(pres.shapes.RECTANGLE, { x: fx, y: 2.22, w, h: 0.26, fill: { color: c }, line: { color: H.dark, width: 0.75 }, objectName: `Funding bar ${i + 1}` });
    tb(s, [{ text: n, options: { breakLine: true, color: H.line } }, { text: eur(v), options: { bold: true, color: H.white } }], { x: fx, y: 2.52, w, h: 0.36, fontSize: 7.5, align: "center", valign: "top", objectName: `Funding item ${i + 1}` });
    fx += w;
  });
  tb(s, "Values Deposera at €40,000. Lowest cash balance: €1,615.", { x: 6.7, y: 2.92, w: 2.6, h: 0.3, fontSize: 7.5, color: H.line, valign: "middle", objectName: "Funding note" });
  s.addTable([
    [thc("", "left"), thc("Year 1", "right"), thc("Year 2", "right")],
    r("Cash in (sales)", "€21,788", "€58,660"),
    r("Cash out", "€8,121", "€21,825"),
    r("Net cash flow", "€13,667", "€36,835", { bold: true }),
    r("Cash at year end", "€15,282", "€52,117", net),
  ], { x: 6.5, y: 3.45, w: 3.0, colW: [1.3, 0.85, 0.85], rowH: 0.29, fontFace: BODY, fontSize: 8.5, border: { type: "solid", pt: 0.5, color: H.line }, fill: { color: H.white }, margin: [0.02, 0.07, 0.02, 0.07], objectName: "Cash table" });
  source(s, "Excl. 21% BTW (VAT). Pre = pre-launch; Q1–Q4 = year 1, Q5–Q8 = year 2. Customers pay at check-in. Year-1 tax (€1,659) is paid in Q6. Source: Babiak (2026).");

  await pres.writeFile({ fileName: OUT });
  await applyTheme(OUT, THEME);
  console.log("written", OUT);
})();
