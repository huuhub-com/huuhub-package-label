// src/server.ts
//デプロイ方法
//gcloud run deploy huuhub-package-label  --region asia-northeast1   --source .   --platform managed   --service-account=105679435990-compute@developer.gserviceaccount.com   --no-allow-unauthenticated   --cpu=4   --memory=4Gi   --port=8080   --timeout=300   --set-env-vars BUCKET_NAME=huuhub-71ef2.firebasestorage.app

import express from "express";
import { Storage } from "@google-cloud/storage";
import { generatePreShipMemoLabelPNG } from "./generatePreShipMemoLabel";

const app = express();
app.use(express.json({ limit: "2mb" }));

// =====================================================
// Cloud Storage bucket
// =====================================================
const bucketName = process.env.BUCKET_NAME;
if (!bucketName) throw new Error("BUCKET_NAME env is required");

const storage = new Storage();
const bucket = storage.bucket(bucketName);

// =====================================================
// Health check
// =====================================================
app.get("/healthz", (_, res) => res.status(200).send("ok"));

// =====================================================
// POST /generate-pre-ship-memo
// =====================================================
app.post("/generate-pre-ship-memo", async (req, res) => {
  try {
    const body = req.body ?? {};

    // =====================================================
    // 必須項目（出荷前メモ用）
    // =====================================================
    const required = [
      "toName",
      "toPostalCode",
      "toFullAddress",
      "orderId",
      "packageId",
      "objectPath"
    ];

    const missing = required.filter(
      (k) => body[k] == null || body[k] === ""
    );
    if (missing.length > 0) {
      return res.status(400).json({
        error: "missing fields",
        missing
      });
    }

    // =====================================================
    // Generate PNG（出荷前メモ用）
    // =====================================================
    const png = await generatePreShipMemoLabelPNG({
      toName: String(body.toName),
      toPostalCode: String(body.toPostalCode),
      toFullAddress: String(body.toFullAddress),
      orderId: String(body.orderId),
      packageId: String(body.packageId),
      itemNum:String(body.itemNum),
    });

    // =====================================================
    // Cloud Storage に保存
    // =====================================================
    const objectPath = String(body.objectPath);
    const file = bucket.file(objectPath);

    await file.save(png, {
      contentType: "image/png",
      resumable: false
    });

    const encoded = encodeURIComponent(objectPath);
    const publicUrl =
      `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encoded}?alt=media`;

    return res.json({ publicUrl });

  } catch (err: any) {
    console.error("generate-pre-ship-memo failed:", err);
    return res.status(500).json({
      error: "Pre-ship memo label generation failed",
      detail: err?.message
    });
  }
});

// =====================================================
app.listen(8080, () =>
  console.log("Pre-ship memo label API is running on port 8080")
);
