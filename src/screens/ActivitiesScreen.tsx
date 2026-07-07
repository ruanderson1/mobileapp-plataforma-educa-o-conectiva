import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import ActivityCard from "../components/ActivityCard";
import ScreenContainer from "../components/ScreenContainer";
import { MainTabsParamList } from "../navigation/BottomTabs";
import { getStudentActivities } from "../services/api";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";
import Card from "../components/Card";
import { Activity } from "../types";

type ActivitiesProps = BottomTabScreenProps<MainTabsParamList, "Atividades">;

export default function ActivitiesScreen({ route }: ActivitiesProps) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let mounted = true;

    getStudentActivities(route.params.studentId)
      .then((response) => {
        if (mounted) {
          setActivities(response);
          setErrorMessage("");
        }
      })
      .catch((error: unknown) => {
        if (mounted) {
          setErrorMessage(error instanceof Error ? error.message : "Falha ao carregar atividades.");
        }
      });

    return () => {
      mounted = false;
    };
  }, [route.params.studentId]);

  return (
    <ScreenContainer>
      <Card style={styles.headerCard}>
        <Text style={styles.kicker}>Painel da turma</Text>
        <Text style={styles.title}>Atividades do período</Text>
        <Text style={styles.subtitle}>
          Aqui você acompanha as entregas e avaliações consideradas no acompanhamento.
        </Text>
      </Card>

      {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

      {activities.map((activity) => (
        <ActivityCard key={activity.id} activity={activity} />
      ))}
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
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
  },
  errorText: {
    ...typography.bodySmall,
    color: colors.danger,
  },
});