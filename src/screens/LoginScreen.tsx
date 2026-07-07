import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import Card from "../components/Card";
import PrimaryButton from "../components/PrimaryButton";
import ScreenContainer from "../components/ScreenContainer";
import { loginResponsavel } from "../services/api";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";
import { RootStackParamList } from "../navigation/AppNavigator";

type LoginNavigation = NativeStackNavigationProp<RootStackParamList, "Login">;

export default function LoginScreen() {
  const navigation = useNavigation<LoginNavigation>();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [enviando, setEnviando] = useState(false);

  const handleLogin = async () => {
    setEnviando(true);
    const resultado = await loginResponsavel(identifier, password);
    setMensagem(resultado.mensagem);
    setEnviando(false);

    if (resultado.sucesso) {
      navigation.replace("Children");
    }
  };

  return (
    <ScreenContainer scroll={false} contentStyle={styles.container}>
      <Card style={styles.loginCard}>
        <View style={styles.header}>
          <Text style={styles.kicker}>Acesso responsável</Text>
          <Text style={styles.appName}>Educação Conectiva</Text>
          <Text style={styles.subtitle}>
            Acompanhe o desenvolvimento escolar do seu filho com clareza e cuidado.
          </Text>
        </View>

        <View style={styles.form}>
          <TextInput
            style={styles.input}
            value={identifier}
            onChangeText={setIdentifier}
            placeholder="E-mail ou telefone"
            placeholderTextColor={colors.textSecondary}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="Senha"
            placeholderTextColor={colors.textSecondary}
            secureTextEntry
          />

          <PrimaryButton title={enviando ? "Entrando..." : "Entrar"} onPress={handleLogin} disabled={enviando} />

          {mensagem ? <Text style={styles.feedback}>{mensagem}</Text> : null}

          <Pressable>
            <Text style={styles.forgotPassword}>Esqueci minha senha</Text>
          </Pressable>

          <Pressable onPress={() => navigation.navigate("Register")}>
            <Text style={styles.registerLink}>Ainda não tenho conta. Fazer cadastro</Text>
          </Pressable>
        </View>
      </Card>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    paddingBottom: spacing.lg,
  },
  loginCard: {
    gap: spacing.lg,
  },
  header: {
    gap: spacing.sm,
  },
  kicker: {
    ...typography.labelCaps,
    color: colors.primary,
  },
  appName: {
    ...typography.titleLarge,
    color: colors.textPrimary,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
  },
  form: {
    gap: spacing.md,
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
  forgotPassword: {
    ...typography.bodySmall,
    color: colors.primary,
    textAlign: "center",
    marginTop: spacing.sm,
  },
  registerLink: {
    ...typography.bodySmall,
    color: colors.navy,
    textAlign: "center",
    fontWeight: "700",
  },
  feedback: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    textAlign: "center",
  },
});