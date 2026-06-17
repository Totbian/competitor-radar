import { Dashboard } from "@/components/Dashboard";

export default function Home() {
  return (
    <main className="container">
      <header className="header">
        <div className="header-left">
          <div className="logo">⚡</div>
          <h1>Competitor Radar</h1>
        </div>
        <span className="header-badge">Powered by Ninja API</span>
      </header>
      <Dashboard />
      <footer className="footer">
        Built with the{" "}
        <a href="https://docs.molin.ai/ninja/ninja-api" target="_blank">
          Ninja API
        </a>{" "}
        by{" "}
        <a href="https://molin.ai" target="_blank">
          Molin AI
        </a>
      </footer>
    </main>
  );
}
