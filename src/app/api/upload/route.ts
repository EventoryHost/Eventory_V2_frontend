import { NextRequest, NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";
import path from "path";

// Initialize S3 Client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || "ap-south-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
  },
});

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Generate unique file name
    const extension = path.extname(file.name) || ".jpg";
    const filename = `${uuidv4()}${extension}`;
    const s3Key = `vendors/${filename}`; // Organize under vendors/ folder

    // Upload to S3
    const command = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME || "eventory-bucket",
      Key: s3Key,
      Body: buffer,
      ContentType: file.type,
      // ACL: "public-read", // Omit if your bucket policies handle this, but typical for assets
    });

    await s3Client.send(command);

    // Generate URL (CloudFront if available, else S3 URL)
    let fileUrl = "";
    if (process.env.CLOUDFRONT_DOMAIN) {
      fileUrl = `https://${process.env.CLOUDFRONT_DOMAIN}/${s3Key}`;
    } else {
      const bucket = process.env.AWS_S3_BUCKET_NAME || "eventory-bucket";
      const region = process.env.AWS_REGION || "ap-south-1";
      fileUrl = `https://${bucket}.s3.${region}.amazonaws.com/${s3Key}`;
    }

    return NextResponse.json({ success: true, url: fileUrl });
  } catch (error: any) {
    console.error("S3 Upload Error:", error);
    return NextResponse.json(
      { error: "Failed to upload file to S3", details: error.message },
      { status: 500 }
    );
  }
}
