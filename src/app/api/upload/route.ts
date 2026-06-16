import { NextRequest, NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";
import path from "path";

export async function POST(request: NextRequest) {
  // Read credentials inside the handler — not at module level.
  // On Amplify/Lambda, module-level code runs at cold-start before env vars
  // are guaranteed to be injected, causing "Could not load credentials" errors.
  const awsRegion =
    process.env.APP_AWS_REGION || process.env.AWS_REGION || "ap-south-1";
  const awsAccessKeyId =
    process.env.APP_AWS_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID;
  const awsSecretAccessKey =
    process.env.APP_AWS_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY;
  const awsBucketName =
    process.env.APP_AWS_S3_BUCKET_NAME ||
    process.env.AWS_S3_BUCKET_NAME ||
    "eventory-bucket";

  // Fail fast with a clear message so we know exactly what is missing
  if (!awsAccessKeyId || !awsSecretAccessKey) {
    console.error("[upload] AWS credentials missing:", {
      hasAppKey: !!process.env.APP_AWS_ACCESS_KEY_ID,
      hasAwsKey: !!process.env.AWS_ACCESS_KEY_ID,
      hasAppSecret: !!process.env.APP_AWS_SECRET_ACCESS_KEY,
      hasAwsSecret: !!process.env.AWS_SECRET_ACCESS_KEY,
    });
    return NextResponse.json(
      {
        error: "Upload service not configured",
        details:
          "AWS credentials are missing. Set APP_AWS_ACCESS_KEY_ID and APP_AWS_SECRET_ACCESS_KEY in Amplify environment variables.",
      },
      { status: 500 }
    );
  }

  const s3Client = new S3Client({
    region: awsRegion,
    credentials: {
      accessKeyId: awsAccessKeyId,
      secretAccessKey: awsSecretAccessKey,
    },
  });

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const extension = path.extname(file.name) || ".jpg";
    const filename = `${uuidv4()}${extension}`;
    const s3Key = `vendors/${filename}`;

    const command = new PutObjectCommand({
      Bucket: awsBucketName,
      Key: s3Key,
      Body: buffer,
      ContentType: file.type,
    });

    await s3Client.send(command);

    const fileUrl = process.env.CLOUDFRONT_DOMAIN
      ? `https://${process.env.CLOUDFRONT_DOMAIN}/${s3Key}`
      : `https://${awsBucketName}.s3.${awsRegion}.amazonaws.com/${s3Key}`;

    return NextResponse.json({ success: true, url: fileUrl });
  } catch (error: any) {
    console.error("S3 Upload Error:", error);
    return NextResponse.json(
      { error: "Failed to upload file to S3", details: error.message },
      { status: 500 }
    );
  }
}
