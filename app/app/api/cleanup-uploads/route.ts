import { del, list } from "@vercel/blob";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const cleanupSecret = process.env.CLEANUP_SECRET;

  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret");

  if (!cleanupSecret || secret !== cleanupSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const cutoffHours = 48;
  const cutoffTime = Date.now() - cutoffHours * 60 * 60 * 1000;

  let cursor: string | undefined;
  let deletedCount = 0;
  let checkedCount = 0;

  try {
    do {
      const result = await list({
        prefix: "songs/",
        limit: 100,
        cursor,
      });

      for (const blob of result.blobs) {
        checkedCount++;

        const uploadedAt = new Date(blob.uploadedAt).getTime();

        if (uploadedAt < cutoffTime) {
          await del(blob.pathname);
          deletedCount++;
        }
      }

      cursor = result.cursor;
    } while (cursor);

    return NextResponse.json({
      success: true,
      checkedCount,
      deletedCount,
      cutoffHours,
    });
  } catch (error) {
    console.error("Blob cleanup failed:", error);

    return NextResponse.json(
      { error: "Blob cleanup failed." },
      { status: 500 }
    );
  }
}