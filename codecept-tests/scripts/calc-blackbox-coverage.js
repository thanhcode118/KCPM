const fs = require("fs");
const path = require("path");

const DOC_DIR = path.join(
  __dirname,
  "..",
  "docs",
  "blackbox",
  "api",
  "auth-account",
);

const REPORT_FILE = path.join(
  __dirname,
  "..",
  "docs",
  "blackbox",
  "api",
  "BLACKBOX_COVERAGE_REPORT.md",
);

const SHOULD_WRITE_TO_MD = process.argv.includes("--write");

function extractSection(markdown, startRegex) {
  const match = markdown.match(startRegex);
  if (!match || match.index === undefined) return "";

  const startIndex = match.index;
  const rest = markdown.slice(startIndex);

  const nextHeading = rest.slice(match[0].length).search(/\n##\s+/);

  if (nextHeading === -1) {
    return rest;
  }

  return rest.slice(0, match[0].length + nextHeading);
}

function extractTags(text, allowedPrefixes = ["V", "X"]) {
  const regex = /\b([A-Z])\d+\b/g;
  const tags = new Set();
  let match;

  while ((match = regex.exec(text)) !== null) {
    const tag = match[0];
    const prefix = match[1];

    if (allowedPrefixes.includes(prefix)) {
      tags.add(tag);
    }
  }

  return tags;
}

function splitMarkdownRow(row) {
  return row
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim());
}

function getTargetTags(markdown) {
  const section = extractSection(
    markdown,
    /##\s*(?:Câu\s*)?1\.\s*Xác định lớp tương đương/i,
  );

  return extractTags(section, ["V", "X"]);
}

function getCoveredTags(markdown) {
  const section = extractSection(
    markdown,
    /##\s*(?:Câu\s*)?3\.\s*Thiết kế test case/i,
  );

  const coveredTags = new Set();

  const rows = section
    .split(/\r?\n/)
    .filter((line) => line.trim().startsWith("|"))
    .filter((line) => !line.includes("---"))
    .filter((line) => !line.includes("STT"));

  for (const row of rows) {
    const cols = splitMarkdownRow(row);

    if (cols.length < 7) continue;

    const actualOutput = cols[4] || "";
    const result = cols[5] || "";
    const tagText = cols[6] || "";

    const isPassed =
      /pass/i.test(result) ||
      /passed/i.test(actualOutput) ||
      /passed/i.test(result);

    const isNotRun =
      /chưa chạy/i.test(result) ||
      /chưa có/i.test(actualOutput) ||
      /chưa/i.test(result);

    if (isPassed && !isNotRun) {
      const tags = extractTags(tagText, ["V", "X"]);
      for (const tag of tags) {
        coveredTags.add(tag);
      }
    }
  }

  return coveredTags;
}

function percent(covered, total) {
  if (total === 0) return "0.00%";
  return ((covered / total) * 100).toFixed(2) + "%";
}

function getTagMeaning(tag) {
  const meanings = {
    V1: "Dữ liệu hợp lệ chính của API",
    V2: "Dữ liệu hợp lệ bổ sung",
    V3: "Dữ liệu hợp lệ bổ sung",
    V4: "Dữ liệu hợp lệ bổ sung",
    V5: "Dữ liệu hợp lệ bổ sung",

    X1: "Thiếu dữ liệu hoặc không gửi dữ liệu bắt buộc",
    X2: "Dữ liệu sai hoặc không hợp lệ",
    X3: "Dữ liệu không tồn tại hoặc đã bị xóa",
    X4: "Dữ liệu không thuộc quyền của user hiện tại",
    X5: "Dữ liệu rỗng hoặc sai định dạng",
    X6: "Kiểu dữ liệu không hợp lệ",
    X7: "Giá trị không nằm trong nghiệp vụ cho phép",
  };

  return meanings[tag] || "Trường hợp đầu vào đã thiết kế";
}

function buildCoverageBlock(result) {
  const tagRows = [];

  for (const tag of result.targetTags) {
    const status = result.coveredTags.includes(tag)
      ? "Đã kiểm thử"
      : "Chưa kiểm thử";

    tagRows.push(`| ${tag} | ${getTagMeaning(tag)} | ${status} |`);
  }

  return `## 5. Mức độ bao phủ

Vì đây là kiểm thử Black-box API nên nhóm không đo line coverage hay branch coverage của mã nguồn.  
Thay vào đó, mức độ bao phủ được đánh giá dựa trên các tag trong bảng lớp tương đương.

| Tag | Trường hợp kiểm thử | Trạng thái |
|---|---|---|
${tagRows.join("\n")}

Kết quả:

| Nội dung | Giá trị |
|---|---:|
| Tổng số tag cần kiểm thử | ${result.targetCount} |
| Số tag đã kiểm thử | ${result.coveredCount} |
| Tỷ lệ bao phủ | ${result.coverage} |

Như vậy, API trong file này hiện đã bao phủ được ${result.coveredCount}/${result.targetCount} tag đã thiết kế.  
Những tag chưa được kiểm thử riêng có thể bổ sung thêm test case sau để tăng mức độ bao phủ.

`;
}

function updateMarkdownFile(filePath, coverageBlock) {
  let markdown = fs.readFileSync(filePath, "utf8");

  const oldCoverageRegex =
    /##\s*5\.\s*(?:Độ bao phủ kiểm thử|Mức độ bao phủ)[\s\S]*?(?=\n### Kết luận|\n##\s+|$)/i;

  if (oldCoverageRegex.test(markdown)) {
    markdown = markdown.replace(oldCoverageRegex, coverageBlock);
  } else if (markdown.includes("### Kết luận")) {
    markdown = markdown.replace("### Kết luận", coverageBlock + "### Kết luận");
  } else {
    markdown += "\n\n" + coverageBlock;
  }

  fs.writeFileSync(filePath, markdown, "utf8");
}

function main() {
  if (!fs.existsSync(DOC_DIR)) {
    console.error("Không tìm thấy thư mục docs:");
    console.error(DOC_DIR);
    process.exit(1);
  }

  const files = fs
    .readdirSync(DOC_DIR)
    .filter((file) => file.endsWith(".md"))
    .filter((file) => file !== "README.md");

  const results = [];

  for (const file of files) {
    const filePath = path.join(DOC_DIR, file);
    const markdown = fs.readFileSync(filePath, "utf8");

    const targetSet = getTargetTags(markdown);
    const coveredSet = getCoveredTags(markdown);

    const targetTags = [...targetSet].sort();
    const coveredTags = [...coveredSet]
      .filter((tag) => targetSet.has(tag))
      .sort();

    const missingTags = targetTags.filter((tag) => !coveredSet.has(tag)).sort();

    const result = {
      file,
      targetTags,
      coveredTags,
      missingTags,
      targetCount: targetTags.length,
      coveredCount: coveredTags.length,
      coverage: percent(coveredTags.length, targetTags.length),
    };

    results.push(result);

    if (SHOULD_WRITE_TO_MD) {
      updateMarkdownFile(filePath, buildCoverageBlock(result));
    }
  }

  const totalTarget = results.reduce((sum, item) => sum + item.targetCount, 0);
  const totalCovered = results.reduce(
    (sum, item) => sum + item.coveredCount,
    0,
  );

  let report = `# Black-box API Tag Coverage Report

## 1. Tổng quan

| Chỉ số | Kết quả |
|---|---:|
| Tổng số file .md | ${results.length} |
| Tổng tag mục tiêu | ${totalTarget} |
| Tổng tag đã cover | ${totalCovered} |
| Overall tag coverage | ${percent(totalCovered, totalTarget)} |

## 2. Chi tiết từng file

| File | Tag mục tiêu | Tag đã cover | Tag chưa cover | Coverage |
|---|---:|---:|---|---:|
`;

  for (const item of results) {
    report += `| \`${item.file}\` | ${item.targetCount} | ${item.coveredCount} | ${item.missingTags.join(", ") || "Không có"} | ${item.coverage} |\n`;
  }

  report += `

## 3. Ghi chú

Đây là **Black-box tag coverage**, không phải code coverage.

- Tag mục tiêu được lấy từ bảng lớp tương đương.
- Tag đã cover được lấy từ bảng test case có kết quả Pass.
- Những test case ghi "Chưa chạy" hoặc "Chưa có trong file hiện tại" không được tính là đã cover.
`;

  fs.mkdirSync(path.dirname(REPORT_FILE), { recursive: true });
  fs.writeFileSync(REPORT_FILE, report, "utf8");

  console.log("Đã tính xong Black-box tag coverage.");
  console.log("");
  console.log("Report:");
  console.log(REPORT_FILE);

  if (SHOULD_WRITE_TO_MD) {
    console.log("");
    console.log(
      "Đã tự động thêm mục 5. Độ bao phủ kiểm thử vào từng file .md.",
    );
  }
}

main();
