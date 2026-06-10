#!/usr/bin/env node
/**
 * Cloudinary onboarding check — upload, inspect, transform.
 * Run: node scripts/cloudinary-onboarding.mjs
 * Credentials are read from .env.local (CLOUDINARY_CLOUD_NAME / API_KEY / API_SECRET).
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { v2 as cloudinary } from "cloudinary";

// ---- 1. Configure Cloudinary (values come from .env.local, no extra deps) ----
const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const env = Object.fromEntries(
  readFileSync(path.join(root, ".env.local"), "utf8")
    .split(/\r?\n/)
    .filter((l) => l.includes("=") && !l.trim().startsWith("#"))
    .map((l) => [l.slice(0, l.indexOf("=")).trim(), l.slice(l.indexOf("=") + 1).trim()])
);

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
  secure: true,
});

// ---- 2. Upload a sample image from Cloudinary's demo cloud ----
const upload = await cloudinary.uploader.upload(
  "https://res.cloudinary.com/demo/image/upload/sample.jpg",
  { folder: "handicraft-erp/onboarding-test" }
);
console.log("Uploaded!");
console.log("  Secure URL :", upload.secure_url);
console.log("  Public ID  :", upload.public_id);

// ---- 3. Fetch details of the uploaded image ----
const details = await cloudinary.api.resource(upload.public_id);
console.log("\nImage details:");
console.log("  Width      :", details.width, "px");
console.log("  Height     :", details.height, "px");
console.log("  Format     :", details.format);
console.log("  File size  :", details.bytes, "bytes");

// ---- 4. Build a transformed URL ----
// f_auto — Cloudinary picks the best format the viewer's browser supports (e.g. AVIF/WebP instead of JPEG)
// q_auto — Cloudinary picks the optimal compression level automatically (smaller file, no visible quality loss)
const transformedUrl = cloudinary.url(upload.public_id, {
  fetch_format: "auto",
  quality: "auto",
});
console.log("\nDone! Click link below to see optimized version of the image. Check the size and the format.");
console.log(transformedUrl);
