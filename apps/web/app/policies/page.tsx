import { loadPolicies } from "../api/ops/_lib/data";
import { PoliciesClient } from "./policies-client";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Policies",
  description: "Policy inventory and routing intent preview for operations."
};

export default async function PoliciesPage() {
  const policiesResult = await loadPolicies();
  return <PoliciesClient initialPolicies={policiesResult.data} initialSource={policiesResult.source} />;
}
