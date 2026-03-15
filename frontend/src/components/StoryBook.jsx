export default function StoryBook({
  pages,
  isGenerating,
  currentPage,
  setCurrentPage,
  storyTitle,
  onReset,
}) {
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

        <div className="sb-nav">
          <button
            className="sb-nav-btn"
            onClick={() => setCurrentPage((p) => p - 1)}
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
                  onClick={() => setCurrentPage(i)}
                />
              ))}
            </div>
          )}

          <button
            className="sb-nav-btn"
            onClick={() => setCurrentPage((p) => p + 1)}
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