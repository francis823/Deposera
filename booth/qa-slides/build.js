const pptxgen = require("pptxgenjs");
const { applyTheme } = require("/root/.claude/skills/synced/c326d757-ddd9-4511-8943-35851afba68f_b15d348b-9255-4a0a-ab6e-b66d49e822b7/pptx/scripts/apply_theme.js");
const icon = require("./icons.js");

const THEME = {
  name: "Deposera",
  headFontFace: "Cambria",
  bodyFontFace: "Calibri",
  colors: {
    dk1: "17271F", lt1: "FFFFFF", dk2: "0B1D15", lt2: "F4EEE1",
    accent1: "21503C", accent2: "CFAA6C", accent3: "2F6A50", accent4: "B5503F",
    accent5: "7D5F30", accent6: "E2C792", hlink: "21503C", folHlink: "7D5F30",
  },
};
const HEX = { dark: "0B1D15", green: "21503C", green2: "2F6A50", brass: "CFAA6C", brass2: "E2C792", brassDark: "7D5F30", cream: "F4EEE1", paper: "FBF8F1", ink: "17271F", soft: "4A5A51", red: "B5503F", line: "E9DFCA" };

(async () => {
  const pres = new pptxgen();
  pres.layout = "LAYOUT_WIDE"; // 13.333 x 7.5
  pres.title = "Deposera Q&A slides";
  pres.author = "Deposera";
  pres.theme = { headFontFace: THEME.headFontFace, bodyFontFace: THEME.bodyFontFace };
  const C = pres.SchemeColor;

  pres.defineSlideMaster({
    title: "Deposera content",
    background: { color: HEX.paper },
    objects: [
      { image: { path: "logo.png", x: 0.6, y: 6.85, w: 0.3, h: 0.3 } },
      { text: { text: "Deposera · Q&A", options: { x: 0.98, y: 6.85, w: 4, h: 0.3, fontSize: 11, color: HEX.soft, margin: 0, valign: "middle" } } },
      { placeholder: { options: { name: "title", type: "title", x: 0.6, y: 0.45, w: 12.1, h: 0.8, fontSize: 34, bold: true, color: HEX.dark, fontFace: "Cambria", valign: "top", align: "left", margin: 0 }, text: "Title" } },
      { placeholder: { options: { name: "subtitle", type: "body", x: 0.6, y: 1.25, w: 12.1, h: 0.45, fontSize: 16, color: HEX.soft, valign: "top", align: "left", margin: 0 }, text: "Subtitle" } },
    ],
    slideNumber: { x: 12.2, y: 6.85, w: 0.5, h: 0.3, fontSize: 11, color: HEX.soft, align: "right" },
  });

  const note = (slide, text) => slide.addText(text, { x: 5.0, y: 6.85, w: 7.0, h: 0.3, fontSize: 10, italic: true, color: HEX.soft, align: "right", margin: 0, isTextBox: true, objectName: "Assumption note" });
  const card = (slide, x, y, w, h, fill, name) => slide.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, rectRadius: 0.12, fill: { color: fill }, line: { color: fill === HEX.paper || fill === "FFFFFF" ? HEX.line : fill, width: 0.75 }, objectName: name });

  /* ---------- 1. How it works ---------- */
  pres.addSection({ title: "Product" });
  let s = pres.addSlide({ masterName: "Deposera content", sectionTitle: "Product" });
  s.addText("How Deposera works", { placeholder: "title", align: "left" });
  s.addText("One neutral service that holds the deposit and settles damage before it becomes a dispute", { placeholder: "subtitle" });
  const steps = [
    ["MdPhotoCamera", "Move-in photos", "We photograph every room. Both sides can add notes within 7 days."],
    ["MdAccountBalance", "Held safely", "The deposit sits in a separate account for the whole tenancy."],
    ["MdManageSearch", "Pre-inspection", "Before move-out we list any damage. The tenant can fix it first."],
    ["MdEuro", "Money back", "Within 14 days, or 30 if repairs are needed. Every deduction needs an invoice."],
  ];
  for (let i = 0; i < 4; i++) {
    const x = 0.6 + i * 3.08, y = 2.05, w = 2.85, h = 2.55;
    card(s, x, y, w, h, "FFFFFF", `Step ${i + 1} card`);
    s.addShape(pres.shapes.OVAL, { x: x + 0.3, y: y + 0.3, w: 0.72, h: 0.72, fill: { color: HEX.green }, line: { color: HEX.green }, objectName: `Step ${i + 1} icon circle` });
    s.addImage({ data: await icon(steps[i][0], HEX.brass2), x: x + 0.47, y: y + 0.47, w: 0.38, h: 0.38, altText: steps[i][1], objectName: `Step ${i + 1} icon` });
    s.addText(`${i + 1}`, { x: x + w - 0.75, y: y + 0.3, w: 0.45, h: 0.45, fontFace: "Cambria", fontSize: 24, bold: true, color: HEX.brass, align: "right", margin: 0, isTextBox: true, objectName: `Step ${i + 1} number` });
    s.addText(steps[i][1], { x: x + 0.3, y: y + 1.17, w: w - 0.6, h: 0.42, fontFace: "Cambria", fontSize: 19, bold: true, color: HEX.dark, margin: 0, isTextBox: true, objectName: `Step ${i + 1} title` });
    s.addText(steps[i][2], { x: x + 0.3, y: y + 1.6, w: w - 0.6, h: 0.85, fontSize: 14, color: HEX.soft, margin: 0, valign: "top", isTextBox: true, objectName: `Step ${i + 1} text` });
  }
  const pays = [
    [HEX.green, "Tenant", "€0", "Pays only the deposit, which is held in full"],
    [HEX.dark, "Letting agency or landlord", "5%", "One-off fee per tenancy, never taken from the deposit"],
    [HEX.green, "Deposera", "Fixed", "Same fee whatever happens at move-out"],
  ];
  for (let i = 0; i < 3; i++) {
    const x = 0.6 + i * 4.1, y = 4.95, w = 3.9, h = 1.55;
    card(s, x, y, w, h, pays[i][0], `Who pays card ${i + 1}`);
    s.addText(pays[i][1].toUpperCase(), { x: x + 0.3, y: y + 0.2, w: w - 0.6, h: 0.3, fontSize: 11, bold: true, charSpacing: 2, color: HEX.brass2, margin: 0, isTextBox: true, objectName: `Who pays label ${i + 1}` });
    s.addText(pays[i][2], { x: x + 0.3, y: y + 0.5, w: 1.6, h: 0.65, fontFace: "Cambria", fontSize: 32, bold: true, color: "FFFFFF", margin: 0, valign: "middle", isTextBox: true, objectName: `Who pays value ${i + 1}` });
    s.addText(pays[i][3], { x: x + 1.85, y: y + 0.5, w: w - 2.1, h: 0.85, fontSize: 13, color: "E9DFCA", margin: 0, valign: "middle", isTextBox: true, objectName: `Who pays text ${i + 1}` });
  }

  /* ---------- 2. The app ---------- */
  s = pres.addSlide({ masterName: "Deposera content", sectionTitle: "Product" });
  s.addText("The app: every deposit in one place", { placeholder: "title" });
  s.addText("A clickable prototype for tenants, shown live at the booth", { placeholder: "subtitle" });
  const shots = [
    ["app-home.png", "Home", "The next step, the deposit, progress and key dates"],
    ["app-damage.png", "Damage", "Choose “I’ll fix it” and see the money back update live"],
    ["app-records.png", "Records", "A dated timeline and every document"],
  ];
  const ph = 4.55, pw = ph * 782 / 1672;
  for (let i = 0; i < 3; i++) {
    const cx = 0.6 + i * 4.1, colW = 3.9;
    s.addImage({ path: shots[i][0], x: cx + 0.15, y: 1.95, w: pw, h: ph, altText: `App prototype: ${shots[i][1]} screen`, objectName: `Phone ${i + 1}` });
    const tx = cx + 0.15 + pw + 0.3;
    s.addText(`${i + 1}`, { x: tx, y: 2.3, w: 0.6, h: 0.6, fontFace: "Cambria", fontSize: 30, bold: true, color: HEX.brass, margin: 0, isTextBox: true, objectName: `Screen ${i + 1} number` });
    s.addText(shots[i][1], { x: tx, y: 2.95, w: colW - pw - 0.5, h: 0.45, fontFace: "Cambria", fontSize: 19, bold: true, color: HEX.dark, margin: 0, isTextBox: true, objectName: `Screen ${i + 1} title` });
    s.addText(shots[i][2], { x: tx, y: 3.42, w: colW - pw - 0.5, h: 1.6, fontSize: 14, color: HEX.soft, margin: 0, valign: "top", isTextBox: true, objectName: `Screen ${i + 1} text` });
  }

  /* ---------- 3. Unit economics ---------- */
  pres.addSection({ title: "Financials" });
  s = pres.addSlide({ masterName: "Deposera content", sectionTitle: "Financials" });
  s.addText("Unit economics: one tenancy", { placeholder: "title" });
  s.addText("Every tenancy pays for itself: half of the fee is margin", { placeholder: "subtitle" });
  const stats = [
    ["€2,400", "Average deposit", "2 months’ rent at €1,200, the Dutch legal maximum"],
    ["€120", "Our fee (5%)", "Paid once by the agency or landlord"],
    ["€60", "Cost to serve", "Three inspections, payments and admin"],
    ["50%", "Margin per tenancy", "€60 left over to cover fixed costs"],
  ];
  for (let i = 0; i < 4; i++) {
    const col = i % 2, row = Math.floor(i / 2);
    const x = 0.6 + col * 3.05, y = 2.0 + row * 2.3, w = 2.85, h = 2.1;
    const dark = i === 3;
    card(s, x, y, w, h, dark ? HEX.green : "FFFFFF", `Stat card ${i + 1}`);
    s.addText(stats[i][0], { x: x + 0.3, y: y + 0.22, w: w - 0.6, h: 0.85, fontFace: "Cambria", fontSize: 44, bold: true, color: dark ? HEX.brass2 : HEX.green, margin: 0, isTextBox: true, objectName: `Stat value ${i + 1}` });
    s.addText(stats[i][1], { x: x + 0.3, y: y + 1.07, w: w - 0.6, h: 0.35, fontSize: 15, bold: true, color: dark ? "FFFFFF" : HEX.dark, margin: 0, isTextBox: true, objectName: `Stat label ${i + 1}` });
    s.addText(stats[i][2], { x: x + 0.3, y: y + 1.42, w: w - 0.6, h: 0.55, fontSize: 12, color: dark ? "E9DFCA" : HEX.soft, margin: 0, valign: "top", isTextBox: true, objectName: `Stat note ${i + 1}` });
  }
  card(s, 6.9, 2.0, 5.8, 4.4, "FFFFFF", "Fee breakdown card");
  s.addChart(pres.charts.BAR, [{ name: "€ per tenancy", labels: ["Margin", "Dispute reserve", "Payments and admin", "Inspections (3 visits)"], values: [60, 5, 10, 45] }], {
    x: 7.1, y: 2.15, w: 5.4, h: 4.1, barDir: "bar",
    showTitle: true, title: "Where the €120 fee goes (€ per tenancy)", titleFontSize: 14, titleColor: HEX.dark, titleFontFace: "+mn-lt",
    chartColors: [HEX.green2], showValue: true, dataLabelPosition: "outEnd", dataLabelFontSize: 12, dataLabelColor: HEX.ink, dataLabelFormatCode: "€#,##0", dataLabelFontFace: "+mn-lt",
    catAxisLabelColor: HEX.soft, catAxisLabelFontSize: 12, catAxisLabelFontFace: "+mn-lt", valAxisHidden: true,
    valGridLine: { style: "none" }, catGridLine: { style: "none" }, showLegend: false, barGapWidthPct: 60, objectName: "Fee breakdown chart",
  });
  note(s, "Estimates for a fictional company (school project)");

  /* ---------- 4. Forecast ---------- */
  s = pres.addSlide({ masterName: "Deposera content", sectionTitle: "Financials" });
  s.addText("Financial forecast: profitable in year 2", { placeholder: "title" });
  s.addText("Revenue grows with the number of tenancies; fixed costs grow more slowly", { placeholder: "subtitle" });
  card(s, 0.6, 2.0, 7.1, 4.4, "FFFFFF", "Forecast chart card");
  s.addChart(pres.charts.BAR, [
    { name: "Revenue", labels: ["Year 1", "Year 2", "Year 3"], values: [180, 600, 1440] },
    { name: "Total costs", labels: ["Year 1", "Year 2", "Year 3"], values: [200, 500, 1050] },
  ], {
    x: 0.8, y: 2.15, w: 6.7, h: 4.1, barDir: "col", barGrouping: "clustered",
    showTitle: true, title: "Revenue and costs (€ thousand)", titleFontSize: 14, titleColor: HEX.dark, titleFontFace: "+mn-lt",
    chartColors: [HEX.green, HEX.brass], showValue: true, dataLabelPosition: "outEnd", dataLabelFontSize: 11, dataLabelColor: HEX.ink, dataLabelFontFace: "+mn-lt", dataLabelFormatCode: "#,##0",
    catAxisLabelColor: HEX.soft, catAxisLabelFontSize: 12, catAxisLabelFontFace: "+mn-lt", valAxisHidden: true,
    valGridLine: { color: "E9DFCA", size: 0.5 }, catGridLine: { style: "none" },
    showLegend: true, legendPos: "b", legendFontSize: 12, legendColor: HEX.soft, legendFontFace: "+mn-lt", barGapWidthPct: 70, objectName: "Forecast chart",
  });
  const th = (t) => ({ text: t, options: { bold: true, color: "FFFFFF", fill: { color: HEX.dark }, fontSize: 13, align: "right" } });
  const td = (t, o = {}) => ({ text: t, options: Object.assign({ color: HEX.ink, fontSize: 13, align: "right" }, o) });
  const tl = (t, o = {}) => ({ text: t, options: Object.assign({ color: HEX.ink, fontSize: 13, align: "left", bold: true }, o) });
  s.addTable([
    [Object.assign(th(""), { options: Object.assign(th("").options, { align: "left" }) }), th("Year 1"), th("Year 2"), th("Year 3")],
    [tl("Tenancies"), td("1,500"), td("5,000"), td("12,000")],
    [tl("Revenue"), td("€180k"), td("€600k"), td("€1,440k")],
    [tl("Cost to serve"), td("€90k"), td("€300k"), td("€720k")],
    [tl("Fixed costs"), td("€110k"), td("€200k"), td("€330k")],
    [tl("Net result", { fill: { color: HEX.cream } }), td("–€20k", { color: HEX.red, bold: true, fill: { color: HEX.cream } }), td("€100k", { color: HEX.green, bold: true, fill: { color: HEX.cream } }), td("€390k", { color: HEX.green, bold: true, fill: { color: HEX.cream } })],
  ], { x: 8.0, y: 2.0, w: 4.7, colW: [1.55, 1.05, 1.05, 1.05], rowH: 0.42, border: { type: "solid", pt: 0.5, color: HEX.line }, fill: { color: "FFFFFF" }, margin: [0.04, 0.1, 0.04, 0.1], objectName: "Forecast table" });
  card(s, 8.0, 4.85, 4.7, 1.55, HEX.green, "Break-even card");
  s.addText("≈ 1,850", { x: 8.3, y: 5.0, w: 2.2, h: 0.75, fontFace: "Cambria", fontSize: 36, bold: true, color: HEX.brass2, margin: 0, valign: "middle", isTextBox: true, objectName: "Break-even value" });
  s.addText("tenancies a year to break even (€110k fixed costs ÷ €60 margin)", { x: 10.5, y: 5.0, w: 2.0, h: 1.25, fontSize: 12, color: "FFFFFF", margin: 0, valign: "middle", isTextBox: true, objectName: "Break-even text" });
  note(s, "Estimates for a fictional company (school project)");

  /* ---------- 5. Market and investment ---------- */
  pres.addSection({ title: "Growth" });
  s = pres.addSlide({ masterName: "Deposera content", sectionTitle: "Growth" });
  s.addText("Market and growth plan", { placeholder: "title" });
  s.addText("Start in the Randstad cities, then grow across the Netherlands", { placeholder: "subtitle" });
  const funnel = [
    ["150,000", "new private-sector tenancies a year in the Netherlands", 6.6, HEX.dark],
    ["60,000", "in the Randstad cities, where we launch", 5.2, HEX.green],
    ["12,000", "our year-3 target: about 8% of the market", 3.8, HEX.brassDark],
  ];
  for (let i = 0; i < 3; i++) {
    const [v, t, w, c] = funnel[i];
    const y = 2.05 + i * 1.12;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.6, y, w, h: 0.95, rectRadius: 0.12, fill: { color: c }, line: { color: c }, objectName: `Market bar ${i + 1}` });
    s.addText([{ text: v, options: { fontFace: "Cambria", fontSize: 26, bold: true, color: i === 2 ? "FFFFFF" : HEX.brass2, breakLine: true } }, { text: t, options: { fontSize: 12, color: "FFFFFF" } }], { x: 0.85, y: y + 0.08, w: w - 0.4, h: 0.8, margin: 0, valign: "middle", isTextBox: true, objectName: `Market text ${i + 1}` });
  }
  card(s, 0.6, 5.5, 6.6, 1.0, "FFFFFF", "Why now card");
  s.addText([{ text: "Why now: ", options: { bold: true, color: HEX.green } }, { text: "since 2023 Dutch law caps deposits at 2 months’ rent and sets 14 and 30-day return deadlines, but nobody checks the damage neutrally.", options: { color: HEX.ink } }], { x: 0.85, y: 5.58, w: 6.1, h: 0.85, fontSize: 13, margin: 0, valign: "middle", isTextBox: true, objectName: "Why now text" });
  card(s, 7.6, 2.05, 5.1, 4.45, "FFFFFF", "Investment card");
  s.addText("SEED INVESTMENT", { x: 7.9, y: 2.25, w: 4.5, h: 0.3, fontSize: 11, bold: true, charSpacing: 2, color: HEX.brassDark, margin: 0, isTextBox: true, objectName: "Investment label" });
  s.addText("€150k", { x: 7.9, y: 2.55, w: 4.5, h: 0.8, fontFace: "Cambria", fontSize: 44, bold: true, color: HEX.green, margin: 0, isTextBox: true, objectName: "Investment value" });
  s.addText("Covers year 1 until we break even in year 2", { x: 7.9, y: 3.35, w: 4.5, h: 0.35, fontSize: 13, color: HEX.soft, margin: 0, isTextBox: true, objectName: "Investment note" });
  s.addChart(pres.charts.DOUGHNUT, [{ name: "Use of funds", labels: ["App and platform", "Inspection team", "Marketing and partnerships", "Legal and operations"], values: [40, 30, 20, 10] }], {
    x: 7.75, y: 3.7, w: 4.8, h: 2.7, holeSize: 55, chartColors: [HEX.green, HEX.green2, HEX.brass, HEX.brassDark],
    showPercent: true, showValue: false, dataLabelColor: "FFFFFF", dataLabelFontSize: 11, dataLabelFontFace: "+mn-lt",
    showLegend: true, legendPos: "r", legendFontSize: 12, legendColor: HEX.soft, legendFontFace: "+mn-lt", showTitle: false, objectName: "Use of funds chart",
  });
  note(s, "Estimates for a fictional company (school project)");

  await pres.writeFile({ fileName: "Deposera-QA-slides.pptx" });
  await applyTheme("Deposera-QA-slides.pptx", THEME);
  console.log("written");
})();
