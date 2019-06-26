import arg from "arg";
import { cwd } from "process";
import inquirer from "inquirer";
import { join } from "path";

const parseArgumentsIntoOptions = rawArgs => {
	const args = arg(
		{
			"--advanced": Boolean,
			"-a": "--advanced",
		},
		{
			argv: rawArgs.slice(2),
		},
	);
	return {
		advanced: args["--advanced"] || false,
	};
};

const promptMissingOptions = async options => {
	const questions = [];
	questions.push({
		type: "input",
		name: "boksiDir",
		message: "Initialize boksi under which directory?",
		default: cwd(),
	});
	questions.push({
		type: "input",
		name: "bloksDir",
		message: "Under which directory are the bloks for Boksi?",
		default: join(cwd(), "/bloks"),
	});
	questions.push({
		type: "confirm",
		name: "serverEnable",
		message: "Enable Boksi server?",
		default: true,
	});
	questions.push({
		type: "confirm",
		name: "uiEnable",
		message: "Enable with locally hosted Boksi Web-UI?",
		default: true,
	});
	if (options.advanced) {
		questions.push({
			type: "input",
			name: "logDir",
			message: "Where should boksi save log files?",
			default: join(cwd(), "/logs"),
		});
		questions.push({
			type: "number",
			name: "terminationPostpone",
			message: "In case of Boksi shutdown failing, how much time (ms) should pass before forced termination?",
			default: 4000,
		});
	}
	const answers = await inquirer.prompt(questions);
	return {
		...options,
		boksiDir: answers.boksiDir,
		boksiConf: {
			server: {
				enable: answers.serverEnable,
				port: 8080,
				devPort: 8080,
			},
			ui: {
				enable: answers.uiEnable,
				port: 3001,
			},
			bloksDir: answers.bloksDir,
			terminationPostpone: answers.terminationPostpone || 4000,
			logDir: answers.logDir || join(answers.boksiDir, "/logs"),
		},
	};
};

export const init = async args => {
	console.log("\nInitiating a new Boksi:\n");
	let options = parseArgumentsIntoOptions(args);
	options = await promptMissingOptions(options);
};