const express = require('express');
const router = express.Router();
const { Sequelize } = require("sequelize");
const config = require("../config/config.json").development;

// Set up Sequelize connection
const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  {
    host: config.host,
    dialect: config.dialect
  }
);

router.use(express.json());
router.get("/", async (req, res) => {
  try {
    const { year, month, vehicleCategory, vehicleType } = req.body;

//    const query = `
//   SELECT State, \`Vehicle Category\`, SUM(Total) AS Total, SUM(\`ELECTRIC(BOV)\`) AS Electric
//   FROM ev_data
//   WHERE \`Year\` = :year
//     AND \`Month_name\` = :month
//     AND \`Vehicle Category\` = :vehicleCategory
//     AND \`Vehicle Type\` = :vehicleType
//   GROUP BY State, \`Vehicle Category\`
// `;

    let query = `
      SELECT State, \`Vehicle Category\`, SUM(Total) AS Total, SUM(\`ELECTRIC(BOV)\`) AS Electric
      FROM ev_data
      WHERE 1=1
    `;

    const replacements = {};

    if (year) {
      query += " AND `Year` = :year";
      replacements.year = year;
    }
    if (month) {
      query += " AND `Month_name` = :month";
      replacements.month = month;
    }
    if (vehicleCategory) {
      query += " AND `Vehicle Category` = :vehicleCategory";
      replacements.vehicleCategory = vehicleCategory;
    }
    if (vehicleType) {
      query += " AND `Vehicle Type` = :vehicleType";
      replacements.vehicleType = vehicleType;
    }

    query += " GROUP BY State, `Vehicle Category`";
    
    const results = await sequelize.query(query, {
      replacements: { year, month, vehicleCategory, vehicleType },
      type: Sequelize.QueryTypes.SELECT,
    });

    res.json(results);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
