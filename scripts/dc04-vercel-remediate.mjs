import { execFileSync } from "node:child_process";
import { copyFileSync, mkdirSync, readFileSync } from "node:fs";

function run(args) {
  execFileSync("npm", args, { stdio: "inherit" });
}

console.log("[dc04] upgrading Next runtime dependency");
run(["install", "--save-exact", "next@16.3.2"]);

console.log("[dc04] upgrading build dependencies");
run(["install", "--save-dev", "--save-exact", "eslint-config-next@16.3.2", "postcss@8.5.26"]);

console.log("[dc04] applying non-breaking transitive audit fixes");
run(["audit", "fix"]);

const pkg = JSON.parse(readFileSync("package.json", "utf8"));
if (pkg.dependencies?.next !== "16.3.2") {
  throw new Error("next_not_runtime_16_3_2");
}
if (pkg.dependencies?.postcss || pkg.dependencies?.["eslint-config-next"]) {
  throw new Error("build_dependencies_moved_to_runtime");
}
if (pkg.devDependencies?.postcss !== "8.5.26") {
  throw new Error("postcss_not_dev_8_5_26");
}
if (pkg.devDependencies?.["eslint-config-next"] !== "16.3.2") {
  throw new Error("eslint_config_next_not_dev_16_3_2");
}

console.log("[dc04] enforcing zero high-severity audit findings");
run(["audit", "--omit=dev", "--audit-level=high"]);
run(["audit", "--audit-level=high"]);

mkdirSync("public", { recursive: true });
copyFileSync("package.json", "public/__dc04-package.json");
copyFileSync("package-lock.json", "public/__dc04-package-lock.json");

console.log("[dc04] remediation artifacts staged for preview verification");
