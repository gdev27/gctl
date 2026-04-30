import { useQuery } from "@tanstack/react-query";

const FALLBACK_ENVELOPE = {
  data: null,
  source: "fallback",
  trustStatus: "fallback",
  reasonCode: "FUNCTION_UNREACHABLE",
  recoveryAction: "Deploy the web app (Vercel Functions) and ensure /api/ops/* endpoints are reachable.",
};

async function fetchEnvelope(path) {
  try {
    const res = await fetch(path, { headers: { Accept: "application/json" } });
    if (!res.ok) {
      return {
        ...FALLBACK_ENVELOPE,
        reasonCode: `OPS_HTTP_${res.status}`,
      };
    }
    return await res.json();
  } catch {
    return FALLBACK_ENVELOPE;
  }
}

export function useOpsEnvelope(path, queryKey) {
  return useQuery({
    queryKey: queryKey || ["ops", path],
    queryFn: () => fetchEnvelope(path),
    staleTime: 30_000,
  });
}
