// v2
import { readFileSync, writeFileSync } from "fs";
let c = readFileSync("src/App.jsx", "utf8");
c = c.replace(/[\u201c\u201d]/g, String.fromCharCode(34));
c = c.replace(/[\u2018\u2019]/g, String.fromCharCode(39));
c = c.replace(/\u2026/g, "...");
writeFileSync("src/App.jsx", c);
console.log("Quotes fixed");
