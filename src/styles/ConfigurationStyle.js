import { StyleSheet } from "react-native";
import Colors from "./Colors";
import { Fonts, Shadow, Radii } from "@styles/Theme";

const ConfigStyles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  container: {
    padding: 15,
    marginTop: 20,
  },
  loader: {
    padding: 30,
  },
  buttonSave: {
    // width: "100%",
    textAlign: "center",
    marginTop: 40,
    marginBottom: 30,
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
    marginVertical: 10,
  },
  buttonRestartTables: {
    // width: "100%",
    textAlign: "center",
    marginTop: 20,
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
});

export { ConfigStyles };
