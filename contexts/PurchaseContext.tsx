import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { Platform } from "react-native";
import Purchases, {
  CustomerInfo,
  LOG_LEVEL,
  PurchasesPackage,
} from "react-native-purchases";
import { DEV_MODE_KEY } from "@/constants/keys";
import { useAuth } from "@/contexts/AuthContext";

export type PurchaseTier = null | "essentials" | "pro" | "founder" | "legacy";

type PurchaseContextType = {
  tier: PurchaseTier;
  isPurchased: boolean;
  customerInfo: CustomerInfo | null;
  packages: PurchasesPackage[];
  isLoading: boolean;
  packagesError: boolean;
  devMode: boolean;
  purchasePackage: (pkg: PurchasesPackage) => Promise<void>;
  restorePurchases: () => Promise<boolean>;
  goToCheckout: () => void;
  refreshPackages: () => Promise<void>;
  toggleDevMode: () => Promise<void>;
};

const PurchaseContext = createContext<PurchaseContextType>({
  tier: null,
  isPurchased: false,
  customerInfo: null,
  packages: [],
  isLoading: true,
  packagesError: false,
  devMode: false,
  purchasePackage: async () => {},
  restorePurchases: async () => false,
  goToCheckout: () => {},
  refreshPackages: async () => {},
  toggleDevMode: async () => {},
});


const RC_API_KEY_IOS = "appl_PcKdCpdlcNqYdcPDgxYtfLuMWTY";
const RC_API_KEY_ANDROID = "goog_dDpYvBqEuPOKHQGOlqIoYqTiFiB";

function tierFromCustomerInfo(info: CustomerInfo | null): PurchaseTier {
  if (!info) return null;
  const active = info.entitlements.active;
  if (active["legacy"]) return "legacy";
  if (active["founder"]) return "founder";
  if (active["pro"]) return "pro";
  if (active["essentials"]) return "essentials";
  return null;
}

export function PurchaseProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
  const [packages, setPackages] = useState<PurchasesPackage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [packagesError, setPackagesError] = useState(false);
  const [rcReady, setRcReady] = useState(false);
  const [devMode, setDevMode] = useState(false);
  const prevUserIdRef = useRef<string | null>(null);

  // Load persisted dev mode on startup
  useEffect(() => {
    AsyncStorage.getItem(DEV_MODE_KEY).then((val) => {
      if (val === "true") setDevMode(true);
    });
  }, []);

  // Sync auth identity to RevenueCat so each user sees their own entitlements
  useEffect(() => {
    if (Platform.OS === "web") return;
    if (!rcReady) return;

    const currentId = user?.id ?? null;
    if (currentId === prevUserIdRef.current) return;
    prevUserIdRef.current = currentId;

    const syncIdentity = async () => {
      try {
        if (currentId) {
          const { customerInfo: info } = await Purchases.logIn(currentId);
          setCustomerInfo(info);
        } else {
          const info = await Purchases.logOut();
          setCustomerInfo(info);
        }
      } catch (e) {
        console.warn("RevenueCat identity sync error:", e);
        // Fallback: fetch fresh customer info without switching identity
        try {
          const info = await Purchases.getCustomerInfo();
          setCustomerInfo(info);
        } catch {}
      }
    };

    syncIdentity();
  }, [user?.id, rcReady]);

  const toggleDevMode = useCallback(async () => {
    const next = !devMode;
    setDevMode(next);
    await AsyncStorage.setItem(DEV_MODE_KEY, next ? "true" : "false");
  }, [devMode]);

  const loadPackages = useCallback(async () => {
    try {
      setPackagesError(false);
      const offerings = await Purchases.getOfferings();
      const pkgs = offerings.current?.availablePackages ?? [];
      setPackages(pkgs);
      if (pkgs.length === 0) {
        // No packages returned — treat as a soft error so UI can show retry
        setPackagesError(true);
      }
    } catch (e) {
      console.warn("RevenueCat offerings error:", e);
      setPackagesError(true);
    }
  }, []);

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
        if (isMounted) {
          setCustomerInfo(info);
          setRcReady(true);
        }

        // Load offerings separately so a failure doesn't block customer info
        try {
          const offerings = await Purchases.getOfferings();
          const pkgs = offerings.current?.availablePackages ?? [];
          if (isMounted) {
            setPackages(pkgs);
            if (pkgs.length === 0) setPackagesError(true);
          }
        } catch (offeringsErr) {
          console.warn("RevenueCat offerings error:", offeringsErr);
          if (isMounted) setPackagesError(true);
        }

        Purchases.addCustomerInfoUpdateListener((updatedInfo) => {
          if (isMounted) setCustomerInfo(updatedInfo);
        });
      } catch (e) {
        console.warn("RevenueCat init error:", e);
        if (isMounted) setPackagesError(true);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    init();
    return () => {
      isMounted = false;
    };
  }, []);

  const refreshPackages = useCallback(async () => {
    setIsLoading(true);
    try {
      await loadPackages();
    } finally {
      setIsLoading(false);
    }
  }, [loadPackages]);

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

  const rcTier = tierFromCustomerInfo(customerInfo);
  const tier: PurchaseTier = devMode ? "legacy" : rcTier;

  return (
    <PurchaseContext.Provider
      value={{
        tier,
        isPurchased: tier !== null,
        customerInfo,
        packages,
        isLoading,
        packagesError,
        devMode,
        purchasePackage,
        restorePurchases,
        goToCheckout,
        refreshPackages,
        toggleDevMode,
      }}
    >
      {children}
    </PurchaseContext.Provider>
  );
}

export function usePurchase() {
  return useContext(PurchaseContext);
}
