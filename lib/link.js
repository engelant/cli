const ora = require('ora');

const TuyaLink = require('@tuyapi/link').wizard;

const c = require('./common');

function link(config, options) {
	// Check arguments
	if (!options.ssid || !options.password) {
		c.badArgument(options);
	}

	if ((!options.apiKey && !config.get('apiKey')) || (!options.apiSecret && !config.get('apiSecret'))) {
		c.badArgument(options);
	}

	// Save API parameters
	if (options.saveAPI) {
		config.set('apiKey', options.apiKey);
		config.set('apiSecret', options.apiSecret);
	}

	// Set API parameters
	if (!options.apiKey) {
		options.apiKey = config.get('apiKey');
	}

	if (!options.apiSecret) {
		options.apiSecret = config.get('apiSecret');
	}

	// Start linking process
	const link = new TuyaLink({apiKey: options.apiKey,
		apiSecret: options.apiSecret,
		email: 'johndoe@example.com',
		password: 'examplepassword'});

	const spinner = ora('Registering devices(s)...').start();

	link.init().then(() => {
		link.linkDevice({ssid: options.ssid, wifiPassword: options.password, devices: options.num}).then(devices => {
			spinner.succeed('Device(s) registered!');

			// Save devices to config
			if (options.save) {
				for (const device of devices) {
					config.set(device.id, device.localKey);
				}
			}

			return console.log(devices);
		}).catch(err => {
			spinner.fail('Device(s) failed to be registered!');
			console.log(err);
		});
	}).catch(err => {
		spinner.fail('Device(s) failed to be registered!');
		console.log(err);
	});
}

module.exports = link;
