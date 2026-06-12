import { NextResponse } from "next/server";

function getSafeWebhookUrl() {
  const rawUrl = process.env.DISCOVERY_LEADS_WEBHOOK_URL;

  if (!rawUrl) return null;

  const url = rawUrl.trim();

  if (!url.startsWith("https://")) {
    console.error("DISCOVERY_LEADS_WEBHOOK_URL is missing or invalid.");
    return null;
  }

  try {
    new URL(url);
    return url;
  } catch {
    console.error("Invalid DISCOVERY_LEADS_WEBHOOK_URL.");
    return null;
  }
}

export async function POST(request: Request) {
  const webhookUrl = getSafeWebhookUrl();

  if (!webhookUrl) {
    return NextResponse.json(
      { error: "Webhook URL is not configured." },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();

    await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        eventType: "cta_click",
        date: new Date().toISOString(),
        artistName: body.artistName || "",
        email: body.email || "",
        songTitle: body.songTitle || "",
        songLink: body.songLink || "",
        releaseStatus: "",
        discoveryScore: "",
        discoveryMoment: "",
        artistArchetype: "",
        rolloutType: "",
        mostShareableLyric: "",
        fanbaseMatchArtists: "",
        ifReleasedToday: "",
        futureRolloutPrediction: "",
        ctaClicked: "Yes",
      }),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("CTA tracking failed:", error);

    return NextResponse.json(
      { error: "CTA tracking failed." },
      { status: 500 }
    );
  }
}