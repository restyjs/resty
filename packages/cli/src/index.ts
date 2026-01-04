import { Command } from "commander";
import { devCommand } from "./commands/dev";
import { newCommand } from "./commands/new";

const program = new Command();

program
    .name("resty")
    .description("Resty.js CLI tool")
    .version("1.0.0");

program.addCommand(devCommand);
program.addCommand(newCommand);

program.parse(process.argv);
