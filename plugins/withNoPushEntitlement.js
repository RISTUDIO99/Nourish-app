// Removes the aps-environment (remote push) entitlement that expo-notifications
// adds during prebuild. Nourish only uses LOCAL scheduled notifications (daily
// tracker reminder), which do not require APNs. Without this, the App Store
// provisioning profile must include the Push Notifications capability, which
// it does not — causing XCODE_BUILD_ERROR at signing.
const { withEntitlementsPlist } = require("expo/config-plugins");

module.exports = function withNoPushEntitlement(config) {
  return withEntitlementsPlist(config, (c) => {
    delete c.modResults["aps-environment"];
    return c;
  });
};
