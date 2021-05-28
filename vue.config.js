module.exports = {
  pluginOptions: {
    electronBuilder: {
      nodeIntegration: true,
      builderOptions: {
        productName: "佰佳购物",
        extraFiles: [
          {
            from: "platform-tools",
            to: "platform-tools",
            filter: ["**/*"],
          },
          {
            from: "logo",
            to: "logo",
            filter: ["**/*"],
          },
        ],
        linux: {
          category: "Utility",
        },
        win: {
          requestedExecutionLevel: "highestAvailable",
        },
        nsis: {
          deleteAppDataOnUninstall: true,
        },
      },
    },
  },
};
