import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import Card from "../components/Card";
import PrimaryButton from "../components/PrimaryButton";
import ScreenContainer from "../components/ScreenContainer";
import { RootStackParamList } from "../navigation/AppNavigator";
import { registerResponsavel } from "../services/api";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";
import { ResponsavelChildLink } from "../types";

type RegisterNavigation = NativeStackNavigationProp<RootStackParamList, "Register">;

export default function RegisterScreen() {
  const navigation = useNavigation<RegisterNavigation>();
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [codigoSalaFilho, setCodigoSalaFilho] = useState("");
  const [codigoFilho, setCodigoFilho] = useState("");
  const [vinculosFilhos, setVinculosFilhos] = useState<ResponsavelChildLink[]>([]);
  const [mensagem, setMensagem] = useState("");
  const [enviando, setEnviando] = useState(false);

  const handleAdicionarFilho = () => {
    const sala = codigoSalaFilho.trim().toUpperCase();
    const filho = codigoFilho.trim().toUpperCase();
    if (!sala || !filho) {
      setMensagem("Informe código da sala e código do filho para adicionar.");
      return;
    }

    const duplicated = vinculosFilhos.some(
      (item) => item.codigoSala === sala && item.codigoFilho === filho,
    );
    if (duplicated) {
      setMensagem("Esse vínculo de filho já foi adicionado.");
      return;
    }

    setVinculosFilhos((prev) => [...prev, { codigoSala: sala, codigoFilho: filho }]);
    setCodigoSalaFilho("");
    setCodigoFilho("");
    setMensagem("");
  };

  const handleRemoverFilho = (indexToRemove: number) => {
    setVinculosFilhos((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleCadastro = async () => {
    setEnviando(true);
    const resultado = await registerResponsavel({
      nome,
      email,
      senha,
      vinculosFilhos,
    });

    setMensagem(resultado.mensagem);
    setEnviando(false);

    if (resultado.sucesso) {
      setTimeout(() => navigation.replace("Login"), 800);
    }
  };

  return (
    <ScreenContainer>
      <Card style={styles.formCard}>
        <View style={styles.header}>
          <Text style={styles.kicker}>Cadastro de responsável</Text>
          <Text style={styles.title}>Criar conta</Text>
          <Text style={styles.subtitle}>
            Use o código da sala e os códigos dos filhos para vincular o acompanhamento.
          </Text>
        </View>

        <View style={styles.form}>
          <TextInput
            style={styles.input}
            value={nome}
            onChangeText={setNome}
            placeholder="Nome completo"
            placeholderTextColor={colors.textSecondary}
          />

          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="E-mail"
            placeholderTextColor={colors.textSecondary}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <TextInput
            style={styles.input}
            value={senha}
            onChangeText={setSenha}
            placeholder="Senha"
            placeholderTextColor={colors.textSecondary}
            secureTextEntry
          />

          <TextInput
            style={styles.input}
            value={codigoSalaFilho}
            onChangeText={setCodigoSalaFilho}
            placeholder="Código da sala do filho (ex.: CL-AB12CD34)"
            placeholderTextColor={colors.textSecondary}
            autoCapitalize="characters"
          />

          <TextInput
            style={styles.input}
            value={codigoFilho}
            onChangeText={setCodigoFilho}
            placeholder="Código do filho (4 últimos dígitos do ID)"
            placeholderTextColor={colors.textSecondary}
            autoCapitalize="characters"
          />

          <PrimaryButton title="Adicionar filho" onPress={handleAdicionarFilho} />

          {vinculosFilhos.length > 0 ? (
            <View style={styles.childrenList}>
              {vinculosFilhos.map((item, index) => (
                <View key={`${item.codigoSala}-${item.codigoFilho}`} style={styles.childRow}>
                  <Text style={styles.childText}>
                    Sala {item.codigoSala} · Filho {item.codigoFilho}
                  </Text>
                  <Pressable onPress={() => handleRemoverFilho(index)}>
                    <Text style={styles.removeLink}>Remover</Text>
                  </Pressable>
                </View>
              ))}
            </View>
          ) : null}

          <PrimaryButton title={enviando ? "Cadastrando..." : "Cadastrar"} onPress={handleCadastro} disabled={enviando} />

          {mensagem ? (
            <Text style={styles.feedback}>{mensagem}</Text>
          ) : (
            <Text style={styles.helper}>
              Adicione cada filho separadamente. Cada vínculo pode ter uma sala diferente.
            </Text>
          )}

          <Pressable onPress={() => navigation.replace("Login")}>
            <Text style={styles.link}>Já tenho conta. Entrar</Text>
          </Pressable>
        </View>
      </Card>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  formCard: {
    gap: spacing.lg,
  },
  header: {
    gap: spacing.xs,
  },
  kicker: {
    ...typography.labelCaps,
    color: colors.primary,
  },
  title: {
    ...typography.titleMedium,
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
  helper: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  feedback: {
    ...typography.bodySmall,
    color: colors.success,
    fontWeight: "700",
  },
  link: {
    ...typography.bodySmall,
    color: colors.primary,
    textAlign: "center",
  },
  childrenList: {
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: spacing.sm,
    backgroundColor: colors.inputBackground,
  },
  childRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: spacing.sm,
  },
  childText: {
    ...typography.bodySmall,
    color: colors.textPrimary,
    flex: 1,
  },
  removeLink: {
    ...typography.bodySmall,
    color: colors.danger,
    fontWeight: "700",
  },
});