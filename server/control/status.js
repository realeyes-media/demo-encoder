exports.statusObject = {};

exports.updateStatusObject = function(inputURI, status) {
	if (!exports.statusObject[inputURI]) {
		exports.statusObject[inputURI] = '';
	}

	exports.statusObject[inputURI] = status;

}