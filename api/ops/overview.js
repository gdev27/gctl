import { loadOverview } from "../_lib/data.js";

export default async function handler(_req, res) {
  res.setHeader("Cache-Control", "no-store");
  res.status(200).json(await loadOverview());
}
