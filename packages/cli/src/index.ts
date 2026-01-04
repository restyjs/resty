import { Command } from "commander";
import { devCommand } from "./commands/dev";

const program = new Command();

program
    .name("resty")
    .description("Resty.js CLI tool")
    .version("1.0.0");

program.addCommand(devCommand);

program.parse(process.argv);
