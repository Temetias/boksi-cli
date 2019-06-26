import arg from "arg";
import inquirer from "inquirer";
import { createBlok } from "./create-blok";
import { init } from "./init";

const helpPrint = () => {
	console.group("\nCommands:\n");
	console.log("init            Initiates a new Boksi.");
	console.log("create-blok     Creates a new blok under this directory.");
	console.log("help            Displays this help page.");
	console.groupEnd();
	console.group("\nArguments:\n");
	console.log("-s, --silent    Silences the console logs of the command.");
};

const version = () => {
	console.log("boksi-cli v0.0.0");
};

export const cli = async args => {
	switch (args[2]) {
		case "init":
			await init(args);
			break;
		case "create-blok":
			await createBlok(args);
			break;
		case "-h":
			helpPrint();
			break;
		case "--help":
			helpPrint();
			break;
		case "help":
			helpPrint();
			break;
		default:
			version();
			break;
	}
};