import { BottomTabNavigationProp, BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { useNavigation } from "@react-navigation/native";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Badge from "../components/Badge";
import Card from "../components/Card";
import PrimaryButton from "../components/PrimaryButton";
import ScreenContainer from "../components/ScreenContainer";
import { MainTabsParamList } from "../navigation/BottomTabs";
import { getChildById, getCurrentParent, getStudentReport } from "../services/api";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";
import { CurrentReport, Student } from "../types";

type StudentHomeProps = BottomTabScreenProps<MainTabsParamList, "Inicio">;
type HomeNavigation = BottomTabNavigationProp<MainTabsParamList, "Inicio">;

export default function StudentHomeScreen({ route }: StudentHomeProps) {
  const navigation = useNavigation<HomeNavigation>();
  const [student, setStudent] = useState<Student | undefined>(undefined);
  const [report, setReport] = useState<CurrentReport | undefined>(undefined);
  const [errorMessage, setErrorMessage] = useState("");
  const [isResumoExpanded, setIsResumoExpanded] = useState(false);
  const [isNotaExpanded, setIsNotaExpanded] = useState(false);
  const [isDificuldadesExpanded, setIsDificuldadesExpanded] = useState(false);
  const [isRecomendacaoExpanded, setIsRecomendacaoExpanded] = useState(false);
  const parent = getCurrentParent();

  useEffect(() => {
    let mounted = true;

    Promise.all([getChildById(route.params.studentId), getStudentReport(route.params.studentId)])
      .then(([studentResponse, reportResponse]) => {
        if (mounted) {
          setStudent(studentResponse);
          setReport(reportResponse);
          setErrorMessage("");
        }
      })
      .catch((error: unknown) => {
        if (mounted) {
          setErrorMessage(error instanceof Error ? error.message : "Falha ao carregar dados do aluno.");
        }
      });

    return () => {
      mounted = false;
    };
  }, [route.params.studentId]);

  if (!student || !report) {
    return (
      <ScreenContainer>
        <Card>
          <Text style={styles.sectionLabel}>Carregando acompanhamento</Text>
          <Text style={styles.cardText}>
            {errorMessage || "Buscando o último relatório gerado para este aluno."}
          </Text>
        </Card>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <Card style={styles.headerPanel}>
        <Text style={styles.kicker}>Acompanhamento principal</Text>
        <Text style={styles.greeting}>Olá, {parent?.name ?? "Responsável"} 👋</Text>
        <Text style={styles.studentName}>Acompanhamento de {student.name}</Text>
        <Text style={styles.meta}>
          {student.className} · {report.periodo_referencia}
        </Text>
      </Card>

      <Card>
        <Text style={styles.sectionLabel}>Resumo da semana</Text>
        <Text style={styles.cardText} numberOfLines={isResumoExpanded ? undefined : 3}>
          {report.resumo_llm}
        </Text>
        <Pressable onPress={() => setIsResumoExpanded((prev) => !prev)}>
          <Text style={styles.seeMoreText}>{isResumoExpanded ? "Ver menos" : "Ver mais"}</Text>
        </Pressable>
      </Card>

      <PrimaryButton
        title="Contar algo sobre meu filho"
        onPress={() => navigation.navigate("Observacao", { studentId: student.id })}
      />

      <View style={styles.attentionCard}>
        <Text style={styles.attentionTitle}>Nota</Text>
        <Text style={styles.attentionNote} numberOfLines={isNotaExpanded ? undefined : 2}>
          Educar é um trabalho em conjunto. Ao compartilhar suas percepções, você ajuda o professor a
          compreender melhor seu filho e a oferecer um acompanhamento mais humano e personalizado.
        </Text>
        <Pressable onPress={() => setIsNotaExpanded((prev) => !prev)}>
          <Text style={styles.seeMoreText}>{isNotaExpanded ? "Ver menos" : "Ver mais"}</Text>
        </Pressable>
      </View>

      <Card>
        <Text style={styles.sectionLabel}>Indicadores do período</Text>

        <View style={styles.indicatorsGrid}>
          <View style={styles.indicatorCard}>
            <Text style={styles.indicatorLabel}>Desempenho</Text>
            <Badge label={report.desempenho_geral} />
          </View>

          <View style={styles.indicatorCard}>
            <Text style={styles.indicatorLabel}>Engajamento</Text>
            <Badge label={report.engajamento} />
          </View>
        </View>
      </Card>

      <Card>
        <Text style={styles.sectionLabel}>Ponto de atenção</Text>
        <Text style={styles.cardText} numberOfLines={isDificuldadesExpanded ? undefined : 3}>
          {report.dificuldades_aprendizagem}
        </Text>
        <Pressable onPress={() => setIsDificuldadesExpanded((prev) => !prev)}>
          <Text style={styles.seeMoreText}>{isDificuldadesExpanded ? "Ver menos" : "Ver mais"}</Text>
        </Pressable>
      </Card>

      <Card>
        <Text style={styles.sectionLabel}>Como ajudar em casa</Text>
        <Text style={styles.cardText} numberOfLines={isRecomendacaoExpanded ? undefined : 3}>
          {report.recomendacao_para_pais}
        </Text>
        <Pressable onPress={() => setIsRecomendacaoExpanded((prev) => !prev)}>
          <Text style={styles.seeMoreText}>{isRecomendacaoExpanded ? "Ver menos" : "Ver mais"}</Text>
        </Pressable>
      </Card>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  headerPanel: {
    marginBottom: spacing.xs,
  },
  kicker: {
    ...typography.labelCaps,
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  greeting: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: "600",
  },
  studentName: {
    ...typography.titleMedium,
    color: colors.textPrimary,
    marginTop: spacing.xs,
  },
  meta: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  sectionLabel: {
    ...typography.labelCaps,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  cardText: {
    ...typography.body,
    color: colors.textPrimary,
  },
  attentionCard: {
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
    padding: spacing.sm,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(76, 175, 80, 0.22)",
    backgroundColor: "rgba(129, 199, 132, 0.18)",
  },
  attentionTitle: {
    ...typography.bodySmall,
    color: "#2E7D32",
    fontWeight: "700",
    marginBottom: spacing.xs,
  },
  attentionNote: {
    ...typography.bodySmall,
    color: colors.textPrimary,
    lineHeight: 18,
  },
  seeMoreText: {
    ...typography.bodySmall,
    color: colors.primary,
    marginTop: spacing.xs,
    fontWeight: "700",
    alignSelf: "flex-start",
  },
  indicatorsGrid: {
    gap: spacing.sm,
  },
  indicatorCard: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.inputBackground,
    borderRadius: 14,
    padding: spacing.sm,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  indicatorLabel: {
    ...typography.bodySmall,
    color: colors.textPrimary,
    fontWeight: "600",
  },
});