import fs from "node:fs";
const f = "C:/Users/hp/OneDrive/Desktop/aicon/client/src/components/Hero.jsx";
let c = fs.readFileSync(f, "utf8");
// Move badge and floating-note back inside the stage (before closing </div> of stage)
c = c.replace(
  `            />\n          </div>\n          <div className="hero__product-badge">`,
  `            />\n            <div className="hero__product-badge">\n              <span className="hero__badge-kicker">FLAGSHIP SERIES</span>\n              <strong>AICON 55" 4K Smart LED TV</strong>\n              <small>Frameless Bezel-Less · HDR10 Contrast</small>\n            </div>\n            <div className="hero__floating-note">\n              <span className="hero__floating-kicker">AICON MODCON PVT LTD</span>\n              <span>Mumbai, Maharashtra · Est. 2023</span>\n            </div>\n          </div>`
);
// Remove the now-duplicate badge/floating-note that are outside stage
c = c.replace(
  `          <div className="hero__product-badge">\n              <span className="hero__badge-kicker">FLAGSHIP SERIES</span>\n              <strong>AICON 55" 4K Smart LED TV</strong>\n              <small>Frameless Bezel-Less Â· HDR10 Contrast</small>\n            </div>\n          <div className="hero__floating-note">`,
  `          <div className="hero__floating-note">`
);
fs.writeFileSync(f, c);
console.log("done");
