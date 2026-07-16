import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { Platform } from "react-native";
import Purchases, {
  CustomerInfo,
  LOG_LEVEL,
  PurchasesPackage,
} from "react-native-purchases";

export type PurchaseTier = null | "essentials" | "pro" | "founder";

type PurchaseContextType = {
  tier: PurchaseTier;
  isPurchased: boolean;
  customerInfo: CustomerInfo | null;
  packages: PurchasesPackage[];
  isLoading: boolean;
  purchasePackage: (pkg: PurchasesPackage) => Promise<void>;
  restorePurchases: () => Promise<boolean>;
  goToCheckout: () => void;
};

const PurchaseContext = createContext<PurchaseContextType>({
  tier: null,
  isPurchased: false,
  customerInfo: null,
  packages: [],
  isLoading: true,
  purchasePackage: async () => {},
  restorePurchases: async () => false,
  goToCheckout: () => {},
});


const RC_API_KEY_IOS = "appl_PcKdCpdlcNqYdcPDgxYtfLuMWTY";
const RC_API_KEY_ANDROID = "goog_dDpYvBqEuPOKHQGOlqIoYqTiFiB";

function tierFromCustomerInfo(info: CustomerInfo | null): PurchaseTier {
  if (!info) return null;
  const active = info.entitlements.active;
  if (active["founder"]) return "founder";
  if (active["pro"]) return "pro";
  if (active["essentials"]) return "essentials";
  return null;
}

export function PurchaseProvider({ children }: { children: React.ReactNode }) {
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
  const [packages, setPackages] = useState<PurchasesPackage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [rcReady, setRcReady] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const init = async () => {
      try {
        if (Platform.OS === "web") {
          setIsLoading(false);
          return;
        }
        const apiKey =
          Platform.OS === "android" ? RC_API_KEY_ANDROID : RC_API_KEY_IOS;
        Purchases.setLogLevel(LOG_LEVEL.DEBUG);
        Purchases.configure({ apiKey });

        const info = await Purchases.getCustomerInfo();
        const offerings = await Purchases.getOfferings();
        const pkgs = offerings.current?.availablePackages ?? [];

        if (isMounted) {
          setCustomerInfo(info);
          setPackages(pkgs);
          setRcReady(true);
        }

        Purchases.addCustomerInfoUpdateListener((updatedInfo) => {
          if (isMounted) setCustomerInfo(updatedInfo);
        });
      } catch (e) {
        console.warn("RevenueCat init error:", e);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    init();
    return () => {
      isMounted = false;
    };
  }, []);

  const purchasePackage = useCallback(
    async (pkg: PurchasesPackage): Promise<void> => {
      const result = await Purchases.purchasePackage(pkg);
      setCustomerInfo(result.customerInfo);
    },
    []
  );

  const restorePurchases = useCallback(async (): Promise<boolean> => {
    const info = await Purchases.restorePurchases();
    setCustomerInfo(info);
    const restoredTier = tierFromCustomerInfo(info);
    return restoredTier !== null;
  }, []);

  const goToCheckout = useCallback(() => {
    router.push("/checkout");
  }, []);

  const tier = tierFromCustomerInfo(customerInfo);

  return (
    <PurchaseContext.Provider
      value={{
        tier,
        isPurchased: tier !== null,
        customerInfo,
        packages,
        isLoading,
        purchasePackage,
        restorePurchases,
        goToCheckout,
      }}
    >
      {children}
    </PurchaseContext.Provider>
  );
}

export function usePurchase() {
  return useContext(PurchaseContext);
}
