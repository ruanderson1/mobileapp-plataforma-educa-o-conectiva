import { StyleSheet, Text, View } from "react-native";
import { ReportHistoryItem } from "../types";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";
import Badge from "./Badge";
import Card from "./Card";
import PrimaryButton from "./PrimaryButton";

interface ReportCardProps {
  report: ReportHistoryItem;
  onPressDetails: () => void;
}

export default function ReportCard({ report, onPressDetails }: ReportCardProps) {
  return (
    <Card>
      <Text style={styles.kicker}>Período</Text>
      <Text style={styles.period}>{report.periodo}</Text>
      <View style={styles.badgeWrapper}>
        <Badge label={report.status} />
      </View>
      <Text style={styles.summaryLabel}>Resumo</Text>
      <Text style={styles.summary}>{report.resumo}</Text>
      <PrimaryButton title="Ver detalhes" onPress={onPressDetails} />
    </Card>
  );
}

const styles = StyleSheet.create({
  kicker: {
    ...typography.labelCaps,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  period: {
    ...typography.heading,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  badgeWrapper: {
    marginBottom: spacing.sm,
  },
  summaryLabel: {
    ...typography.labelCaps,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  summary: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
});