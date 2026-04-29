import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { spawnSync } from "node:child_process";

type Step = {
  id: string;
  command: string;
};

type StepResult = {
  id: string;
  command: string;
  success: boolean;
  exitCode: number;
  outputFile: string;
};

const rootDir = process.cwd();
const reportDir = path.join(rootDir, "docs", "evidence", "preflight");
const markdownReportPath = path.join(rootDir, "docs", "evidence", "judge-preflight-report.md");
const jsonReportPath = path.join(rootDir, "docs", "evidence", "judge-preflight-report.json");

const steps: Step[] = [
  { id: "validate-env", command: "npm run validate:env" },
  { id: "validate-evidence", command: "npm run validate:evidence" },
  { id: "hh-compile", command: "npm run hh:compile" },
  { id: "test", command: "npm run test" },
  { id: "typecheck", command: "npm run typecheck" },
  { id: "demo-deterministic", command: "npm run demo:deterministic" },
  { id: "demo-swarm", command: "npm run demo:swarm" },
  { id: "ens-passport", command: "npm run ens:passport" }
];

async function main(): Promise<void> {
  await mkdir(reportDir, { recursive: true });

  const startedAt = new Date().toISOString();
  const results: StepResult[] = [];

  for (const step of steps) {
    console.log(`Running ${step.command}`);
    const run = spawnSync(step.command, {
      cwd: rootDir,
      shell: true,
      env: process.env,
      encoding: "utf8"
    });
    const output = `${run.stdout ?? ""}${run.stderr ?? ""}`;
    const outputFilePath = path.join(reportDir, `${step.id}.txt`);
    await writeFile(outputFilePath, output, "utf8");
    const exitCode = run.status ?? 1;
    const stepResult: StepResult = {
      id: step.id,
      command: step.command,
      success: exitCode === 0,
      exitCode,
      outputFile: path.relative(rootDir, outputFilePath)
    };
    results.push(stepResult);

    if (!stepResult.success) {
      console.error(`Step failed: ${step.id}`);
    }
  }

  const passed = results.filter((result) => result.success).length;
  const failed = results.length - passed;
  const endedAt = new Date().toISOString();

  const report = {
    startedAt,
    endedAt,
    passed,
    failed,
    results
  };

  await writeFile(jsonReportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");

  const markdown = [
    "# Judge Preflight Report",
    "",
    `- Started (UTC): \`${startedAt}\``,
    `- Ended (UTC): \`${endedAt}\``,
    `- Passed: \`${passed}\``,
    `- Failed: \`${failed}\``,
    "",
    "## Step Results",
    ...results.map(
      (result) =>
        `- ${result.success ? "[PASS]" : "[FAIL]"} \`${result.id}\` — \`${result.command}\` (exit=${result.exitCode}) -> \`${result.outputFile}\``
    ),
    ""
  ].join("\n");

  await writeFile(markdownReportPath, markdown, "utf8");

  if (failed > 0) {
    process.exit(1);
  }
}

void main().catch((error: unknown) => {
  console.error("judge preflight crashed");
  console.error(error);
  process.exit(1);
});
