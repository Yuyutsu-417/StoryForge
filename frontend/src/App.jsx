import { useState } from "react";
import StoryForm from "./components/StoryForm";
import StoryBook from "./components/StoryBook";
import "./App.css";

function App() {
  const [pages, setPages] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [status, setStatus] = useState("");
  const [storyTitle, setStoryTitle] = useState("");

  const handleGenerate = async (formData) => {
    setPages([]);
    setIsGenerating(true);
    setIsComplete(false);
    setCurrentPage(0);
    setStatus("Writing your story...");
    setStoryTitle(`${formData.child_name} and the ${formData.theme} Adventure`);

    try {
      const response = await fetch("http://127.0.0.1:8000/generate-story", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error(`Server error: ${response.status}`);

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith("data: ")) continue;
          const jsonStr = trimmed.slice(6);
          if (!jsonStr) continue;

          try {
            const data = JSON.parse(jsonStr);

            if (data.type === "start") {
              setStatus("Writing your story...");
            }

            if (data.type === "page_text") {
              setStatus(`Writing page ${data.page}...`);
              setPages((prev) => {
                const exists = prev.find((p) => p.page === data.page);
                if (exists) {
                  return prev.map((p) =>
                    p.page === data.page ? { ...p, text: data.text } : p
                  );
                }
                return [...prev, { page: data.page, text: data.text, image: null }];
              });
            }

            if (data.type === "page_image") {
              setPages((prev) =>
                prev.map((p) =>
                  p.page === data.page ? { ...p, image: data.image } : p
                )
              );
            }

            if (data.type === "complete") {
              setStatus("Your story is ready!");
              setIsGenerating(false);
              setIsComplete(true);
            }

            if (data.type === "error") {
              setStatus(`Something went wrong. Please try again.`);
              setIsGenerating(false);
            }

          } catch (e) {
            console.warn("Parse error:", e);
          }
        }
      }
    } catch (err) {
      console.error(err);
      setStatus("Connection error. Is the backend running?");
      setIsGenerating(false);
    }
  };

  return (
    <div className="app">
      <header className="header">
        <h1>Story<span>Forge</span></h1>
        <p>Create magical personalized storybooks with AI</p>
      </header>

      <main className="main">
        {!isGenerating && !isComplete && (
          <StoryForm onGenerate={handleGenerate} />
        )}

        {(isGenerating || isComplete) && (
          <>
            {status && <div className="status-bar">{status}</div>}
            <StoryBook
              pages={pages}
              isGenerating={isGenerating}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              storyTitle={storyTitle}
              onReset={() => {
                setIsComplete(false);
                setIsGenerating(false);
                setPages([]);
                setStatus("");
              }}
            />
          </>
        )}
      </main>
    </div>
  );
}

export default App;