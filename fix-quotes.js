const fs = require(“fs”);
let c = fs.readFileSync(“src/App.jsx”, “utf8”);
c = c.replace(/[“”]/g, String.fromCharCode(34)).replace(/[‘’]/g, String.fromCharCode(39));
fs.writeFileSync(“src/App.jsx”, c);
console.log(“Quotes fixed”);
