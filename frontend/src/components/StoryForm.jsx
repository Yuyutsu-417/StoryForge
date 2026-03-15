import { useState } from "react";

const themes = [
  { emoji: "🚀", label: "Space", value: "Space adventure" },
  { emoji: "🌲", label: "Forest", value: "Magical forest" },
  { emoji: "🌊", label: "Ocean", value: "Underwater kingdom" },
  { emoji: "🦕", label: "Dinos", value: "Dinosaur world" },
  { emoji: "🦸", label: "Heroes", value: "Superhero academy" },
  { emoji: "🏰", label: "Castle", value: "Enchanted castle" },
  { emoji: "🦁", label: "Safari", value: "Jungle safari" },
  { emoji: "🐉", label: "Dragons", value: "Dragon friendship" },
];

export default function StoryForm({ onGenerate }) {
  const [form, setForm] = useState({
    child_name: "",
    age: 5,
    theme: "Space adventure",
    num_pages: 5,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.child_name.trim()) return alert("Please enter the child's name!");
    onGenerate(form);
  };

  return (
    <div className="card">
      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label>Child's name</label>
            <input
              type="text"
              placeholder="e.g. Arjun, Maya, Sofia..."
              value={form.child_name}
              onChange={(e) => setForm({ ...form, child_name: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Age</label>
            <input
              type="number"
              min="2"
              max="12"
              value={form.age}
              onChange={(e) =>
                setForm({ ...form, age: parseInt(e.target.value) })
              }
            />
          </div>
        </div>

        <span className="theme-label">Choose a theme</span>
        <div className="theme-grid">
          {themes.map((t) => (
            <button
              type="button"
              key={t.value}
              className={`theme-btn ${form.theme === t.value ? "active" : ""}`}
              onClick={() => setForm({ ...form, theme: t.value })}
            >
              {t.emoji} {t.label}
            </button>
          ))}
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Number of pages</label>
            <select
              value={form.num_pages}
              onChange={(e) =>
                setForm({ ...form, num_pages: parseInt(e.target.value) })
              }
            >
              <option value={3}>3 pages — quick read</option>
              <option value={5}>5 pages — perfect</option>
              <option value={7}>7 pages — epic tale</option>
            </select>
          </div>
          <div className="form-group">
            <label>Reading level</label>
            <select>
              <option>Simple (ages 2–4)</option>
              <option>Normal (ages 5–8)</option>
              <option>Advanced (ages 9–12)</option>
            </select>
          </div>
        </div>

        <button type="submit" className="generate-btn">
          ✨ Generate My Story
        </button>
      </form>
    </div>
  );
}