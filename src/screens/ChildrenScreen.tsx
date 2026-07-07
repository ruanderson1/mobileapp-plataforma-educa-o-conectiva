import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import Badge from "../components/Badge";
import Card from "../components/Card";
import PrimaryButton from "../components/PrimaryButton";
import ScreenContainer from "../components/ScreenContainer";
import { RootStackParamList } from "../navigation/AppNavigator";
import { addChildToCurrentParent, getChildren } from "../services/api";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";
import { Student } from "../types";

type ChildrenNavigation = NativeStackNavigationProp<RootStackParamList, "Children">;

export default function ChildrenScreen() {
  const navigation = useNavigation<ChildrenNavigation>();
  const [students, setStudents] = useState<Student[]>([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [codigoSala, setCodigoSala] = useState("");
  const [codigoFilho, setCodigoFilho] = useState("");
  const [savingChild, setSavingChild] = useState(false);

  const loadChildren = async () => {
    try {
      const response = await getChildren();
      setStudents(response);
      setErrorMessage("");
    } catch (error: unknown) {
      setErrorMessage(error instanceof Error ? error.message : "Falha ao carregar filhos vinculados.");
    }
  };

  useEffect(() => {
    void loadChildren();
  }, []);

  const handleAddChild = async () => {
    setSavingChild(true);
    const result = await addChildToCurrentParent(codigoSala, codigoFilho);
    setSavingChild(false);
    setErrorMessage(result.mensagem);

    if (result.sucesso) {
      setCodigoSala("");
      setCodigoFilho("");
      setShowAddForm(false);
      await loadChildren();
    }
  };

  const total = students.length;
  const abertas = students.length;
  const atencao = students.filter((student) => student.status !== "Bom").length;

  return (
    <ScreenContainer>
      <Card style={styles.panelHeader}>
        <Text style={styles.kicker}>Workspace da família</Text>
        <Text style={styles.title}>Meus filhos</Text>
        <Text style={styles.subtitle}>Escolha qual acompanhamento deseja visualizar.</Text>
        <Pressable onPress={() => setShowAddForm((prev) => !prev)}>
          <Text style={styles.addLink}>+ Adicionar outro aluno</Text>
        </Pressable>

        {showAddForm ? (
          <View style={styles.addForm}>
            <TextInput
              style={styles.input}
              value={codigoSala}
              onChangeText={setCodigoSala}
              placeholder="Código da sala (ex.: CL-AB12CD34)"
              placeholderTextColor={colors.textSecondary}
              autoCapitalize="characters"
            />
            <TextInput
              style={styles.input}
              value={codigoFilho}
              onChangeText={setCodigoFilho}
              placeholder="Código do filho (4 últimos dígitos)"
              placeholderTextColor={colors.textSecondary}
              autoCapitalize="characters"
            />
            <PrimaryButton
              title={savingChild ? "Adicionando..." : "Vincular aluno"}
              onPress={handleAddChild}
              disabled={savingChild}
            />
          </View>
        ) : null}
      </Card>

      <View style={styles.metricsRow}>
        <Card style={styles.metricCard}>
          <Text style={styles.metricLabel}>Total</Text>
          <Text style={styles.metricValue}>{total}</Text>
        </Card>
        <Card style={styles.metricCard}>
          <Text style={styles.metricLabel}>Acompanhando</Text>
          <Text style={styles.metricValue}>{abertas}</Text>
        </Card>
        <Card style={styles.metricCard}>
          <Text style={styles.metricLabel}>Atenção</Text>
          <Text style={styles.metricValue}>{atencao}</Text>
        </Card>
      </View>

      {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

      {students.map((student) => (
        <Card key={student.id}>
          <View style={styles.cardHeader}>
            <View style={styles.headerTextContainer}>
              <Text style={styles.studentName}>{student.name}</Text>
              <Text style={styles.className}>{student.className}</Text>
            </View>
            <Badge label={student.status} />
          </View>

          <Text style={styles.summary}>{student.summary}</Text>

          <PrimaryButton
            title="Ver acompanhamento"
            onPress={() => navigation.replace("MainTabs", { studentId: student.id })}
          />
        </Card>
      ))}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  panelHeader: {
    backgroundColor: colors.surface,
  },
  kicker: {
    ...typography.labelCaps,
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  title: {
    ...typography.titleMedium,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
  },
  metricsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  metricCard: {
    flexGrow: 1,
    minWidth: 100,
    paddingVertical: spacing.sm,
  },
  metricLabel: {
    ...typography.labelCaps,
    color: colors.textSecondary,
  },
  metricValue: {
    ...typography.heading,
    color: colors.navy,
    marginTop: spacing.xs,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  headerTextContainer: {
    flexShrink: 1,
  },
  studentName: {
    ...typography.heading,
    color: colors.textPrimary,
  },
  className: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: 2,
  },
  summary: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  errorText: {
    ...typography.bodySmall,
    color: colors.danger,
  },
  addLink: {
    ...typography.bodySmall,
    color: colors.primary,
    marginTop: spacing.sm,
    fontWeight: "700",
  },
  addForm: {
    marginTop: spacing.sm,
    gap: spacing.sm,
  },
  input: {
    backgroundColor: colors.inputBackground,
    borderColor: colors.borderStrong,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    ...typography.body,
    color: colors.textPrimary,
  },
});