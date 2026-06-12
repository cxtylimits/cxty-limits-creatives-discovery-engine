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

    const eventType =
      body.eventType === "submission" ? "submission" : "cta_click";

    const ctaClicked = eventType === "submission" ? "No" : "Yes";

    await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        eventType,
        date: new Date().toISOString(),
        artistName: body.artistName || "",
        email: body.email || "",
        songTitle: body.songTitle || "",
        songLink: body.songLink || "",
        releaseStatus: body.releaseStatus || "",
        discoveryScore: body.discoveryScore || "",
        discoveryMoment: body.discoveryMoment || "",
        artistArchetype: body.artistArchetype || "",
        rolloutType: body.rolloutType || "",
        mostShareableLyric: body.mostShareableLyric || "",
        fanbaseMatchArtists: body.fanbaseMatchArtists || "",
        ifReleasedToday: body.ifReleasedToday || "",
        futureRolloutPrediction: body.futureRolloutPrediction || "",
        ctaClicked,
      }),
    });

    return NextResponse.json({ success: true, eventType, ctaClicked });
  } catch (error) {
    console.error("Lead tracking failed:", error);

    return NextResponse.json(
      { error: "Lead tracking failed." },
      { status: 500 }
    );
  }
}