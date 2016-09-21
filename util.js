var _ = require('underscore');
var promise = require("promise");

module.exports = {
	/**
	 * try executing a function
	 * @param f: function to be executed
	 */
	try: function(f){
		return new Promise(f);
	}
};