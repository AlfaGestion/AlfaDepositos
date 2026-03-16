import { StyleSheet } from "react-native";
import Colors from "./Colors";
import { Fonts, Shadow, Radii } from "@styles/Theme";

const ConfigStyles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  container: {
    padding: 15,
    paddingTop: 8,
  },
  loader: {
    padding: 30,
  },
  buttonSave: {
    textAlign: "center",
    marginTop: 12,
    marginBottom: 20,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
    backgroundColor: Colors.DGREEN,
    paddingVertical: 12,
    borderRadius: Radii.lg,
    ...Shadow.sm,
  },
  buttonSaveText: {
    color: Colors.WHITE,
    fontSize: 16,
    fontFamily: Fonts.display,
    letterSpacing: 0.5,
  },
  messageStatus: {
    textAlign: "center",
    marginVertical: 8,
  },
  buttonRestartTables: {
    textAlign: "center",
    marginTop: 6,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
    backgroundColor: Colors.RED,
    paddingVertical: 12,
    borderRadius: Radii.lg,
    ...Shadow.sm,
  },
  buttonRestartTablesText: {
    color: Colors.WHITE,
    fontSize: 15,
    fontFamily: Fonts.display,
    letterSpacing: 0.4,
  },
  textDeletingTables: {
    textAlign: "center",
    marginTop: 5,
  },
  buttonIcon: {
    width: 18,
    height: 18,
    tintColor: Colors.WHITE,
  },
  themeModeBlock: {
    marginTop: 14,
  },
  themeModeTitle: {
    fontSize: 16,
    marginBottom: 8,
    color: "#1B1B1B",
    fontFamily: Fonts.display,
  },
  themeModeSelector: {
    flexDirection: "row",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#D0D9E2",
    backgroundColor: "#F3F7FB",
    padding: 4,
  },
  themeModeSelectorDark: {
    backgroundColor: "#1F2935",
    borderColor: "#324255",
  },
  themeModeOption: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 9,
    paddingVertical: 9,
    gap: 6,
  },
  themeModeOptionActiveLight: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E3EDF7",
  },
  themeModeOptionActiveDark: {
    backgroundColor: "#152332",
    borderWidth: 1,
    borderColor: "#2D4154",
  },
  themeModeText: {
    fontSize: 14,
    fontFamily: Fonts.display,
  },
  themeModeTextInactive: {
    color: "#7A8A9A",
  },
  themeModeTextActiveLight: {
    color: "#1A395A",
  },
  themeModeTextActiveDark: {
    color: "#E8F0F8",
  },
});

export { ConfigStyles };
