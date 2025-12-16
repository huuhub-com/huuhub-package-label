import {
    createCanvas,
    registerFont,
    CanvasRenderingContext2D as NodeCanvasRenderingContext2D,
} from "canvas";
import type { PreShipMemoLabelInput } from "./types/preShipMemoLabel";
import path from "node:path";
// フォント（既存の fonts を流用してOK）
const FONT_PATH = path.join(__dirname, "../fonts/BIZUDPGothic-Bold.ttf");

registerFont(FONT_PATH, { family: "NotoSansJP" });

const mm2px = (mm: number) => Math.round(mm * 11.811); // 300dpi想定

// 62mm × 100mm
const WIDTH = mm2px(29);
const HEIGHT = mm2px(90);

export async function generatePreShipMemoLabelPNG(
    input: PreShipMemoLabelInput
): Promise<Buffer> {
    const canvas = createCanvas(WIDTH, HEIGHT);
    const ctx = canvas.getContext("2d");

    // 背景
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    let y = 40;
    const paddingTop = 50;
    const LEFT = 50;
    const DELTA = 45;
    const ROTATE = 90 * Math.PI / 180; // 右回転 90°
    // 宛名（最重要）
    ctx.fillStyle = "#000";
    ctx.font = "bold 48px NotoSansJP";
    drawRotated(ctx, WIDTH - y - paddingTop, LEFT, ROTATE, () => {
        ctx.fillText(`${input.toName} 様`, 0, 0);
    });
    y += 50;
    // 住所
    ctx.font = "32px NotoSansJP";
    drawRotated(ctx, WIDTH - y - paddingTop, LEFT, ROTATE, () => {
        ctx.fillText(`〒${input.toPostalCode}`, 0, 0);
    });
    y += 40;

    // Order / Package
    ctx.font = "bold 30px NotoSansJP";
    drawRotated(ctx, WIDTH - y - paddingTop, LEFT, ROTATE, () => {
        ctx.fillText(`orderId:${input.orderId}`, 0, 0);
    });
    y += 40;
    drawRotated(ctx, WIDTH - y - paddingTop, LEFT, ROTATE, () => {
        ctx.fillText(`packageId:${input.packageId}`, 0, 0);
    });
    y += 42;
    drawRotated(ctx, WIDTH - y - paddingTop, LEFT, ROTATE, () => {
        wrapText(ctx, input.toFullAddress, 0, 0, HEIGHT - 80, 40);
    });

    return canvas.toBuffer("image/png");
}

// 簡易改行
function wrapText(
    ctx: import("canvas").CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    maxWidth: number,
    lineHeight: number
) {

    let line = "";
    for (const ch of text) {
        const test = line + ch;
        if (ctx.measureText(test).width > maxWidth) {
            ctx.fillText(line, x, y);
            line = ch;
            y += lineHeight;
        } else {
            line = test;
        }
    }
    if (line) ctx.fillText(line, x, y);
}

function drawRotated(
    ctx: NodeCanvasRenderingContext2D,
    x: number,
    y: number,
    angle: number,
    drawFn: () => void
) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    drawFn();
    ctx.restore();
}