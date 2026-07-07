import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Card from "../components/Card";
import ScreenContainer from "../components/ScreenContainer";
import { RootStackParamList } from "../navigation/AppNavigator";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";

type ReportDetailsProps = NativeStackScreenProps<RootStackParamList, "ReportDetails">;

export default function ReportDetailsScreen({ navigation, route }: ReportDetailsProps) {
  const { report } = route.params;

  return (
    <ScreenContainer>
      <Pressable onPress={() => navigation.goBack()} style={styles.backLink}>
        <Text style={styles.backLinkText}>Voltar</Text>
      </Pressable>

      <Card>
        <Text style={styles.kicker}>Detalhes do relatório</Text>
        <Text style={styles.title}>{report.periodo_referencia}</Text>
        <Text style={styles.body}>{report.resumo_llm}</Text>
      </Card>

      <Card>
        <Text style={styles.sectionLabel}>Indicadores</Text>
        <View style={styles.grid}>
          <DetailRow label="Desempenho geral" value={report.desempenho_geral} />
          <DetailRow label="Engajamento" value={report.engajamento} />
          <DetailRow
            label="Necessita intervenção"
            value={report.necessita_intervencao ? "Sim" : "Não"}
          />
        </View>
      </Card>

      <Card>
        <Text style={styles.sectionLabel}>Dificuldades de aprendizagem</Text>
        <Text style={styles.body}>{report.dificuldades_aprendizagem}</Text>
      </Card>

      <Card>
        <Text style={styles.sectionLabel}>Recomendação para pais</Text>
        <Text style={styles.body}>{report.recomendacao_para_pais}</Text>
      </Card>

      <Card>
        <Text style={styles.sectionLabel}>Plano de ação sugerido</Text>
        <Text style={styles.body}>{report.plano_acao_sugerido}</Text>
      </Card>
    </ScreenContainer>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  backLink: {
    alignSelf: "flex-start",
    paddingVertical: spacing.xs,
  },
  backLinkText: {
    ...typography.bodySmall,
    color: colors.primary,
    fontWeight: "700",
  },
  kicker: {
    ...typography.labelCaps,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  title: {
    ...typography.titleMedium,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  sectionLabel: {
    ...typography.labelCaps,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  body: {
    ...typography.body,
    color: colors.textPrimary,
  },
  grid: {
    gap: spacing.sm,
  },
  detailRow: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.inputBackground,
    borderRadius: 14,
    padding: spacing.sm,
    gap: 6,
  },
  detailLabel: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    fontWeight: "600",
  },
  detailValue: {
    ...typography.body,
    color: colors.textPrimary,
  },
});