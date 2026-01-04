import { Command } from "commander";
import prompts from "prompts";
import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";

export const newCommand = new Command()
    .command("new [name]")
    .description("Create a new Resty project")
    .action(async (name) => {
        let projectName = name;

        if (!projectName) {
            const response = await prompts({
                type: "text",
                name: "value",
                message: "Project name:",
                initial: "my-resty-app"
            });
            projectName = response.value;
        }

        if (!projectName) {
            console.log("Operation cancelled");
            return;
        }

        const targetDir = path.resolve(process.cwd(), projectName);
        if (fs.existsSync(targetDir)) {
            console.error(`Directory ${projectName} already exists`);
            return;
        }

        console.log(`Creating project in ${targetDir}...`);

        const __dirname = path.dirname(fileURLToPath(import.meta.url));
        let templatePath = path.resolve(__dirname, "../templates/basic");

        // Check if we are in dev/src environment
        if (!fs.existsSync(templatePath)) {
            templatePath = path.resolve(__dirname, "../../templates/basic");
        }

        if (!fs.existsSync(templatePath)) {
            console.error("Template not found at", templatePath);
            return;
        }

        fs.copySync(templatePath, targetDir);

        // Rename gitignore to .gitignore
        const gitignorePath = path.join(targetDir, "gitignore");
        if (fs.existsSync(gitignorePath)) {
            fs.renameSync(gitignorePath, path.join(targetDir, ".gitignore"));
        }

        console.log("Project created successfully!");
        console.log(`\ncd ${projectName}\nnpm install\nnpm run dev`);
    });
