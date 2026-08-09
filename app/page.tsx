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
  const [processingPhase, setProcessingPhase] = useState<
    "idle" | "uploading" | "analyzing"
  >("idle");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisStage, setAnalysisStage] = useState("Preparing analysis");
  const [selectedFileName, setSelectedFileName] = useState("");
  const [selectedFileSize, setSelectedFileSize] = useState("");
  const [report, setReport] = useState<Report | null>(null);
  const [error, setError] = useState("");
  const [mobileStep, setMobileStep] = useState(0);
  const [leadInfo, setLeadInfo] = useState<{
    artistName: string;
    email: string;
    songTitle: string;
    songLink: string;
  } | null>(null);

  const isSubmittingRef = useRef(false);
  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);

  useEffect(() => {
    setMobileStep(0);

    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;

    window.parent.postMessage(
      { type: "CXTY_DISCOVERY_READY" },
      "*"
    );
  }, []);

  useEffect(() => {
    let raf = 0;

    const postHeight = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const height = Math.max(
          document.documentElement.scrollHeight,
          document.body.scrollHeight,
          document.documentElement.offsetHeight,
          document.body.offsetHeight
        );

        window.parent.postMessage(
          {
            type: "CXTY_DISCOVERY_HEIGHT",
            height,
            mode: report ? "report" : "intake",
          },
          "*"
        );
      });
    };

    postHeight();

    const observer = new ResizeObserver(postHeight);
    observer.observe(document.documentElement);
    observer.observe(document.body);

    window.addEventListener("load", postHeight);
    window.addEventListener("resize", postHeight);

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      window.removeEventListener("load", postHeight);
      window.removeEventListener("resize", postHeight);
    };
  }, [loading, report, error]);

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

  function handleFieldFocus(
    event: React.FocusEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) {
    const field = event.currentTarget;

    window.setTimeout(() => {
      field.scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "nearest",
      });

      window.parent.postMessage(
        {
          type: "CXTY_DISCOVERY_FOCUS_FIELD",
        },
        "*"
      );
    }, 120);
  }

  function handleSongFileChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file) {
      setSelectedFileName("");
      setSelectedFileSize("");
      return;
    }

    setSelectedFileName(file.name);
    setSelectedFileSize(
      file.size >= 1024 * 1024
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
        : `${Math.max(1, Math.round(file.size / 1024))} KB`
    );
    setError("");
  }

  function goToMobileStep(
    form: HTMLFormElement,
    nextStep: number
  ) {
    setError("");

    if (nextStep > mobileStep) {
      const formData = new FormData(form);

      if (nextStep >= 1) {
        const songFile = formData.get("songFile") as File | null;
        const songLink = String(formData.get("songLink") || "").trim();

        if ((!songFile || songFile.size === 0) && !songLink) {
          setError("Upload a track or paste a song link to continue.");
          setMobileStep(0);
          return;
        }
      }

      if (nextStep >= 2) {
        const artistName = String(formData.get("artistName") || "").trim();
        const email = String(formData.get("email") || "").trim();

        if (!artistName || !email) {
          setError("Add your artist name and email to continue.");
          setMobileStep(1);
          return;
        }
      }
    }

    setMobileStep(Math.max(0, Math.min(2, nextStep)));

    window.setTimeout(() => {
      window.parent.postMessage(
        {
          type: "CXTY_DISCOVERY_STEP_CHANGED",
        },
        "*"
      );
    }, 80);
  }

  function handleMobileStepClick(
    event: React.MouseEvent<HTMLButtonElement>,
    nextStep: number
  ) {
    const form = event.currentTarget.closest("form");

    if (!form) return;

    goToMobileStep(form, nextStep);
  }

  function handleMobileTouchStart(
    event: React.TouchEvent<HTMLFormElement>
  ) {
    const touch = event.touches[0];

    touchStartXRef.current = touch.clientX;
    touchStartYRef.current = touch.clientY;
  }

  function handleMobileTouchEnd(
    event: React.TouchEvent<HTMLFormElement>
  ) {
    const startX = touchStartXRef.current;
    const startY = touchStartYRef.current;

    touchStartXRef.current = null;
    touchStartYRef.current = null;

    if (startX === null || startY === null) return;

    const touch = event.changedTouches[0];
    const deltaX = touch.clientX - startX;
    const deltaY = touch.clientY - startY;

    if (Math.abs(deltaX) < 52) return;
    if (Math.abs(deltaY) > Math.abs(deltaX) * 0.7) return;

    const form = event.currentTarget;

    if (deltaX < 0) {
      goToMobileStep(form, mobileStep + 1);
    } else {
      goToMobileStep(form, mobileStep - 1);
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSubmittingRef.current) return;

    isSubmittingRef.current = true;
    setLoading(true);
    setError("");
    setUploadProgress(0);
    setAnalysisProgress(0);

    let analysisTimer: number | null = null;

    try {
      const form = event.currentTarget;
      const formData = new FormData(form);

      const songFile = formData.get("songFile") as File | null;
      const songLink = String(formData.get("songLink") || "").trim();

      if ((!songFile || songFile.size === 0) && !songLink) {
        throw new Error("Please upload a song or paste a song link.");
      }

      if (songFile && songFile.size > 0) {
        setProcessingPhase("uploading");
        setAnalysisStage("Uploading track securely");
        setUploadProgress(1);

        const safeFileName = songFile.name.replace(/[^a-zA-Z0-9._-]/g, "-");
        const uploadPath = `songs/${Date.now()}-${safeFileName}`;

        const uploadedSong = await upload(uploadPath, songFile, {
          access: "private",
          handleUploadUrl: "/api/upload-song",
          onUploadProgress: (progressEvent) => {
            setUploadProgress(
              Math.max(1, Math.min(100, Math.round(progressEvent.percentage)))
            );
          },
        });

        setUploadProgress(100);

        formData.delete("songFile");
        formData.append("songBlobPathname", uploadedSong.pathname);
        formData.append("songFileName", songFile.name);
        formData.append("songFileType", songFile.type || "audio/mpeg");
      } else {
        formData.delete("songFile");
      }

      setProcessingPhase("analyzing");
      setAnalysisProgress(8);
      setAnalysisStage("Reading structure and creative context");

      const analysisStartedAt = Date.now();

      analysisTimer = window.setInterval(() => {
        const elapsed = Date.now() - analysisStartedAt;

        setAnalysisProgress((current) => {
          let ceiling = 92;

          if (elapsed < 4500) {
            ceiling = 36;
            setAnalysisStage("Reading structure and creative context");
          } else if (elapsed < 9000) {
            ceiling = 58;
            setAnalysisStage("Mapping story, audience, and emotion");
          } else if (elapsed < 15000) {
            ceiling = 76;
            setAnalysisStage("Finding the creative angle");
          } else {
            ceiling = 94;
            setAnalysisStage("Building rollout direction");
          }

          if (current >= ceiling) return current;

          const step = current < 35 ? 3 : current < 70 ? 2 : 1;
          return Math.min(ceiling, current + step);
        });
      }, 480);

      const response = await fetch("/api/analyze-song", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Something went wrong.");
      }

      if (analysisTimer !== null) {
        window.clearInterval(analysisTimer);
        analysisTimer = null;
      }

      setAnalysisStage("Report ready");
      setAnalysisProgress(100);

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

      await new Promise((resolve) => window.setTimeout(resolve, 320));
      setReport(data.report);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Something went wrong analyzing the song.";

      setError(message);
      setProcessingPhase("idle");
    } finally {
      if (analysisTimer !== null) {
        window.clearInterval(analysisTimer);
      }

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
        onReset={() => {
          setReport(null);
          setMobileStep(0);
          setProcessingPhase("idle");
          setUploadProgress(0);
          setAnalysisProgress(0);
          setSelectedFileName("");
          setSelectedFileSize("");
        }}
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
            <p className="engine-kicker live-red">Creative intelligence for music</p>

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

          <form
            onSubmit={handleSubmit}
            onTouchStart={handleMobileTouchStart}
            onTouchEnd={handleMobileTouchEnd}
            className="composer-panel"
          >
            <div className="composer-header">
              <div>
                <span className="composer-label live-red">New analysis</span>
                <strong>Start with the track.</strong>
              </div>
              <span className="composer-step">01</span>
            </div>

            <div className="mobile-intake-progress" aria-label="Analysis setup progress">
              {["Track", "Details", "Context"].map((label, index) => (
                <button
                  key={label}
                  type="button"
                  className={index === mobileStep ? "active" : index < mobileStep ? "complete" : ""}
                  onClick={(event) => handleMobileStepClick(event, index)}
                >
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <b>{label}</b>
                  <i />
                </button>
              ))}
            </div>

            <div className="mobile-swipe-hint" aria-hidden="true">
              <span>Swipe to move through setup</span>
              <b>←</b>
              <i />
              <b>→</b>
            </div>

            <div className={`mobile-intake-slide ${mobileStep === 0 ? "active" : ""}`}>
              <div className="track-source track-source-hero">
              <div className="track-source-head">
                <div>
                  <span className="composer-label live-red">Track source</span>
                  <strong>Feed the engine.</strong>
                </div>
                <span className="source-note">Best results: audio upload</span>
              </div>

              <div className="source-grid">
                <div className="upload-shell">
                  <div>
                    <span className="upload-icon">＋</span>
                    <div className="upload-copy">
                      <strong>
                        {selectedFileName ? "Track selected" : "Upload track"}
                      </strong>
                      <p>
                        {selectedFileName
                          ? `${selectedFileName} · ${selectedFileSize}`
                          : "MP3, WAV, M4A, AAC, OGG or FLAC · max 50 MB"}
                      </p>
                      <span className="upload-life" aria-hidden="true">
                        <i /><i /><i /><i /><i /><i /><i /><i /><i />
                      </span>
                    </div>
                  </div>

                  <input
                    name="songFile"
                    type="file"
                    accept=".mp3,.wav,.m4a,.aac,.ogg,.flac,audio/mpeg,audio/wav,audio/mp4,audio/x-m4a,audio/aac,audio/ogg,audio/flac"
                    className="upload-input"
                    onChange={handleSongFileChange}
                  />
                </div>

                <label className="link-shell link-shell-hero">
                  <span>Or paste a song link</span>
                  <input
                    name="songLink"
                    placeholder="Spotify, YouTube, or SoundCloud"
                    className="composer-input composer-link"
                    onFocus={handleFieldFocus}
                  />
                </label>
              </div>

              <p className="track-source-note">
                Links are used for context only and may be less accurate. For
                Spotify links, add lyrics or key context for a stronger report.
              </p>
              </div>

              <div className="mobile-step-actions">
                <span>01 / 03</span>
                <button
                  type="button"
                  onClick={(event) => handleMobileStepClick(event, 1)}
                >
                  Continue <b>→</b>
                </button>
              </div>
            </div>

            <div className={`mobile-intake-slide ${mobileStep === 1 ? "active" : ""}`}>
              <div className="session-meta">
              <div className="session-meta-head">
                <span className="composer-label">Session details</span>
                <span>Required metadata</span>
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
              </div>

              <div className="mobile-step-actions split">
                <button
                  type="button"
                  className="back"
                  onClick={(event) => handleMobileStepClick(event, 0)}
                >
                  ← Back
                </button>
                <span>02 / 03</span>
                <button
                  type="button"
                  onClick={(event) => handleMobileStepClick(event, 2)}
                >
                  Continue <b>→</b>
                </button>
              </div>
            </div>

            <div className={`mobile-intake-slide ${mobileStep === 2 ? "active" : ""}`}>
              <label className="lyrics-shell">
              <span>Lyrics / context</span>
              <textarea
                name="lyrics"
                placeholder="Optional — paste lyrics or add context for a more accurate analysis."
                className="composer-textarea"
                onFocus={handleFieldFocus}
              />
            </label>

            {loading && (
              <section className="processing-panel" aria-live="polite">
                <div className="processing-head">
                  <div>
                    <span>
                      {processingPhase === "uploading"
                        ? "Secure upload"
                        : "Discovery Engine"}
                    </span>
                    <strong>
                      {processingPhase === "uploading"
                        ? "Uploading track"
                        : analysisStage}
                    </strong>
                  </div>
                  <b>
                    {processingPhase === "uploading"
                      ? uploadProgress
                      : analysisProgress}
                    %
                  </b>
                </div>

                <div className="processing-progress">
                  <i
                    style={{
                      width: `${
                        processingPhase === "uploading"
                          ? uploadProgress
                          : analysisProgress
                      }%`,
                    }}
                  />
                </div>

                <div className="processing-wave" aria-hidden="true">
                  {Array.from({ length: 44 }).map((_, index) => (
                    <i
                      key={index}
                      style={
                        {
                          "--process-delay": `${index * 23}ms`,
                          "--process-height": `${18 + ((index * 29) % 70)}%`,
                        } as React.CSSProperties
                      }
                    />
                  ))}
                </div>

                <p>
                  {processingPhase === "uploading"
                    ? "Your track is being uploaded privately before analysis begins."
                    : "Keep this screen open. We’re building the report now."}
                </p>
              </section>
            )}

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

            <div className="mobile-step-actions final">
              <button
                type="button"
                className="back"
                onClick={(event) => handleMobileStepClick(event, 1)}
              >
                ← Back
              </button>
              <span>03 / 03</span>
            </div>

            {error && <p className="engine-error">{error}</p>}
            </div>
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
      title: "Why this song connects.",
      content: (
        <div className="report-dashboard-grid">
          <div className="report-moment-card">
            <span>Core discovery moment</span>
            <strong>{report.strategy.discoveryMoment}</strong>
          </div>

          <div className="report-primary-score">
            <span>Discovery score</span>
            <strong>{report.scores.discoveryScore}</strong>
            <small>/100</small>
            <i
              style={{
                width: `${Math.max(
                  0,
                  Math.min(100, report.scores.discoveryScore)
                )}%`,
              }}
            />
          </div>

          <ReportStat
            label="Archetype"
            value={report.strategy.artistArchetype}
          />
          <ReportStat
            label="Rollout"
            value={report.strategy.rolloutType}
          />

          <div className="report-quote compact">
            <span>The line that carries the rollout</span>
            <strong>
              “{cleanQuote(report.evidence.mostShareableLyric)}”
            </strong>
          </div>
        </div>
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
        <div className="report-audience-layout">
          <div>
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
          </div>
          <SpotifyRail report={report} />
        </div>
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
              <i>
                <b
                  style={{
                    width: `${Math.max(0, Math.min(100, Number(value) || 0))}%`,
                  }}
                />
              </i>
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
            body="The listeners most likely to hear themselves inside the record."
          />
          <ReportInsight
            label="If it connects"
            value={`“${cleanQuote(report.evidence.listenerComment)}”`}
            body="The emotional response the rollout should be built to trigger."
          />
          <ReportInsight
            label="What it's really selling"
            value={report.evidence.strongestMessage}
            body="The feeling people need to recognize in themselves."
          />
        </div>
      ),
    },
    {
      id: "evidence",
      label: "Evidence",
      eyebrow: "Inside the record",
      title: "The emotional material we found.",
      content: (
        <div className="report-two">
          <ReportPills title="Themes" items={report.evidence.coreThemes} />
          <ReportPills
            title="Emotions"
            items={report.evidence.emotionalStates}
          />
          <ReportPills
            title="Repeated ideas"
            items={report.evidence.repeatedIdeas}
          />
        </div>
      ),
    },
    {
      id: "content",
      label: "Content",
      eyebrow: "Creative system",
      title: "What to make around the song.",
      content: (
        <div className="report-three">
          <ReportList title="Content pillars" items={report.rollout.contentPillars} />
          <ReportList title="Video ideas" items={report.rollout.videoIdeas} />
          <ReportInsight
            label="Platform priority"
            value={report.rollout.platformPriority}
          />
        </div>
      ),
    },
    {
      id: "timeline",
      label: "Timeline",
      eyebrow: "Rollout sequence",
      title: "How to move the record.",
      content: (
        <div className="report-three timeline">
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
      title: "The final read.",
      content: (
        <div className="report-two final-read">
          <ReportInsight
            label="Recommendation"
            value={report.creative.finalRecommendation}
          />
          <ReportInsight
            label="Visual world"
            value={report.creative.visualDirection}
          />
          <ReportInsight
            label="Biggest opportunity"
            value={report.creative.biggestOpportunity}
          />
          <ReportInsight
            label="Biggest risk"
            value={report.creative.biggestRisk}
          />
        </div>
      ),
    },
    {
      id: "next",
      label: "Next move",
      eyebrow: "Your next move",
      title: "We found the story. Now build the world.",
      content: (
        <div className="report-next-move">
          <div className="next-move-copy">
            <div className="next-move-visual" aria-hidden="true">
              <div className="next-orbit next-orbit-a" />
              <div className="next-orbit next-orbit-b" />
              <div className="next-orbit next-orbit-c" />
              <div className="next-core">
                <span>DISCOVERY</span>
                <b>{report.scores.discoveryScore}</b>
                <small>/100</small>
              </div>

              <div className="next-wave">
                {Array.from({ length: 34 }).map((_, index) => (
                  <i
                    key={index}
                    style={
                      {
                        "--next-delay": `${index * 34}ms`,
                        "--next-height": `${18 + ((index * 31) % 68)}%`,
                      } as React.CSSProperties
                    }
                  />
                ))}
              </div>
            </div>

            <div className="next-move-copy-text">
              <span>CXTY LIMITS</span>
              <p>
                Turn the discovery report into a release world, or clear the
                session and analyze another record.
              </p>
            </div>
          </div>

          <button
            type="button"
            className="next-move-primary"
            onClick={onBuildMyRolloutClick}
          >
            <span>Build the world around this song</span>
            <b>↗</b>
          </button>

          <button
            type="button"
            className="next-move-secondary"
            onClick={onReset}
          >
            <span>Analyze another track</span>
            <b>＋</b>
          </button>
        </div>
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

    const children = Array.from(track.children) as HTMLElement[];
    if (!children.length) return;

    const center = track.scrollLeft + track.clientWidth / 2;

    let closest = 0;
    let closestDistance = Number.POSITIVE_INFINITY;

    children.forEach((child, index) => {
      const childCenter = child.offsetLeft + child.offsetWidth / 2;
      const distance = Math.abs(center - childCenter);

      if (distance < closestDistance) {
        closestDistance = distance;
        closest = index;
      }
    });

    if (closest !== activeSlide) {
      setActiveSlide(closest);
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
          <div className="report-nav-title">Discovery report</div>

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
          <div className="report-explore-hint">
            <span className="desktop-hint">Use arrows or swipe/trackpad to explore</span>
            <span className="mobile-hint">Swipe to explore the report</span>
            <i>
              <b />
            </i>
            <strong>→</strong>
          </div>

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
              aria-label="Previous report slide"
            >
              <b>←</b>
              <span>Previous</span>
            </button>

            <div className="report-progress-center">
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
              <span>{slides[activeSlide]?.label}</span>
            </div>

            <button
              type="button"
              onClick={() => goToSlide(activeSlide + 1)}
              disabled={activeSlide === slides.length - 1}
              aria-label="Next report slide"
            >
              <span>Next</span>
              <b>→</b>
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
