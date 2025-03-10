const csv = require("fast-csv");
const fs = require("fs");
const { logger } = require("./logger");

/**
 * Parse a CSV file and return an array of objects
 * @param {string} filePath - Path to the CSV file
 * @param {Object} options - CSV parsing options
 * @returns {Promise<Array>} - Array of objects representing CSV rows
 */
const parseCSV = (filePath, options = {}) => {
  return new Promise((resolve, reject) => {
    const data = [];

    if (!fs.existsSync(filePath)) {
      return reject(new Error(`File not found: ${filePath}`));
    }

    fs.createReadStream(filePath)
      .pipe(
        csv.parse({
          headers: true,
          ...options,
        })
      )
      .on("error", (error) => {
        logger.error(`Error parsing CSV: ${error.message}`);
        reject(error);
      })
      .on("data", (row) => {
        data.push(row);
      })
      .on("end", () => {
        logger.info(`CSV parsed successfully: ${data.length} rows`);
        resolve(data);
      });
  });
};

module.exports = { parseCSV };
