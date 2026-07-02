const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const ROOT = process.cwd();

const RESULT_DIR = path.join(ROOT, "fe-codecept-results");
const OUTPUT_DIR = path.join(ROOT, "output");

fs.mkdirSync(RESULT_DIR, { recursive: true });
fs.mkdirSync(OUTPUT_DIR, { recursive: true });

/**
 * Danh sách FE test sẽ chạy trên Jenkins.
 * Hiện Jenkinsfile của bạn đang chạy 2 file này.
 * Nếu sau này có thêm file FE khác thì thêm vào mảng này.
 */
const FE_TEST_DIR = path.join(ROOT, "tests", "fe");

const FE_TEST_FILES = fs
  .readdirSync(FE_TEST_DIR)
  .filter((file) => file.endsWith("_test.js"))
  .sort()
  .map((file) => `tests/fe/${file}`);

function nowText() {
  return new Date().toISOString();
}

function normalizeText(value) {
  return String(value || "").replace(/\r\n/g, "\n");
}

function trimText(value, maxLength = 12000) {
  const text = normalizeText(value);

  if (text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, maxLength)}\n\n... LOG BI CAT BOT DO QUA DAI ...`;
}

function getFailureSection(log) {
  const text = normalizeText(log);
  const index = text.indexOf("-- FAILURES:");

  if (index >= 0) {
    return text.slice(index);
  }

  return text;
}

function extractFailureBlocks(log) {
  const text = getFailureSection(log);
  const lines = text.split("\n");

  const blocks = [];
  let currentBlock = [];

  for (const line of lines) {
    if (/^\s*\d+\)\s+/.test(line)) {
      if (currentBlock.length > 0) {
        blocks.push(currentBlock.join("\n"));
      }

      currentBlock = [line];
      continue;
    }

    if (currentBlock.length > 0) {
      currentBlock.push(line);
    }
  }

  if (currentBlock.length > 0) {
    blocks.push(currentBlock.join("\n"));
  }

  return blocks;
}

function parseFailureBlock(file, block, fallbackIndex) {
  const lines = normalizeText(block).split("\n");

  const firstLineIndex = lines.findIndex((line) => /^\s*\d+\)\s+/.test(line));
  const firstLine = firstLineIndex >= 0 ? lines[firstLineIndex] : "";

  const firstMatch = firstLine.match(/^\s*(\d+)\)\s+(.+?)\s*$/);

  const index = firstMatch ? Number(firstMatch[1]) : fallbackIndex + 1;
  const feature = firstMatch ? firstMatch[2].trim() : "Unknown Feature";

  let scenarioLineIndex = -1;

  for (let i = firstLineIndex + 1; i < lines.length; i += 1) {
    const line = lines[i].trim();

    if (line) {
      scenarioLineIndex = i;
      break;
    }
  }

  const scenario =
    scenarioLineIndex >= 0
      ? lines[scenarioLineIndex].trim().replace(/:\s*$/, "")
      : `Unknown failed scenario ${index}`;

  const detailLines =
    scenarioLineIndex >= 0 ? lines.slice(scenarioLineIndex + 1) : lines;

  const errorMessage =
    detailLines
      .map((line) => line.trim())
      .find((line) => {
        return (
          line &&
          !line.startsWith("(") &&
          !line.startsWith("- screenshot") &&
          !line.startsWith("at ") &&
          !line.includes("Artifacts:") &&
          !line.includes("Metadata:")
        );
      }) || "Khong parse duoc error message. Xem log chi tiet.";

  return {
    file,
    index,
    feature,
    scenario,
    errorMessage,
    logSnippet: block.trim(),
  };
}

function extractFailures(file, log) {
  const blocks = extractFailureBlocks(log);

  if (blocks.length > 0) {
    return blocks.map((block, index) => parseFailureBlock(file, block, index));
  }

  const text = normalizeText(log);
  const failures = [];

  const xLineRegex = /^\s*×\s+(.+?)\s+in\s+\d+ms\s*$/gm;
  let match;

  while ((match = xLineRegex.exec(text)) !== null) {
    failures.push({
      file,
      index: failures.length + 1,
      feature: "Unknown Feature",
      scenario: match[1].trim(),
      errorMessage: "Khong parse duoc failure block. Xem log file.",
      logSnippet: trimText(getFailureSection(log), 12000),
    });
  }

  return failures;
}

function runCommand(command, args) {
  const result = spawnSync(command, args, {
    cwd: ROOT,
    shell: true,
    encoding: "utf8",
    maxBuffer: 1024 * 1024 * 80,
    env: {
      ...process.env,
      FORCE_COLOR: "0",
    },
  });

  return {
    status: result.status ?? 1,
    stdout: result.stdout || "",
    stderr: result.stderr || "",
    output: `${result.stdout || ""}\n${result.stderr || ""}`,
  };
}

function adfText(text) {
  return {
    type: "text",
    text: String(text || ""),
  };
}

function adfParagraph(text) {
  return {
    type: "paragraph",
    content: [adfText(text)],
  };
}

function adfHeading(text, level = 3) {
  return {
    type: "heading",
    attrs: {
      level,
    },
    content: [adfText(text)],
  };
}

function adfCodeBlock(text) {
  return {
    type: "codeBlock",
    attrs: {
      language: "text",
    },
    content: [adfText(text || "Khong co log")],
  };
}

function buildJiraDescriptionAdf(summary, failure) {
  return {
    type: "doc",
    version: 1,
    content: [
      adfHeading("FE CodeceptJS failed scenario", 2),

      adfHeading("Thong tin loi", 3),
      adfParagraph(`Feature: ${failure.feature}`),
      adfParagraph(`Scenario: ${failure.scenario}`),
      adfParagraph(`File test: ${failure.file}`),
      adfParagraph(`Error: ${failure.errorMessage}`),

      adfHeading("Thong tin Jenkins", 3),
      adfParagraph(`Job: ${summary.jobName}`),
      adfParagraph(`Build number: ${summary.buildNumber}`),
      adfParagraph(`Build URL: ${summary.buildUrl}`),
      adfParagraph(`Branch: ${summary.branch}`),
      adfParagraph(`Commit: ${summary.commit}`),
      adfParagraph(`Time: ${summary.time}`),

      adfHeading("Lenh chay lai loi nay", 3),
      adfCodeBlock(
        `cd codecept-tests\nnpx codeceptjs run ${failure.file} --grep "${failure.scenario.replace(
          /"/g,
          '\\"',
        )}"`,
      ),

      adfHeading("Log loi", 3),
      adfCodeBlock(trimText(failure.logSnippet, 12000)),
    ],
  };
}

function buildJiraDescriptionText(summary, failure) {
  return trimText(
    [
      "FE CodeceptJS failed scenario",
      "",
      "Thong tin loi:",
      `Feature: ${failure.feature}`,
      `Scenario: ${failure.scenario}`,
      `File test: ${failure.file}`,
      `Error: ${failure.errorMessage}`,
      "",
      "Thong tin Jenkins:",
      `Job: ${summary.jobName}`,
      `Build number: ${summary.buildNumber}`,
      `Build URL: ${summary.buildUrl}`,
      `Branch: ${summary.branch}`,
      `Commit: ${summary.commit}`,
      `Time: ${summary.time}`,
      "",
      "Lenh chay lai loi nay:",
      "cd codecept-tests",
      `npx codeceptjs run ${failure.file} --grep "${failure.scenario.replace(
        /"/g,
        '\\"',
      )}"`,
      "",
      "Log loi:",
      trimText(failure.logSnippet, 12000),
    ].join("\n"),
    30000,
  );
}

function buildIssueSummary(failure) {
  const fileName = path.basename(failure.file);
  const cleanScenario = failure.scenario.replace(/\s+/g, " ").trim();

  return `[CI][FE][${fileName}] ${cleanScenario}`.slice(0, 250);
}

async function createJiraTask(summary, failure) {
  const jiraBaseUrl = process.env.JIRA_BASE_URL;
  const jiraEmail = process.env.JIRA_EMAIL || process.env.JIRA_USER_EMAIL;
  const jiraApiToken = process.env.JIRA_API_TOKEN;
  const jiraProjectKey = process.env.JIRA_PROJECT_KEY;
  const jiraIssueType = process.env.JIRA_ISSUE_TYPE || "Task";
  const jiraApiVersion = process.env.JIRA_API_VERSION || "3";

  if (!jiraBaseUrl || !jiraEmail || !jiraApiToken || !jiraProjectKey) {
    console.log("Bo qua tao Jira task vi thieu bien moi truong Jira.");
    console.log(
      "Can co: JIRA_BASE_URL, JIRA_EMAIL hoac JIRA_USER_EMAIL, JIRA_API_TOKEN, JIRA_PROJECT_KEY",
    );
    return null;
  }

  const url = `${jiraBaseUrl.replace(/\/$/, "")}/rest/api/${jiraApiVersion}/issue`;

  const description =
    jiraApiVersion === "3"
      ? buildJiraDescriptionAdf(summary, failure)
      : buildJiraDescriptionText(summary, failure);

  const body = {
    fields: {
      project: {
        key: jiraProjectKey,
      },
      summary: buildIssueSummary(failure),
      description,
      issuetype: {
        name: jiraIssueType,
      },
      labels: ["ci", "codeceptjs", "fe-test", "auto-created", "jenkins"],
    },
  };

  if (process.env.JIRA_ASSIGNEE_ACCOUNT_ID) {
    body.fields.assignee = {
      accountId: process.env.JIRA_ASSIGNEE_ACCOUNT_ID,
    };
  }

  const auth = Buffer.from(`${jiraEmail}:${jiraApiToken}`).toString("base64");

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const responseText = await res.text();

  if (!res.ok) {
    console.log("======================================");
    console.log("TAO JIRA TASK THAT BAI");
    console.log("======================================");
    console.log(`Scenario: ${failure.scenario}`);
    console.log(`Status: ${res.status}`);
    console.log(responseText);
    return null;
  }

  const data = JSON.parse(responseText);
  const issueUrl = `${jiraBaseUrl.replace(/\/$/, "")}/browse/${data.key}`;

  console.log(`Da tao Jira task cho loi: ${failure.scenario}`);
  console.log(issueUrl);

  return {
    key: data.key,
    url: issueUrl,
  };
}

async function createJiraTasksForFailures(summary, failures) {
  const created = [];

  for (let index = 0; index < failures.length; index += 1) {
    const failure = failures[index];

    console.log("======================================");
    console.log(`CREATE JIRA TASK ${index + 1}/${failures.length}`);
    console.log("======================================");
    console.log(`File: ${failure.file}`);
    console.log(`Scenario: ${failure.scenario}`);

    try {
      const issue = await createJiraTask(summary, failure);

      if (issue) {
        created.push({
          ...issue,
          scenario: failure.scenario,
          file: failure.file,
        });
      }
    } catch (error) {
      console.log(`Loi khi tao Jira task: ${error.message}`);
    }
  }

  return created;
}

async function main() {
  console.log("======================================");
  console.log("RUN FE CODECEPTJS TESTS ONLY");
  console.log("CREATE ONE JIRA TASK PER FAILED SCENARIO");
  console.log("======================================");
  console.log(`Time: ${nowText()}`);
  console.log(`FE_URL: ${process.env.FE_URL || ""}`);
  console.log(`API_URL: ${process.env.API_URL || ""}`);
  console.log("");

  const results = [];

  for (const file of FE_TEST_FILES) {
    const absolutePath = path.join(ROOT, file);

    if (!fs.existsSync(absolutePath)) {
      console.log(`SKIP: Khong ton tai file ${file}`);
      continue;
    }

    console.log("======================================");
    console.log(`RUN: ${file}`);
    console.log("======================================");

    const result = runCommand("npx", ["codeceptjs", "run", file, "--steps"]);

    const logFileName = file.replace(/[\\/]/g, "__").replace(/\.js$/, ".log");

    const logFilePath = path.join(RESULT_DIR, logFileName);

    fs.writeFileSync(logFilePath, result.output, "utf8");

    console.log(result.output);

    let failures = extractFailures(file, result.output);

    if (result.status !== 0 && failures.length === 0) {
      failures = [
        {
          file,
          index: 1,
          feature: "Unknown Feature",
          scenario: `File test fail: ${file}`,
          errorMessage: "Khong parse duoc scenario fail. Xem log file.",
          logSnippet: trimText(getFailureSection(result.output), 12000),
        },
      ];
    }

    results.push({
      file,
      status: result.status,
      logFile: logFilePath,
      output: result.output,
      failures,
    });

    if (result.status === 0) {
      console.log(`PASS: ${file}`);
    } else {
      console.log(`FAIL: ${file}`);
      console.log(`Parsed failures: ${failures.length}`);
    }

    console.log("");
  }

  const combinedLogPath = path.join(RESULT_DIR, "fe-codecept-combined.log");

  fs.writeFileSync(
    combinedLogPath,
    results
      .map((item) => {
        return [
          "====================================================",
          item.file,
          `Exit code: ${item.status}`,
          `Parsed failures: ${item.failures.length}`,
          "====================================================",
          item.output,
        ].join("\n");
      })
      .join("\n\n"),
    "utf8",
  );

  const failedResults = results.filter((item) => item.status !== 0);
  const allFailures = failedResults.flatMap((item) => item.failures);

  const summary = {
    time: nowText(),
    jobName: process.env.JOB_NAME || "local",
    buildNumber: process.env.BUILD_NUMBER || "local",
    buildUrl: process.env.BUILD_URL || "local",
    branch: process.env.BRANCH_NAME || process.env.GIT_BRANCH || "unknown",
    commit: process.env.GIT_COMMIT || "unknown",
    totalFiles: results.length,
    passedFiles: results.filter((item) => item.status === 0).length,
    failedFiles: failedResults.length,
    totalFailures: allFailures.length,
    results: results.map((item) => ({
      file: item.file,
      status: item.status,
      logFile: item.logFile,
      failures: item.failures,
    })),
  };

  const summaryPath = path.join(RESULT_DIR, "fe-codecept-summary.json");

  fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2), "utf8");

  console.log("======================================");
  console.log("FE CODECEPTJS SUMMARY");
  console.log("======================================");
  console.log(`Total files: ${summary.totalFiles}`);
  console.log(`Passed files: ${summary.passedFiles}`);
  console.log(`Failed files: ${summary.failedFiles}`);
  console.log(`Total failed scenarios: ${summary.totalFailures}`);
  console.log(`Combined log: ${combinedLogPath}`);
  console.log(`Summary json: ${summaryPath}`);

  if (allFailures.length > 0) {
    console.log("");
    console.log("FAILED SCENARIOS:");

    allFailures.forEach((failure, index) => {
      console.log(`${index + 1}. [${failure.file}] ${failure.scenario}`);
    });

    console.log("");
    console.log("Tao Jira task rieng cho tung loi fail...");

    const createdIssues = await createJiraTasksForFailures(
      summary,
      allFailures,
    );

    const jiraResultPath = path.join(RESULT_DIR, "jira-created-tasks.json");

    fs.writeFileSync(
      jiraResultPath,
      JSON.stringify(createdIssues, null, 2),
      "utf8",
    );

    console.log("");
    console.log(
      `Da tao ${createdIssues.length}/${allFailures.length} Jira task.`,
    );
    console.log(`Jira result: ${jiraResultPath}`);

    process.exit(2);
  }

  console.log("Tat ca FE CodeceptJS test da pass.");
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(2);
});
