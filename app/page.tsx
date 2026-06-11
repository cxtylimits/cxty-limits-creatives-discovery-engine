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
      window.scrollTo({ top: 0, behavior: "smooth" });
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
    <main style={mainStyle}>
      <section style={containerStyle}>
        <p style={brandStyle}>CXTY LIMITS CREATIVES</p>

        <h1 style={heroHeadlineStyle}>DISCOVERY ENGINE</h1>

        <p style={heroTextStyle}>
          Upload your unreleased song and get the story, the angle, and the
          rollout world before release day.
        </p>

        <p style={supportTextStyle}>
          No long intake. Drop the track. We&apos;ll find what people are
          supposed to feel — and how the release should be built around it.
        </p>

        <form onSubmit={handleSubmit} style={formStyle}>
          <h2 style={formTitleStyle}>DROP THE TRACK</h2>

          <input
            name="artistName"
            required
            placeholder="Artist Name"
            style={inputStyle}
          />

          <input
            name="email"
            required
            placeholder="Email Address"
            type="email"
            style={inputStyle}
          />

          <label style={labelStyle}>Upload Song File</label>

          <input
            name="songFile"
            required
            type="file"
            accept="audio/*"
            style={{ color: "#ffffff" }}
          />

          <textarea
            name="lyrics"
            placeholder="Optional: Paste lyrics for a more accurate report"
            style={textAreaStyle}
          />

          <button disabled={loading} type="submit" style={buttonStyle}>
            {loading ? "Building The World..." : "Create My Rollout"}
          </button>

          {loading && (
            <div style={loadingStyle}>
              <p>Listening for the emotional signal…</p>
              <p>Finding the lyric that carries the rollout…</p>
              <p>Mapping the audience psychology…</p>
              <p>Building the world around the song…</p>
            </div>
          )}

          {error && <p style={{ color: "#f87171" }}>{error}</p>}
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
    <main style={reportMainStyle}>
      <section style={reportContainerStyle}>
        <p style={brandStyle}>CXTY LIMITS CREATIVES</p>

        <section style={wrappedHeroStyle}>
          <p style={eyebrowStyle}>THE DISCOVERY MOMENT</p>
          <h1 style={wrappedHeadlineStyle}>{report.strategy.discoveryMoment}</h1>

          <div style={wrappedStatsStyle}>
            <Stat label="Archetype" value={report.strategy.artistArchetype} />
            <Stat label="Rollout" value={report.strategy.rolloutType} />
            <Stat label="Score" value={`${report.scores.discoveryScore}/100`} />
          </div>
        </section>

        <section style={bigRedCardStyle}>
          <p style={eyebrowWhiteStyle}>THE LINE THAT CARRIES THE ROLLOUT</p>
          <h2 style={lyricStyle}>
            “{cleanQuote(report.evidence.mostShareableLyric)}”
          </h2>
        </section>

        <section style={splitGridStyle}>
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

        <section style={fanbasePanelStyle}>
          <p style={eyebrowStyle}>FANBASE MATCH</p>
          <h2 style={sectionTitleStyle}>Where this song could live.</h2>
          <p style={panelBodyStyle}>{report.fanbaseMatch?.fanbaseReason}</p>

          <div style={threeGridStyle}>
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
        </section>

        <section style={scorePanelStyle}>
          <p style={eyebrowStyle}>DISCOVERY SCORECARD</p>

          <div style={scoreGridStyle}>
            {scores.map(([label, value]) => (
              <div key={label} style={scoreCardStyle}>
                <p style={scoreLabelStyle}>{label}</p>
                <p style={scoreNumberStyle}>
                  {value}
                  <span style={scoreOutOfStyle}>/100</span>
                </p>
              </div>
            ))}
          </div>
        </section>

        <section style={splitGridStyle}>
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

        <section style={evidencePanelStyle}>
          <p style={eyebrowStyle}>WHAT WE PULLED FROM THE SONG</p>

          <div style={evidenceGridStyle}>
            <PillList title="Themes" items={report.evidence.coreThemes} />
            <PillList title="Emotions" items={report.evidence.emotionalStates} />
            <PillList title="Imagery" items={report.evidence.imagery} />
            <PillList
              title="Repeated Ideas"
              items={report.evidence.repeatedIdeas}
            />
          </div>
        </section>

        <section style={blueprintStyle}>
          <p style={eyebrowStyle}>THE ROLLOUT BLUEPRINT</p>

          <div style={splitGridStyle}>
            <ListBlock
              title="Content Pillars"
              items={report.rollout.contentPillars}
            />
            <ListBlock title="Video Ideas" items={report.rollout.videoIdeas} />
          </div>

          <div style={threeGridStyle}>
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

        <section style={splitGridStyle}>
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

        <section style={finalCardStyle}>
          <p style={eyebrowStyle}>FINAL READ</p>
          <h2 style={finalTitleStyle}>{report.creative.finalRecommendation}</h2>
        </section>

        <section style={ctaStyle}>
          <p style={eyebrowWhiteStyle}>CXTY LIMITS CREATIVES</p>
          <h2 style={ctaTitleStyle}>
            We found the story. Now build the world around it.
          </h2>
          <p style={ctaBodyStyle}>
            Your song does not need more random posts. It needs a release world:
            visuals, narrative, short-form moments, and a rollout system built
            around the emotion people will actually remember.
          </p>

          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <button style={blackButtonStyle}>
              Build The World Around This Song
            </button>
            <button onClick={onReset} style={outlineButtonStyle}>
              Analyze Another Track
            </button>
          </div>
        </section>
      </section>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div style={statStyle}>
      <p style={statLabelStyle}>{label}</p>
      <p style={statValueStyle}>{value}</p>
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
    <section style={wrappedCardStyle}>
      <p style={eyebrowStyle}>{label}</p>
      <h3 style={wrappedCardTitleStyle}>{title}</h3>
      {body && <p style={wrappedCardBodyStyle}>{body}</p>}
    </section>
  );
}

function PillList({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h3 style={smallTitleStyle}>{title}</h3>
      <div style={pillWrapStyle}>
        {items?.slice(0, 5).map((item, index) => (
          <span key={index} style={pillStyle}>
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

function ListBlock({ title, items }: { title: string; items: string[] }) {
  return (
    <section style={listBlockStyle}>
      <h3 style={listTitleStyle}>{title}</h3>
      <ul style={listStyle}>
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

const mainStyle = {
  minHeight: "100vh",
  background: "#000000",
  color: "#ffffff",
  padding: "60px 24px",
  fontFamily: "var(--font-source-sans)",
  overflow: "hidden",
};

const reportMainStyle = {
  minHeight: "100vh",
  background:
    "radial-gradient(circle at top left, rgba(220,38,38,0.24), transparent 30%), #000000",
  color: "#ffffff",
  padding: "48px 20px",
  fontFamily: "var(--font-source-sans)",
};

const containerStyle = {
  maxWidth: "980px",
  margin: "0 auto",
};

const reportContainerStyle = {
  maxWidth: "940px",
  margin: "0 auto",
};

const brandStyle = {
  color: "#dc2626",
  letterSpacing: "6px",
  textTransform: "uppercase" as const,
  fontSize: "13px",
};

const heroHeadlineStyle = {
  fontFamily: "var(--font-bebas)",
  fontSize: "96px",
  lineHeight: "0.86",
  margin: "12px 0 0",
  letterSpacing: "2px",
};

const heroTextStyle = {
  maxWidth: "760px",
  fontSize: "23px",
  fontWeight: 800,
  lineHeight: "1.35",
  marginTop: "28px",
};

const supportTextStyle = {
  maxWidth: "760px",
  fontSize: "18px",
  lineHeight: "1.55",
  color: "#a1a1aa",
  marginTop: "16px",
};

const formStyle = {
  marginTop: "44px",
  padding: "32px",
  border: "1px solid #27272a",
  borderRadius: "22px",
  maxWidth: "720px",
  background: "rgba(9,9,11,0.92)",
  display: "grid",
  gap: "16px",
};

const formTitleStyle = {
  fontFamily: "var(--font-bebas)",
  fontSize: "48px",
  margin: 0,
  letterSpacing: "1px",
};

const inputStyle = {
  width: "100%",
  padding: "16px",
  background: "#ffffff",
  border: "1px solid #27272a",
  borderRadius: "12px",
  color: "#000000",
  fontSize: "16px",
};

const textAreaStyle = {
  width: "100%",
  minHeight: "140px",
  padding: "16px",
  background: "#ffffff",
  border: "1px solid #27272a",
  borderRadius: "12px",
  color: "#000000",
  fontSize: "16px",
  fontFamily: "var(--font-source-sans)",
  resize: "vertical" as const,
};

const labelStyle = {
  color: "#a1a1aa",
  fontSize: "15px",
  marginTop: "8px",
};

const buttonStyle = {
  marginTop: "16px",
  background: "#dc2626",
  color: "#ffffff",
  border: "none",
  padding: "17px 26px",
  borderRadius: "12px",
  cursor: "pointer",
  fontWeight: 900,
  textTransform: "uppercase" as const,
  letterSpacing: "1px",
  fontSize: "15px",
};

const loadingStyle = {
  color: "#a1a1aa",
  fontSize: "15px",
  lineHeight: "1.25",
};

const wrappedHeroStyle = {
  marginTop: "24px",
  padding: "34px",
  border: "1px solid #dc2626",
  borderRadius: "28px",
  background:
    "linear-gradient(135deg, rgba(220,38,38,0.24), rgba(9,9,11,1) 55%, rgba(255,255,255,0.05))",
};

const eyebrowStyle = {
  color: "#dc2626",
  letterSpacing: "4px",
  textTransform: "uppercase" as const,
  fontSize: "12px",
  margin: 0,
  fontWeight: 800,
};

const eyebrowWhiteStyle = {
  color: "#ffffff",
  letterSpacing: "4px",
  textTransform: "uppercase" as const,
  fontSize: "12px",
  margin: 0,
  fontWeight: 800,
};

const wrappedHeadlineStyle = {
  fontSize: "34px",
  lineHeight: "1.12",
  margin: "18px 0 0",
  maxWidth: "820px",
  fontWeight: 900,
};

const wrappedStatsStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
  gap: "12px",
  marginTop: "26px",
};

const statStyle = {
  background: "rgba(0,0,0,0.45)",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: "18px",
  padding: "18px",
};

const statLabelStyle = {
  color: "#a1a1aa",
  fontSize: "13px",
  margin: 0,
};

const statValueStyle = {
  color: "#ffffff",
  fontSize: "19px",
  fontWeight: 900,
  lineHeight: "1.25",
  margin: "8px 0 0",
};

const bigRedCardStyle = {
  marginTop: "20px",
  padding: "30px",
  borderRadius: "24px",
  background: "#dc2626",
};

const lyricStyle = {
  fontSize: "36px",
  lineHeight: "1.05",
  margin: "14px 0 0",
  fontWeight: 900,
};

const splitGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
  gap: "18px",
  marginTop: "18px",
};

const wrappedCardStyle = {
  background: "rgba(9,9,11,0.92)",
  border: "1px solid #27272a",
  borderRadius: "22px",
  padding: "26px",
};

const wrappedCardTitleStyle = {
  fontSize: "25px",
  lineHeight: "1.15",
  margin: "14px 0 0",
  fontWeight: 900,
};

const wrappedCardBodyStyle = {
  color: "#a1a1aa",
  fontSize: "16px",
  lineHeight: "1.5",
  marginTop: "12px",
};

const fanbasePanelStyle = {
  marginTop: "18px",
  background:
    "linear-gradient(135deg, rgba(255,255,255,0.08), rgba(9,9,11,0.96))",
  border: "1px solid #27272a",
  borderRadius: "22px",
  padding: "26px",
};

const sectionTitleStyle = {
  fontSize: "30px",
  lineHeight: "1.1",
  margin: "12px 0 0",
  fontWeight: 900,
};

const panelBodyStyle = {
  color: "#a1a1aa",
  fontSize: "16px",
  lineHeight: "1.5",
  maxWidth: "760px",
  marginTop: "10px",
};

const scorePanelStyle = {
  marginTop: "18px",
  background: "rgba(9,9,11,0.92)",
  border: "1px solid #27272a",
  borderRadius: "22px",
  padding: "26px",
};

const scoreGridStyle = {
  marginTop: "18px",
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(135px, 1fr))",
  gap: "10px",
};

const scoreCardStyle = {
  background: "#000000",
  border: "1px solid #27272a",
  borderRadius: "16px",
  padding: "16px",
  minHeight: "92px",
  display: "flex",
  flexDirection: "column" as const,
  justifyContent: "center",
};

const scoreLabelStyle = {
  color: "#a1a1aa",
  margin: 0,
  fontSize: "13px",
};

const scoreNumberStyle = {
  fontSize: "28px",
  fontWeight: 900,
  margin: "6px 0 0",
};

const scoreOutOfStyle = {
  color: "#a1a1aa",
  fontSize: "15px",
  marginLeft: "3px",
  fontWeight: 800,
};

const evidencePanelStyle = {
  marginTop: "18px",
  background: "rgba(9,9,11,0.92)",
  border: "1px solid #27272a",
  borderRadius: "22px",
  padding: "26px",
};

const evidenceGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
  gap: "18px",
  marginTop: "18px",
};

const smallTitleStyle = {
  fontSize: "18px",
  margin: "0 0 10px",
  fontWeight: 900,
};

const pillWrapStyle = {
  display: "flex",
  flexWrap: "wrap" as const,
  gap: "8px",
};

const pillStyle = {
  border: "1px solid #27272a",
  borderRadius: "999px",
  padding: "8px 11px",
  color: "#d4d4d8",
  fontSize: "14px",
  background: "#000000",
};

const blueprintStyle = {
  marginTop: "18px",
  background: "rgba(9,9,11,0.92)",
  border: "1px solid #27272a",
  borderRadius: "22px",
  padding: "26px",
};

const threeGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: "18px",
  marginTop: "18px",
};

const listBlockStyle = {
  background: "#000000",
  border: "1px solid #27272a",
  borderRadius: "18px",
  padding: "22px",
};

const listTitleStyle = {
  fontSize: "24px",
  margin: "0 0 12px",
  fontWeight: 900,
};

const listStyle = {
  color: "#d4d4d8",
  fontSize: "16px",
  lineHeight: "1.45",
  paddingLeft: "18px",
  margin: 0,
};

const finalCardStyle = {
  marginTop: "18px",
  background: "#ffffff",
  color: "#000000",
  borderRadius: "24px",
  padding: "30px",
};

const finalTitleStyle = {
  fontSize: "28px",
  lineHeight: "1.15",
  margin: "14px 0 0",
  fontWeight: 900,
};

const ctaStyle = {
  marginTop: "20px",
  background: "#dc2626",
  color: "#ffffff",
  borderRadius: "28px",
  padding: "34px",
};

const ctaTitleStyle = {
  fontSize: "38px",
  lineHeight: "1.05",
  margin: "14px 0 0",
  fontWeight: 900,
};

const ctaBodyStyle = {
  fontSize: "18px",
  lineHeight: "1.5",
  maxWidth: "820px",
};

const blackButtonStyle = {
  marginTop: "18px",
  background: "#000000",
  color: "#ffffff",
  border: "none",
  padding: "15px 22px",
  borderRadius: "12px",
  cursor: "pointer",
  fontWeight: 900,
  textTransform: "uppercase" as const,
  letterSpacing: "1px",
};

const outlineButtonStyle = {
  marginTop: "18px",
  background: "transparent",
  color: "#ffffff",
  border: "1px solid #ffffff",
  padding: "15px 22px",
  borderRadius: "12px",
  cursor: "pointer",
  fontWeight: 900,
  textTransform: "uppercase" as const,
  letterSpacing: "1px",
};