import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import Card from "../components/Card";
import PrimaryButton from "../components/PrimaryButton";
import ScreenContainer from "../components/ScreenContainer";
import { MainTabsParamList } from "../navigation/BottomTabs";
import {
  deleteParentObservation,
  getChildById,
  getParentObservations,
  submitParentObservation,
  updateParentObservation,
} from "../services/api";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";
import { ParentObservation, Student } from "../types";

type ParentObservationProps = BottomTabScreenProps<MainTabsParamList, "Observacao">;

export default function ParentObservationScreen({ route }: ParentObservationProps) {
  const [student, setStudent] = useState<Student | undefined>(undefined);
  const [observationText, setObservationText] = useState("");
  const [observations, setObservations] = useState<ParentObservation[]>([]);
  const [editingObservationId, setEditingObservationId] = useState<string | null>(null);
  const [isLoadingObservations, setIsLoadingObservations] = useState(true);
  const [isSavingObservation, setIsSavingObservation] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const response = await getChildById(route.params.studentId);
        if (mounted) {
          setStudent(response);
        }

        const loadedObservations = await getParentObservations(route.params.studentId);
        if (mounted) {
          setObservations(loadedObservations);
          setErrorMessage("");
        }
      } catch (error: unknown) {
        if (mounted) {
          setErrorMessage(error instanceof Error ? error.message : "Falha ao carregar observações.");
        }
      } finally {
        if (mounted) {
          setIsLoadingObservations(false);
        }
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, [route.params.studentId]);

  const resetEditor = () => {
    setObservationText("");
    setEditingObservationId(null);
  };

  const handleSubmit = async () => {
    const trimmed = observationText.trim();
    if (!trimmed || !student || isSavingObservation) return;

    setIsSavingObservation(true);
    setSuccessMessage("");
    setErrorMessage("");

    try {
      if (editingObservationId) {
        const updated = await updateParentObservation(student.id, editingObservationId, trimmed);
        setObservations((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
        setSuccessMessage("Observação atualizada com sucesso.");
      } else {
        const created = await submitParentObservation(student.id, trimmed);
        setObservations((prev) => [created, ...prev]);
        setSuccessMessage("Observação enviada com sucesso.");
      }

      resetEditor();
    } catch (error: unknown) {
      setErrorMessage(error instanceof Error ? error.message : "Não foi possível salvar a observação.");
    } finally {
      setIsSavingObservation(false);
    }
  };

  const handleEdit = (observation: ParentObservation) => {
    if (observation.authorType !== "parent") {
      return;
    }

    setObservationText(observation.text);
    setEditingObservationId(observation.id);
    setSuccessMessage("");
    setErrorMessage("");
  };

  const handleDelete = (observation: ParentObservation) => {
    if (observation.authorType !== "parent") {
      return;
    }

    if (!student || isSavingObservation) return;

    Alert.alert(
      "Apagar observação",
      "Essa ação remove a observação permanentemente.",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Apagar",
          style: "destructive",
          onPress: async () => {
            try {
              setIsSavingObservation(true);
              setSuccessMessage("");
              setErrorMessage("");

              await deleteParentObservation(student.id, observation.id);
              setObservations((prev) => prev.filter((item) => item.id !== observation.id));

              if (editingObservationId === observation.id) {
                resetEditor();
              }

              setSuccessMessage("Observação apagada com sucesso.");
            } catch (error: unknown) {
              setErrorMessage(error instanceof Error ? error.message : "Não foi possível apagar a observação.");
            } finally {
              setIsSavingObservation(false);
            }
          },
        },
      ],
    );
  };

  const formatDate = (isoDate: string) => {
    const date = new Date(isoDate);
    if (Number.isNaN(date.getTime())) {
      return "Data indisponível";
    }

    return date.toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <ScreenContainer>
      <Card style={styles.headerCard}>
        <Text style={styles.kicker}>Canal da família</Text>
        <Text style={styles.title}>Observação sobre {student?.name ?? "aluno"}</Text>
        <Text style={styles.helperText}>
          Conte algo que você percebeu em casa. Pode ser sobre estudos, rotina, motivação,
          comportamento ou alguma dificuldade recente.
        </Text>
        {errorMessage ? <Text style={styles.errorMessage}>{errorMessage}</Text> : null}
      </Card>

      <Card>
        <TextInput
          style={styles.textArea}
          multiline
          textAlignVertical="top"
          value={observationText}
          onChangeText={setObservationText}
          placeholder="Exemplo: Percebi que ela está mais cansada esta semana e evitou fazer as tarefas de matemática."
          placeholderTextColor={colors.textSecondary}
        />

        <PrimaryButton
          title={editingObservationId ? "Salvar edição" : "Enviar observação"}
          onPress={handleSubmit}
          disabled={isSavingObservation}
        />

        {editingObservationId ? (
          <Pressable style={styles.cancelButton} onPress={resetEditor}>
            <Text style={styles.cancelButtonText}>Cancelar edição</Text>
          </Pressable>
        ) : null}

        <Text style={styles.secondaryText}>
          Sua observação será considerada no próximo acompanhamento do aluno.
        </Text>

        {successMessage ? <Text style={styles.successMessage}>{successMessage}</Text> : null}

        <Text style={styles.counterText}>Observações cadastradas: {observations.length}</Text>
      </Card>

      <Card>
        <Text style={styles.listTitle}>Observações já enviadas</Text>

        {isLoadingObservations ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color={colors.primary} />
            <Text style={styles.loadingText}>Carregando observações...</Text>
          </View>
        ) : null}

        {!isLoadingObservations && observations.length === 0 ? (
          <Text style={styles.emptyStateText}>Nenhuma observação registrada ainda.</Text>
        ) : null}

        {!isLoadingObservations
          ? observations.map((observation) => (
              <View key={observation.id} style={styles.observationItem}>
                <View style={styles.observationHeaderRow}>
                  <Text style={styles.observationDate}>{formatDate(observation.createdAt)}</Text>
                  <View
                    style={[
                      styles.sourceBadge,
                      observation.authorType === "parent" ? styles.parentBadge : styles.teacherBadge,
                    ]}
                  >
                    <Text
                      style={[
                        styles.sourceBadgeText,
                        observation.authorType === "parent"
                          ? styles.parentBadgeText
                          : styles.teacherBadgeText,
                      ]}
                    >
                      {observation.authorLabel}
                    </Text>
                  </View>
                </View>
                <Text style={styles.observationContent}>{observation.text}</Text>

                {observation.authorType === "parent" ? (
                  <View style={styles.actionsRow}>
                    <Pressable
                      style={[styles.actionButton, styles.editButton]}
                      onPress={() => handleEdit(observation)}
                    >
                      <Text style={[styles.actionButtonText, styles.editButtonText]}>Editar</Text>
                    </Pressable>

                    <Pressable
                      style={[styles.actionButton, styles.deleteButton]}
                      onPress={() => handleDelete(observation)}
                    >
                      <Text style={[styles.actionButtonText, styles.deleteButtonText]}>Apagar</Text>
                    </Pressable>
                  </View>
                ) : (
                  <Text style={styles.teacherHintText}>Observação registrada pela escola.</Text>
                )}
              </View>
            ))
          : null}
      </Card>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  headerCard: {
    marginBottom: spacing.xs,
  },
  kicker: {
    ...typography.labelCaps,
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  title: {
    ...typography.titleMedium,
    color: colors.textPrimary,
  },
  helperText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  textArea: {
    minHeight: 150,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 12,
    padding: spacing.md,
    backgroundColor: colors.inputBackground,
    ...typography.body,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  secondaryText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  cancelButton: {
    marginTop: spacing.sm,
    alignSelf: "flex-start",
  },
  cancelButtonText: {
    ...typography.bodySmall,
    color: colors.primary,
    fontWeight: "700",
  },
  successMessage: {
    ...typography.bodySmall,
    color: colors.success,
    marginTop: spacing.sm,
    fontWeight: "700",
  },
  counterText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  errorMessage: {
    ...typography.bodySmall,
    color: colors.danger,
    marginTop: spacing.sm,
  },
  listTitle: {
    ...typography.heading,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginVertical: spacing.sm,
  },
  loadingText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  emptyStateText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  observationItem: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.md,
    marginTop: spacing.md,
  },
  observationDate: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  observationHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.xs,
    gap: spacing.sm,
  },
  sourceBadge: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  sourceBadgeText: {
    ...typography.bodySmall,
    fontWeight: "700",
  },
  parentBadge: {
    borderColor: colors.primary,
    backgroundColor: colors.softPrimary,
  },
  parentBadgeText: {
    color: colors.primary,
  },
  teacherBadge: {
    borderColor: "#C9DAF7",
    backgroundColor: "#F3F8FF",
  },
  teacherBadgeText: {
    color: "#4A72B2",
  },
  observationContent: {
    ...typography.body,
    color: colors.textPrimary,
  },
  teacherHintText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
  actionsRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  actionButton: {
    borderRadius: 999,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
  },
  actionButtonText: {
    ...typography.bodySmall,
    fontWeight: "700",
  },
  editButton: {
    borderColor: colors.primary,
    backgroundColor: colors.softPrimary,
  },
  editButtonText: {
    color: colors.primary,
  },
  deleteButton: {
    borderColor: colors.borderStrong,
    backgroundColor: colors.surface,
  },
  deleteButtonText: {
    color: colors.textSecondary,
  },
});