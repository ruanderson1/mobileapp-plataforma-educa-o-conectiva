import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { RouteProp } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Pressable, Text } from "react-native";
import { colors } from "../theme/colors";
import { RootStackParamList } from "./AppNavigator";
import ActivitiesScreen from "../screens/ActivitiesScreen";
import ParentObservationScreen from "../screens/ParentObservationScreen";
import ReportHistoryScreen from "../screens/ReportHistoryScreen";
import StudentHomeScreen from "../screens/StudentHomeScreen";
import { typography } from "../theme/typography";

export type MainTabsParamList = {
  Inicio: { studentId: string };
  Atividades: { studentId: string };
  Observacao: { studentId: string };
  Relatorios: { studentId: string };
};

type MainTabsProps = NativeStackScreenProps<RootStackParamList, "MainTabs">;

const Tab = createBottomTabNavigator<MainTabsParamList>();

function getTabLabel(routeName: keyof MainTabsParamList) {
  if (routeName === "Inicio") return "Início";
  if (routeName === "Observacao") return "Observação";
  if (routeName === "Relatorios") return "Relatórios";
  return routeName;
}

export default function BottomTabs({ route, navigation }: MainTabsProps) {
  const { studentId } = route.params;

  return (
    <Tab.Navigator
      screenOptions={({ route: tabRoute }) => ({
        headerShown: true,
        headerShadowVisible: false,
        headerStyle: {
          backgroundColor: colors.surface,
        },
        headerTitle: "",
        headerLeft: () => (
          <Pressable style={styles.backButton} onPress={() => navigation.replace("Children")}>
            <Text style={styles.backLink}>Voltar</Text>
          </Pressable>
        ),
        tabBarIconStyle: { display: "none" },
        tabBarLabelStyle: {
          fontSize: 13,
          fontWeight: "700",
          marginTop: 8,
          marginBottom: 10,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: "#5E7089",
        tabBarStyle: {
          height: 78,
          borderTopColor: colors.border,
          backgroundColor: colors.surface,
          borderTopWidth: 1,
          paddingTop: 6,
        },
        tabBarLabel: getTabLabel(tabRoute.name as keyof MainTabsParamList),
        tabBarItemStyle: {
          marginVertical: 7,
          marginHorizontal: 4,
          borderRadius: 12,
        },
      })}
    >
      <Tab.Screen name="Inicio" component={StudentHomeScreen} initialParams={{ studentId }} />
      <Tab.Screen name="Atividades" component={ActivitiesScreen} initialParams={{ studentId }} />
      <Tab.Screen
        name="Observacao"
        component={ParentObservationScreen}
        initialParams={{ studentId }}
      />
      <Tab.Screen name="Relatorios" component={ReportHistoryScreen} initialParams={{ studentId }} />
    </Tab.Navigator>
  );
}

export type MainTabRoute = RouteProp<MainTabsParamList, keyof MainTabsParamList>;

const styles = {
  backButton: {
    marginLeft: 12,
    paddingVertical: 4,
    paddingRight: 8,
  },
  backLink: {
    ...typography.bodySmall,
    color: colors.primary,
    fontWeight: "700" as const,
  },
};