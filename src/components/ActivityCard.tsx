import { StyleSheet, Text, View } from "react-native";
import { Activity } from "../types";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";
import Card from "./Card";

interface ActivityCardProps {
  activity: Activity;
}

export default function ActivityCard({ activity }: ActivityCardProps) {
  return (
    <Card>
      <Text style={styles.kicker}>Atividade</Text>
      <Text style={styles.title}>{activity.tipo}</Text>

      <View style={styles.metricsRow}>
        <View style={styles.metricBox}>
          <Text style={styles.label}>Pontuação</Text>
          <Text style={styles.value}>
            {activity.pontuacao}/{activity.notaMaxima}
          </Text>
        </View>

        <View style={styles.metricBox}>
          <Text style={styles.label}>Peso</Text>
          <Text style={styles.value}>{activity.peso}</Text>
        </View>
      </View>

      <Text style={styles.observationLabel}>Observação</Text>
      <Text style={styles.observation}>{activity.observacoes}</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  kicker: {
    ...typography.labelCaps,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  title: {
    ...typography.heading,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  metricsRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  metricBox: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.inputBackground,
    borderRadius: 14,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
  },
  label: {
    ...typography.labelCaps,
    color: colors.textSecondary,
  },
  value: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: "700",
    marginTop: spacing.xs,
  },
  observationLabel: {
    ...typography.labelCaps,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  observation: {
    ...typography.bodySmall,
    color: colors.textPrimary,
  },
});