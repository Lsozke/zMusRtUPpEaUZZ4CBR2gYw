'use strict';

/**
 * Define the logic for a job to exit from scraping
 */
let ExitStrategy = {};

/**
 * Determine the exiting state of a job
 * @param {number} maxSuccess
 * @param {number} maxFail
 * @param {number} successCount
 * @param {number} failCount
 * @returns {number} 0:Not Exit, 1:Exit Normally, -1:Exit with Error
 */
ExitStrategy.shouldExit = (maxSuccess, maxFail, successCount, failCount) => {
	if (failCount >= maxFail) {
		return -1;
	} else if (successCount >= maxSuccess) {
		return 1;
	} else {
		return 0;
	}
};

module.exports = ExitStrategy;
