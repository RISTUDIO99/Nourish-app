import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { Alert, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { useUser } from '@clerk/expo';
import { useColors } from '@/hooks/useColors';
import { meals } from '@/constants/meals';
import { canAccessMeal } from '@/constants/access';
import { useSubscription } from '@/lib/revenuecat';
import { useTrial } from '@/lib/trial';

const STORAGE_KEY = 'nourish_grocery_checked';
const CUSTOM_STORAGE_KEY = 'nourish_grocery_custom_v1';

type GroceryItem = {
  id: string;
  name: string;
};

type CustomGroceryItem = GroceryItem & {
  createdAt: number;
};

type GrocerySection = {
  title: string;
  items: GroceryItem[];
};

const produceKeywords = ['lemon', 'broccoli', 'carrot', 'spinach', 'ginger', 'sweet potato', 'courgette', 'banana', 'kiwi', 'mango', 'lime', 'cucumber', 'mint', 'cherries'];
const proteinKeywords = ['salmon', 'chicken'];
const dairyKeywords = ['yoghurt', 'kefir'];

function getCategory(name: string): string {
  const lower = name.toLowerCase();
  if (produceKeywords.some(k => lower.includes(k))) return 'Produce';
  if (proteinKeywords.some(k => lower.includes(k))) return 'Protein';
  if (dairyKeywords.some(k => lower.includes(k))) return 'Dairy & Fridge';
  return 'Pantry & Dry Goods';
}

export default function GroceryScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { isLoaded: userLoaded, user } = useUser();
  const { access } = useSubscription();
  const { isActive: activeTrial } = useTrial();
  const topInset = Platform.OS === 'web' ? Math.max(insets.top, 67) : insets.top;
  const storageKey = user?.id ? `${STORAGE_KEY}:${user.id}` : null;
  const customStorageKey = user?.id ? `${CUSTOM_STORAGE_KEY}:${user.id}` : null;

  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set());
  const [customItems, setCustomItems] = useState<CustomGroceryItem[]>([]);
  const [newItemName, setNewItemName] = useState('');
  const [editingItem, setEditingItem] = useState<CustomGroceryItem | null>(null);
  const [editingName, setEditingName] = useState('');
  const [loaded, setLoaded] = useState(false);
  const checkedIdsRef = useRef<Set<string>>(new Set());
  const customItemsRef = useRef<CustomGroceryItem[]>([]);
  const writeQueueRef = useRef<Promise<void>>(Promise.resolve());

  // Derive grocery list from meals
  const sections = useMemo(() => {
    const map = new Map<string, Map<string, GroceryItem>>();

    meals
      .filter((meal) => canAccessMeal(meal.id, {
        isPremium: access.isPremium,
        isFounderDiamond: access.isFounderDiamond,
        isTrial: activeTrial,
      }))
      .forEach(meal => {
      meal.ingredients.forEach(ing => {
        const cat = getCategory(ing.name);
        if (!map.has(cat)) map.set(cat, new Map());
        const catMap = map.get(cat)!;
        if (!catMap.has(ing.id)) {
          catMap.set(ing.id, { id: ing.id, name: ing.name });
        }
      });
      });

    const result: GrocerySection[] = Array.from(map.entries()).map(([title, catMap]) => ({
      title,
      items: Array.from(catMap.values()).sort((a, b) => a.name.localeCompare(b.name))
    }));

    const order = ['Produce', 'Protein', 'Dairy & Fridge', 'Pantry & Dry Goods'];
    result.sort((a, b) => order.indexOf(a.title) - order.indexOf(b.title));

    return result;
  }, [access.isFounderDiamond, access.isPremium, activeTrial]);

  useEffect(() => {
    setLoaded(false);
    setCheckedIds(new Set());
    setCustomItems([]);
    checkedIdsRef.current = new Set();
    customItemsRef.current = [];
    writeQueueRef.current = Promise.resolve();
    if (!storageKey || !customStorageKey) {
      if (userLoaded) setLoaded(true);
      return;
    }

    void Promise.all([
      AsyncStorage.getItem(storageKey),
      AsyncStorage.getItem(customStorageKey),
    ])
      .then(([checkedData, customData]) => {
        const nextChecked = checkedData
          ? new Set(JSON.parse(checkedData) as string[])
          : new Set<string>();
        const parsedCustom = customData
          ? JSON.parse(customData) as CustomGroceryItem[]
          : [];
        const nextCustom = parsedCustom.filter(
          (item) =>
            item &&
            typeof item.id === 'string' &&
            typeof item.name === 'string' &&
            typeof item.createdAt === 'number',
        );
        checkedIdsRef.current = nextChecked;
        customItemsRef.current = nextCustom;
        setCheckedIds(nextChecked);
        setCustomItems(nextCustom);
      })
      .catch((error) => {
        console.error('Failed to load grocery guide', error);
      })
      .finally(() => {
        setLoaded(true);
      });
  }, [customStorageKey, storageKey, userLoaded]);

  const queueStorageWrite = useCallback((key: string, value: string) => {
    writeQueueRef.current = writeQueueRef.current
      .catch(() => undefined)
      .then(() => AsyncStorage.setItem(key, value))
      .catch((error) => {
        console.error('Failed to save grocery guide', error);
      });
    return writeQueueRef.current;
  }, []);

  const saveChecked = useCallback((newSet: Set<string>) => {
    if (!storageKey) return;
    checkedIdsRef.current = newSet;
    setCheckedIds(newSet);
    return queueStorageWrite(storageKey, JSON.stringify(Array.from(newSet)));
  }, [queueStorageWrite, storageKey]);

  const saveCustomItems = useCallback((nextItems: CustomGroceryItem[]) => {
    if (!customStorageKey) return;
    customItemsRef.current = nextItems;
    setCustomItems(nextItems);
    return queueStorageWrite(customStorageKey, JSON.stringify(nextItems));
  }, [customStorageKey, queueStorageWrite]);

  const toggleItem = useCallback(async (id: string) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newSet = new Set(checkedIdsRef.current);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    await saveChecked(newSet);
  }, [saveChecked]);

  const addCustomItem = useCallback(async () => {
    const name = newItemName.trim();
    if (!name) return;
    const item: CustomGroceryItem = {
      id: `custom-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name,
      createdAt: Date.now(),
    };
    setNewItemName('');
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await saveCustomItems([...customItemsRef.current, item]);
  }, [newItemName, saveCustomItems]);

  const beginEditing = useCallback((item: CustomGroceryItem) => {
    setEditingItem(item);
    setEditingName(item.name);
  }, []);

  const saveEditedItem = useCallback(async () => {
    if (!editingItem) return;
    const name = editingName.trim();
    if (!name) return;
    await saveCustomItems(
      customItemsRef.current.map((item) =>
        item.id === editingItem.id ? { ...item, name } : item,
      ),
    );
    setEditingItem(null);
    setEditingName('');
  }, [editingItem, editingName, saveCustomItems]);

  const removeCustomItem = useCallback(async (item: CustomGroceryItem) => {
    await saveCustomItems(customItemsRef.current.filter((current) => current.id !== item.id));
    if (checkedIdsRef.current.has(item.id)) {
      const nextChecked = new Set(checkedIdsRef.current);
      nextChecked.delete(item.id);
      await saveChecked(nextChecked);
    }
  }, [saveChecked, saveCustomItems]);

  const confirmRemoveCustomItem = useCallback((item: CustomGroceryItem) => {
    if (Platform.OS === 'web') {
      if (window.confirm(`Remove “${item.name}” from your grocery list?`)) {
        void removeCustomItem(item);
      }
      return;
    }
    Alert.alert(
      'Remove item',
      `Remove “${item.name}” from your grocery list?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: () => void removeCustomItem(item) },
      ],
    );
  }, [removeCustomItem]);

  const resetList = useCallback(() => {
    const doReset = async () => {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      await saveChecked(new Set());
    };

    if (Platform.OS === 'web') {
      if (window.confirm('Clear all checked items?')) {
        void doReset();
      }
    } else {
      Alert.alert(
        'Reset list',
        'Clear all checked items?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Reset', style: 'destructive', onPress: () => void doReset() }
        ]
      );
    }
  }, [saveChecked]);

  if (!loaded) {
    return (
      <View style={[styles.screen, { backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' }]}>
        <Feather name="loader" size={24} color={colors.primary} />
      </View>
    );
  }

  const catalogItems = sections.flatMap((section) => section.items);
  const visibleIds = new Set([...catalogItems, ...customItems].map((item) => item.id));
  const totalItems = visibleIds.size;
  const totalChecked = Array.from(checkedIds).filter((id) => visibleIds.has(id)).length;
  const isAllDone = totalItems > 0 && totalChecked === totalItems;

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingTop: topInset + 16, paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.headerCopy}>
            <Text style={[styles.kicker, { color: colors.accent }]}>PREPARATION</Text>
            <Text style={[styles.title, { color: colors.foreground }]}>Grocery Guide</Text>
            <Text style={[styles.description, { color: colors.mutedForeground }]}>
              {isAllDone ? "You have everything you need." : "Everything you need for the Nourish library, organized for an easy trip."}
            </Text>
          </View>
          <View style={[styles.headerIcon, { backgroundColor: `${colors.primary}15` }]}>
            <Feather name="shopping-bag" size={24} color={colors.primary} />
          </View>
        </View>

        <View style={[styles.addCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.addCopy}>
            <Text style={[styles.addTitle, { color: colors.cardForeground }]}>Add anything you need</Text>
            <Text style={[styles.addDescription, { color: colors.mutedForeground }]}>
              Add groceries, household supplies, or personal favorites.
            </Text>
          </View>
          <View style={styles.addRow}>
            <TextInput
              accessibilityLabel="New grocery item"
              value={newItemName}
              onChangeText={setNewItemName}
              onSubmitEditing={() => void addCustomItem()}
              returnKeyType="done"
              placeholder="Coffee, creamer, paper towels…"
              placeholderTextColor={colors.mutedForeground}
              style={[
                styles.addInput,
                {
                  color: colors.foreground,
                  backgroundColor: colors.background,
                  borderColor: colors.border,
                },
              ]}
            />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Add item to grocery list"
              disabled={!newItemName.trim()}
              onPress={() => void addCustomItem()}
              style={({ pressed }) => [
                styles.addButton,
                { backgroundColor: newItemName.trim() ? colors.primary : colors.muted },
                pressed && { opacity: 0.75 },
              ]}
            >
              <Feather
                name="plus"
                size={19}
                color={newItemName.trim() ? colors.primaryForeground : colors.mutedForeground}
              />
              <Text
                style={[
                  styles.addButtonText,
                  { color: newItemName.trim() ? colors.primaryForeground : colors.mutedForeground },
                ]}
              >
                Add
              </Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.controls}>
          <Text style={[styles.progressText, { color: colors.primary }]}>{totalChecked} of {totalItems} gathered</Text>
          {totalChecked > 0 ? (
            <Pressable
              accessibilityRole="button"
              onPress={resetList}
              style={({pressed}) => [styles.resetButton, pressed && { opacity: 0.7 }]}
            >
              <Text style={[styles.resetButtonText, { color: colors.mutedForeground }]}>Reset</Text>
            </Pressable>
          ) : null}
        </View>

        {customItems.length > 0 ? (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>My added items</Text>
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
              {customItems.map((item, index) => {
                const isChecked = checkedIds.has(item.id);
                const isLast = index === customItems.length - 1;
                return (
                  <View
                    key={item.id}
                    style={[
                      styles.itemRow,
                      !isLast && { borderBottomWidth: 1, borderBottomColor: colors.border },
                    ]}
                  >
                    <Pressable
                      accessibilityRole="checkbox"
                      accessibilityLabel={item.name}
                      accessibilityState={{ checked: isChecked }}
                      onPress={() => void toggleItem(item.id)}
                      style={({ pressed }) => [styles.customItemToggle, pressed && { opacity: 0.7 }]}
                    >
                      <View style={[
                        styles.checkbox,
                        { borderColor: isChecked ? colors.primary : colors.mutedForeground },
                        isChecked && { backgroundColor: colors.primary },
                      ]}>
                        {isChecked ? <Feather name="check" size={14} color={colors.primaryForeground} /> : null}
                      </View>
                      <Text style={[
                        styles.itemName,
                        { color: isChecked ? colors.mutedForeground : colors.cardForeground },
                        isChecked && { textDecorationLine: 'line-through' },
                      ]}>
                        {item.name}
                      </Text>
                    </Pressable>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={`Edit ${item.name}`}
                      hitSlop={8}
                      onPress={() => beginEditing(item)}
                      style={({ pressed }) => [styles.itemAction, pressed && { opacity: 0.6 }]}
                    >
                      <Feather name="edit-2" size={17} color={colors.primary} />
                    </Pressable>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={`Remove ${item.name}`}
                      hitSlop={8}
                      onPress={() => confirmRemoveCustomItem(item)}
                      style={({ pressed }) => [styles.itemAction, pressed && { opacity: 0.6 }]}
                    >
                      <Feather name="trash-2" size={17} color={colors.destructive} />
                    </Pressable>
                  </View>
                );
              })}
            </View>
          </View>
        ) : null}

        {sections.map(section => (
          <View key={section.title} style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>{section.title}</Text>
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
              {section.items.map((item, index) => {
                const isChecked = checkedIds.has(item.id);
                const isLast = index === section.items.length - 1;
                return (
                  <Pressable
                    key={item.id}
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: isChecked }}
                    onPress={() => toggleItem(item.id)}
                    style={({ pressed }) => [
                      styles.itemRow,
                      !isLast && { borderBottomWidth: 1, borderBottomColor: colors.border },
                      pressed && { backgroundColor: `${colors.primary}05` }
                    ]}
                  >
                    <View style={[
                      styles.checkbox,
                      { borderColor: isChecked ? colors.primary : colors.mutedForeground },
                      isChecked && { backgroundColor: colors.primary }
                    ]}>
                      {isChecked ? <Feather name="check" size={14} color={colors.primaryForeground} /> : null}
                    </View>
                    <Text style={[
                      styles.itemName,
                      { color: isChecked ? colors.mutedForeground : colors.cardForeground },
                      isChecked && { textDecorationLine: 'line-through' }
                    ]}>
                      {item.name}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        ))}

      </ScrollView>
      <Modal
        visible={editingItem !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setEditingItem(null)}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.cardForeground }]}>Edit grocery item</Text>
            <TextInput
              accessibilityLabel="Edit grocery item name"
              autoFocus
              value={editingName}
              onChangeText={setEditingName}
              onSubmitEditing={() => void saveEditedItem()}
              returnKeyType="done"
              style={[
                styles.editInput,
                {
                  color: colors.foreground,
                  backgroundColor: colors.background,
                  borderColor: colors.border,
                },
              ]}
            />
            <View style={styles.modalActions}>
              <Pressable
                accessibilityRole="button"
                onPress={() => setEditingItem(null)}
                style={({ pressed }) => [
                  styles.modalButton,
                  { borderColor: colors.border },
                  pressed && { opacity: 0.7 },
                ]}
              >
                <Text style={[styles.modalButtonText, { color: colors.foreground }]}>Cancel</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                disabled={!editingName.trim()}
                onPress={() => void saveEditedItem()}
                style={({ pressed }) => [
                  styles.modalButton,
                  { backgroundColor: editingName.trim() ? colors.primary : colors.muted },
                  pressed && { opacity: 0.7 },
                ]}
              >
                <Text
                  style={[
                    styles.modalButtonText,
                    { color: editingName.trim() ? colors.primaryForeground : colors.mutedForeground },
                  ]}
                >
                  Save
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  scrollContent: { flexGrow: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, marginBottom: 20, paddingHorizontal: 22 },
  headerCopy: { flex: 1, gap: 7 },
  kicker: { fontSize: 10, fontWeight: '700', letterSpacing: 1.5 },
  title: { fontSize: 32, lineHeight: 37, fontWeight: '600', letterSpacing: -0.7 },
  description: { fontSize: 14, lineHeight: 20, maxWidth: 300 },
  headerIcon: { width: 50, height: 50, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  addCard: { marginHorizontal: 22, marginBottom: 16, borderWidth: 1, borderRadius: 20, padding: 16, gap: 14 },
  addCopy: { gap: 4 },
  addTitle: { fontSize: 17, fontWeight: '700' },
  addDescription: { fontSize: 12.5, lineHeight: 18 },
  addRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  addInput: { flex: 1, minHeight: 48, borderWidth: 1, borderRadius: 14, paddingHorizontal: 14, fontSize: 15 },
  addButton: { minHeight: 48, borderRadius: 14, paddingHorizontal: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7 },
  addButtonText: { fontSize: 14, fontWeight: '700' },
  controls: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 22, marginBottom: 24 },
  progressText: { fontSize: 13, fontWeight: '600' },
  resetButton: { paddingHorizontal: 12, paddingVertical: 6 },
  resetButtonText: { fontSize: 13, fontWeight: '600' },
  section: { marginBottom: 24, paddingHorizontal: 22 },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: 12 },
  card: { borderWidth: 1, borderRadius: 20, overflow: 'hidden' },
  itemRow: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 14 },
  customItemToggle: { flex: 1, minWidth: 0, flexDirection: 'row', alignItems: 'center', gap: 14 },
  itemAction: { width: 30, height: 34, alignItems: 'center', justifyContent: 'center' },
  checkbox: { width: 24, height: 24, borderRadius: 8, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  itemName: { flex: 1, fontSize: 16, fontWeight: '500' },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(10, 24, 17, 0.62)', alignItems: 'center', justifyContent: 'center', padding: 24 },
  modalCard: { width: '100%', maxWidth: 390, borderRadius: 22, padding: 20, gap: 16 },
  modalTitle: { fontSize: 20, fontWeight: '700' },
  editInput: { minHeight: 50, borderWidth: 1, borderRadius: 14, paddingHorizontal: 14, fontSize: 16 },
  modalActions: { flexDirection: 'row', gap: 10 },
  modalButton: { flex: 1, minHeight: 48, borderWidth: 1, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  modalButtonText: { fontSize: 14, fontWeight: '700' },
});
