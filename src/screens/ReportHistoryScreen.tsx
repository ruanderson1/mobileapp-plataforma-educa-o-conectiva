import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import ReportCard from "../components/ReportCard";
import ScreenContainer from "../components/ScreenContainer";
import { RootStackParamList } from "../navigation/AppNavigator";
import { MainTabsParamList } from "../navigation/BottomTabs";
import { getStudentReportHistory } from "../services/api";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";
import Card from "../components/Card";
import { ReportHistoryItem } from "../types";

type ReportHistoryProps = BottomTabScreenProps<MainTabsParamList, "Relatorios">;
type RootNavigation = NativeStackNavigationProp<RootStackParamList>;

export default function ReportHistoryScreen({ route }: ReportHistoryProps) {
  const [reports, setReports] = useState<ReportHistoryItem[]>([]);
  const navigation = useNavigation<RootNavigation>();

  const openReportDetails = (report: ReportHistoryItem) => {
    navigation.navigate("ReportDetails", { report: report.detalhes });
  };

  useEffect(() => {
    let mounted = true;

    getStudentReportHistory(route.params.studentId).then((response) => {
      if (mounted) {
        setReports(response);
      }
    });

    return () => {
      mounted = false;
    };
  }, [route.params.studentId]);

  return (
    <ScreenContainer>
      <Card style={styles.headerCard}>
        <Text style={styles.kicker}>Histórico escolar</Text>
        <Text style={styles.title}>Relatórios</Text>
        <Text style={styles.subtitle}>
          Acompanhe a evolução do seu filho ao longo dos períodos.
        </Text>
      </Card>

      {reports.map((report) => (
        <ReportCard
          key={report.id}
          report={report}
          onPressDetails={() => openReportDetails(report)}
        />
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
});