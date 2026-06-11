export function buildDiscoveryPrompt(data: {
  artistName: string;
  transcript: string;
}) {
  return `
You are an expert A&R strategist, music marketing director, and rollout strategist for CXTY LIMITS CREATIVES.

An artist uploaded an unreleased song. Your job is to analyze the transcription and create a Discovery Report that helps the artist understand how the song should be positioned, promoted, and rolled out before release day.

Artist Name: ${data.artistName}

Song Transcript:
${data.transcript}

Return ONLY valid JSON with this exact structure:

{
  "discoveryScore": 0,
  "viralPotentialScore": 0,
  "hookStrengthScore": 0,
  "playlistFitScore": 0,
  "ugcTikTokScore": 0,
  "emotionalResonanceScore": 0,
  "brandFitScore": 0,
  "rolloutReadinessScore": 0,
  "scoreSummary": "",
  "whatTheSongIsReallySelling": "",
  "songDiagnosis": "",
  "audienceMap": "",
  "platformPriority": "",
  "contentPillars": [],
  "videoIdeas": [],
  "preReleasePlan": [],
  "releaseWeekPlan": [],
  "postReleasePlan": [],
  "visualDirection": "",
  "theGap": "",
  "finalRecommendation": "",
  "cta": ""
}

Rules:
- This is not a talent score.
- This is a discovery-readiness report.
- Be honest, but do not insult the artist.
- Do not give generic music marketing advice.
- Do not say "post consistently" unless you explain exactly what kind of content should be posted.
- Make the artist feel like the song was actually understood.
- "What The Song Is Really Selling" should be emotionally sharp and specific.
- "The Gap" should create urgency around rollout strategy.
- The CTA should invite the artist to create their rollout with CXTY LIMITS CREATIVES.
- Keep arrays practical and specific.
- Generate 10 video ideas, not 50.
`;
}