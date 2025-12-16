// npm install
// npm run build
// node dist/index.js

import { generatePreShipMemoLabelPNG } from "./generatePreShipMemoLabel";
import fs from "fs";
import path from "path";

async function main() {
  const png = await generatePreShipMemoLabelPNG({
    toName: "山根 康平",
    toPostalCode: "196-0033",
    toFullAddress: "東京都昭島市東町5-11-31 パークサイドイワサキ201号",
    orderId: "581619123094127700",
    packageId: "01",
  });

  const outDir = path.join(__dirname, "../output");
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, "pre-ship-memo.png"), png);
}

main();
