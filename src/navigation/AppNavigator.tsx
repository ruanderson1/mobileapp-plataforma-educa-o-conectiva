import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ChildrenScreen from "../screens/ChildrenScreen";
import LoginScreen from "../screens/LoginScreen";
import ReportDetailsScreen from "../screens/ReportDetailsScreen";
import RegisterScreen from "../screens/RegisterScreen";
import BottomTabs from "./BottomTabs";
import { CurrentReport } from "../types";

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Children: undefined;
  MainTabs: { studentId: string };
  ReportDetails: { report: CurrentReport };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Login">
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Children" component={ChildrenScreen} />
        <Stack.Screen name="MainTabs" component={BottomTabs} />
        <Stack.Screen name="ReportDetails" component={ReportDetailsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}