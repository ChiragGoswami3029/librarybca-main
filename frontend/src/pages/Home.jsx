import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpenText, ShieldCheck, UploadCloud } from 'lucide-react';

const homeStyles = `
  .home-page-shell {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: clamp(1rem, 3vw, 2rem);
    background: var(--bg-gradient);
    overflow-x: hidden;
  }

  .home-page-panel {
    width: min(100%, 1100px);
    max-width: 1100px;
    overflow: hidden;
  }

  .home-page-grid {
    display: grid;
    grid-template-columns: minmax(0, 1.2fr) minmax(260px, 0.8fr);
    gap: clamp(1.25rem, 2vw, 2rem);
    align-items: center;
    padding: clamp(1.5rem, 3vw, 3rem) clamp(1rem, 2vw, 2rem);
    width: 100%;
  }

  .home-copy {
    min-width: 0;
  }

  .home-badge {
    display: inline-flex;
    margin-bottom: 1.25rem;
    padding: 0.45rem 0.9rem;
    font-size: 0.74rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    white-space: nowrap;
  }

  .home-title {
    font-size: clamp(2.5rem, 5vw, 4rem);
    margin-bottom: 1rem;
    line-height: 0.92;
    letter-spacing: -0.06em;
    max-width: 100%;
  }

  .home-description {
    font-size: clamp(1rem, 1.7vw, 1.05rem);
    line-height: 1.7;
    max-width: 620px;
    margin-bottom: 2rem;
    color: var(--text-secondary);
  }

  .home-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    width: 100%;
  }

  .home-actions .btn {
    min-width: 0;
  }

  .home-feature-list {
    display: grid;
    gap: 1rem;
    width: 100%;
    min-width: 0;
  }

  .home-feature-card {
    padding: 1.15rem 1.1rem;
    width: 100%;
  }

  .home-feature-card > div {
    display: flex;
    align-items: center;
    gap: 0.8rem;
    min-width: 0;
  }

  .home-feature-icon {
    width: 42px;
    height: 42px;
    display: grid;
    place-items: center;
    border-radius: var(--radius-md);
    background: var(--accent-subtle);
    color: var(--accent-primary);
    flex-shrink: 0;
  }

  .home-feature-copy {
    min-width: 0;
  }

  .home-feature-title {
    font-weight: 700;
    color: var(--text-primary);
    line-height: 1.3;
  }

  .home-feature-subtitle {
    font-size: 0.82rem;
    color: var(--text-muted);
    line-height: 1.4;
  }

  @media (max-width: 1023px) {
    .home-page-grid {
      grid-template-columns: 1fr;
      padding: clamp(1.25rem, 4vw, 2rem) clamp(0.9rem, 3vw, 1.2rem);
    }

    .home-copy {
      max-width: 100%;
    }

    .home-feature-list {
      max-width: 100%;
    }
  }

  @media (max-width: 767px) {
    .home-page-shell {
      padding: 1rem 0.65rem;
    }

    .home-page-panel {
      max-width: 100%;
    }

    .home-badge {
      margin-bottom: 1rem;
      width: auto;
    }

    .home-title {
      font-size: clamp(2.5rem, 13vw, 4rem);
      line-height: 0.96;
      letter-spacing: -0.05em;
      margin-bottom: 1rem;
    }

    .home-description {
      font-size: 1.02rem;
      margin-bottom: 1.5rem;
    }

    .home-actions {
      flex-direction: column;
      gap: 0.85rem;
    }

    .home-actions .btn {
      width: 100%;
      justify-content: center;
    }

    .home-feature-card {
      padding: 0.9rem 0.9rem;
    }

    .home-feature-card > div {
      gap: 0.7rem;
    }

    .home-feature-title {
      font-size: clamp(1.25rem, 5vw, 1.7rem);
    }

    .home-feature-subtitle {
      font-size: 0.78rem;
    }
  }

  @media (max-width: 359px) {
    .home-page-shell {
      padding: 0.75rem 0.45rem;
    }

    .home-feature-card > div {
      align-items: flex-start;
    }

    .home-feature-icon {
      width: 38px;
      height: 38px;
    }
  }
`;

export default function Home() {
  return (
    <>
      <style>{homeStyles}</style>
      <div className="home-page-shell">
        <div className="glass-panel-strong home-page-panel">
          <div className="home-page-grid">
            <div className="home-copy">
              <div className="badge badge-accent home-badge">AcademicShare</div>

              <h1 className="home-title">Share. Learn. Grow.</h1>

              <p className="home-description">
                Discover, share and learn from academic resources with your BCA classmates and peers.
              </p>

              <div className="home-actions">
                <Link className="btn btn-primary btn-lg" to="/signup">
                  Create Account <ArrowRight size={18} />
                </Link>
                <Link className="btn btn-glass btn-lg" to="/login">
                  Login
                </Link>
              </div>
            </div>

            <div className="home-feature-list">
              <div className="glass-card home-feature-card">
                <div>
                  <div className="home-feature-icon">
                    <BookOpenText size={20} />
                  </div>
                  <div className="home-feature-copy">
                    <div className="home-feature-title">Shared Notes</div>
                    <div className="home-feature-subtitle">Semester-wise study material</div>
                  </div>
                </div>
              </div>

              <div className="glass-card home-feature-card">
                <div>
                  <div className="home-feature-icon">
                    <UploadCloud size={20} />
                  </div>
                  <div className="home-feature-copy">
                    <div className="home-feature-title">Upload & Learn</div>
                    <div className="home-feature-subtitle">Share practicals and notes</div>
                  </div>
                </div>
              </div>

              <div className="glass-card home-feature-card">
                <div>
                  <div className="home-feature-icon">
                    <ShieldCheck size={20} />
                  </div>
                  <div className="home-feature-copy">
                    <div className="home-feature-title">Secure Access</div>
                    <div className="home-feature-subtitle">Built for the student community</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
