"use client";

import { useState } from "react";

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
};

type Report = {
  evidence: {
    coreThemes: string[];
    emotionalStates: string[];
    repeatedIdeas: string[];
    imagery: string[];
    coreTension: string;
    strongestMessage: string;
    mostShareableLyric: string;
    listenerComment: string;
  };
  strategy: {
    discoveryMoment: string;
    artistArchetype: string;
    archetypeExplanation: string;
    discoveryAngle: string;
    rolloutType: string;
    audienceMap: string;
    ifReleasedToday:
      | string
      | {
          likelyOutcome?: string;
          theUnlock?: string;
          contentTrigger?: string;
        };
    futureRolloutPrediction?: string;
  };
  fanbaseMatch: {
    closestArtists: string[];
    similarSongs: string[];
    playlistLanes: string[];
    fanbaseReason: string;
  };
  scores: {
    discoveryScore: number;
    viralPotentialScore: number;
    hookStrengthScore: number;
    playlistFitScore: number;
    ugcTikTokScore: number;
    emotionalResonanceScore: number;
    brandFitScore: number;
    rolloutReadinessScore: number;
  };
  rollout: {
    platformPriority: string;
    contentPillars: string[];
    videoIdeas: string[];
    preReleasePlan: string[];
    releaseWeekPlan: string[];
    postReleasePlan: string[];
  };
  creative: {
    visualDirection: string;
    biggestOpportunity: string;
    biggestRisk: string;
    finalRecommendation: string;
    cta: string;
  };
  spotify?: {
    artists?: SpotifyArtist[];
    tracks?: SpotifyTrack[];
  };
};

function ScoreCard({
  label,
  score,
}: {
  label: string;
  score: number | string;
}) {
  const safeScore = Number(score) || 0;

  return (
    <div className="score-card">
      <div className="score-top">
        <span>{label}</span>
        <strong>{safeScore}</strong>
      </div>
      <div className="score-bar">
        <div style={{ width: `${Math.min(safeScore, 100)}%` }} />
      </div>
    </div>
  );
}

function Section({
  eyebrow,
  title,
  children,
}: {
  eyebrow?: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="report-section">
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h2>{title}</h2>
      {children}
    </section>
  );
}

function ListBlock({ items }: { items?: string[] }) {
  if (!items || items.length === 0) return null;

  return (
    <ul className="clean-list">
      {items.map((item, index) => (
        <li key={`${item}-${index}`}>{item}</li>
      ))}
    </ul>
  );
}

function getIfReleasedTodayText(report: Report) {
  const prediction = report.strategy.ifReleasedToday;

  if (!prediction) return "";

  if (typeof prediction === "string") return prediction;

  return [
    prediction.likelyOutcome,
    prediction.theUnlock,
    prediction.contentTrigger,
  ]
    .filter(Boolean)
    .join(" ");
}

function getIfReleasedTodayParts(report: Report) {
  const prediction = report.strategy.ifReleasedToday;

  if (!prediction) {
    return {
      likelyOutcome: "",
      theUnlock: "",
      contentTrigger: "",
    };
  }

  if (typeof prediction === "string") {
    return {
      likelyOutcome: prediction,
      theUnlock: "",
      contentTrigger: "",
    };
  }

  return {
    likelyOutcome: prediction.likelyOutcome || "",
    theUnlock: prediction.theUnlock || "",
    contentTrigger: prediction.contentTrigger || "",
  };
}

function SpotifyArtists({ artists }: { artists?: SpotifyArtist[] }) {
  if (!artists || artists.length === 0) return null;

  return (
    <div className="spotify-grid">
      {artists.map((artist, index) => (
        <a
          className="spotify-card"
          href={artist.url}
          target="_blank"
          rel="noreferrer"
          key={`${artist.name}-${index}`}
        >
          {artist.image && <img src={artist.image} alt={artist.name} />}
          <div>
            <span>Artist Lane</span>
            <strong>{artist.name}</strong>
          </div>
        </a>
      ))}
    </div>
  );
}

function SpotifyTracks({ tracks }: { tracks?: SpotifyTrack[] }) {
  if (!tracks || tracks.length === 0) return null;

  return (
    <div className="spotify-grid">
      {tracks.map((track, index) => (
        <a
          className="spotify-card"
          href={track.url}
          target="_blank"
          rel="noreferrer"
          key={`${track.name}-${index}`}
        >
          {track.image && <img src={track.image} alt={track.name} />}
          <div>
            <span>Song Reference</span>
            <strong>{track.name}</strong>
            <p>{track.artist}</p>
          </div>
        </a>
      ))}
    </div>
  );
}

function ReportView({
  report,
  transcript,
  lyricsSource,
  onReset,
}: {
  report: Report;
  transcript: string;
  lyricsSource: string;
  onReset: () => void;
}) {
  const prediction = getIfReleasedTodayParts(report);

  return (
    <main className="page report-page">
      <section className="report-hero">
        <div>
          <p className="eyebrow">CXTY LIMITS DISCOVERY ENGINE</p>
          <h1>Your Song Discovery Report</h1>
          <p className="hero-copy">
            A strategic read on the song&apos;s emotional center, discovery
            angle, fanbase lane, rollout path, and creative world.
          </p>
        </div>

        <div className="hero-score">
          <span>Discovery Score</span>
          <strong>{report.scores.discoveryScore}</strong>
          <p>Out of 100</p>
        </div>
      </section>

      <Section eyebrow="Prediction" title="If Released Today">
        <div className="prediction-grid">
          {prediction.likelyOutcome && (
            <div className="prediction-card">
              <span>Likely Outcome</span>
              <p>{prediction.likelyOutcome}</p>
            </div>
          )}

          {prediction.theUnlock && (
            <div className="prediction-card">
              <span>The Unlock</span>
              <p>{prediction.theUnlock}</p>
            </div>
          )}

          {prediction.contentTrigger && (
            <div className="prediction-card">
              <span>Content Trigger</span>
              <p>{prediction.contentTrigger}</p>
            </div>
          )}
        </div>
      </Section>

      {report.strategy.futureRolloutPrediction && (
        <Section eyebrow="Future Upgrade" title="Future Rollout Prediction">
          <div className="big-callout">
            <p>{report.strategy.futureRolloutPrediction}</p>
          </div>
        </Section>
      )}

      <Section eyebrow="Core Read" title="The Discovery Moment">
        <div className="two-col">
          <div className="callout">
            <span>Discovery Moment</span>
            <p>{report.strategy.discoveryMoment}</p>
          </div>

          <div className="callout">
            <span>Artist Archetype</span>
            <p>{report.strategy.artistArchetype}</p>
            <small>{report.strategy.archetypeExplanation}</small>
          </div>
        </div>
      </Section>

      <Section eyebrow="Scores" title="Discovery Scorecard">
        <div className="score-grid">
          <ScoreCard
            label="Discovery Score"
            score={report.scores.discoveryScore}
          />
          <ScoreCard
            label="Viral Potential"
            score={report.scores.viralPotentialScore}
          />
          <ScoreCard
            label="Hook Strength"
            score={report.scores.hookStrengthScore}
          />
          <ScoreCard
            label="Playlist Fit"
            score={report.scores.playlistFitScore}
          />
          <ScoreCard
            label="UGC / TikTok"
            score={report.scores.ugcTikTokScore}
          />
          <ScoreCard
            label="Emotional Resonance"
            score={report.scores.emotionalResonanceScore}
          />
          <ScoreCard label="Brand Fit" score={report.scores.brandFitScore} />
          <ScoreCard
            label="Rollout Readiness"
            score={report.scores.rolloutReadinessScore}
          />
        </div>
      </Section>

      <Section eyebrow="Evidence" title="What The Song Is Really Built Around">
        <div className="two-col">
          <div>
            <h3>Core Themes</h3>
            <ListBlock items={report.evidence.coreThemes} />
          </div>

          <div>
            <h3>Emotional States</h3>
            <ListBlock items={report.evidence.emotionalStates} />
          </div>

          <div>
            <h3>Repeated Ideas</h3>
            <ListBlock items={report.evidence.repeatedIdeas} />
          </div>

          <div>
            <h3>Imagery</h3>
            <ListBlock items={report.evidence.imagery} />
          </div>
        </div>

        <div className="insight-stack">
          <div>
            <span>Core Tension</span>
            <p>{report.evidence.coreTension}</p>
          </div>

          <div>
            <span>Strongest Message</span>
            <p>{report.evidence.strongestMessage}</p>
          </div>

          <div>
            <span>Most Shareable Lyric</span>
            <p className="quote">&quot;{report.evidence.mostShareableLyric}&quot;</p>
          </div>

          <div>
            <span>Fan Comment Energy</span>
            <p>{report.evidence.listenerComment}</p>
          </div>
        </div>
      </Section>

      <Section eyebrow="Strategy" title="Audience & Rollout Direction">
        <div className="two-col">
          <div className="text-card">
            <h3>Discovery Angle</h3>
            <p>{report.strategy.discoveryAngle}</p>
          </div>

          <div className="text-card">
            <h3>Rollout Type</h3>
            <p>{report.strategy.rolloutType}</p>
          </div>

          <div className="text-card">
            <h3>Audience Map</h3>
            <p>{report.strategy.audienceMap}</p>
          </div>

          <div className="text-card">
            <h3>Platform Priority</h3>
            <p>{report.rollout.platformPriority}</p>
          </div>
        </div>
      </Section>

      <Section eyebrow="Fanbase Match" title="Who This Could Reach">
        <p className="section-copy">{report.fanbaseMatch.fanbaseReason}</p>

        <div className="two-col">
          <div>
            <h3>Closest Artist Lanes</h3>
            <ListBlock items={report.fanbaseMatch.closestArtists} />
          </div>

          <div>
            <h3>Similar Song References</h3>
            <ListBlock items={report.fanbaseMatch.similarSongs} />
          </div>

          <div>
            <h3>Playlist Lanes</h3>
            <ListBlock items={report.fanbaseMatch.playlistLanes} />
          </div>
        </div>

        <SpotifyArtists artists={report.spotify?.artists} />
        <SpotifyTracks tracks={report.spotify?.tracks} />
      </Section>

      <Section eyebrow="Rollout Blueprint" title="How To Build Around The Song">
        <div className="three-col">
          <div>
            <h3>Content Pillars</h3>
            <ListBlock items={report.rollout.contentPillars} />
          </div>

          <div>
            <h3>Video Ideas</h3>
            <ListBlock items={report.rollout.videoIdeas} />
          </div>

          <div>
            <h3>Pre-Release Plan</h3>
            <ListBlock items={report.rollout.preReleasePlan} />
          </div>

          <div>
            <h3>Release Week Plan</h3>
            <ListBlock items={report.rollout.releaseWeekPlan} />
          </div>

          <div>
            <h3>Post-Release Plan</h3>
            <ListBlock items={report.rollout.postReleasePlan} />
          </div>
        </div>
      </Section>

      <Section eyebrow="Creative Direction" title="The World Around The Record">
        <div className="insight-stack">
          <div>
            <span>Visual Direction</span>
            <p>{report.creative.visualDirection}</p>
          </div>

          <div>
            <span>Biggest Opportunity</span>
            <p>{report.creative.biggestOpportunity}</p>
          </div>

          <div>
            <span>Biggest Risk</span>
            <p>{report.creative.biggestRisk}</p>
          </div>

          <div>
            <span>Final Recommendation</span>
            <p>{report.creative.finalRecommendation}</p>
          </div>
        </div>
      </Section>

      <section className="cta-section">
        <p className="eyebrow">NEXT STEP</p>
        <h2>Build The World Around This Song</h2>
        <p>{report.creative.cta}</p>

        <a
          className="cta-button"
          href="https://cxtylimits.co/build-my-rollout"
          target="_blank"
          rel="noreferrer"
        >
          Build The World Around This Song
        </a>

        <button className="secondary-button" type="button" onClick={onReset}>
          Analyze Another Song
        </button>
      </section>

      {transcript && (
        <details className="transcript-box">
          <summary>Transcript Source: {lyricsSource}</summary>
          <p>{transcript}</p>
        </details>
      )}

      <GlobalStyles />
    </main>
  );
}

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<Report | null>(null);
  const [transcript, setTranscript] = useState("");
  const [lyricsSource, setLyricsSource] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setError("");

    try {
      const form = event.currentTarget;
      const formData = new FormData(form);

      const response = await fetch("/api/analyze-song", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Something went wrong.");
      }

      setTranscript(data.transcript || "");
      setLyricsSource(data.lyricsSource || "");
      setReport(data.report);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Something went wrong analyzing the song.";

      setError(message);
    } finally {
      setLoading(false);
    }
  }

  if (report) {
    return (
      <ReportView
        report={report}
        transcript={transcript}
        lyricsSource={lyricsSource}
        onReset={() => {
          setReport(null);
          setTranscript("");
          setLyricsSource("");
          setError("");
        }}
      />
    );
  }

  return (
    <main className="page">
      <section className="hero">
        <p className="eyebrow">CXTY LIMITS DISCOVERY ENGINE</p>
        <h1>Find the world inside your song.</h1>
        <p className="hero-copy">
          Upload a song and get a strategic discovery report built around the
          lyrics, emotion, audience lane, rollout direction, and content moments
          that can help the record move.
        </p>
      </section>

      <section className="form-shell">
        <form onSubmit={handleSubmit} className="song-form">
          <div className="field-grid">
            <label>
              Artist Name
              <input
                name="artistName"
                required
                placeholder="Artist Name"
                className="input"
              />
            </label>

            <label>
              Email Address
              <input
                name="email"
                required
                placeholder="Email Address"
                type="email"
                className="input"
              />
            </label>

            <label>
              Song Title
              <input
                name="songTitle"
                placeholder="Song Title"
                className="input"
              />
            </label>

            <label>
              Song Link
              <input
                name="songLink"
                placeholder="Spotify, SoundCloud, YouTube, Dropbox, etc."
                className="input"
              />
            </label>
          </div>

          <label>
            Release Status
            <select name="releaseStatus" className="input" defaultValue="">
              <option value="" disabled>
                Select release status
              </option>
              <option value="Unreleased">Unreleased</option>
              <option value="Released recently">Released recently</option>
              <option value="Older song / needs new rollout">
                Older song / needs new rollout
              </option>
              <option value="Demo / work in progress">
                Demo / work in progress
              </option>
            </select>
          </label>

          <label>
            Upload Song File
            <input
              name="songFile"
              required
              type="file"
              className="file-input"
            />
          </label>

          <label>
            Lyrics
            <textarea
              name="lyrics"
              placeholder="Optional but recommended. Paste lyrics here for a cleaner report."
              className="textarea"
              rows={8}
            />
          </label>

          {error && <div className="error-box">{error}</div>}

          <button className="submit-button" type="submit" disabled={loading}>
            {loading ? "Analyzing Song..." : "Analyze My Song"}
          </button>

          <p className="micro-copy">
            Your report may take a minute. Keep this page open while the
            Discovery Engine reads the song.
          </p>
        </form>
      </section>

      <GlobalStyles />
    </main>
  );
}

function GlobalStyles() {
  return (
    <style jsx global>{`
      * {
        box-sizing: border-box;
      }

      body {
        margin: 0;
        background: #050505;
        color: #ffffff;
        font-family: Inter, Arial, sans-serif;
      }

      .page {
        min-height: 100vh;
        background:
          radial-gradient(circle at top left, rgba(237, 28, 36, 0.2), transparent 34%),
          linear-gradient(180deg, #050505 0%, #111111 100%);
        padding: 56px 20px;
      }

      .hero,
      .report-hero,
      .form-shell,
      .report-section,
      .cta-section,
      .transcript-box {
        width: min(1120px, 100%);
        margin-left: auto;
        margin-right: auto;
      }

      .hero {
        text-align: center;
        padding: 32px 0 28px;
      }

      .eyebrow {
        margin: 0 0 14px;
        color: #ed1c24;
        font-size: 12px;
        font-weight: 800;
        letter-spacing: 0.18em;
        text-transform: uppercase;
      }

      h1 {
        margin: 0;
        font-size: clamp(42px, 8vw, 92px);
        line-height: 0.92;
        letter-spacing: -0.06em;
        text-transform: uppercase;
      }

      .hero-copy {
        max-width: 760px;
        margin: 22px auto 0;
        color: rgba(255, 255, 255, 0.78);
        font-size: 18px;
        line-height: 1.6;
      }

      .form-shell {
        margin-top: 28px;
        background: rgba(255, 255, 255, 0.06);
        border: 1px solid rgba(255, 255, 255, 0.12);
        border-radius: 26px;
        padding: 28px;
        box-shadow: 0 24px 80px rgba(0, 0, 0, 0.45);
      }

      .song-form {
        display: flex;
        flex-direction: column;
        gap: 20px;
      }

      .field-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 20px;
      }

      label {
        display: flex;
        flex-direction: column;
        gap: 9px;
        color: rgba(255, 255, 255, 0.86);
        font-size: 13px;
        font-weight: 800;
        letter-spacing: 0.05em;
        text-transform: uppercase;
      }

      .input,
      .textarea,
      .file-input {
        width: 100%;
        border: 1px solid rgba(255, 255, 255, 0.16);
        border-radius: 14px;
        background: rgba(0, 0, 0, 0.42);
        color: #ffffff;
        font-size: 16px;
        outline: none;
        padding: 15px 16px;
      }

      .textarea {
        resize: vertical;
        line-height: 1.5;
      }

      .input::placeholder,
      .textarea::placeholder {
        color: rgba(255, 255, 255, 0.42);
      }

      .submit-button,
      .cta-button,
      .secondary-button {
        border: 0;
        border-radius: 999px;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-weight: 900;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        text-decoration: none;
      }

      .submit-button {
        width: 100%;
        background: #ed1c24;
        color: #ffffff;
        min-height: 58px;
        font-size: 15px;
      }

      .submit-button:disabled {
        cursor: not-allowed;
        opacity: 0.7;
      }

      .micro-copy {
        margin: -4px 0 0;
        text-align: center;
        color: rgba(255, 255, 255, 0.52);
        font-size: 13px;
      }

      .error-box {
        background: rgba(237, 28, 36, 0.14);
        border: 1px solid rgba(237, 28, 36, 0.42);
        color: #ffffff;
        border-radius: 14px;
        padding: 14px 16px;
        line-height: 1.5;
      }

      .report-page {
        padding-top: 40px;
      }

      .report-hero {
        display: grid;
        grid-template-columns: 1fr 220px;
        gap: 24px;
        align-items: center;
        padding: 28px 0 24px;
      }

      .hero-score {
        min-height: 190px;
        background: #ed1c24;
        border-radius: 28px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        text-align: center;
        padding: 24px;
      }

      .hero-score span {
        font-size: 12px;
        font-weight: 900;
        letter-spacing: 0.14em;
        text-transform: uppercase;
      }

      .hero-score strong {
        font-size: 76px;
        line-height: 1;
      }

      .hero-score p {
        margin: 6px 0 0;
        color: rgba(255, 255, 255, 0.8);
      }

      .report-section {
        margin-top: 26px;
        background: rgba(255, 255, 255, 0.06);
        border: 1px solid rgba(255, 255, 255, 0.12);
        border-radius: 26px;
        padding: 28px;
      }

      .report-section h2,
      .cta-section h2 {
        margin: 0 0 20px;
        font-size: clamp(28px, 4vw, 52px);
        line-height: 0.98;
        letter-spacing: -0.04em;
        text-transform: uppercase;
      }

      .report-section h3 {
        margin: 0 0 12px;
        font-size: 15px;
        letter-spacing: 0.08em;
        text-transform: uppercase;
      }

      .section-copy {
        margin: 0 0 22px;
        color: rgba(255, 255, 255, 0.78);
        line-height: 1.6;
      }

      .two-col {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 18px;
      }

      .three-col {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 18px;
      }

      .callout,
      .text-card,
      .prediction-card,
      .insight-stack > div {
        background: rgba(0, 0, 0, 0.3);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 20px;
        padding: 20px;
      }

      .callout span,
      .prediction-card span,
      .insight-stack span {
        color: #ed1c24;
        display: block;
        font-size: 11px;
        font-weight: 900;
        letter-spacing: 0.16em;
        margin-bottom: 10px;
        text-transform: uppercase;
      }

      .callout p,
      .text-card p,
      .prediction-card p,
      .insight-stack p {
        margin: 0;
        color: rgba(255, 255, 255, 0.84);
        line-height: 1.55;
      }

      .callout p {
        color: #ffffff;
        font-size: 24px;
        font-weight: 900;
        letter-spacing: -0.03em;
      }

      .callout small {
        display: block;
        color: rgba(255, 255, 255, 0.64);
        line-height: 1.5;
        margin-top: 10px;
      }

      .big-callout {
        background: #ffffff;
        color: #111111;
        border-radius: 24px;
        padding: 26px;
      }

      .big-callout p {
        margin: 0;
        font-size: 24px;
        font-weight: 850;
        line-height: 1.35;
        letter-spacing: -0.03em;
      }

      .prediction-grid {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 18px;
      }

      .score-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 16px;
      }

      .score-card {
        background: rgba(0, 0, 0, 0.3);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 18px;
        padding: 18px;
      }

      .score-top {
        display: flex;
        justify-content: space-between;
        gap: 18px;
        align-items: center;
        margin-bottom: 12px;
      }

      .score-top span {
        color: rgba(255, 255, 255, 0.78);
        font-size: 13px;
        font-weight: 800;
        letter-spacing: 0.06em;
        text-transform: uppercase;
      }

      .score-top strong {
        font-size: 28px;
      }

      .score-bar {
        height: 9px;
        border-radius: 999px;
        overflow: hidden;
        background: rgba(255, 255, 255, 0.12);
      }

      .score-bar div {
        height: 100%;
        background: #ed1c24;
        border-radius: 999px;
      }

      .clean-list {
        list-style: none;
        padding: 0;
        margin: 0;
        display: flex;
        flex-direction: column;
        gap: 10px;
      }

      .clean-list li {
        color: rgba(255, 255, 255, 0.78);
        line-height: 1.45;
        padding-left: 18px;
        position: relative;
      }

      .clean-list li::before {
        content: "";
        width: 7px;
        height: 7px;
        border-radius: 50%;
        background: #ed1c24;
        position: absolute;
        left: 0;
        top: 0.55em;
      }

      .insight-stack {
        display: grid;
        grid-template-columns: 1fr;
        gap: 14px;
        margin-top: 20px;
      }

      .quote {
        color: #ffffff !important;
        font-size: 22px;
        font-weight: 900;
        letter-spacing: -0.03em;
      }

      .spotify-grid {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 16px;
        margin-top: 18px;
      }

      .spotify-card {
        display: flex;
        gap: 14px;
        align-items: center;
        background: rgba(0, 0, 0, 0.32);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 18px;
        padding: 12px;
        color: #ffffff;
        text-decoration: none;
      }

      .spotify-card img {
        width: 62px;
        height: 62px;
        object-fit: cover;
        border-radius: 12px;
      }

      .spotify-card span {
        display: block;
        color: #ed1c24;
        font-size: 10px;
        font-weight: 900;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        margin-bottom: 5px;
      }

      .spotify-card strong {
        display: block;
        font-size: 14px;
        line-height: 1.2;
      }

      .spotify-card p {
        margin: 4px 0 0;
        color: rgba(255, 255, 255, 0.58);
        font-size: 12px;
      }

      .cta-section {
        margin-top: 26px;
        background: #ffffff;
        color: #111111;
        border-radius: 28px;
        padding: 32px;
        text-align: center;
      }

      .cta-section p {
        max-width: 720px;
        margin: 0 auto 22px;
        color: rgba(17, 17, 17, 0.72);
        line-height: 1.6;
      }

      .cta-button {
        background: #ed1c24;
        color: #ffffff;
        min-height: 54px;
        padding: 0 26px;
        margin: 4px 8px;
      }

      .secondary-button {
        background: #111111;
        color: #ffffff;
        min-height: 54px;
        padding: 0 22px;
        margin: 4px 8px;
      }

      .transcript-box {
        margin-top: 24px;
        background: rgba(255, 255, 255, 0.06);
        border: 1px solid rgba(255, 255, 255, 0.12);
        border-radius: 18px;
        padding: 18px;
      }

      .transcript-box summary {
        cursor: pointer;
        font-weight: 800;
      }

      .transcript-box p {
        color: rgba(255, 255, 255, 0.7);
        line-height: 1.6;
        white-space: pre-wrap;
      }

      @media screen and (max-width: 800px) {
        .page {
          padding: 34px 14px;
        }

        .field-grid,
        .two-col,
        .three-col,
        .prediction-grid,
        .score-grid,
        .spotify-grid,
        .report-hero {
          grid-template-columns: 1fr;
        }

        .form-shell,
        .report-section,
        .cta-section {
          padding: 20px;
          border-radius: 22px;
        }

        .hero-score {
          min-height: 150px;
        }

        .hero-score strong {
          font-size: 60px;
        }

        .big-callout p {
          font-size: 20px;
        }

        .cta-button,
        .secondary-button {
          width: 100%;
          margin: 6px 0;
        }
      }
    `}</style>
  );
}