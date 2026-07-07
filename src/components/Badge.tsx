import { StyleSheet, Text, View } from "react-native";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { StatusBadgeLabel } from "../types";

interface BadgeProps {
  label: StatusBadgeLabel;
}

const paletteByLabel: Record<StatusBadgeLabel, { background: string; text: string }> = {
  Bom: { background: "#E4F4E6", text: colors.success },
  Atenção: { background: "#FFF3D9", text: colors.warning },
  Cuidado: { background: "#FDE6E6", text: colors.danger },
  Baixo: { background: "#FDE6E6", text: colors.danger },
  Médio: { background: "#FFF3D9", text: colors.warning },
  Alto: { background: "#E4F4E6", text: colors.success },
  Sim: { background: "#FFF3D9", text: colors.warning },
  Não: { background: "#E4F4E6", text: colors.success },
};

export default function Badge({ label }: BadgeProps) {
  const palette = paletteByLabel[label];

  return (
    <View style={[styles.container, { backgroundColor: palette.background }]}> 
      <Text style={[styles.text, { color: palette.text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: "flex-start",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(24, 51, 94, 0.12)",
  },
  text: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.4,
  },
});