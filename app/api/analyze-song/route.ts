import { NextResponse } from "next/server";
import OpenAI from "openai";
import { get } from "@vercel/blob";

const apiKey = process.env.OPENAI_API_KEY;

if (!apiKey) {
  throw new Error("OPENAI_API_KEY is missing.");
}

const openai = new OpenAI({ apiKey });

type SpotifyArtist = {
  name: string;
  image: string;
  url: string;
};

type SpotifyTrack = {
  name: string;
  artist: string;
  image: string;
  url: string;
  album?: string;
  releaseDate?: string;
  popularity?: number;
};

function getSpotifyTrackIdFromUrl(songLink: string) {
  try {
    const url = new URL(songLink);
    const parts = url.pathname.split("/").filter(Boolean);

    if (
      url.hostname.includes("spotify.com") &&
      parts[0] === "track" &&
      parts[1]
    ) {
      return parts[1];
    }

    return null;
  } catch {
    return null;
  }
}

async function getSpotifyTrackById(
  token: string,
  trackId: string
): Promise<SpotifyTrack | null> {
  try {
    const response = await fetch(
      `https://api.spotify.com/v1/tracks/${trackId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) return null;

    const track = await response.json();

    return {
      name: track.name || "",
      artist: track.artists?.map((artist: any) => artist.name).join(", ") || "",
      image: track.album?.images?.[0]?.url || "",
      url: track.external_urls?.spotify || "",
      album: track.album?.name || "",
      releaseDate: track.album?.release_date || "",
      popularity: track.popularity,
    };
  } catch (error) {
    console.error("Spotify track lookup failed:", error);
    return null;
  }
}

function buildDiscoveryPrompt(data: {
  artistName: string;
  songTitle: string;
  songLink: string;
  releaseStatus: string;
  lyrics: string;
  lyricsSource: string;
  spotifyTrack?: SpotifyTrack | null;
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

Spotify Track Metadata:
${
  data.spotifyTrack
    ? `
Track: ${data.spotifyTrack.name}
Artist: ${data.spotifyTrack.artist}
Album: ${data.spotifyTrack.album || "Not provided"}
Release Date: ${data.spotifyTrack.releaseDate || "Not provided"}
Spotify Popularity: ${
        typeof data.spotifyTrack.popularity === "number"
          ? data.spotifyTrack.popularity
          : "Not provided"
      }
Spotify URL: ${data.spotifyTrack.url}
`
    : "No Spotify track metadata available."
}

Release Status:
${data.releaseStatus || "Not provided"}

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
    "ifReleasedToday": {
      "likelyOutcome": "",
      "theUnlock": "",
      "contentTrigger": ""
    },
    "futureRolloutPrediction": ""
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
- Do not guarantee streams, virality, followers, playlisting, or revenue.
- Use realistic opportunity language, not certainty language.

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
- ifReleasedToday.likelyOutcome: max 1 sentence. Make it feel like a prediction, not a score.
- ifReleasedToday.theUnlock: max 1 sentence. Mention the specific lyric, phrase, emotional moment, or recurring idea that unlocks the rollout.
- ifReleasedToday.contentTrigger: max 1 sentence. Make it feel like a repeatable short-form content idea.
- futureRolloutPrediction: max 2 sentences. Explain what could realistically happen if the artist builds a stronger rollout around this song over the next 30–60 days. Make it specific to the song's tone, message, artist archetype, discovery moment, fanbase lane, and rollout type. Do not say the song will go viral.
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

async function getSpotifyAccessToken() {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) return null;

  try {
    const response = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        Authorization:
          "Basic " +
          Buffer.from(`${clientId}:${clientSecret}`).toString("base64"),
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
    });

    if (!response.ok) {
      console.error("Spotify token error:", await response.text());
      return null;
    }

    const data = await response.json();
    return data.access_token as string;
  } catch (error) {
    console.error("Spotify token request failed:", error);
    return null;
  }
}

async function searchSpotifyArtist(
  token: string,
  artistName: string
): Promise<SpotifyArtist | null> {
  try {
    const query = encodeURIComponent(artistName);

    const response = await fetch(
      `https://api.spotify.com/v1/search?q=${query}&type=artist&limit=1`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) return null;

    const data = await response.json();
    const artist = data?.artists?.items?.[0];

    if (!artist) return null;

    return {
      name: artist.name,
      image: artist.images?.[0]?.url || "",
      url: artist.external_urls?.spotify || "",
    };
  } catch (error) {
    console.error("Spotify artist search failed:", error);
    return null;
  }
}

function parseSongArtist(value: string) {
  const parts = String(value || "").split("—");

  if (parts.length >= 2) {
    return {
      song: parts[0].trim(),
      artist: parts.slice(1).join("—").trim(),
    };
  }

  return {
    song: value,
    artist: "",
  };
}

async function searchSpotifyTrack(
  token: string,
  songValue: string
): Promise<SpotifyTrack | null> {
  try {
    const parsed = parseSongArtist(songValue);

    const query = parsed.artist
      ? encodeURIComponent(`track:${parsed.song} artist:${parsed.artist}`)
      : encodeURIComponent(parsed.song);

    const response = await fetch(
      `https://api.spotify.com/v1/search?q=${query}&type=track&limit=1`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) return null;

    const data = await response.json();
    const track = data?.tracks?.items?.[0];

    if (!track) return null;

    return {
      name: track.name,
      artist: track.artists?.[0]?.name || "",
      image: track.album?.images?.[0]?.url || "",
      url: track.external_urls?.spotify || "",
    };
  } catch (error) {
    console.error("Spotify track search failed:", error);
    return null;
  }
}

async function enrichWithSpotify(report: any) {
  try {
    const token = await getSpotifyAccessToken();

    if (!token) {
      return {
        artists: [],
        tracks: [],
      };
    }

    const closestArtists = report?.fanbaseMatch?.closestArtists || [];
    const similarSongs = report?.fanbaseMatch?.similarSongs || [];

    const artists = await Promise.all(
      closestArtists
        .slice(0, 3)
        .map((artist: string) => searchSpotifyArtist(token, artist))
    );

    const tracks = await Promise.all(
      similarSongs
        .slice(0, 3)
        .map((track: string) => searchSpotifyTrack(token, track))
    );

    return {
      artists: artists.filter(Boolean),
      tracks: tracks.filter(Boolean),
    };
  } catch (error) {
    console.error("Spotify enrichment failed:", error);

    return {
      artists: [],
      tracks: [],
    };
  }
}

function getSafeWebhookUrl() {
  const rawUrl = process.env.DISCOVERY_LEADS_WEBHOOK_URL;

  if (!rawUrl) return null;

  const url = rawUrl.trim();

  if (!url.startsWith("https://")) {
    console.error(
      "DISCOVERY_LEADS_WEBHOOK_URL is missing or invalid. It must start with https://"
    );
    return null;
  }

  try {
    new URL(url);
    return url;
  } catch (error) {
    console.error("Invalid DISCOVERY_LEADS_WEBHOOK_URL:", error);
    return null;
  }
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
  futureRolloutPrediction: string;
  ctaClicked: string;
}) {
  const webhookUrl = getSafeWebhookUrl();

  if (!webhookUrl) return;

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      console.error("Lead webhook returned error:", await response.text());
    }
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
    const releaseStatus = String(formData.get("releaseStatus") || "").trim();
    const providedLyrics = String(formData.get("lyrics") || "").trim();

let spotifyTrack: SpotifyTrack | null = null;

const spotifyTrackId = getSpotifyTrackIdFromUrl(songLink);

if (spotifyTrackId) {
  const spotifyToken = await getSpotifyAccessToken();

  if (spotifyToken) {
    spotifyTrack = await getSpotifyTrackById(spotifyToken, spotifyTrackId);
  }
}

const songBlobPathname = String(
  formData.get("songBlobPathname") || ""
).trim();

const songFileName = String(formData.get("songFileName") || "song.mp3").trim();
const songFileType = String(formData.get("songFileType") || "audio/mpeg").trim();

let file = formData.get("songFile") as File | null;

if (songBlobPathname) {
  const result = await get(songBlobPathname, { access: "private" });

  if (result?.statusCode !== 200 || !result.stream) {
    return NextResponse.json(
      { error: "We could not access the uploaded song file. Please try again." },
      { status: 400 }
    );
  }

  const audioBlob = await new Response(result.stream).blob();

  file = new File([audioBlob], songFileName, {
    type: result.blob.contentType || songFileType || "audio/mpeg",
  });
}

    if (!artistName || !email || (!file && !songLink)) {
  return NextResponse.json(
    {
      error: "Please add your artist name, email, and upload a song or paste a song link.",
    },
    { status: 400 }
  );
}

   let transcript = "";
let lyricsToAnalyze = providedLyrics;
let lyricsSource = providedLyrics
  ? "artist-provided lyrics"
  : file
    ? "AI transcription from uploaded audio"
    : "song link context only";

if (file) {
  const maxFileSize = 50 * 1024 * 1024;

  if (file.size > maxFileSize) {
    return NextResponse.json(
      { error: "File is too large. Please upload a song under 50MB." },
      { status: 400 }
    );
  }

  const transcription = await openai.audio.transcriptions.create({
    file,
    model: "gpt-4o-transcribe",
    prompt:
      "This is a song. Transcribe the vocals as accurately as possible. Preserve repeated hooks, chorus lines, ad-libs, slang, emotional phrasing, and unusual lyric choices. Do not summarize. Do not rewrite. If words are unclear, transcribe the most likely lyric without inventing extra lines.",
  });

  transcript = transcription.text || "";
  lyricsToAnalyze = providedLyrics || transcript;
}

if (!lyricsToAnalyze && songLink) {
  lyricsToAnalyze = `No lyrics were provided. Analyze cautiously using only this song link/context: ${songLink}`;
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
            spotifyTrack,
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

    const spotify = await enrichWithSpotify(report);

const enrichedReport = {
  ...report,
  spotify: {
    ...spotify,
    submittedTrack: spotifyTrack,
  },
};

    const prediction = report?.strategy?.ifReleasedToday;
    const predictionText =
      typeof prediction === "string"
        ? prediction
        : [
            prediction?.likelyOutcome,
            prediction?.theUnlock,
            prediction?.contentTrigger,
          ]
            .filter(Boolean)
            .join(" ");

    const leadPayload = {
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
      ifReleasedToday: predictionText,
      futureRolloutPrediction:
        report?.strategy?.futureRolloutPrediction || "",
      ctaClicked: "No",
    };

  // sendLeadToWebhook(leadPayload).catch((error) => {
//   console.error("Lead webhook background error:", error);
// });

    return NextResponse.json({
      transcript,
      lyricsSource,
      report: enrichedReport,
    });
  } catch (error) {
    console.error("Analyze song route failed:", error);

    return NextResponse.json(
      { error: "Something went wrong analyzing the song." },
      { status: 500 }
    );
  }
}