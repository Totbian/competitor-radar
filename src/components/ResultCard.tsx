"use client";

import { MODULES } from "@/lib/modules";

interface TaskInfo {
  competitor: string;
  moduleId: string;
  taskId: string;
  status: string;
  result: Record<string, unknown> | null;
  error: string | null;
}

export function ResultCard({ task }: { task: TaskInfo }) {
  const mod = MODULES.find((m) => m.id === task.moduleId);
  if (!mod) return null;

  return (
    <div className="result-card">
      <div className="result-card-header">
        <div className="result-card-header-left">
          <span className="icon">{mod.icon}</span>
          <div>
            <div className="title">{mod.name}</div>
            <div className="competitor-url">{task.competitor}</div>
          </div>
        </div>
        <span className={`status-badge ${task.status.replace("_", "_")}`}>
          {task.status === "in_progress" ? "scanning..." : task.status}
        </span>
      </div>
      <div className="result-card-body">
        {task.status === "pending" || task.status === "in_progress" ? (
          <LoadingSkeleton />
        ) : task.status === "failed" ? (
          <p style={{ color: "var(--danger)", fontSize: "0.85rem" }}>
            {task.error || "Task failed"}
          </p>
        ) : task.result ? (
          <ResultContent moduleId={task.moduleId} data={task.result} />
        ) : null}
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div>
      <div className="skeleton wide" />
      <div className="skeleton medium" />
      <div className="skeleton narrow" />
      <div className="skeleton wide" />
    </div>
  );
}

function ResultContent({
  moduleId,
  data,
}: {
  moduleId: string;
  data: Record<string, unknown>;
}) {
  switch (moduleId) {
    case "promotions":
      return <PromotionsResult data={data} />;
    case "ads":
      return <AdsResult data={data} />;
    case "social":
      return <SocialResult data={data} />;
    case "pricing":
      return <PricingResult data={data} />;
    case "reviews":
      return <ReviewsResult data={data} />;
    default:
      return <GenericResult data={data} />;
  }
}

function PromotionsResult({ data }: { data: Record<string, unknown> }) {
  const promotions = (data.promotions || []) as Array<Record<string, unknown>>;
  const aggressiveness = (data.overallAggressiveness as string) || "unknown";

  return (
    <div>
      <div className="metric-row">
        <span className="metric-label">Active Promotions</span>
        <span className="metric-value">{promotions.length}</span>
      </div>
      <div className="metric-row">
        <span className="metric-label">Free Shipping</span>
        <span className="metric-value">
          {(data.freeShippingThreshold as string) || "Not found"}
        </span>
      </div>
      <div className="metric-row">
        <span className="metric-label">Aggressiveness</span>
        <span
          className={`metric-value aggressiveness-${aggressiveness.toLowerCase()}`}
        >
          {aggressiveness.toUpperCase()}
        </span>
      </div>
      {promotions.length > 0 && (
        <div className="result-items" style={{ marginTop: "0.75rem" }}>
          {promotions.map((promo, i) => (
            <div key={i} className="result-item">
              <span className="bullet">•</span>
              <span className="content">
                <strong>{promo.type as string}:</strong>{" "}
                {promo.description as string}
                {promo.discountAmount ? ` (${promo.discountAmount as string})` : ""}
                {promo.hasUrgency ? " ⏰" : ""}
              </span>
            </div>
          ))}
        </div>
      )}
      {typeof data.summary === "string" && data.summary && (
        <p className="result-summary" style={{ marginTop: "0.75rem" }}>
          {data.summary as string}
        </p>
      )}
    </div>
  );
}

function AdsResult({ data }: { data: Record<string, unknown> }) {
  const ads = (data.ads || []) as Array<Record<string, unknown>>;

  return (
    <div>
      <div className="metric-row">
        <span className="metric-label">Total Active Ads</span>
        <span className="metric-value">{data.totalActiveAds as number}</span>
      </div>
      <div className="metric-row">
        <span className="metric-label">Dominant Theme</span>
        <span className="metric-value">{data.dominantTheme as string}</span>
      </div>
      {ads.length > 0 && (
        <div className="result-items" style={{ marginTop: "0.75rem" }}>
          {ads.slice(0, 5).map((ad, i) => (
            <div key={i} className="result-item">
              <span className="bullet">•</span>
              <span className="content">
                <strong>{ad.creativetype as string}</strong> - {ad.messaging as string}
                {ad.productFocus ? ` | Focus: ${ad.productFocus as string}` : ""}
                {ad.daysActive ? ` | ${ad.daysActive}d active` : ""}
              </span>
            </div>
          ))}
        </div>
      )}
      {typeof data.summary === "string" && data.summary && (
        <p className="result-summary" style={{ marginTop: "0.75rem" }}>
          {data.summary as string}
        </p>
      )}
    </div>
  );
}

function SocialResult({ data }: { data: Record<string, unknown> }) {
  const platforms = (data.platforms || []) as Array<Record<string, unknown>>;

  return (
    <div>
      <div className="metric-row">
        <span className="metric-label">Influencer Collabs</span>
        <span className="metric-value">
          {data.influencerCollabs ? "Yes ✓" : "None found"}
        </span>
      </div>
      {platforms.length > 0 && (
        <div className="result-items" style={{ marginTop: "0.75rem" }}>
          {platforms.map((p, i) => (
            <div key={i} className="result-item">
              <span className="bullet">•</span>
              <span className="content">
                <strong>{p.platform as string}</strong> (@{p.handle as string}) -{" "}
                {p.postsLast2Weeks as number} posts in 2 weeks | Top format:{" "}
                {p.topContentType as string}
                {(p.featuredProducts as string[])?.length > 0 && (
                  <div className="tag-list">
                    {(p.featuredProducts as string[]).slice(0, 4).map((prod, j) => (
                      <span key={j} className="tag">
                        {prod}
                      </span>
                    ))}
                  </div>
                )}
              </span>
            </div>
          ))}
        </div>
      )}
      {typeof data.contentStrategy === "string" && data.contentStrategy && (
        <p className="result-summary" style={{ marginTop: "0.75rem" }}>
          <strong>Strategy:</strong> {data.contentStrategy as string}
        </p>
      )}
      {typeof data.summary === "string" && data.summary && (
        <p className="result-summary">{data.summary as string}</p>
      )}
    </div>
  );
}

function PricingResult({ data }: { data: Record<string, unknown> }) {
  const priceRange = (data.priceRange || {}) as Record<string, string>;
  const newProducts = (data.newProducts || []) as Array<Record<string, string>>;
  const bestSellers = (data.bestSellers || []) as string[];
  const tactics = (data.pricingTactics || []) as string[];

  return (
    <div>
      <div className="metric-row">
        <span className="metric-label">Price Range</span>
        <span className="metric-value">
          {priceRange.lowest} - {priceRange.highest} {priceRange.currency}
        </span>
      </div>
      <div className="metric-row">
        <span className="metric-label">Shipping</span>
        <span className="metric-value">{data.shippingInfo as string}</span>
      </div>
      {bestSellers.length > 0 && (
        <>
          <h4
            style={{
              fontSize: "0.75rem",
              color: "var(--text-muted)",
              marginTop: "0.75rem",
              marginBottom: "0.4rem",
            }}
          >
            BEST SELLERS
          </h4>
          <div className="tag-list">
            {bestSellers.slice(0, 5).map((item, i) => (
              <span key={i} className="tag">
                {item}
              </span>
            ))}
          </div>
        </>
      )}
      {newProducts.length > 0 && (
        <>
          <h4
            style={{
              fontSize: "0.75rem",
              color: "var(--text-muted)",
              marginTop: "0.75rem",
              marginBottom: "0.4rem",
            }}
          >
            NEW ARRIVALS
          </h4>
          <div className="result-items">
            {newProducts.slice(0, 4).map((prod, i) => (
              <div key={i} className="result-item">
                <span className="bullet">•</span>
                <span className="content">
                  {prod.name} - <strong>{prod.price}</strong>
                </span>
              </div>
            ))}
          </div>
        </>
      )}
      {tactics.length > 0 && (
        <>
          <h4
            style={{
              fontSize: "0.75rem",
              color: "var(--text-muted)",
              marginTop: "0.75rem",
              marginBottom: "0.4rem",
            }}
          >
            PRICING TACTICS
          </h4>
          <div className="tag-list">
            {tactics.map((t, i) => (
              <span key={i} className="tag">
                {t}
              </span>
            ))}
          </div>
        </>
      )}
      {typeof data.summary === "string" && data.summary && (
        <p className="result-summary" style={{ marginTop: "0.75rem" }}>
          {data.summary as string}
        </p>
      )}
    </div>
  );
}

function ReviewsResult({ data }: { data: Record<string, unknown> }) {
  const loves = (data.customerLoves || []) as string[];
  const complaints = (data.customerComplaints || []) as string[];
  const bestRated = (data.bestRatedProducts || []) as Array<
    Record<string, string>
  >;

  return (
    <div>
      <div className="metric-row">
        <span className="metric-label">Overall Rating</span>
        <span className="metric-value">
          {"⭐".repeat(Math.round(data.overallRating as number))}{" "}
          {data.overallRating as number}/5
        </span>
      </div>
      <div className="metric-row">
        <span className="metric-label">Total Reviews</span>
        <span className="metric-value">{data.totalReviews as number}</span>
      </div>
      <div className="metric-row">
        <span className="metric-label">Platform</span>
        <span className="metric-value">{data.platform as string}</span>
      </div>
      <div className="metric-row">
        <span className="metric-label">Recent Trend</span>
        <span className="metric-value">{data.recentTrend as string}</span>
      </div>
      <div className="metric-row">
        <span className="metric-label">Responds to Negatives</span>
        <span className="metric-value">
          {data.respondsToNegative ? "Yes ✓" : "No ✗"}
        </span>
      </div>
      {loves.length > 0 && (
        <>
          <h4
            style={{
              fontSize: "0.75rem",
              color: "var(--success)",
              marginTop: "0.75rem",
              marginBottom: "0.4rem",
            }}
          >
            👍 CUSTOMERS LOVE
          </h4>
          <div className="result-items">
            {loves.map((item, i) => (
              <div key={i} className="result-item">
                <span className="bullet" style={{ color: "var(--success)" }}>
                  •
                </span>
                <span className="content">{item}</span>
              </div>
            ))}
          </div>
        </>
      )}
      {complaints.length > 0 && (
        <>
          <h4
            style={{
              fontSize: "0.75rem",
              color: "var(--danger)",
              marginTop: "0.75rem",
              marginBottom: "0.4rem",
            }}
          >
            👎 COMMON COMPLAINTS
          </h4>
          <div className="result-items">
            {complaints.map((item, i) => (
              <div key={i} className="result-item">
                <span className="bullet" style={{ color: "var(--danger)" }}>
                  •
                </span>
                <span className="content">{item}</span>
              </div>
            ))}
          </div>
        </>
      )}
      {bestRated.length > 0 && (
        <>
          <h4
            style={{
              fontSize: "0.75rem",
              color: "var(--text-muted)",
              marginTop: "0.75rem",
              marginBottom: "0.4rem",
            }}
          >
            🏆 BEST RATED PRODUCTS
          </h4>
          <div className="result-items">
            {bestRated.map((prod, i) => (
              <div key={i} className="result-item">
                <span className="bullet">•</span>
                <span className="content">
                  {prod.name} ({prod.rating})
                </span>
              </div>
            ))}
          </div>
        </>
      )}
      {typeof data.summary === "string" && data.summary && (
        <p className="result-summary" style={{ marginTop: "0.75rem" }}>
          {data.summary as string}
        </p>
      )}
    </div>
  );
}

function GenericResult({ data }: { data: Record<string, unknown> }) {
  return (
    <pre
      style={{
        fontSize: "0.75rem",
        color: "var(--text-secondary)",
        whiteSpace: "pre-wrap",
        wordBreak: "break-word",
      }}
    >
      {JSON.stringify(data, null, 2)}
    </pre>
  );
}
