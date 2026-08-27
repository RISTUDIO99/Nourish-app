import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import {
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { collections, libraryItems, allMealTypes } from "@/data/library";

const FAVORITES_KEY = "nourish:library:favorites";
const HIDE_ALCOHOL_KEY = "nourish:library:hideAlcohol";

export default function LibraryScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : 0;

  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<string>("All");
  const [hideAlcohol, setHideAlcohol] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);

  useFocusEffect(
    useCallback(() => {
      Promise.all([
        AsyncStorage.getItem(HIDE_ALCOHOL_KEY),
        AsyncStorage.getItem(FAVORITES_KEY),
      ]).then(([alcoholPreference, favorites]) => {
        setHideAlcohol(alcoholPreference === "true");
        setFavoriteIds(favorites ? JSON.parse(favorites) : []);
      }).catch(() => {
        setFavoriteIds([]);
      });
    }, [])
  );

  const toggleHideAlcohol = async (val: boolean) => {
    setHideAlcohol(val);
    await AsyncStorage.setItem(HIDE_ALCOHOL_KEY, String(val));
  };

  const toggleFavorite = async (itemId: string) => {
    const next = favoriteIds.includes(itemId)
      ? favoriteIds.filter((favoriteId) => favoriteId !== itemId)
      : [...favoriteIds, itemId];
    setFavoriteIds(next);
    await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
  };

  const filteredItems = useMemo(() => {
    let items = libraryItems;

    if (activeFilter === "Favorites") {
      items = items.filter((item) => favoriteIds.includes(item.id));
    } else if (activeFilter !== "All") {
      items = items.filter((item) => item.mealTypes.includes(activeFilter));
    }
    if (hideAlcohol && activeFilter === "Wine Pairing") {
      items = [];
    }

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      items = items.filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          item.summary.toLowerCase().includes(q) ||
          item.tags.some((tag) => tag.toLowerCase().includes(q)) ||
          item.cuisine?.toLowerCase().includes(q) ||
          item.region?.toLowerCase().includes(q) ||
          item.ingredients.some((ingredient) => ingredient.name.toLowerCase().includes(q))
      );
    }

    return items;
  }, [search, activeFilter, favoriteIds, hideAlcohol]);

  const displayCollections = collections;

  const showGrid = search.trim() !== "" || activeFilter !== "All";

  const renderItemCard = (itemId: string, horizontal = false) => {
    const item = libraryItems.find((i) => i.id === itemId);
    if (!item) return null;
    const isFavorite = favoriteIds.includes(item.id);
    const displayImage = hideAlcohol && item.alcoholFlag
      ? item.alcoholHiddenImage ?? item.image
      : item.image;

    return (
      <Pressable
        key={item.id}
        style={({ pressed }) => [
          styles.itemCard,
          horizontal ? styles.itemCardHorizontal : styles.itemCardGrid,
          { backgroundColor: colors.card, borderColor: colors.border },
          pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] },
        ]}
        onPress={() => router.push(`/library/${item.id}` as never)}
        accessibilityRole="button"
        accessibilityLabel={`Open ${item.title} recipe`}
        testID={`library-card-${item.id}`}
      >
        <View>
          <Image
            source={displayImage}
            style={[styles.itemImage, horizontal ? styles.itemImageHorizontal : styles.itemImageGrid]}
            resizeMode="cover"
          />
          <Pressable
            style={({ pressed }) => [styles.favoriteBtn, pressed && styles.iconPressed]}
            onPress={(event) => {
              event.stopPropagation();
              toggleFavorite(item.id);
            }}
            accessibilityRole="button"
            accessibilityLabel={isFavorite ? `Remove ${item.title} from favorites` : `Save ${item.title} to favorites`}
          >
            <Ionicons name={isFavorite ? "heart" : "heart-outline"} size={19} color={isFavorite ? colors.destructive : "#fff"} />
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.addBtn, { backgroundColor: colors.primary }, pressed && styles.iconPressed]}
            onPress={(event) => {
              event.stopPropagation();
              router.push({
                pathname: "/library/[id]",
                params: { id: item.id, addToPlan: "1" },
              } as never);
            }}
            accessibilityRole="button"
            accessibilityLabel={`Add ${item.title} to a meal plan`}
            testID={`library-add-${item.id}`}
          >
            <Ionicons name="add" size={20} color="#fff" />
          </Pressable>
        </View>
        <View style={styles.itemBody}>
          <Text style={[styles.itemTitle, { color: colors.foreground }]} numberOfLines={2}>
            {item.title}
          </Text>
          <View style={styles.itemMetaRow}>
            <View style={styles.itemMeta}>
              <Ionicons name="time-outline" size={12} color={colors.mutedForeground} />
              <Text style={[styles.itemMetaText, { color: colors.mutedForeground }]}>
                {item.prepMinutes + item.cookMinutes}m
              </Text>
            </View>
            <View style={styles.itemMeta}>
              <Ionicons name="flame-outline" size={12} color={colors.mutedForeground} />
              <Text style={[styles.itemMetaText, { color: colors.mutedForeground }]}>
                Est. {item.estimatedNutrition.calories} kcal
              </Text>
            </View>
            <Text style={[styles.itemProtein, { color: colors.primary }]}>
              {item.estimatedNutrition.protein}g protein
            </Text>
          </View>
        </View>
      </Pressable>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 100 + bottomPad }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={[styles.header, { paddingTop: topPad + 16 }]}>
          <Text style={[styles.riStudio, { color: colors.mutedForeground }]}>RI Studio</Text>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>Explore</Text>
          <Text style={[styles.headerSub, { color: colors.mutedForeground }]}>
            Beautiful meals for everyday life, global tastes, and personal wellness.
          </Text>
        </View>

        {/* Search */}
        <View style={styles.searchWrap}>
          <View style={[styles.searchBar, { backgroundColor: colors.surface }]}>
            <Ionicons name="search" size={20} color={colors.mutedForeground} />
            <TextInput
              style={[styles.searchInput, { color: colors.foreground }]}
              placeholder="Search recipes, ingredients, wellness..."
              placeholderTextColor={colors.mutedForeground}
              value={search}
              onChangeText={setSearch}
              returnKeyType="search"
              clearButtonMode="while-editing"
            />
          </View>
        </View>

        {/* Filters */}
        <View style={styles.controlsRow}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterScroll}
            style={{ flex: 1 }}
          >
            {["All", "Favorites", ...allMealTypes.filter((filter) => !(hideAlcohol && filter === "Wine Pairing"))].map((filter) => {
              const isActive = activeFilter === filter;
              return (
                <Pressable
                  key={filter}
                  style={[
                    styles.filterBtn,
                    { backgroundColor: isActive ? colors.primary : colors.card, borderColor: isActive ? colors.primary : colors.border },
                  ]}
                  onPress={() => setActiveFilter(filter)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isActive }}
                >
                  {filter === "Favorites" && (
                    <Ionicons
                      name={isActive ? "heart" : "heart-outline"}
                      size={14}
                      color={isActive ? "#fff" : colors.foreground}
                    />
                  )}
                  <Text style={[styles.filterText, { color: isActive ? "#fff" : colors.foreground }]}>
                    {filter}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        <View style={styles.prefRow}>
          <Text style={[styles.prefLabel, { color: colors.mutedForeground }]}>Hide alcohol content</Text>
          <Switch
            value={hideAlcohol}
            onValueChange={toggleHideAlcohol}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor="#fff"
            style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
            accessibilityLabel="Hide recipes and pairings that contain alcohol"
          />
        </View>

        {/* Main Content */}
        {showGrid ? (
          <View style={styles.gridWrap}>
            <Text style={[styles.sectionTitle, { color: colors.foreground, marginBottom: 16 }]}>
              {filteredItems.length} {filteredItems.length === 1 ? "Result" : "Results"}
            </Text>
            <View style={styles.grid}>
              {filteredItems.map((item) => renderItemCard(item.id, false))}
            </View>
            {filteredItems.length === 0 && (
              <View style={styles.emptyState}>
                <Ionicons name="search-outline" size={48} color={colors.muted} />
                <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No recipes found</Text>
                <Text style={[styles.emptySub, { color: colors.mutedForeground }]}>
                  Try adjusting your search or filters.
                </Text>
              </View>
            )}
          </View>
        ) : (
          <View style={styles.collectionsWrap}>
            {displayCollections.map((collection) => (
              <View key={collection.id} style={styles.collectionBlock}>
                <View style={styles.collectionHeader}>
                  <Text style={[styles.collectionTitle, { color: colors.foreground }]}>{collection.title}</Text>
                  <Text style={[styles.collectionSub, { color: colors.mutedForeground }]}>{collection.subtitle}</Text>
                </View>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.collectionScroll}
                  snapToInterval={296} // itemCardHorizontal width (280) + gap (16)
                  decelerationRate="fast"
                >
                  {collection.itemIds.map((itemId) => renderItemCard(itemId, true))}
                </ScrollView>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  riStudio: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 2,
    textTransform: "uppercase",
    marginBottom: 6,
  },
  headerTitle: {
    fontSize: 32,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.5,
  },
  headerSub: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    lineHeight: 20,
    marginTop: 6,
    maxWidth: 330,
  },
  searchWrap: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    height: 48,
    borderRadius: 12,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: "Inter_400Regular",
    height: "100%",
  },
  controlsRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  prefRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 20,
    marginTop: -8,
  },
  prefLabel: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
  filterScroll: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    gap: 10,
    alignItems: "center",
  },
  filterBtn: {
    minHeight: 44,
    paddingHorizontal: 20,
    borderRadius: 100,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  filterText: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
  },
  gridWrap: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  sectionTitle: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  collectionsWrap: {
    gap: 40,
    paddingTop: 8,
  },
  collectionBlock: {},
  collectionHeader: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  collectionTitle: {
    fontSize: 24,
    fontFamily: "Inter_700Bold",
    marginBottom: 4,
  },
  collectionSub: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    lineHeight: 20,
  },
  collectionScroll: {
    paddingHorizontal: 20,
    gap: 16,
  },
  itemCard: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
  },
  itemCardHorizontal: {
    width: 250,
  },
  itemCardGrid: {
    width: "48%",
  },
  itemImage: {
    width: "100%",
  },
  itemImageHorizontal: {
    height: 168,
  },
  itemImageGrid: {
    height: 132,
  },
  itemBody: {
    padding: 12,
    minHeight: 104,
  },
  itemTitle: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    lineHeight: 20,
    marginBottom: 7,
  },
  itemMetaRow: {
    gap: 4,
  },
  itemMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  itemMetaText: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
  },
  itemProtein: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
  },
  favoriteBtn: {
    position: "absolute",
    top: 8,
    left: 8,
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 22,
    backgroundColor: "rgba(18, 30, 24, 0.72)",
  },
  addBtn: {
    position: "absolute",
    right: 8,
    bottom: 8,
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 22,
  },
  iconPressed: {
    opacity: 0.72,
    transform: [{ scale: 0.94 }],
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: "Inter_600SemiBold",
    marginTop: 8,
  },
  emptySub: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
});
