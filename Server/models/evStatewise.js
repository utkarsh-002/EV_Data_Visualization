module.exports = (sequelize, DataTypes) => {
    const EvStatewise = sequelize.define(
      "EvStatewise",
      {
        State: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        "Vehicle Category": {
          type: DataTypes.STRING,
          allowNull: false,
        },
        Total: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        Electric: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
      },
      {
        tableName: "ev_data",
        timestamps: false,
      }
    );
  
    return EvStatewise;
}