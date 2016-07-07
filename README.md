# psv2json
Convert psv (pipe separated) files to json.

Note that the output will not be enclosed in [ ] so it won't be parseable (unless there was only one line of data in the input file!).
This is on purpose because the primary goal is to create a file that is compatible with the mongoimport utility.  

## Usage
	const psv2json = require('psv2json');

	let psvStream = fs.createReadStream('my/psv/file', { encoding: 'utf8' });
	let jsonStream = fs.createWriteStream('my/json/file');

	psvStream.pipe(psv2json()).pipe(jsonStream);
