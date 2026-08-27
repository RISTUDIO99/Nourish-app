const fs = require("fs");
const { IOSConfig, withFinalizedMod } = require("expo/config-plugins");

const APS_ENVIRONMENT_ENTRY =
  /\s*<key>aps-environment<\/key>\s*<string>[^<]*<\/string>/g;

module.exports = function withNoPushEntitlement(config) {
  return withFinalizedMod(config, [
    "ios",
    async (finalConfig) => {
      const entitlementPaths = IOSConfig.Paths.getAllEntitlementsPaths(
        finalConfig.modRequest.projectRoot,
      );

      for (const entitlementPath of entitlementPaths) {
        const original = fs.readFileSync(entitlementPath, "utf8");
        const updated = original.replace(APS_ENVIRONMENT_ENTRY, "");

        if (updated.includes("<key>aps-environment</key>")) {
          throw new Error(
            `Unable to remove aps-environment from ${entitlementPath}`,
          );
        }

        if (updated !== original) {
          fs.writeFileSync(entitlementPath, updated);
        }
      }

      return finalConfig;
    },
  ]);
};