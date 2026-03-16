import { useState } from "react";

export default function StoryBook({
  pages,
  isGenerating,
  currentPage,
  setCurrentPage,
  storyTitle,
  onReset,
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const page = pages[currentPage];

  const getThemeEmoji = (title) => {
    if (title?.includes("Space")) return "🚀";
    if (title?.includes("Forest")) return "🌲";
    if (title?.includes("Ocean")) return "🌊";
    if (title?.includes("Dino")) return "🦕";
    if (title?.includes("Hero")) return "🦸";
    if (title?.includes("Castle")) return "🏰";
    if (title?.includes("Safari")) return "🦁";
    if (title?.includes("Dragon")) return "🐉";
    return "✨";
  };

  const handlePlay = () => {
    if (!page?.text) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(page.text);
    utterance.rate = 0.85;
    utterance.pitch = 1.1;
    utterance.volume = 1;
    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find(v =>
      v.name.includes("Female") ||
      v.name.includes("Samantha") ||
      v.name.includes("Karen") ||
      v.name.includes("Google UK English Female")
    );
    if (preferred) utterance.voice = preferred;
    utterance.onstart = () => { setIsPlaying(true); setIsPaused(false); };
    utterance.onend = () => { setIsPlaying(false); setIsPaused(false); };
    utterance.onerror = () => { setIsPlaying(false); setIsPaused(false); };
    window.speechSynthesis.speak(utterance);
  };

  const handlePause = () => {
    if (isPlaying && !isPaused) {
      window.speechSynthesis.pause();
      setIsPaused(true);
      setIsPlaying(false);
    }
  };

  const handleResume = () => {
    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
      setIsPlaying(true);
    }
  };

  const handleStop = () => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
  };

  const handlePageChange = (newPage) => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
    setCurrentPage(newPage);
  };

  return (
    <>
      <div className="storybook">
        <div className="sb-header">
          <span className="sb-title">"{storyTitle}"</span>
          <span className="sb-badge">
            {isGenerating ? "Generating..." : `${pages.length} pages`}
          </span>
        </div>

        {pages.length === 0 ? (
          <div className="sb-page">
            <div className="sb-image-side">
              <div className="sb-image-placeholder">
                {getThemeEmoji(storyTitle)}
              </div>
            </div>
            <div className="sb-text-side">
              <div className="sb-page-label">Getting ready...</div>
              <div className="sb-generating-text">
                Your magical story is being written just for you...
              </div>
            </div>
          </div>
        ) : (
          <div className="sb-page">
            <div className="sb-image-side">
              {page?.image ? (
                <img src={page.image} alt={`Page ${currentPage + 1}`} />
              ) : (
                <div className="sb-image-placeholder">
                  {getThemeEmoji(storyTitle)}
                </div>
              )}
            </div>
            <div className="sb-text-side">
              <div className="sb-page-label">
                Page {currentPage + 1} of {pages.length}
              </div>
              {page?.text ? (
                <div className="sb-story-text">{page.text}</div>
              ) : (
                <div className="sb-generating-text">Writing this page...</div>
              )}
            </div>
          </div>
        )}

        {/* Narration bar — always visible above nav */}
        {page?.text && !isGenerating && (
          <div className="narration-bar">
            {!isPlaying && !isPaused && (
              <button className="narration-btn play" onClick={handlePlay}>
                🔊 Listen to this page
              </button>
            )}
            {isPlaying && (
              <>
                <button className="narration-btn pause" onClick={handlePause}>
                  ⏸ Pause
                </button>
                <button className="narration-btn stop" onClick={handleStop}>
                  ⏹ Stop
                </button>
              </>
            )}
            {isPaused && (
              <>
                <button className="narration-btn play" onClick={handleResume}>
                  ▶ Resume
                </button>
                <button className="narration-btn stop" onClick={handleStop}>
                  ⏹ Stop
                </button>
              </>
            )}
          </div>
        )}

        <div className="sb-nav">
          <button
            className="sb-nav-btn"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 0}
          >
            ← Previous
          </button>

          {isGenerating ? (
            <span className="generating-badge">✨ Writing your story...</span>
          ) : (
            <div className="dots">
              {pages.map((_, i) => (
                <div
                  key={i}
                  className={`dot ${i === currentPage ? "active" : ""}`}
                  onClick={() => handlePageChange(i)}
                />
              ))}
            </div>
          )}

          <button
            className="sb-nav-btn"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= pages.length - 1}
          >
            Next →
          </button>
        </div>
      </div>

      {!isGenerating && (
        <button className="reset-btn" onClick={onReset}>
          ← Create another story
        </button>
      )}
    </>
  );
}