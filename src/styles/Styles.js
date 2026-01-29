import Colors from "@styles/Colors";
import { StyleSheet } from "react-native";
import { Fonts, Radii, Shadow } from "@styles/Theme";

const loginStyles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.BG,
    paddingHorizontal: 24,
  },
  logo: {
    height: 100,
    width: 100,
  },
  title: {
    fontSize: 25,
    marginVertical: 12,
    color: Colors.DGREY,
    fontFamily: Fonts.display,
    letterSpacing: 0.5,
  },
  inputs: {
    borderWidth: 1,
    borderColor: Colors.BORDER,
    paddingVertical: 12,
    paddingHorizontal: 16,
    width: "80%",
    marginVertical: 8,
    borderRadius: Radii.md,
    fontSize: 16,
    backgroundColor: Colors.WHITE,
  },
  button: {
    marginTop: 20,
    backgroundColor: Colors.PRIMARY,
    paddingVertical: 14,
    width: "80%",
    borderRadius: Radii.lg,
    ...Shadow.md,
  },
  textButton: {
    textAlign: "center",
    color: Colors.WHITE,
    fontSize: 16,
    fontFamily: Fonts.body,
    letterSpacing: 0.6,
  },
  textError: {
    fontSize: 15,
    color: Colors.ERROR,
    marginBottom: 10,
  },
  footerText: {
    fontSize: 14,
    marginTop: 50,
    color: Colors.MUTED,
    letterSpacing: 0.4,
  },
});

export { loginStyles };
