import type { ComponentProps, ReactNode } from "react";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Swipeable, {
  type SwipeableMethods,
} from "react-native-gesture-handler/ReanimatedSwipeable";

export type SwipeableAction = {
  label: string;
  color: string;
  onPress: () => void;
  icon?: ComponentProps<typeof MaterialIcons>["name"];
};

type SwipeableListItemProps = {
  title: string;
  subtitle?: string;
  leftActions?: SwipeableAction[];
  rightActions?: SwipeableAction[];
  onPress?: () => void;
  children?: ReactNode;
};

export function SwipeableListItem({
  title,
  subtitle,
  leftActions = [],
  rightActions = [],
  onPress,
  children,
}: SwipeableListItemProps) {
  const renderActions = (
    actions: SwipeableAction[],
    side: "left" | "right",
    swipeable: SwipeableMethods,
  ) => (
    <View
      style={[
        styles.actionsContainer,
        side === "right" && styles.rightActionsContainer,
      ]}
    >
      {actions.map((action) => (
        <Pressable
          key={`${side}-${action.label}-${action.color}-${action.icon ?? "none"}`}
          accessibilityLabel={action.label}
          accessibilityRole="button"
          onPress={() => {
            swipeable.close();
            action.onPress();
          }}
          style={({ pressed }) => [
            styles.actionButton,
            { backgroundColor: action.color },
            pressed && styles.actionButtonPressed,
          ]}
        >
          {action.icon ? (
            <MaterialIcons name={action.icon} size={20} color="#ffffff" />
          ) : null}
          <Text style={styles.actionText} numberOfLines={1}>
            {action.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );

  return (
    <Swipeable
      containerStyle={styles.swipeContainer}
      friction={1.5}
      overshootFriction={8}
      leftThreshold={36}
      rightThreshold={36}
      renderLeftActions={
        leftActions.length > 0
          ? (_progress, _translation, swipeable) =>
              renderActions(leftActions, "left", swipeable)
          : undefined
      }
      renderRightActions={
        rightActions.length > 0
          ? (_progress, _translation, swipeable) =>
              renderActions(rightActions, "right", swipeable)
          : undefined
      }
    >
      <Pressable
        accessibilityRole={onPress ? "button" : undefined}
        onPress={onPress}
        style={({ pressed }) => [
          styles.card,
          pressed && onPress ? styles.cardPressed : null,
        ]}
      >
        <View style={styles.contentContainer}>
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
        {children}
      </Pressable>
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  swipeContainer: {
    borderRadius: 8,
    marginBottom: 12,
    overflow: "hidden",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    shadowColor: "#000000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  cardPressed: {
    opacity: 0.92,
  },
  contentContainer: {
    gap: 4,
  },
  title: {
    color: "#111827",
    fontSize: 16,
    fontWeight: "600",
  },
  subtitle: {
    color: "#6b7280",
    fontSize: 13,
  },
  actionsContainer: {
    flexDirection: "row",
    minWidth: 88,
  },
  rightActionsContainer: {
    justifyContent: "flex-end",
  },
  actionButton: {
    gap: 4,
    justifyContent: "center",
    alignItems: "center",
    minWidth: 80,
    height: "100%",
    paddingHorizontal: 10,
  },
  actionButtonPressed: {
    opacity: 0.85,
  },
  actionText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "600",
  },
});
