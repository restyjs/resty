import { Command } from "commander";
import chokidar from "chokidar";
import { spawn, ChildProcess } from "child_process";
import pc from "picocolors";
import path from "path";

export const devCommand = new Command("dev")
    .description("Start development server with hot reload")
    .action(async () => {
        console.log(pc.blue("ℹ"), pc.cyan("Starting Resty development server..."));

        // Default to src/index.ts for now
        // In future, read resty.json or package.json
        const entryPoint = path.join(process.cwd(), "src", "index.ts");

        let child: ChildProcess | null = null;

        const startApp = () => {
            if (child) {
                child.kill();
            }

            // Use tsx for execution
            child = spawn("npx", ["tsx", entryPoint], {
                stdio: "inherit",
                shell: true,
                env: {
                    ...process.env,
                    NODE_ENV: "development",
                    RESTY_DEBUG: "true" // Enable debug mode by default in dev
                }
            });

            child.on("error", (err) => {
                console.error(pc.red(`[resty] Failed to start app: ${err.message}`));
            });
        };

        const watcher = chokidar.watch("src/**/*.{ts,js,json}", {
            ignoreInitial: true,
            ignored: ["**/node_modules/**", "**/.git/**", "**/dist/**"]
        });

        watcher.on("all", (event, filePath) => {
            console.log(pc.dim(`[resty] File changed: ${path.relative(process.cwd(), filePath)}`));
            console.log(pc.yellow("↻"), "Restarting...");
            startApp();
        });

        startApp();

        process.on("SIGINT", () => {
            if (child) child.kill();
            process.exit();
        });
    });
