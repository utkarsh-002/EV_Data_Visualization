const express = require("express");
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
    dialect: config.dialect,
    dialectOptions: {
      multipleStatements: true
    }
  }
);

router.get("/", async (req, res) => {
  try {
    // SQL statement to create the stored procedure
    const createStatewiseProcedureSQL = `
      DROP PROCEDURE IF EXISTS CreateEvStatewiseTable;
      CREATE PROCEDURE CreateEvStatewiseTable()
      BEGIN
        DROP TABLE IF EXISTS ev_statewise;
        CREATE TABLE IF NOT EXISTS ev_statewise (
          State VARCHAR(255),
          \`Vehicle Category\` VARCHAR(255),
          Electric INT,
          Total INT,
          Ratio DECIMAL(10, 4)
        );
        INSERT INTO ev_statewise (State, \`Vehicle Category\`, Electric, Total, Ratio)
        SELECT State, \`Vehicle Category\`, SUM(\`ELECTRIC(BOV)\`) AS Electric, SUM(Total) AS Total,
        CAST(SUM(\`ELECTRIC(BOV)\`) / SUM(Total) AS DECIMAL(10, 4)) AS Ratio
        FROM ev_data
        WHERE \`Year\` BETWEEN 2014 AND 2024
        GROUP BY State, \`Vehicle Category\`;
      END;
    `;

    // Execute the SQL statement
    await sequelize.query(createStatewiseProcedureSQL, {
      type: Sequelize.QueryTypes.RAW,
    });

    await sequelize.query("CALL CreateEvStatewiseTable", {
      type: Sequelize.QueryTypes.RAW,
    });

    const results = await sequelize.query("SELECT * FROM ev_statewise", {
      type: Sequelize.QueryTypes.SELECT,
    });
    // console.log(results);
    res.send(results);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
