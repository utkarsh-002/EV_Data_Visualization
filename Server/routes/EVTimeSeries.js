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
      multipleStatements: true,
    },
  }
);

router.get("/", async (req, res) => {
  try {
    // SQL statement to create the stored procedure
    const createTimeSeriesProcedure = `
      DROP PROCEDURE IF EXISTS createTimeSeriesProcedure;
      CREATE PROCEDURE createTimeSeriesProcedure()
      BEGIN
        DROP TABLE IF EXISTS ev_timeSeries;
        CREATE TABLE IF NOT EXISTS ev_timeSeries (
          State VARCHAR(255),
          Year INT,
          \`Vehicle Category\` VARCHAR(255),
          Electric INT,
          Total INT
        );
        INSERT INTO ev_timeSeries (State, Year, \`Vehicle Category\`, Electric, Total)
        SELECT State, Year, \`Vehicle Category\`, SUM(\`ELECTRIC(BOV)\`) AS Electric, SUM(\`Total\`) AS Total
        FROM ev_data
        WHERE \`Year\` BETWEEN 2014 AND 2024
        GROUP BY State, \`Vehicle Category\`, Year;
      END;
    `;

    const pivotProcedure = `
        DROP PROCEDURE IF EXISTS pivotProcedure;
        CREATE PROCEDURE pivotProcedure()
        BEGIN
          CREATE TABLE IF NOT EXISTS ev_timeSeries_pivot (
            State VARCHAR(255),
            \`2014\` INT,
            \`2015\` INT,
            \`2016\` INT,
            \`2017\` INT,
            \`2018\` INT,
            \`2019\` INT,
            \`2020\` INT,
            \`2021\` INT,
            \`2022\` INT,
            \`2023\` INT,
            \`2024\` INT
            );
        INSERT INTO ev_timeSeries_pivot (State, \`2014\`, \`2015\`, \`2016\`, \`2017\`, \`2018\`, \`2019\`, \`2020\`, \`2021\`, \`2022\`, \`2023\`, \`2024\`)
        SELECT State, SUM(CASE WHEN YEAR = 2014 THEN Electric ELSE 0 END) AS \`2014\`,
        SUM(CASE WHEN YEAR = 2015 THEN Electric ELSE 0 END) AS \`2015\`,
        SUM(CASE WHEN YEAR = 2016 THEN Electric ELSE 0 END) AS \`2016\`,
        SUM(CASE WHEN YEAR = 2017 THEN Electric ELSE 0 END) AS \`2017\`,
        SUM(CASE WHEN YEAR = 2018 THEN Electric ELSE 0 END) AS \`2018\`,
        SUM(CASE WHEN YEAR = 2019 THEN Electric ELSE 0 END) AS \`2019\`,
        SUM(CASE WHEN YEAR = 2020 THEN Electric ELSE 0 END) AS \`2020\`,
        SUM(CASE WHEN YEAR = 2021 THEN Electric ELSE 0 END) AS \`2021\`,
        SUM(CASE WHEN YEAR = 2022 THEN Electric ELSE 0 END) AS \`2022\`,
        SUM(CASE WHEN YEAR = 2023 THEN Electric ELSE 0 END) AS \`2023\`,
        SUM(CASE WHEN YEAR = 2024 THEN Electric ELSE 0 END) AS \`2024\`
        FROM ev_timeSeries
        GROUP BY State;
        END;
    `;

    const timeSeriesPenetration = `
        DROP PROCEDURE IF EXISTS timeSeriesPenetration;
        CREATE PROCEDURE timeSeriesPenetration()
        BEGIN
          CREATE TABLE IF NOT EXISTS temp_table AS
            SELECT State, Year, SUM(Electric) AS Electric, SUM(Total) AS Total
            FROM ev_timeSeries
            GROUP BY State, Year;  
          DROP TABLE IF EXISTS ev_timeSeries_penetration;
          CREATE TABLE IF NOT EXISTS ev_timeSeries_penetration (
            State VARCHAR(255),
            Year INT,
            Penetration DECIMAL(5, 2)
          );
          INSERT INTO ev_timeSeries_penetration (State, Year, Penetration)
          SELECT State, Year, (Electric / Total) * 100 AS Penetration
          FROM temp_table;
          DROP TABLE temp_table;
        END;
    `;

    const query = req.query;
    console.log(query.query);
    if (query.query === "pivot") {
      await sequelize.query(pivotProcedure, {
        type: Sequelize.QueryTypes.RAW,
      });

      await sequelize.query("CALL pivotProcedure", {
        type: Sequelize.QueryTypes.RAW,
      });

      const results = await sequelize.query(
        "SELECT * FROM ev_timeSeries_pivot",
        {
          type: Sequelize.QueryTypes.SELECT,
        }
      );
      res.json(results);
      return;
    } else if (query.query === "penetration") {
        await sequelize.query(timeSeriesPenetration, {
            type: Sequelize.QueryTypes.RAW,
        });
    
        await sequelize.query("CALL timeSeriesPenetration", {
            type: Sequelize.QueryTypes.RAW,
        });
    
        const results = await sequelize.query(
            "SELECT * FROM ev_timeSeries_penetration",
            {
            type: Sequelize.QueryTypes.SELECT,
            }
        );
        res.json(results);
        return;
    }

    // Execute the SQL statement
    await sequelize.query(createTimeSeriesProcedure, {
      type: Sequelize.QueryTypes.RAW,
    });

    await sequelize.query("CALL createTimeSeriesProcedure", {
      type: Sequelize.QueryTypes.RAW,
    });

    const results = await sequelize.query("SELECT * FROM ev_timeSeries", {
      type: Sequelize.QueryTypes.SELECT,
    });
    // console.log(results);
    res.json(results);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
