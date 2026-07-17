"use client";

import { useEffect, useState } from "react";

type HealthResponse = {
  status: string;
  timestamp: string;
  database: string;
};

export default function HealthCheckPage() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/health`)
      .then((res) => res.json())
      .then(setHealth)
      .catch(() => setError("Could not reach backend"));
  }, []);

  return (
    <main className="p-8">
      <h1 className="text-xl font-semibold mb-4">Frontend ↔ Backend Health Check</h1>
      {error && <p className="text-red-600">{error}</p>}
      {health && (
        <pre className="bg-gray-100 p-4 rounded text-sm">
          {JSON.stringify(health, null, 2)}
        </pre>
      )}
      {!health && !error && <p>Checking...</p>}
    </main>
  );
}