"use client";

import { useEffect, useRef, useState } from "react";
import { upload } from "@vercel/blob/client";

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
    submittedTrack?: {
      name: string;
      artist: string;
      image: string;
      url: string;
      album?: string;
      releaseDate?: string;
      popularity?: number;
    } | null;
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
  const [leadInfo, setLeadInfo] = useState<{
    artistName: string;
    email: string;
    songTitle: string;
    songLink: string;
  } | null>(null);

  const isSubmittingRef = useRef(false);

  useEffect(() => {
    if (!report) return;

    const scrollToReportTop = () => {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;

      window.parent.postMessage(
        { type: "CXTY_DISCOVERY_REPORT_READY" },
        "*"
      );
    };

    const firstScroll = window.setTimeout(scrollToReportTop, 100);
    const secondScroll = window.setTimeout(scrollToReportTop, 500);
    const thirdScroll = window.setTimeout(scrollToReportTop, 1000);

    return () => {
      window.clearTimeout(firstScroll);
      window.clearTimeout(secondScroll);
      window.clearTimeout(thirdScroll);
    };
  }, [report]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSubmittingRef.current) return;

    isSubmittingRef.current = true;
    setLoading(true);
    setError("");

    try {
      const form = event.currentTarget;
      const formData = new FormData(form);

      const songFile = formData.get("songFile") as File | null;
      const songLink = String(formData.get("songLink") || "").trim();

      if ((!songFile || songFile.size === 0) && !songLink) {
        throw new Error("Please upload a song or paste a song link.");
      }

      if (songFile && songFile.size > 0) {
        const safeFileName = songFile.name.replace(/[^a-zA-Z0-9._-]/g, "-");
        const uploadPath = `songs/${Date.now()}-${safeFileName}`;

        const uploadedSong = await upload(uploadPath, songFile, {
          access: "private",
          handleUploadUrl: "/api/upload-song",
        });

        formData.delete("songFile");
        formData.append("songBlobPathname", uploadedSong.pathname);
        formData.append("songFileName", songFile.name);
        formData.append("songFileType", songFile.type || "audio/mpeg");
      } else {
        formData.delete("songFile");
      }

      const response = await fetch("/api/analyze-song", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Something went wrong.");
      }

      setLeadInfo({
        artistName: String(formData.get("artistName") || ""),
        email: String(formData.get("email") || ""),
        songTitle: String(formData.get("songTitle") || ""),
        songLink: String(formData.get("songLink") || ""),
      });

      fetch("/api/track-cta", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          eventType: "submission",
          artistName: String(formData.get("artistName") || ""),
          email: String(formData.get("email") || ""),
          songTitle: String(formData.get("songTitle") || ""),
          songLink: String(formData.get("songLink") || ""),
          releaseStatus: String(formData.get("releaseStatus") || ""),
          discoveryScore: data.report?.scores?.discoveryScore || "",
          discoveryMoment: data.report?.strategy?.discoveryMoment || "",
          artistArchetype: data.report?.strategy?.artistArchetype || "",
          rolloutType: data.report?.strategy?.rolloutType || "",
          mostShareableLyric: data.report?.evidence?.mostShareableLyric || "",
          fanbaseMatchArtists: Array.isArray(
            data.report?.fanbaseMatch?.closestArtists
          )
            ? data.report.fanbaseMatch.closestArtists.join(", ")
            : "",
          ifReleasedToday: data.report?.strategy?.ifReleasedToday
            ? `${data.report.strategy.ifReleasedToday.likelyOutcome} ${data.report.strategy.ifReleasedToday.theUnlock} ${data.report.strategy.ifReleasedToday.contentTrigger}`
            : "",
          futureRolloutPrediction:
            data.report?.strategy?.futureRolloutPrediction || "",
        }),
      }).catch((trackingError) => {
        console.error("Submission tracking failed:", trackingError);
      });

      setReport(data.report);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Something went wrong analyzing the song.";

      setError(message);
    } finally {
      setLoading(false);
      isSubmittingRef.current = false;
    }
  }

  async function handleBuildMyRolloutClick() {
    if (leadInfo) {
      fetch("/api/track-cta", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          artistName: leadInfo.artistName,
          email: leadInfo.email,
          songTitle: leadInfo.songTitle,
          songLink: leadInfo.songLink,
          ctaClicked: "Yes",
        }),
      }).catch((trackingError) => {
        console.error("CTA tracking failed:", trackingError);
      });
    }

    window.open("https://cxtylimits.co/build-my-rollout", "_blank");
  }

  if (report) {
    return (
      <ReportView
        report={report}
        onReset={() => setReport(null)}
        onBuildMyRolloutClick={handleBuildMyRolloutClick}
      />
    );
  }

  return (
    <main className="engine-shell">
      <section className="engine-workspace">
        <header className="engine-topbar">
          <div>
            <p className="product-brand">CXTY LIMITS</p>
            <p className="product-name">Discovery Engine</p>
          </div>

          <div className="engine-status">
            <span />
            Private session
          </div>
        </header>

        <div className="engine-grid">
          <section className="engine-intro">
            <p className="engine-kicker">Creative intelligence for music</p>

            <h1 className="engine-title">
              What are we
              <br />
              discovering?
            </h1>

            <p className="engine-description">
              Upload a track or paste a song link. Discovery Engine turns the
              record into a story, audience map, creative angle, and rollout
              direction.
            </p>

            <div className="engine-meta">
              <span>Private upload</span>
              <span>Strategy report</span>
              <span>Rollout direction</span>
            </div>
          </section>

          <form onSubmit={handleSubmit} className="composer-panel">
            <div className="composer-header">
              <div>
                <span className="composer-label">New analysis</span>
                <strong>Start with the track.</strong>
              </div>
              <span className="composer-step">01</span>
            </div>

            <div className="composer-grid">
              <label className="field-shell">
                <span>Artist</span>
                <input
                  name="artistName"
                  required
                  placeholder="Artist name"
                  className="composer-input"
                />
              </label>

              <label className="field-shell">
                <span>Email</span>
                <input
                  name="email"
                  required
                  placeholder="Email address"
                  type="email"
                  className="composer-input"
                />
              </label>

              <label className="field-shell">
                <span>Song title</span>
                <input
                  name="songTitle"
                  placeholder="Optional"
                  className="composer-input"
                />
              </label>

              <label className="field-shell">
                <span>Release status</span>
                <select
                  name="releaseStatus"
                  defaultValue=""
                  className="composer-input"
                >
                  <option value="" disabled>
                    Select
                  </option>
                  <option value="Unreleased">Unreleased</option>
                  <option value="Already Released">Already Released</option>
                  <option value="Not Sure">Not Sure</option>
                </select>
              </label>
            </div>

            <div className="track-source">
              <div className="track-source-head">
                <div>
                  <span className="composer-label">Track source</span>
                  <strong>Upload audio or paste a link.</strong>
                </div>
                <span className="source-note">Best results: audio upload</span>
              </div>

              <label className="link-shell">
                <span>Song link</span>
                <input
                  name="songLink"
                  placeholder="Spotify, YouTube, or SoundCloud"
                  className="composer-input composer-link"
                />
              </label>

              <div className="upload-shell">
                <div>
                  <span className="upload-icon">＋</span>
                  <div>
                    <strong>Upload track</strong>
                    <p>MP3, WAV, M4A, AAC, OGG or FLAC · max 50 MB</p>
                  </div>
                </div>

                <input
                  name="songFile"
                  type="file"
                  accept=".mp3,.wav,.m4a,.aac,.ogg,.flac,audio/mpeg,audio/wav,audio/mp4,audio/x-m4a,audio/aac,audio/ogg,audio/flac"
                  className="upload-input"
                />
              </div>

              <p className="track-source-note">
                Links are used for context only and may be less accurate. For
                Spotify links, add lyrics or key context for a stronger report.
              </p>
            </div>

            <label className="lyrics-shell">
              <span>Lyrics / context</span>
              <textarea
                name="lyrics"
                placeholder="Optional — paste lyrics or add context for a more accurate analysis."
                className="composer-textarea"
              />
            </label>

            <div className="composer-actions">
              <div className="privacy-note">
                <span />
                Your upload stays private.
              </div>

              <button
                disabled={loading}
                type="submit"
                className="analyze-button"
              >
                <span>
                  {loading ? "Analyzing track" : "Start analysis"}
                </span>
                <b>{loading ? "…" : "↗"}</b>
              </button>
            </div>

            {loading && <AnalysisLoader />}

            {error && <p className="engine-error">{error}</p>}
          </form>
        </div>
      </section>
    </main>
  );
}

function AnalysisLoader() {
  const steps = [
    "Reading structure and creative context",
    "Mapping story and audience",
    "Finding the creative angle",
    "Building rollout direction",
  ];

  return (
    <section className="analysis-loader">
      <div className="analysis-loader-top">
        <div>
          <span>Discovery Engine</span>
          <strong>Analyzing track</strong>
        </div>
        <span className="analysis-live">LIVE</span>
      </div>

      <div className="analysis-wave" aria-hidden="true">
        {Array.from({ length: 52 }).map((_, index) => (
          <i
            key={index}
            style={
              {
                "--bar-delay": `${index * 24}ms`,
                "--bar-height": `${22 + ((index * 37) % 68)}%`,
              } as React.CSSProperties
            }
          />
        ))}
      </div>

      <div className="analysis-steps">
        {steps.map((step, index) => (
          <span key={step}>
            <i>{String(index + 1).padStart(2, "0")}</i>
            {step}
          </span>
        ))}
      </div>
    </section>
  );
}

function ReportView({
  report,
  onReset,
  onBuildMyRolloutClick,
}: {
  report: Report;
  onReset: () => void;
  onBuildMyRolloutClick: () => void;
}) {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [activeSlide, setActiveSlide] = useState(0);

  const scores = [
    ["Discovery", report.scores.discoveryScore],
    ["Viral", report.scores.viralPotentialScore],
    ["Hook", report.scores.hookStrengthScore],
    ["Playlist", report.scores.playlistFitScore],
    ["UGC", report.scores.ugcTikTokScore],
    ["Emotion", report.scores.emotionalResonanceScore],
    ["Brand", report.scores.brandFitScore],
    ["Rollout", report.scores.rolloutReadinessScore],
  ] as const;

  const slides = [
    {
      id: "overview",
      label: "Overview",
      eyebrow: "The discovery moment",
      title: report.strategy.discoveryMoment,
      content: (
        <>
          <div className="report-stat-row">
            <ReportStat
              label="Archetype"
              value={report.strategy.artistArchetype}
            />
            <ReportStat label="Rollout" value={report.strategy.rolloutType} />
            <ReportStat
              label="Discovery score"
              value={`${report.scores.discoveryScore}/100`}
            />
          </div>

          <div className="report-quote">
            <span>The line that carries the rollout</span>
            <strong>
              “{cleanQuote(report.evidence.mostShareableLyric)}”
            </strong>
          </div>
        </>
      ),
    },
    {
      id: "release",
      label: "Release",
      eyebrow: "If released today",
      title: "What happens next.",
      content: (
        <div className="report-three">
          <ReportInsight
            label="Likely outcome"
            value={report.strategy.ifReleasedToday?.likelyOutcome}
          />
          <ReportInsight
            label="The unlock"
            value={report.strategy.ifReleasedToday?.theUnlock}
          />
          <ReportInsight
            label="Content trigger"
            value={report.strategy.ifReleasedToday?.contentTrigger}
          />
          <ReportInsight
            label="Future rollout prediction"
            value={report.strategy.futureRolloutPrediction}
            wide
          />
        </div>
      ),
    },
    {
      id: "audience",
      label: "Audience",
      eyebrow: "Fanbase match",
      title: "Where this song could live.",
      content: (
        <>
          <p className="report-lede">{report.fanbaseMatch?.fanbaseReason}</p>

          <div className="report-three">
            <ReportList
              title="Closest artist lanes"
              items={report.fanbaseMatch?.closestArtists || []}
            />
            <ReportList
              title="Similar song energy"
              items={report.fanbaseMatch?.similarSongs || []}
            />
            <ReportList
              title="Playlist lanes"
              items={report.fanbaseMatch?.playlistLanes || []}
            />
          </div>

          <SpotifyRail report={report} />
        </>
      ),
    },
    {
      id: "scorecard",
      label: "Scorecard",
      eyebrow: "Discovery scorecard",
      title: "How the record is positioned.",
      content: (
        <div className="report-score-grid">
          {scores.map(([label, value]) => (
            <div className="report-score" key={label}>
              <span>{label}</span>
              <strong>
                {value}
                <small>/100</small>
              </strong>
            </div>
          ))}
        </div>
      ),
    },
    {
      id: "strategy",
      label: "Strategy",
      eyebrow: "Angle + audience",
      title: "The strategy underneath the song.",
      content: (
        <div className="report-two">
          <ReportInsight
            label="The angle"
            value={report.strategy.discoveryAngle}
            body={report.strategy.archetypeExplanation}
          />
          <ReportInsight
            label="The audience"
            value={report.strategy.audienceMap}
            body="These are the people most likely to hear themselves inside the record."
          />
          <ReportInsight
            label="If it connects"
            value={`“${cleanQuote(report.evidence.listenerComment)}”`}
            body="This is the emotional reaction the rollout should be built to trigger."
          />
          <ReportInsight
            label="What it's really selling"
            value={report.evidence.strongestMessage}
            body="The song is not just a sound. It is a feeling people need to recognize in themselves."
          />
        </div>
      ),
    },
    {
      id: "evidence",
      label: "Evidence",
      eyebrow: "What we pulled from the song",
      title: "The emotional material inside the record.",
      content: (
        <div className="report-two">
          <ReportPills title="Themes" items={report.evidence.coreThemes} />
          <ReportPills
            title="Emotions"
            items={report.evidence.emotionalStates}
          />
          <ReportPills title="Imagery" items={report.evidence.imagery} />
          <ReportPills
            title="Repeated ideas"
            items={report.evidence.repeatedIdeas}
          />
        </div>
      ),
    },
    {
      id: "rollout",
      label: "Rollout",
      eyebrow: "The rollout blueprint",
      title: "Turn the analysis into movement.",
      content: (
        <div className="report-rollout-grid">
          <ReportList title="Content pillars" items={report.rollout.contentPillars} />
          <ReportList title="Video ideas" items={report.rollout.videoIdeas} />
          <ReportList title="Pre-release" items={report.rollout.preReleasePlan} />
          <ReportList
            title="Release week"
            items={report.rollout.releaseWeekPlan}
          />
          <ReportList
            title="30 days after"
            items={report.rollout.postReleasePlan}
          />
        </div>
      ),
    },
    {
      id: "final",
      label: "Final read",
      eyebrow: "Creative direction",
      title: report.creative.finalRecommendation,
      content: (
        <>
          <div className="report-two">
            <ReportInsight
              label="Visual world"
              value={report.creative.visualDirection}
            />
            <ReportInsight label="Biggest risk" value={report.creative.biggestRisk} />
          </div>

          <div className="report-final-cta">
            <div>
              <span>CXTY LIMITS</span>
              <strong>We found the story. Now build the world around it.</strong>
            </div>

            <div className="report-cta-actions">
              <button type="button" onClick={onBuildMyRolloutClick}>
                Build the world around this song
              </button>
              <button type="button" onClick={onReset}>
                Analyze another track
              </button>
            </div>
          </div>
        </>
      ),
    },
  ];

  function goToSlide(index: number) {
    const next = Math.max(0, Math.min(slides.length - 1, index));
    setActiveSlide(next);

    const track = trackRef.current;
    if (!track) return;

    const slide = track.children[next] as HTMLElement | undefined;
    slide?.scrollIntoView({
      behavior: "smooth",
      inline: "start",
      block: "nearest",
    });
  }

  function handleTrackScroll() {
    const track = trackRef.current;
    if (!track) return;

    const width = track.clientWidth;
    if (!width) return;

    const index = Math.round(track.scrollLeft / width);
    if (index !== activeSlide && index >= 0 && index < slides.length) {
      setActiveSlide(index);
    }
  }

  return (
    <main className="report-app">
      <header className="report-topbar">
        <div>
          <p className="product-brand dark">CXTY LIMITS</p>
          <p className="report-product-name">Discovery Engine / Report</p>
        </div>

        <div className="report-topbar-meta">
          <span>
            {String(activeSlide + 1).padStart(2, "0")} /{" "}
            {String(slides.length).padStart(2, "0")}
          </span>
          <button type="button" onClick={onReset}>
            New analysis
          </button>
        </div>
      </header>

      <div className="report-layout">
        <aside className="report-nav">
          <div className="report-nav-title">Report</div>

          <nav>
            {slides.map((slide, index) => (
              <button
                key={slide.id}
                type="button"
                className={index === activeSlide ? "active" : ""}
                onClick={() => goToSlide(index)}
              >
                <span>{String(index + 1).padStart(2, "0")}</span>
                {slide.label}
              </button>
            ))}
          </nav>
        </aside>

        <section className="report-main">
          <div
            className="report-track"
            ref={trackRef}
            onScroll={handleTrackScroll}
          >
            {slides.map((slide, index) => (
              <article className="report-slide" key={slide.id}>
                <div className="report-slide-inner">
                  <div className="report-slide-head">
                    <div>
                      <span className="report-eyebrow">{slide.eyebrow}</span>
                      <h1>{slide.title}</h1>
                    </div>

                    <span className="report-slide-index">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </div>

                  <div className="report-slide-content">{slide.content}</div>
                </div>
              </article>
            ))}
          </div>

          <div className="report-controls">
            <button
              type="button"
              onClick={() => goToSlide(activeSlide - 1)}
              disabled={activeSlide === 0}
            >
              ← Previous
            </button>

            <div className="report-dots">
              {slides.map((slide, index) => (
                <button
                  type="button"
                  aria-label={`Go to ${slide.label}`}
                  key={slide.id}
                  className={index === activeSlide ? "active" : ""}
                  onClick={() => goToSlide(index)}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={() => goToSlide(activeSlide + 1)}
              disabled={activeSlide === slides.length - 1}
            >
              Next →
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}

function ReportStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="report-stat">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function ReportInsight({
  label,
  value,
  body,
  wide,
}: {
  label: string;
  value?: string;
  body?: string;
  wide?: boolean;
}) {
  return (
    <section className={`report-insight ${wide ? "wide" : ""}`}>
      <span>{label}</span>
      <strong>{value || "—"}</strong>
      {body ? <p>{body}</p> : null}
    </section>
  );
}

function ReportList({ title, items }: { title: string; items: string[] }) {
  return (
    <section className="report-list">
      <span>{title}</span>
      <ul>
        {items?.slice(0, 5).map((item, index) => (
          <li key={`${title}-${index}`}>{item}</li>
        ))}
      </ul>
    </section>
  );
}

function ReportPills({ title, items }: { title: string; items: string[] }) {
  return (
    <section className="report-pill-group">
      <span>{title}</span>
      <div>
        {items?.slice(0, 6).map((item, index) => (
          <b key={`${title}-${index}`}>{item}</b>
        ))}
      </div>
    </section>
  );
}

function SpotifyRail({ report }: { report: Report }) {
  const submitted = report.spotify?.submittedTrack;
  const artists = report.spotify?.artists || [];
  const tracks = report.spotify?.tracks || [];

  if (!submitted && !artists.length && !tracks.length) return null;

  return (
    <div className="spotify-rail">
      {submitted ? (
        <a
          href={submitted.url}
          target="_blank"
          rel="noopener noreferrer"
          className="spotify-reference submitted"
        >
          {submitted.image ? (
            <img src={submitted.image} alt={submitted.name} />
          ) : null}
          <div>
            <span>Submitted track</span>
            <strong>{submitted.name}</strong>
            <p>{submitted.artist}</p>
          </div>
        </a>
      ) : null}

      {artists.slice(0, 3).map((artist, index) => (
        <a
          href={artist.url}
          target="_blank"
          rel="noopener noreferrer"
          className="spotify-reference"
          key={`artist-${index}`}
        >
          {artist.image ? <img src={artist.image} alt={artist.name} /> : null}
          <div>
            <span>Artist lane</span>
            <strong>{artist.name}</strong>
            <p>Open in Spotify</p>
          </div>
        </a>
      ))}

      {tracks.slice(0, 3).map((track, index) => (
        <a
          href={track.url}
          target="_blank"
          rel="noopener noreferrer"
          className="spotify-reference"
          key={`track-${index}`}
        >
          {track.image ? <img src={track.image} alt={track.name} /> : null}
          <div>
            <span>Song reference</span>
            <strong>{track.name}</strong>
            <p>{track.artist}</p>
          </div>
        </a>
      ))}
    </div>
  );
}

function cleanQuote(text: string) {
  return String(text || "").replace(/^["“]+|["”]+$/g, "");
}
