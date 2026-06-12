"use client";

import { useState } from "react";

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
    ifReleasedToday: {
      likelyOutcome: string;
      theUnlock: string;
      contentTrigger: string;
    };
    futureRolloutPrediction: string;
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
    artists: {
      name: string;
      image: string;
      url: string;
    }[];
    tracks: {
      name: string;
      artist: string;
      image: string;
      url: string;
    }[];
  };
};

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<Report | null>(null);
  const [error, setError] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setReport(null);

    const formData = new FormData(event.currentTarget);

    try {
      const response = await fetch("/api/analyze-song", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Something went wrong.");
      }

      setReport(data.report);

setTimeout(() => {
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
}, 150);
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  if (report) {
    return <ReportView report={report} onReset={() => setReport(null)} />;
  }

  return (
    <main className="page-shell">
      <section className="container">
        <p className="brand">CXTY LIMITS CREATIVES</p>

        <h1 className="hero-title">DISCOVERY ENGINE</h1>

        <p className="hero-copy">
          Upload your song and get the story, the angle, and the rollout world
          that gives it the best chance to be discovered.
        </p>

        <p className="support-copy">
          Built for unreleased songs, new releases, and songs that already came
          out but still need a stronger discovery strategy.
        </p>

        <form onSubmit={handleSubmit} className="form-card">
          <h2 className="form-title">DROP THE TRACK</h2>

          <input
            name="artistName"
            required
            placeholder="Artist Name"
            className="input"
          />

          <input
            name="email"
            required
            placeholder="Email Address"
            type="email"
            className="input"
          />

          <input
            name="songTitle"
            placeholder="Song Title optional"
            className="input"
          />

          <select name="releaseStatus" defaultValue="" className="input">
            <option value="" disabled>
              Is the song released?
            </option>
            <option value="Unreleased">Unreleased</option>
            <option value="Already Released">Already Released</option>
            <option value="Not Sure">Not Sure</option>
          </select>

          <label className="label">Song Link optional</label>
          <input
            name="songLink"
            placeholder="Spotify, YouTube, or SoundCloud link"
            className="input"
          />
          <p className="field-note">
            Links are used for context only and may be less accurate. For the
            best report, upload the song file or paste the lyrics.
          </p>

          <label className="label">Upload Song File</label>

          <input
            name="songFile"
            required
            type="file"
            accept=".mp3,.wav,.m4a,.aac,.ogg,.flac,audio/mpeg,audio/wav,audio/mp4,audio/x-m4a,audio/aac,audio/ogg,audio/flac"
            className="file-input"
          />

          <textarea
            name="lyrics"
            placeholder="Optional: Paste lyrics for a more accurate report"
            className="textarea"
          />

          <button disabled={loading} type="submit" className="primary-button">
            {loading ? "Building The World..." : "Create My Rollout"}
          </button>

          {loading && (
            <div className="loading">
              <p>Listening for the emotional signal…</p>
              <p>Finding the lyric that carries the rollout…</p>
              <p>Mapping the audience psychology…</p>
              <p>Building the world around the song…</p>
            </div>
          )}

          {error && <p className="error">{error}</p>}
        </form>
      </section>
    </main>
  );
}

function ReportView({
  report,
  onReset,
}: {
  report: Report;
  onReset: () => void;
}) {
  const scores = [
    ["Discovery", report.scores.discoveryScore],
    ["Viral", report.scores.viralPotentialScore],
    ["Hook", report.scores.hookStrengthScore],
    ["Playlist", report.scores.playlistFitScore],
    ["UGC", report.scores.ugcTikTokScore],
    ["Emotion", report.scores.emotionalResonanceScore],
    ["Brand", report.scores.brandFitScore],
    ["Rollout", report.scores.rolloutReadinessScore],
  ];

  return (
    <main className="report-shell">
      <section className="report-container">
        <p className="brand">CXTY LIMITS CREATIVES</p>

        <section className="wrapped-hero">
          <p className="eyebrow">THE DISCOVERY MOMENT</p>
          <h1 className="wrapped-headline">{report.strategy.discoveryMoment}</h1>

          <div className="stats-grid">
            <Stat label="Archetype" value={report.strategy.artistArchetype} />
            <Stat label="Rollout" value={report.strategy.rolloutType} />
            <Stat label="Score" value={`${report.scores.discoveryScore}/100`} />
          </div>
        </section>

        <section className="red-card">
          <p className="eyebrow-white">THE LINE THAT CARRIES THE ROLLOUT</p>
          <h2 className="lyric">
            “{cleanQuote(report.evidence.mostShareableLyric)}”
          </h2>
        </section>

        <section className="final-card dark-final">
          <p className="eyebrow">IF RELEASED TODAY...</p>

          <div style={{ marginTop: "16px" }}>
            <p className="eyebrow">LIKELY OUTCOME</p>
            <h3 className="wrapped-card-title">
              {report.strategy.ifReleasedToday?.likelyOutcome}
            </h3>
          </div>

          <div style={{ marginTop: "24px" }}>
            <p className="eyebrow">THE UNLOCK</p>
            <h3 className="wrapped-card-title">
              {report.strategy.ifReleasedToday?.theUnlock}
            </h3>
          </div>

          <div style={{ marginTop: "24px" }}>
            <p className="eyebrow">CONTENT TRIGGER</p>
            <h3 className="wrapped-card-title">
              {report.strategy.ifReleasedToday?.contentTrigger}
            </h3>
          </div>
        </section>

        <section className="final-card dark-final">
          <p className="eyebrow">FUTURE ROLLOUT PREDICTION</p>
          <h3 className="wrapped-card-title">
            {report.strategy.futureRolloutPrediction}
          </h3>
        </section>

        <section className="split-grid">
          <WrappedCard
            label="IF IT CONNECTS"
            title={`“${cleanQuote(report.evidence.listenerComment)}”`}
            body="This is the emotional reaction the rollout should be built to trigger."
          />

          <WrappedCard
            label="WHAT IT'S REALLY SELLING"
            title={report.evidence.strongestMessage}
            body="The song is not just a sound. It is a feeling people need to recognize in themselves."
          />
        </section>

        <section className="panel fanbase-panel">
          <p className="eyebrow">FANBASE MATCH</p>
          <h2 className="section-title">Where this song could live.</h2>
          <p className="panel-body">{report.fanbaseMatch?.fanbaseReason}</p>

          <div className="three-grid">
            <ListBlock
              title="Closest Artist Lanes"
              items={report.fanbaseMatch?.closestArtists || []}
            />
            <ListBlock
              title="Similar Song Energy"
              items={report.fanbaseMatch?.similarSongs || []}
            />
            <ListBlock
              title="Playlist Lanes"
              items={report.fanbaseMatch?.playlistLanes || []}
            />
          </div>

          {report.spotify?.artists?.length ? (
            <div className="spotify-section">
              <h3 className="spotify-heading">Spotify Artist Lanes</h3>
              <div className="spotify-grid">
                {report.spotify.artists.map((artist, index) => (
                  <a
                    key={index}
                    className="spotify-card"
                    href={artist.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {artist.image && (
                      <img
                        src={artist.image}
                        alt={artist.name}
                        className="spotify-img"
                      />
                    )}
                    <div>
                      <p className="spotify-name">{artist.name}</p>
                      <p className="spotify-link">Open in Spotify</p>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          ) : null}

          {report.spotify?.tracks?.length ? (
            <div className="spotify-section">
              <h3 className="spotify-heading">Spotify Song References</h3>
              <div className="spotify-grid">
                {report.spotify.tracks.map((track, index) => (
                  <a
                    key={index}
                    className="spotify-card"
                    href={track.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {track.image && (
                      <img
                        src={track.image}
                        alt={track.name}
                        className="spotify-img"
                      />
                    )}
                    <div>
                      <p className="spotify-name">{track.name}</p>
                      <p className="spotify-sub">{track.artist}</p>
                      <p className="spotify-link">Open in Spotify</p>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          ) : null}
        </section>

        <section className="panel">
          <p className="eyebrow">DISCOVERY SCORECARD</p>

          <div className="score-grid">
            {scores.map(([label, value]) => (
              <div key={label} className="score-card">
                <p className="score-label">{label}</p>
                <p className="score-number">
                  {value}
                  <span className="score-outof">/100</span>
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="split-grid">
          <WrappedCard
            label="THE ANGLE"
            title={report.strategy.discoveryAngle}
            body={report.strategy.archetypeExplanation}
          />

          <WrappedCard
            label="THE AUDIENCE"
            title={report.strategy.audienceMap}
            body="These are the people most likely to hear themselves inside the record."
          />
        </section>

        <section className="panel">
          <p className="eyebrow">WHAT WE PULLED FROM THE SONG</p>

          <div className="evidence-grid">
            <PillList title="Themes" items={report.evidence.coreThemes} />
            <PillList title="Emotions" items={report.evidence.emotionalStates} />
            <PillList title="Imagery" items={report.evidence.imagery} />
            <PillList
              title="Repeated Ideas"
              items={report.evidence.repeatedIdeas}
            />
          </div>
        </section>

        <section className="panel">
          <p className="eyebrow">THE ROLLOUT BLUEPRINT</p>

          <div className="split-grid inner-grid">
            <ListBlock
              title="Content Pillars"
              items={report.rollout.contentPillars}
            />
            <ListBlock title="Video Ideas" items={report.rollout.videoIdeas} />
          </div>

          <div className="three-grid">
            <ListBlock
              title="Pre-Release"
              items={report.rollout.preReleasePlan}
            />
            <ListBlock
              title="Release Week"
              items={report.rollout.releaseWeekPlan}
            />
            <ListBlock
              title="30 Days After"
              items={report.rollout.postReleasePlan}
            />
          </div>
        </section>

        <section className="split-grid">
          <WrappedCard
            label="VISUAL WORLD"
            title={report.creative.visualDirection}
            body=""
          />
          <WrappedCard
            label="BIGGEST RISK"
            title={report.creative.biggestRisk}
            body=""
          />
        </section>

        <section className="final-card">
          <p className="eyebrow">FINAL READ</p>
          <h2 className="final-title">{report.creative.finalRecommendation}</h2>
        </section>

        <section className="cta-card desktop-bottom-cta">
          <p className="eyebrow-white">CXTY LIMITS CREATIVES</p>
          <h2 className="cta-title">
            We found the story. Now build the world around it.
          </h2>
          <p className="cta-body">
            Your song does not need more random posts. It needs a release world:
            visuals, narrative, short-form moments, and a rollout system built
            around the emotion people will actually remember.
          </p>

          <div className="button-row">
            <a
              className="black-button"
              href="https://cxtylimits.co/build-my-rollout"
              target="_blank"
              rel="noopener noreferrer"
            >
              Build The World Around This Song
            </a>

            <button onClick={onReset} className="outline-button">
              Analyze Another Track
            </button>
          </div>
        </section>
      </section>

      <style jsx global>{`
        * {
          box-sizing: border-box;
        }

        html,
        body {
          margin: 0;
          padding: 0;
          background: #000;
          overflow-x: hidden;
        }

        .page-shell {
          min-height: 100vh;
          background: #000;
          color: #fff;
          padding: 56px 20px;
          font-family: var(--font-source-sans);
          overflow-x: hidden;
        }

        .report-shell {
          min-height: 100vh;
          background: radial-gradient(
              circle at top left,
              rgba(220, 38, 38, 0.24),
              transparent 30%
            ),
            #000;
          color: #fff;
          padding: 44px 20px;
          font-family: var(--font-source-sans);
          overflow-x: hidden;
        }

        .container,
        .report-container {
          width: 100%;
          max-width: 940px;
          margin: 0 auto;
        }

        .brand,
        .eyebrow {
          color: #dc2626;
          letter-spacing: 4px;
          text-transform: uppercase;
          font-size: 12px;
          font-weight: 900;
          margin: 0;
        }

        .eyebrow-white {
          color: #fff;
          letter-spacing: 4px;
          text-transform: uppercase;
          font-size: 12px;
          font-weight: 900;
          margin: 0;
        }

        .hero-title {
          font-family: var(--font-bebas);
          font-size: clamp(66px, 12vw, 96px);
          line-height: 0.86;
          margin: 14px 0 0;
          letter-spacing: 2px;
          max-width: 760px;
        }

        .hero-copy {
          max-width: 760px;
          font-size: clamp(20px, 4vw, 23px);
          font-weight: 900;
          line-height: 1.35;
          margin-top: 28px;
        }

        .support-copy {
          max-width: 760px;
          font-size: 18px;
          line-height: 1.55;
          color: #a1a1aa;
          margin-top: 16px;
        }

        .form-card {
          margin-top: 40px;
          padding: 30px;
          border: 1px solid #27272a;
          border-radius: 22px;
          width: 100%;
          max-width: 720px;
          background: rgba(9, 9, 11, 0.92);
          display: grid;
          gap: 16px;
        }

        .form-title {
          font-family: var(--font-bebas);
          font-size: 48px;
          margin: 0;
          letter-spacing: 1px;
        }

        .input,
        .textarea {
          width: 100%;
          padding: 16px;
          background: #fff;
          border: 1px solid #27272a;
          border-radius: 12px;
          color: #000;
          font-size: 16px;
          font-family: var(--font-source-sans);
        }

        .textarea {
          min-height: 130px;
          resize: vertical;
        }

        .label {
          color: #a1a1aa;
          font-size: 15px;
          margin-top: 8px;
        }

        .field-note {
          color: #a1a1aa;
          font-size: 14px;
          line-height: 1.35;
          margin: -6px 0 2px;
        }

        .file-input {
          color: #fff;
          max-width: 100%;
        }

        .primary-button,
        .black-button,
        .outline-button,
        .mobile-reset {
          border: none;
          padding: 15px 20px;
          border-radius: 12px;
          cursor: pointer;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 1px;
          font-size: 14px;
        }

        .primary-button {
          margin-top: 14px;
          background: #dc2626;
          color: #fff;
        }

        .loading {
          color: #a1a1aa;
          font-size: 15px;
          line-height: 1.25;
        }

        .error {
          color: #f87171;
        }

        .wrapped-hero,
        .panel,
        .wrapped-card,
        .final-card,
        .cta-card,
        .red-card {
          width: 100%;
          overflow: hidden;
        }

        .wrapped-hero {
          margin-top: 24px;
          padding: 32px;
          border: 1px solid #dc2626;
          border-radius: 28px;
          background: linear-gradient(
            135deg,
            rgba(220, 38, 38, 0.24),
            rgba(9, 9, 11, 1) 55%,
            rgba(255, 255, 255, 0.05)
          );
        }

        .wrapped-headline {
          font-size: clamp(25px, 5vw, 34px);
          line-height: 1.12;
          margin: 18px 0 0;
          max-width: 820px;
          font-weight: 900;
        }

        .stats-grid,
        .score-grid,
        .split-grid,
        .three-grid,
        .evidence-grid {
          display: grid;
          gap: 12px;
        }

        .stats-grid {
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          margin-top: 24px;
        }

        .stat,
        .score-card,
        .list-block {
          background: #000;
          border: 1px solid #27272a;
          border-radius: 16px;
          padding: 16px;
        }

        .stat-label,
        .score-label {
          color: #a1a1aa;
          font-size: 13px;
          margin: 0;
        }

        .stat-value {
          color: #fff;
          font-size: 18px;
          font-weight: 900;
          line-height: 1.25;
          margin: 8px 0 0;
        }

        .red-card {
          margin-top: 18px;
          padding: 28px;
          border-radius: 24px;
          background: #dc2626;
        }

        .lyric {
          font-size: clamp(27px, 6vw, 36px);
          line-height: 1.05;
          margin: 14px 0 0;
          font-weight: 900;
        }

        .split-grid {
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          margin-top: 18px;
        }

        .three-grid {
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          margin-top: 18px;
        }

        .wrapped-card,
        .panel {
          background: rgba(9, 9, 11, 0.92);
          border: 1px solid #27272a;
          border-radius: 22px;
          padding: 24px;
        }

        .fanbase-panel {
          background: linear-gradient(
            135deg,
            rgba(255, 255, 255, 0.08),
            rgba(9, 9, 11, 0.96)
          );
        }

        .wrapped-card-title {
          font-size: 24px;
          line-height: 1.15;
          margin: 14px 0 0;
          font-weight: 900;
        }

        .wrapped-card-body,
        .panel-body {
          color: #a1a1aa;
          font-size: 16px;
          line-height: 1.5;
          margin-top: 12px;
        }

        .panel {
          margin-top: 18px;
        }

        .section-title {
          font-size: 28px;
          line-height: 1.1;
          margin: 12px 0 0;
          font-weight: 900;
        }

        .score-grid {
          margin-top: 18px;
          grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
          gap: 10px;
        }

        .score-card {
          min-height: 88px;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .score-number {
          font-size: 28px;
          font-weight: 900;
          margin: 6px 0 0;
        }

        .score-outof {
          color: #a1a1aa;
          font-size: 15px;
          margin-left: 3px;
          font-weight: 800;
        }

        .evidence-grid {
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          margin-top: 18px;
        }

        .small-title {
          font-size: 18px;
          margin: 0 0 10px;
          font-weight: 900;
        }

        .pill-wrap {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .pill {
          border: 1px solid #27272a;
          border-radius: 999px;
          padding: 8px 11px;
          color: #d4d4d8;
          font-size: 14px;
          background: #000;
        }

        .inner-grid {
          margin-top: 18px;
        }

        .list-title {
          font-size: 23px;
          margin: 0 0 12px;
          font-weight: 900;
        }

        .list {
          color: #d4d4d8;
          font-size: 16px;
          line-height: 1.45;
          padding-left: 18px;
          margin: 0;
        }

        .final-card {
          margin-top: 18px;
          background: #fff;
          color: #000;
          border-radius: 24px;
          padding: 28px;
        }

        .dark-final {
          background: #09090b;
          color: #fff;
          border: 1px solid #27272a;
        }

        .final-title {
          font-size: 26px;
          line-height: 1.15;
          margin: 14px 0 0;
          font-weight: 900;
        }

        .cta-card {
          margin-top: 20px;
          background: #dc2626;
          color: #fff;
          border-radius: 28px;
          padding: 30px;
        }

        .mobile-early-cta {
          display: none;
        }

        .cta-title {
          font-size: clamp(30px, 6vw, 38px);
          line-height: 1.05;
          margin: 14px 0 0;
          font-weight: 900;
        }

        .cta-body {
          font-size: 17px;
          line-height: 1.5;
          max-width: 820px;
        }

        .button-row {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }

        .black-button {
          margin-top: 16px;
          background: #000;
          color: #fff;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          text-decoration: none;
        }

        .outline-button,
        .mobile-reset {
          margin-top: 16px;
          background: transparent;
          color: #fff;
          border: 1px solid #fff;
        }

        .mobile-reset {
          display: none;
          width: 100%;
        }

        .spotify-section {
          margin-top: 22px;
        }

        .spotify-heading {
          font-size: 22px;
          margin: 0 0 12px;
          font-weight: 900;
        }

        .spotify-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
          gap: 12px;
        }

        .spotify-card {
          display: flex;
          gap: 12px;
          align-items: center;
          background: #000;
          border: 1px solid #27272a;
          border-radius: 16px;
          padding: 12px;
          text-decoration: none;
          color: #fff;
        }

        .spotify-img {
          width: 58px;
          height: 58px;
          border-radius: 12px;
          object-fit: cover;
          flex-shrink: 0;
        }

        .spotify-name {
          font-size: 16px;
          font-weight: 900;
          margin: 0;
          line-height: 1.15;
        }

        .spotify-sub {
          color: #a1a1aa;
          font-size: 14px;
          margin: 4px 0 0;
        }

        .spotify-link {
          color: #dc2626;
          font-size: 13px;
          font-weight: 900;
          margin: 6px 0 0;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        @media (max-width: 640px) {
          .page-shell,
          .report-shell {
            padding: 32px 14px;
          }

          .container,
          .report-container {
            max-width: 100%;
          }

          .brand,
          .eyebrow,
          .eyebrow-white {
            letter-spacing: 3px;
            font-size: 11px;
          }

          .hero-title {
            font-size: 58px;
            line-height: 0.9;
            max-width: 100%;
            word-break: normal;
          }

          .hero-copy {
            font-size: 19px;
            line-height: 1.35;
            margin-top: 22px;
          }

          .support-copy {
            font-size: 16px;
            line-height: 1.5;
          }

          .form-card {
            margin-top: 30px;
            padding: 20px;
            border-radius: 18px;
          }

          .form-title {
            font-size: 38px;
          }

          .input,
          .textarea {
            font-size: 15px;
            padding: 14px;
          }

          .wrapped-hero,
          .panel,
          .wrapped-card,
          .red-card,
          .final-card,
          .cta-card {
            padding: 20px;
            border-radius: 20px;
          }

          .wrapped-headline {
            font-size: 25px;
          }

          .stats-grid,
          .score-grid,
          .split-grid,
          .three-grid,
          .evidence-grid {
            grid-template-columns: 1fr;
          }

          .stat-value {
            font-size: 17px;
          }

          .lyric {
            font-size: 28px;
          }

          .wrapped-card-title {
            font-size: 21px;
          }

          .score-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .score-card {
            min-height: 78px;
            padding: 14px;
          }

          .score-number {
            font-size: 24px;
          }

          .list-title {
            font-size: 21px;
          }

          .final-title {
            font-size: 22px;
          }

          .mobile-early-cta {
            display: block;
          }

          .mobile-reset {
            display: block;
          }

          .black-button,
          .outline-button {
            width: 100%;
          }
        }
      `}</style>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="stat">
      <p className="stat-label">{label}</p>
      <p className="stat-value">{value}</p>
    </div>
  );
}

function WrappedCard({
  label,
  title,
  body,
}: {
  label: string;
  title: string;
  body: string;
}) {
  return (
    <section className="wrapped-card">
      <p className="eyebrow">{label}</p>
      <h3 className="wrapped-card-title">{title}</h3>
      {body && <p className="wrapped-card-body">{body}</p>}
    </section>
  );
}

function PillList({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h3 className="small-title">{title}</h3>
      <div className="pill-wrap">
        {items?.slice(0, 5).map((item, index) => (
          <span key={index} className="pill">
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

function ListBlock({ title, items }: { title: string; items: string[] }) {
  return (
    <section className="list-block">
      <h3 className="list-title">{title}</h3>
      <ul className="list">
        {items?.slice(0, 5).map((item, index) => (
          <li key={index} style={{ marginBottom: "10px" }}>
            {item}
          </li>
        ))}
      </ul>
    </section>
  );
}

function cleanQuote(text: string) {
  return String(text || "").replace(/^["“]+|["”]+$/g, "");
}