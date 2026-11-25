const React = require("react"); const { renderToStaticMarkup } = require("react-dom/server"); const sharp = require("sharp");
const md = require("react-icons/md");
module.exports = async function icon(name, color, size = 256) {
  const svg = renderToStaticMarkup(React.createElement(md[name], { color: "#" + color, size }));
  const buf = await sharp(Buffer.from(svg)).png().toBuffer();
  return "image/png;base64," + buf.toString("base64");
};
