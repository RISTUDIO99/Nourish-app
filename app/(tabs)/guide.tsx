import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Image,
  Linking,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { usePurchase } from "@/contexts/PurchaseContext";
import { foodReference, shoppingList } from "@/data/plans";
import { TEMPLATE_ITEMS } from "@/data/templates";

type TabKey = "foods" | "shopping" | "templates" | "tracking";

type CustomItem = { id: string; category: string; item: string; why: string };
type CheckedMap = Record<string, boolean>;
type DeletedSet = string[];

const CHECKED_KEY = "nourish:shopping:checked";
const CUSTOM_KEY = "nourish:shopping:custom";
const DELETED_KEY = "nourish:shopping:deleted";

export default function GuideScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : 0;
  const { tier, goToCheckout } = usePurchase();
  const hasTemplates = tier === "pro" || tier === "founder" || tier === "legacy";
  const [activeTab, setActiveTab] = useState<TabKey>("foods");
  const [profileName, setProfileName] = useState<string | null>(null);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);

  useEffect(() => {
    AsyncStorage.getItem("nourish:user:profile:v1").then((raw) => {
      if (raw) {
        const p = JSON.parse(raw);
        if (p.name) setProfileName(p.name);
        if (p.photoUri) setProfilePhoto(p.photoUri);
      }
    });
  }, []);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const [checked, setChecked] = useState<CheckedMap>({});
  const [customItems, setCustomItems] = useState<CustomItem[]>([]);
  const [deletedKeys, setDeletedKeys] = useState<DeletedSet>([]);

  const [addModalVisible, setAddModalVisible] = useState(false);
  const [editItem, setEditItem] = useState<CustomItem | null>(null);
  const [newItemName, setNewItemName] = useState("");
  const [newItemWhy, setNewItemWhy] = useState("");
  const [newItemCategory, setNewItemCategory] = useState(shoppingList[0]?.category ?? "");

  useFocusEffect(
    useCallback(() => {
      const load = async () => {
        const [c, cu, d] = await Promise.all([
          AsyncStorage.getItem(CHECKED_KEY),
          AsyncStorage.getItem(CUSTOM_KEY),
          AsyncStorage.getItem(DELETED_KEY),
        ]);
        if (c) setChecked(JSON.parse(c));
        if (cu) setCustomItems(JSON.parse(cu));
        if (d) setDeletedKeys(JSON.parse(d));
      };
      load();
    }, [])
  );

  const shoppingCategories = useMemo(() => {
    const categories = shoppingList.map((section) => section.category);
    customItems.forEach((item) => {
      if (!categories.includes(item.category)) categories.push(item.category);
    });
    return categories;
  }, [customItems]);

  const saveChecked = async (next: CheckedMap) => {
    setChecked(next);
    await AsyncStorage.setItem(CHECKED_KEY, JSON.stringify(next));
  };

  const saveCustom = async (next: CustomItem[]) => {
    setCustomItems(next);
    await AsyncStorage.setItem(CUSTOM_KEY, JSON.stringify(next));
  };

  const saveDeleted = async (next: DeletedSet) => {
    setDeletedKeys(next);
    await AsyncStorage.setItem(DELETED_KEY, JSON.stringify(next));
  };

  const toggle = (key: string) => setExpanded((p) => ({ ...p, [key]: !p[key] }));

  const toggleCheck = (key: string) => {
    const next = { ...checked, [key]: !checked[key] };
    saveChecked(next);
  };

  const deleteDefault = (key: string) => {
    Alert.alert("Remove Item", "Remove this item from your list?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove", style: "destructive", onPress: () => {
          const next = [...deletedKeys, key];
          saveDeleted(next);
        }
      },
    ]);
  };

  const openAddModal = (category?: string) => {
    setEditItem(null);
    setNewItemName("");
    setNewItemWhy("");
    setNewItemCategory(category ?? shoppingList[0]?.category ?? "");
    setAddModalVisible(true);
  };

  const openEditModal = (item: CustomItem) => {
    setEditItem(item);
    setNewItemName(item.item);
    setNewItemWhy(item.why);
    setNewItemCategory(item.category);
    setAddModalVisible(true);
  };

  const saveItem = async () => {
    if (!newItemName.trim()) return;
    if (editItem) {
      const next = customItems.map((ci) =>
        ci.id === editItem.id ? { ...ci, item: newItemName.trim(), why: newItemWhy.trim(), category: newItemCategory } : ci
      );
      await saveCustom(next);
    } else {
      const newItem: CustomItem = {
        id: `custom-${Date.now()}`,
        category: newItemCategory,
        item: newItemName.trim(),
        why: newItemWhy.trim(),
      };
      await saveCustom([...customItems, newItem]);
    }
    setAddModalVisible(false);
  };

  const deleteCustom = (id: string) => {
    Alert.alert("Delete Item", "Delete this custom item?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete", style: "destructive", onPress: async () => {
          await saveCustom(customItems.filter((ci) => ci.id !== id));
        }
      },
    ]);
  };

  const clearChecked = () => {
    Alert.alert("Clear Checked", "Uncheck all items?", [
      { text: "Cancel", style: "cancel" },
      { text: "Clear", onPress: () => saveChecked({}) },
    ]);
  };

  const categories = shoppingCategories;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 110 + bottomPad }}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.header, { paddingTop: topPad + 20 }]}>
          <Text style={[styles.riStudio, { color: colors.mutedForeground }]}>RI Studio</Text>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>Food Guide</Text>
          <Text style={[styles.headerSub, { color: colors.mutedForeground }]}>
            The science behind what to eat and why.
          </Text>
        </View>

        {/* Cookbook quick-access card — always visible */}
        <Pressable
          style={({ pressed }) => [styles.cookbookBanner, { backgroundColor: colors.card, borderColor: colors.border }, pressed && { opacity: 0.85 }]}
          onPress={() => {
            const hasCookbook = tier === "pro" || tier === "founder" || tier === "legacy";
            if (!hasCookbook) { goToCheckout(); return; }
            router.push("/cookbook" as never);
          }}
        >
          <View style={[styles.cookbookIconWrap, { backgroundColor: "rgba(201,162,39,0.12)" }]}>
            <Ionicons name="book-outline" size={22} color="#c9a227" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.cookbookBannerTitle, { color: colors.foreground }]}>My Cookbook</Text>
            <Text style={[styles.cookbookBannerSub, { color: colors.mutedForeground }]}>Your personal saved recipe collection</Text>
          </View>
          {(tier === "pro" || tier === "founder" || tier === "legacy")
            ? <Ionicons name="chevron-forward" size={16} color={colors.mutedForeground} />
            : <Ionicons name="lock-closed" size={14} color={colors.mutedForeground} />}
        </Pressable>

        {/* Tabs */}
        <View style={[styles.tabRow, { backgroundColor: colors.muted, marginHorizontal: 20 }]}>
          {([
            { key: "foods", label: "Food Guide" },
            { key: "shopping", label: "Shopping" },
            { key: "templates", label: "Templates" },
            { key: "tracking", label: "Tracking" },
          ] as { key: TabKey; label: string }[]).map((tab) => (
            <Pressable
              key={tab.key}
              style={[styles.tabBtn, activeTab === tab.key && { backgroundColor: colors.card }]}
              onPress={() => setActiveTab(tab.key)}
            >
              <Text style={[styles.tabText, { color: activeTab === tab.key ? colors.primary : colors.mutedForeground }]}>
                {tab.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Food Reference */}
        {activeTab === "foods" && (
          <View style={styles.content}>
            {foodReference.map((section) => (
              <View key={section.section} style={styles.sectionBlock}>
                <Text style={[styles.sectionTitle, { color: colors.foreground }]}>{section.section}</Text>
                <Text style={[styles.sectionIntro, { color: colors.mutedForeground }]}>{section.intro}</Text>
                {section.categories.map((cat) => {
                  const key = `${section.section}-${cat.name}`;
                  const isOpen = expanded[key];
                  return (
                    <View key={cat.name} style={[styles.accordion, { backgroundColor: colors.card, borderColor: colors.border }]}>
                      <Pressable style={styles.accordionHeader} onPress={() => toggle(key)}>
                        <Text style={[styles.accordionTitle, { color: colors.foreground }]}>{cat.name}</Text>
                        <Ionicons name={isOpen ? "chevron-up" : "chevron-down"} size={18} color={colors.mutedForeground} />
                      </Pressable>
                      {isOpen && (
                        <View style={[styles.accordionBody, { borderTopColor: colors.border }]}>
                          <Text style={[styles.catDesc, { color: colors.mutedForeground }]}>{cat.description}</Text>
                          {cat.items.map((item) => (
                            <View key={item.name} style={[styles.foodItem, { borderBottomColor: colors.border }]}>
                              <Text style={[styles.foodName, { color: colors.foreground }]}>{item.name}</Text>
                              <Text style={[styles.foodBenefit, { color: colors.mutedForeground }]}>{item.benefit}</Text>
                            </View>
                          ))}
                        </View>
                      )}
                    </View>
                  );
                })}
              </View>
            ))}
          </View>
        )}

        {/* Shopping List */}
        {activeTab === "shopping" && (
          <View style={styles.content}>
            {/* Header row */}
            <View style={styles.shoppingHeader}>
              <Text style={[styles.shoppingHeaderText, { color: colors.mutedForeground }]}>
                Tap to check · Long press to remove
              </Text>
              <Pressable onPress={clearChecked}>
                <Text style={[styles.clearBtn, { color: colors.primary }]}>Clear Checked</Text>
              </Pressable>
            </View>

            {shoppingCategories.map((category) => {
              const defaultCategory = shoppingList.find((cat) => cat.category === category);
              const catCustom = customItems.filter((c) => c.category === category);
              const defaultItems = (defaultCategory?.items ?? []).filter((item) => !deletedKeys.includes(`${category}:${item.item}`));

              if (defaultItems.length === 0 && catCustom.length === 0) return null;

              return (
                <View key={category} style={styles.sectionBlock}>
                  <View style={styles.catTitleRow}>
                    <Text style={[styles.sectionTitle, { color: colors.foreground }]}>{category}</Text>
                    <Pressable
                      style={[styles.addCatBtn, { backgroundColor: colors.primary + "18" }]}
                      onPress={() => openAddModal(category)}
                    >
                      <Ionicons name="add" size={16} color={colors.primary} />
                      <Text style={[styles.addCatBtnText, { color: colors.primary }]}>Add</Text>
                    </Pressable>
                  </View>
                  <View style={[styles.shoppingCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    {defaultItems.map((item, i) => {
                      const key = `${category}:${item.item}`;
                      const isChecked = !!checked[key];
                      return (
                        <Pressable
                          key={item.item}
                          style={[
                            styles.shoppingItem,
                            i < defaultItems.length - 1 + catCustom.length && { borderBottomWidth: 1, borderBottomColor: colors.border },
                          ]}
                          onPress={() => toggleCheck(key)}
                          onLongPress={() => deleteDefault(key)}
                          delayLongPress={500}
                        >
                          <View style={[styles.checkCircle, {
                            borderColor: isChecked ? colors.primary : colors.border,
                            backgroundColor: isChecked ? colors.primary : "transparent",
                          }]}>
                            {isChecked && <Ionicons name="checkmark" size={11} color="#fff" />}
                          </View>
                          <View style={{ flex: 1 }}>
                            <Text style={[styles.shoppingName, { color: isChecked ? colors.mutedForeground : colors.foreground }, isChecked && styles.strikethrough]}>
                              {item.item}
                            </Text>
                            <Text style={[styles.shoppingWhy, { color: colors.mutedForeground }]}>{item.why}</Text>
                          </View>
                        </Pressable>
                      );
                    })}

                    {catCustom.map((item, i) => {
                      const key = `custom:${item.id}`;
                      const isChecked = !!checked[key];
                      return (
                        <Pressable
                          key={item.id}
                          style={[
                            styles.shoppingItem,
                            { borderBottomWidth: i < catCustom.length - 1 ? 1 : 0, borderBottomColor: colors.border },
                          ]}
                          onPress={() => toggleCheck(key)}
                        >
                          <View style={[styles.checkCircle, {
                            borderColor: isChecked ? colors.primary : colors.border,
                            backgroundColor: isChecked ? colors.primary : "transparent",
                          }]}>
                            {isChecked && <Ionicons name="checkmark" size={11} color="#fff" />}
                          </View>
                          <View style={{ flex: 1 }}>
                            <Text style={[styles.shoppingName, { color: isChecked ? colors.mutedForeground : colors.foreground }, isChecked && styles.strikethrough]}>
                              {item.item}
                            </Text>
                            {item.why ? <Text style={[styles.shoppingWhy, { color: colors.mutedForeground }]}>{item.why}</Text> : null}
                          </View>
                          <View style={styles.customItemActions}>
                            <Pressable onPress={() => openEditModal(item)} hitSlop={8}>
                              <Ionicons name="pencil-outline" size={15} color={colors.mutedForeground} />
                            </Pressable>
                            <Pressable onPress={() => deleteCustom(item.id)} hitSlop={8}>
                              <Ionicons name="trash-outline" size={15} color="#c0392b" />
                            </Pressable>
                          </View>
                        </Pressable>
                      );
                    })}

                    {defaultItems.length === 0 && catCustom.length === 0 && (
                      <View style={styles.emptyRow}>
                        <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No items. Tap Add to add one.</Text>
                      </View>
                    )}
                  </View>
                </View>
              );
            })}

            {/* Global add */}
            <Pressable
              style={[styles.globalAdd, { backgroundColor: colors.primary, }]}
              onPress={() => openAddModal()}
            >
              <Ionicons name="add-circle-outline" size={20} color="#fff" />
              <Text style={styles.globalAddText}>Add Item to List</Text>
            </Pressable>
          </View>
        )}

        {/* Templates Tab */}
        {activeTab === "templates" && (
          <View style={styles.content}>
            {!hasTemplates && (
              <View style={[styles.templateLockBanner, { backgroundColor: colors.secondary + "15", borderColor: colors.secondary + "40" }]}>
                <Ionicons name="star" size={18} color={colors.secondary} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.templateLockTitle, { color: colors.foreground }]}>Pro & Founder Circle Feature</Text>
                  <Text style={[styles.templateLockSub, { color: colors.mutedForeground }]}>Upgrade to Pro ($19.99/mo) to unlock all premium templates.</Text>
                </View>
                <Pressable style={[styles.templateLockBtn, { backgroundColor: colors.secondary }]} onPress={goToCheckout}>
                  <Text style={styles.templateLockBtnText}>Upgrade</Text>
                </Pressable>
              </View>
            )}
            {TEMPLATE_ITEMS.map((template) => (
              <Pressable
                key={template.id}
                style={({ pressed }) => [
                  styles.templateCard,
                  { backgroundColor: colors.card, borderColor: hasTemplates ? template.color + "50" : colors.border },
                  !hasTemplates && { opacity: 0.65 },
                  hasTemplates && pressed && { opacity: 0.88 },
                ]}
                onPress={() => {
                  if (!hasTemplates) { goToCheckout(); return; }
                  router.push(`/templates/${template.id}` as any);
                }}
              >
                <View style={[styles.templateCardBar, { backgroundColor: template.color }]} />
                <View style={styles.templateCardBody}>
                  <View style={styles.templateCardRow}>
                    <View style={[styles.templateIconWrap, { backgroundColor: template.color + "20" }]}>
                      <Ionicons name={template.category === "checklist" ? "list-outline" : template.category === "bundle" ? "cart-outline" : template.category === "protocol" ? "shield-checkmark-outline" : template.category === "journal" ? "journal-outline" : "calendar-outline"} size={18} color={template.color} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.templateCardTitle, { color: colors.foreground }]}>{template.title}</Text>
                      <Text style={[styles.templateCardSub, { color: template.color }]}>{template.subtitle}</Text>
                    </View>
                    {!hasTemplates
                      ? <Ionicons name="lock-closed" size={16} color={colors.mutedForeground} />
                      : <Ionicons name="chevron-forward" size={16} color={colors.mutedForeground} />
                    }
                  </View>
                </View>
              </Pressable>
            ))}
          </View>
        )}

        {/* Tracking */}
        {activeTab === "tracking" && (
          <View style={styles.content}>

            {/* Profile card */}
            <Pressable
              style={({ pressed }) => [styles.kitchenCard, pressed && { opacity: 0.85 }]}
              onPress={() => router.push("/tracking-profile" as never)}
            >
              <View style={[styles.kitchenIconWrap, { backgroundColor: "rgba(61,107,82,0.10)" }]}>
                {profilePhoto ? (
                  <Image source={{ uri: profilePhoto }} style={styles.profileThumb} />
                ) : (
                  <Ionicons name="person-circle-outline" size={26} color="#3d6b52" />
                )}
              </View>
              <View style={styles.kitchenCardBody}>
                <View style={styles.kitchenCardRow}>
                  <Text style={[styles.kitchenCardTitle, { color: colors.foreground }]}>
                    {profileName ? profileName : "My Profile"}
                  </Text>
                  <Ionicons name="chevron-forward" size={16} color={colors.mutedForeground} />
                </View>
                <Text style={[styles.kitchenCardSub, { color: colors.mutedForeground }]}>
                  {profileName
                    ? "Edit your name, photo, and contact info."
                    : "Add your name, photo, and contact info. Stored on-device only."}
                </Text>
              </View>
            </Pressable>

            {/* Nutrition Tracker */}
            <Pressable
              style={({ pressed }) => [styles.kitchenCard, pressed && { opacity: 0.85 }]}
              onPress={() => {
                const hasTracker = tier === "pro" || tier === "founder" || tier === "legacy";
                if (!hasTracker) { goToCheckout(); return; }
                router.push("/nutrition-tracker" as never);
              }}
            >
              <View style={[styles.kitchenIconWrap, { backgroundColor: "rgba(76,175,130,0.12)" }]}>
                <Ionicons name="bar-chart-outline" size={26} color="#4caf82" />
              </View>
              <View style={styles.kitchenCardBody}>
                <View style={styles.kitchenCardRow}>
                  <Text style={[styles.kitchenCardTitle, { color: colors.foreground }]}>Nutrition Tracker</Text>
                  {(tier === "pro" || tier === "founder" || tier === "legacy")
                    ? <Ionicons name="chevron-forward" size={16} color={colors.mutedForeground} />
                    : <Ionicons name="lock-closed" size={15} color={colors.mutedForeground} />}
                </View>
                <Text style={[styles.kitchenCardSub, { color: colors.mutedForeground }]}>
                   Log meals by type, track estimated macros, and review your daily nutrition habits.
                </Text>
                <View style={[styles.kitchenTierBadge, { backgroundColor: "rgba(76,175,130,0.1)", borderColor: "rgba(76,175,130,0.35)" }]}>
                  <Text style={[styles.kitchenTierText, { color: "#4caf82" }]}>Pro · Founder · Legacy</Text>
                </View>
              </View>
            </Pressable>

            {/* Inflammation Tracker */}
            <Pressable
              style={({ pressed }) => [styles.kitchenCard, pressed && { opacity: 0.85 }]}
              onPress={() => {
                const hasTracker = tier === "essentials" || tier === "pro" || tier === "founder" || tier === "legacy";
                if (!hasTracker) { goToCheckout(); return; }
                router.push("/tracker" as never);
              }}
            >
              <View style={[styles.kitchenIconWrap, { backgroundColor: "rgba(217,83,79,0.10)" }]}>
                <Ionicons name="pulse-outline" size={26} color="#d9534f" />
              </View>
              <View style={styles.kitchenCardBody}>
                <View style={styles.kitchenCardRow}>
                  <Text style={[styles.kitchenCardTitle, { color: colors.foreground }]}>Inflammation Tracker</Text>
                  {(tier === "essentials" || tier === "pro" || tier === "founder" || tier === "legacy")
                    ? <Ionicons name="chevron-forward" size={16} color={colors.mutedForeground} />
                    : <Ionicons name="lock-closed" size={15} color={colors.mutedForeground} />}
                </View>
                <Text style={[styles.kitchenCardSub, { color: colors.mutedForeground }]}>
                  Track daily pain, mood, and sleep. Spot patterns over time and share with your care team.
                </Text>
                <View style={styles.comingSoonBadge}>
                  <Ionicons name="watch-outline" size={10} color="#7b9fd4" />
                  <Text style={styles.comingSoonBadgeText}>Apple Health Sleep Sync — coming soon</Text>
                </View>
                <View style={[styles.kitchenTierBadge, { backgroundColor: "rgba(217,83,79,0.08)", borderColor: "rgba(217,83,79,0.25)", marginTop: 6 }]}>
                  <Text style={[styles.kitchenTierText, { color: "#d9534f" }]}>All members</Text>
                </View>
              </View>
            </Pressable>

            {/* Health Report */}
            <Pressable
              style={({ pressed }) => [styles.kitchenCard, pressed && { opacity: 0.85 }]}
              onPress={() => {
                const hasReport = tier === "pro" || tier === "founder" || tier === "legacy";
                if (!hasReport) { goToCheckout(); return; }
                router.push("/health-report" as never);
              }}
            >
              <View style={[styles.kitchenIconWrap, { backgroundColor: "rgba(74,114,184,0.10)" }]}>
                <Ionicons name="document-text-outline" size={26} color="#4a72b8" />
              </View>
              <View style={styles.kitchenCardBody}>
                <View style={styles.kitchenCardRow}>
                  <Text style={[styles.kitchenCardTitle, { color: colors.foreground }]}>Health Reports</Text>
                  {(tier === "pro" || tier === "founder" || tier === "legacy")
                    ? <Ionicons name="chevron-forward" size={16} color={colors.mutedForeground} />
                    : <Ionicons name="lock-closed" size={15} color={colors.mutedForeground} />}
                </View>
                <Text style={[styles.kitchenCardSub, { color: colors.mutedForeground }]}>
                  Generate daily, weekly, or monthly reports from your tracking data. Export as PDF, plain text, or Markdown.
                </Text>
                <View style={[styles.kitchenTierBadge, { backgroundColor: "rgba(74,114,184,0.08)", borderColor: "rgba(74,114,184,0.2)" }]}>
                  <Text style={[styles.kitchenTierText, { color: "#4a72b8" }]}>Pro · Founder · Legacy</Text>
                </View>
              </View>
            </Pressable>

            {/* Privacy notice */}
            <View style={styles.privacyNotice}>
              <Ionicons name="lock-closed-outline" size={13} color="#3d6b52" />
              <Text style={styles.privacyNoticeText}>
                All tracking data is stored on your device and on secure Nourish servers. It is never sold or shared. You own your data.
              </Text>
            </View>


          </View>
        )}

        <View style={styles.disclaimerBar}>
          <Text style={styles.disclaimerText}>
            If you are taking medication or have a medical condition, please consult your doctor or healthcare provider before making changes to your diet.
          </Text>
        </View>
      </ScrollView>

      {/* Add/Edit Modal */}
      <Modal visible={addModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>
              {editItem ? "Edit Item" : "Add Item"}
            </Text>

            <Text style={[styles.modalLabel, { color: colors.mutedForeground }]}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
              <View style={styles.categoryPicker}>
                {categories.map((cat) => (
                  <Pressable
                    key={cat}
                    style={[styles.catChip, {
                      backgroundColor: newItemCategory === cat ? colors.primary : colors.muted,
                      borderColor: newItemCategory === cat ? colors.primary : colors.border,
                    }]}
                    onPress={() => setNewItemCategory(cat)}
                  >
                    <Text style={[styles.catChipText, { color: newItemCategory === cat ? "#fff" : colors.foreground }]}>
                      {cat}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </ScrollView>

            <Text style={[styles.modalLabel, { color: colors.mutedForeground }]}>Item Name</Text>
            <TextInput
              style={[styles.modalInput, { borderColor: colors.border, color: colors.foreground, backgroundColor: colors.background }]}
              placeholder="e.g. Manuka honey"
              placeholderTextColor={colors.mutedForeground}
              value={newItemName}
              onChangeText={setNewItemName}
            />

            <Text style={[styles.modalLabel, { color: colors.mutedForeground }]}>Note (optional)</Text>
            <TextInput
              style={[styles.modalInput, { borderColor: colors.border, color: colors.foreground, backgroundColor: colors.background }]}
              placeholder="Why you're adding this..."
              placeholderTextColor={colors.mutedForeground}
              value={newItemWhy}
              onChangeText={setNewItemWhy}
            />

            <View style={styles.modalBtns}>
              <Pressable style={[styles.modalCancel, { borderColor: colors.border }]} onPress={() => setAddModalVisible(false)}>
                <Text style={[styles.modalCancelText, { color: colors.foreground }]}>Cancel</Text>
              </Pressable>
              <Pressable style={[styles.modalConfirm, { backgroundColor: colors.primary }]} onPress={saveItem}>
                <Text style={styles.modalConfirmText}>{editItem ? "Save" : "Add"}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 24, paddingBottom: 8 },
  riStudio: { fontSize: 11, fontFamily: "Inter_500Medium", letterSpacing: 2.5, textTransform: "uppercase", marginBottom: 4 },
  headerTitle: { fontSize: 32, fontFamily: "Inter_700Bold", marginBottom: 6 },
  headerSub: { fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 20 },
  tabRow: { flexDirection: "row", borderRadius: 10, padding: 4, marginTop: 16, marginBottom: 8 },
  tabBtn: { flex: 1, paddingVertical: 9, borderRadius: 8, alignItems: "center" },
  tabText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  content: { padding: 20, gap: 4 },
  sectionBlock: { marginBottom: 20 },
  sectionTitle: { fontSize: 20, fontFamily: "Inter_700Bold", marginBottom: 6 },
  sectionIntro: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 20, marginBottom: 12 },
  accordion: { borderRadius: 12, borderWidth: 1, marginBottom: 8, overflow: "hidden" },
  accordionHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 14 },
  accordionTitle: { fontSize: 15, fontFamily: "Inter_600SemiBold", flex: 1 },
  accordionBody: { borderTopWidth: 1, padding: 14 },
  catDesc: { fontSize: 12, fontFamily: "Inter_400Regular", lineHeight: 18, marginBottom: 12 },
  foodItem: { paddingVertical: 10, borderBottomWidth: 1 },
  foodName: { fontSize: 14, fontFamily: "Inter_600SemiBold", marginBottom: 3 },
  foodBenefit: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 19 },
  shoppingHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 4 },
  shoppingHeaderText: { fontSize: 12, fontFamily: "Inter_400Regular" },
  clearBtn: { fontSize: 13, fontFamily: "Inter_500Medium" },
  catTitleRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 },
  addCatBtn: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 100 },
  addCatBtnText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  shoppingCard: { borderRadius: 12, borderWidth: 1, overflow: "hidden" },
  shoppingItem: { flexDirection: "row", alignItems: "flex-start", gap: 12, padding: 14 },
  checkCircle: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, alignItems: "center", justifyContent: "center", marginTop: 2, flexShrink: 0 },
  shoppingName: { fontSize: 14, fontFamily: "Inter_500Medium", marginBottom: 2 },
  shoppingWhy: { fontSize: 12, fontFamily: "Inter_400Regular", lineHeight: 17 },
  strikethrough: { textDecorationLine: "line-through" },
  customItemActions: { flexDirection: "row", gap: 14, alignItems: "center", paddingLeft: 8 },
  emptyRow: { padding: 16, alignItems: "center" },
  emptyText: { fontSize: 13, fontFamily: "Inter_400Regular" },
  globalAdd: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, padding: 14, borderRadius: 12, marginTop: 8 },
  globalAddText: { color: "#fff", fontSize: 15, fontFamily: "Inter_600SemiBold" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modalCard: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 28, paddingBottom: 40 },
  modalTitle: { fontSize: 22, fontFamily: "Inter_700Bold", marginBottom: 20 },
  modalLabel: { fontSize: 11, fontFamily: "Inter_600SemiBold", letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 8 },
  modalInput: { borderWidth: 1.5, borderRadius: 10, padding: 13, fontSize: 15, fontFamily: "Inter_400Regular", marginBottom: 16 },
  categoryPicker: { flexDirection: "row", gap: 8 },
  catChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 100, borderWidth: 1 },
  catChipText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  modalBtns: { flexDirection: "row", gap: 10, marginTop: 8 },
  modalCancel: { flex: 1, borderWidth: 1, borderRadius: 10, padding: 14, alignItems: "center" },
  modalCancelText: { fontSize: 15, fontFamily: "Inter_500Medium" },
  modalConfirm: { flex: 1, borderRadius: 10, padding: 14, alignItems: "center" },
  modalConfirmText: { color: "#fff", fontSize: 15, fontFamily: "Inter_600SemiBold" },
  templateLockBanner: { flexDirection: "row", alignItems: "flex-start", gap: 10, padding: 14, borderRadius: 12, borderWidth: 1, marginBottom: 16 },
  templateLockTitle: { fontSize: 14, fontFamily: "Inter_600SemiBold", marginBottom: 2 },
  templateLockSub: { fontSize: 12, fontFamily: "Inter_400Regular", lineHeight: 17 },
  templateLockBtn: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 8 },
  templateLockBtnText: { color: "#fff", fontSize: 12, fontFamily: "Inter_600SemiBold" },
  templateCard: { borderRadius: 14, borderWidth: 1.5, overflow: "hidden", marginBottom: 10 },
  templateCardBar: { height: 4 },
  templateCardBody: { padding: 14 },
  templateCardRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  templateIconWrap: { width: 38, height: 38, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  templateCardTitle: { fontSize: 15, fontFamily: "Inter_600SemiBold", marginBottom: 2 },
  templateCardSub: { fontSize: 11, fontFamily: "Inter_500Medium", textTransform: "uppercase", letterSpacing: 0.5 },
  disclaimerBar: { marginHorizontal: 16, marginTop: 12, marginBottom: 24, padding: 14, borderRadius: 10, backgroundColor: "rgba(0,0,0,0.04)" },
  disclaimerText: { fontSize: 12, fontFamily: "Inter_400Regular", lineHeight: 18, textAlign: "center", opacity: 0.6 },
  kitchenCard: { backgroundColor: "#fffef8", borderRadius: 16, borderWidth: 1, borderColor: "rgba(201,162,39,0.25)", marginBottom: 12, flexDirection: "row", alignItems: "flex-start", padding: 16, gap: 14 },
  kitchenIconWrap: { width: 52, height: 52, borderRadius: 14, alignItems: "center", justifyContent: "center", flexShrink: 0, overflow: "hidden" },
  profileThumb: { width: 52, height: 52, borderRadius: 14 },
  kitchenCardBody: { flex: 1 },
  kitchenCardRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 4 },
  kitchenCardTitle: { fontSize: 16, fontFamily: "Inter_600SemiBold" },
  kitchenCardSub: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 19, marginBottom: 10 },
  kitchenTierBadge: { alignSelf: "flex-start", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, borderWidth: 1 },
  kitchenTierText: { fontSize: 11, fontFamily: "Inter_600SemiBold", letterSpacing: 0.4 },
  // Cookbook banner (top of guide)
  cookbookBanner: { flexDirection: "row", alignItems: "center", gap: 12, marginHorizontal: 16, marginBottom: 14, padding: 14, borderRadius: 14, borderWidth: 1 },
  cookbookIconWrap: { width: 42, height: 42, borderRadius: 11, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  cookbookBannerTitle: { fontSize: 14, fontFamily: "Inter_600SemiBold", marginBottom: 1 },
  cookbookBannerSub: { fontSize: 12, fontFamily: "Inter_400Regular" },
  // Tracking tab extras
  comingSoonBadge: { flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 2 },
  comingSoonBadgeText: { fontSize: 10, fontFamily: "Inter_500Medium", color: "#7b9fd4" },
  privacyNotice: { flexDirection: "row", alignItems: "flex-start", gap: 8, padding: 12, backgroundColor: "rgba(61,107,82,0.06)", borderRadius: 10, borderWidth: 1, borderColor: "rgba(61,107,82,0.12)", marginBottom: 16 },
  privacyNoticeText: { flex: 1, fontSize: 11, fontFamily: "Inter_400Regular", color: "#3d6b52", lineHeight: 17 },
  suggestBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 13, borderRadius: 12, borderWidth: 1, marginBottom: 8 },
  suggestBtnText: { fontSize: 14, fontFamily: "Inter_500Medium" },
});
