import { NextRequest, NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";
import path from "path";

const awsRegion = process.env.APP_AWS_REGION || process.env.AWS_REGION || "ap-south-1";
const awsAccessKeyId = process.env.APP_AWS_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID;
const awsSecretAccessKey =
  process.env.APP_AWS_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY;
const awsBucketName =
  process.env.APP_AWS_S3_BUCKET_NAME || process.env.AWS_S3_BUCKET_NAME || "eventory-bucket";

// Initialize S3 Client
const s3Client = new S3Client({
  region: awsRegion,
  credentials: {
    accessKeyId: awsAccessKeyId as string,
    secretAccessKey: awsSecretAccessKey as string,
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
      Bucket: awsBucketName,
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
      fileUrl = `https://${awsBucketName}.s3.${awsRegion}.amazonaws.com/${s3Key}`;
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
