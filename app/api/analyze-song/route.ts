import { NextResponse } from "next/server";
import OpenAI from "openai";

const apiKey = process.env.OPENAI_API_KEY;

if (!apiKey) {
  throw new Error("OPENAI_API_KEY is missing.");
}

const openai = new OpenAI({
  apiKey,
});

function buildDiscoveryPrompt(data: {
  artistName: string;
  songTitle: string;
  songLink: string;
  releaseStatus: string;
  lyrics: string;
  lyricsSource: string;
}) {
  return `
You are an elite A&R strategist, creative director, rollout strategist, and music psychologist working for CXTY LIMITS CREATIVES.

Analyze this song for discovery potential, audience positioning, rollout direction, and creative world-building.

This tool is for unreleased songs, newly released songs, and older songs that need a better discovery strategy.

Artist Name:
${data.artistName}

Song Title:
${data.songTitle || "Not provided"}

Song Link Context:
${data.songLink || "Not provided"}

Release Status:
${data.releaseStatus || "Not Sure"}

Lyrics Source:
${data.lyricsSource}

Lyrics / Transcript:
${data.lyrics}

Important:
- Uploaded audio and pasted lyrics are the primary analysis sources.
- Song links are optional context only.
- Do not claim you analyzed full audio from Spotify, YouTube, SoundCloud, or any pasted link.
- If only limited link context is available, make the report more cautious.
- If lyrics are pasted, treat them as more accurate than transcription.
- If lyrics are not pasted, use the uploaded audio transcription.

Return ONLY valid JSON in this exact structure:

{
  "evidence": {
    "coreThemes": [],
    "emotionalStates": [],
    "repeatedIdeas": [],
    "imagery": [],
    "coreTension": "",
    "strongestMessage": "",
    "mostShareableLyric": "",
    "listenerComment": ""
  },
  "strategy": {
    "discoveryMoment": "",
    "artistArchetype": "",
    "archetypeExplanation": "",
    "discoveryAngle": "",
    "rolloutType": "",
    "audienceMap": "",
    "ifReleasedToday": ""
  },
  "fanbaseMatch": {
    "closestArtists": [],
    "similarSongs": [],
    "playlistLanes": [],
    "fanbaseReason": ""
  },
  "scores": {
    "discoveryScore": 0,
    "viralPotentialScore": 0,
    "hookStrengthScore": 0,
    "playlistFitScore": 0,
    "ugcTikTokScore": 0,
    "emotionalResonanceScore": 0,
    "brandFitScore": 0,
    "rolloutReadinessScore": 0
  },
  "rollout": {
    "platformPriority": "",
    "contentPillars": [],
    "videoIdeas": [],
    "preReleasePlan": [],
    "releaseWeekPlan": [],
    "postReleasePlan": []
  },
  "creative": {
    "visualDirection": "",
    "biggestOpportunity": "",
    "biggestRisk": "",
    "finalRecommendation": "",
    "cta": ""
  }
}

SCORING RULES:
- Scores must be true 0-100 scores.
- Never use 1-10 scoring.
- Average independent artists should generally score between 65 and 85.
- Never return below 60 unless there is clear evidence of weak lyrics, unclear emotion, no memorable lines, or almost no rollout potential.
- Discovery Score is not a talent score. It measures discoverability and rollout potential.

WRITING RULES:
- Keep everything tight.
- Do not write long paragraphs.
- No generic music marketing advice.
- No fluff.
- No markdown.
- No text outside JSON.
- Everything must be based on evidence from the lyrics/transcript.
- If lyrics came from transcription, do not quote long lyric passages as if guaranteed exact.
- If lyrics were pasted by the artist, you may quote exact lyrics.

SECTION RULES:
- discoveryMoment: max 1 sentence.
- artistArchetype: max 3 words.
- archetypeExplanation: max 2 sentences.
- mostShareableLyric: exact lyric only if confident. If transcription is unclear, choose the clearest short phrase.
- listenerComment: max 1 sentence, sound like a real fan.
- coreTension: max 2 sentences.
- strongestMessage: max 1 sentence.
- discoveryAngle: max 2 sentences.
- audienceMap: max 2 sentences.
- ifReleasedToday: exactly 2 sentences. Make it feel like a prediction, not a score. The second sentence should explain the unlock using the most specific lyric, phrase, emotional moment, or recurring idea.
- platformPriority: concise ranked recommendation.
- contentPillars: max 4 items.
- videoIdeas: max 5 items.
- preReleasePlan: max 3 items.
- releaseWeekPlan: max 3 items.
- postReleasePlan: max 3 items.
- visualDirection: max 2 sentences.
- biggestOpportunity: max 1 sentence.
- biggestRisk: max 1 sentence.
- finalRecommendation: max 2 sentences.
- cta: max 3 sentences.

FANBASE MATCH RULES:
- closestArtists: exactly 3 artists.
- similarSongs: exactly 3 songs formatted as "Song — Artist".
- playlistLanes: exactly 3 playlist lanes.
- fanbaseReason: max 2 sentences.
- These should be based on lyrical mood, emotional positioning, genre feel, audience behavior, and rollout world.
- Do not claim exact sonic similarity if you only have lyrics/transcription.
- Use language like "fanbase lane" or "audience overlap," not "this sounds exactly like."
`;
}

async function sendLeadToWebhook(data: {
  date: string;
  artistName: string;
  email: string;
  songTitle: string;
  songLink: string;
  releaseStatus: string;
  discoveryScore: string | number;
  discoveryMoment: string;
  artistArchetype: string;
  rolloutType: string;
  mostShareableLyric: string;
  fanbaseMatchArtists: string;
  ifReleasedToday: string;
  ctaClicked: string;
}) {
  const webhookUrl = process.env.DISCOVERY_LEADS_WEBHOOK_URL;

  if (!webhookUrl) {
    console.log("DISCOVERY_LEADS_WEBHOOK_URL is not set. Skipping lead capture.");
    return;
  }

  try {
    await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
  } catch (error) {
    console.error("Lead webhook failed:", error);
  }
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const artistName = String(formData.get("artistName") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const songTitle = String(formData.get("songTitle") || "").trim();
    const songLink = String(formData.get("songLink") || "").trim();
    const releaseStatus = String(formData.get("releaseStatus") || "Not Sure").trim();
    const providedLyrics = String(formData.get("lyrics") || "").trim();
    const file = formData.get("songFile") as File | null;

    if (!artistName || !email || !file) {
      return NextResponse.json(
        {
          error:
            "Please add your artist name, email, and upload the song file. Song links are optional context only.",
        },
        { status: 400 }
      );
    }

    const maxFileSize = 25 * 1024 * 1024;

    if (file.size > maxFileSize) {
      return NextResponse.json(
        { error: "File is too large. Please upload a song under 25MB." },
        { status: 400 }
      );
    }

    const transcription = await openai.audio.transcriptions.create({
      file,
      model: "gpt-4o-transcribe",
      prompt:
        "This is a song. Transcribe the vocals as accurately as possible. Preserve repeated hooks, chorus lines, ad-libs, slang, emotional phrasing, and unusual lyric choices. Do not summarize. Do not rewrite. If words are unclear, transcribe the most likely lyric without inventing extra lines.",
    });

    const transcript = transcription.text || "";

    const lyricsToAnalyze = providedLyrics || transcript;

    const lyricsSource = providedLyrics
      ? "artist-provided lyrics"
      : "AI transcription from uploaded audio";

    if (!lyricsToAnalyze) {
      return NextResponse.json(
        {
          error:
            "We could not detect lyrics from the upload. Please paste the lyrics and try again.",
        },
        { status: 400 }
      );
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "system",
          content:
            "You create premium, evidence-based music discovery reports for CXTY LIMITS CREATIVES. Return valid JSON only.",
        },
        {
          role: "user",
          content: buildDiscoveryPrompt({
            artistName,
            songTitle,
            songLink,
            releaseStatus,
            lyrics: lyricsToAnalyze,
            lyricsSource,
          }),
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    const raw = completion.choices[0]?.message?.content;

    if (!raw) {
      return NextResponse.json(
        { error: "No report was generated." },
        { status: 500 }
      );
    }

    const report = JSON.parse(raw);

    await sendLeadToWebhook({
      date: new Date().toISOString(),
      artistName,
      email,
      songTitle,
      songLink,
      releaseStatus,
      discoveryScore: report?.scores?.discoveryScore || "",
      discoveryMoment: report?.strategy?.discoveryMoment || "",
      artistArchetype: report?.strategy?.artistArchetype || "",
      rolloutType: report?.strategy?.rolloutType || "",
      mostShareableLyric: report?.evidence?.mostShareableLyric || "",
      fanbaseMatchArtists:
        report?.fanbaseMatch?.closestArtists?.join(", ") || "",
      ifReleasedToday: report?.strategy?.ifReleasedToday || "",
      ctaClicked: "No",
    });

    return NextResponse.json({
      transcript,
      lyricsSource,
      report,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Something went wrong analyzing the song." },
      { status: 500 }
    );
  }
}