"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily:
            'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
          background: "#0b0d14",
          color: "#e6e8ef",
        }}
      >
        <div style={{ textAlign: "center", padding: 24, maxWidth: 420 }}>
          <h1 style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>
            Lane hit an unexpected error
          </h1>
          <p style={{ color: "#888ea0", fontSize: 14, marginTop: 8 }}>
            {error.message || "Please try again."}
          </p>
          <button
            onClick={reset}
            style={{
              marginTop: 20,
              height: 36,
              padding: "0 14px",
              borderRadius: 8,
              border: "none",
              background: "#7c6cf5",
              color: "#fff",
              fontSize: 14,
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
