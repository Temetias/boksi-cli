import arg from "arg";
import { cwd } from "process";
import inquirer from "inquirer";
import { join } from "path";
import { mkdirSync, writeFileSync, createWriteStream } from "fs";
import { get } from "https";
import rimraf from "rimraf";

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
		default: join(cwd(), "/boksi"),
	});
	questions.push({
		type: "input",
		name: "bloksDir",
		message: "Under which directory are the bloks for Boksi?",
		default: join(cwd(), "/boksi" , "/bloks"),
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
			default: join(cwd(), "/boksi", "/logs"),
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
		conf: {
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
		},
	};
};

const createBoksiDirs = (dir, bloksDir, logDir) => {
	console.log(`Creating a directory for boksi core under "${dir}`);
	mkdirSync(dir);
	console.log(`Creating the blok directory under ${bloksDir}`);
	mkdirSync(bloksDir);
	console.log(`Creating a logging directory under ${logDir}`);
	mkdirSync(logDir);
};

const writeConfigs = (dir, boksiConf) => {
	console.log(`Writing the config file under ${join(dir, "/boksi-conf.json")}`)
	writeFileSync(join(dir, "/boksi-conf.json"), JSON.stringify(boksiConf));
};

const downloadFiles = () => {
	return new Promise((resolve, reject) => {
		console.log("Fetching core from https://api.github.com/repos/Temetias/boksi-core/tarball");
		try {
			const file = createWriteStream(join(cwd(), "/tmp", "/boksi.zip"));
			get("https://api.github.com/repos/Temetias/boksi-core/zipball", { gzip: true }, response => {
				response.pipe(file);
				file.on("finish", () => {
					file.close();
					resolve();
				});
			});
		} catch (e) {
			reject(e)
		}
	});
}

export const init = async args => {
	console.log("\nInitiating a new Boksi:\n");
	let options = parseArgumentsIntoOptions(args);
	options = await promptMissingOptions(options);

	console.log("\n\nBuild started! This might take a moment.\n");
	// Create temp.
	mkdirSync(join(cwd(), "/tmp"));

	// Create dirs
	createBoksiDirs(options.boksiDir, options.conf.boksiConf.bloksDir , options.conf.boksiConf.logDir);

	// Write configs
	writeConfigs(options.boksiDir, options.conf);

	// Download files
	await downloadFiles();

	// Clean temp.
	console.log("Cleaning up...");
	//rimraf.sync(join(cwd(), "/tmp"));
};
