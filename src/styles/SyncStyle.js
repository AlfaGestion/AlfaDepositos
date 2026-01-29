import { StyleSheet } from "react-native";
import Colors from "./Colors";
import { Fonts, Radii, Shadow } from "@styles/Theme";
import { moderateScale, horizontalScale, verticalScale } from "../utils/Metrics";

const syncStyle = StyleSheet.create({
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#E7F1F9",
    paddingHorizontal: 16,
  },
  text: {
    fontSize: moderateScale(16),
    textAlign: "center",
    padding: 10,
    marginVertical: verticalScale(16),
    color: Colors.DGREY,
    fontFamily: Fonts.body,
  },
  image: {
    width: 96,
    height: 96,
    marginBottom: verticalScale(20),
  },
  btnSync: {
    paddingVertical: 12,
    paddingHorizontal: 22,
    backgroundColor: Colors.SURFACE,
    borderRadius: Radii.lg,
    borderWidth: 1,
    borderColor: Colors.BORDER,
    ...Shadow.sm,
  },
  textBtnSync: {
    fontSize: moderateScale(17),
    color: Colors.PRIMARY,
    fontFamily: Fonts.body,
    letterSpacing: 0.6,
  },
  cardButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    backgroundColor: Colors.SURFACE,
    borderRadius: Radii.lg,
    borderWidth: 1,
    borderColor: Colors.BORDER,
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 12,
    ...Shadow.sm,
  },
  cardIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F0F5FA",
    borderWidth: 1,
    borderColor: Colors.BORDER,
  },
  cardIcon: {
    width: 28,
    height: 28,
  },
  cardText: {
    fontFamily: Fonts.display,
    fontSize: moderateScale(17),
    color: Colors.DGREY,
  },
  errorMessage: {
    fontSize: moderateScale(15),
    color: Colors.ERROR,
    padding: 10,
    marginBottom: 20,
    textAlign: "center",
  },
  finalText: {
    fontSize: moderateScale(15),
    marginTop: verticalScale(20),
    color: Colors.DGREY,
    fontFamily: Fonts.body,
  },
  btnReturn: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    backgroundColor: Colors.PRIMARY,
    borderRadius: Radii.md,
    ...Shadow.sm,
  },
  textBtnReturn: {
    fontSize: moderateScale(16),
    textAlign: "center",
    color: Colors.WHITE,
    fontFamily: Fonts.body,
  },
});

const sendPending = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "#E7F1F9",
  },
  container: {
    alignItems: "center",
    marginTop: 10,
    padding: 16,
  },
  textHeader: {
    fontSize: 16,
    textAlign: "center",
    color: Colors.DGREY,
    fontFamily: Fonts.body,
  },
  imageHeader: {
    marginVertical: 20,
    width: 72,
    height: 72,
  },
  btnSendPending: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginVertical: 20,
    backgroundColor: Colors.SURFACE,
    borderRadius: Radii.lg,
    borderWidth: 1,
    borderColor: Colors.BORDER,
    ...Shadow.sm,
  },
  btnSendPendingDisabled: {
    opacity: 0.6,
  },
  textBtnSendPending: {
    color: Colors.PRIMARY,
    fontSize: 17,
    fontFamily: Fonts.body,
    letterSpacing: 0.6,
  },
  cardButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    backgroundColor: Colors.SURFACE,
    borderRadius: Radii.lg,
    borderWidth: 1,
    borderColor: Colors.BORDER,
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 12,
    ...Shadow.sm,
  },
  cardIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F0F5FA",
    borderWidth: 1,
    borderColor: Colors.BORDER,
  },
  cardIcon: {
    width: 28,
    height: 28,
  },
  cardText: {
    fontFamily: Fonts.display,
    fontSize: moderateScale(17),
    color: Colors.DGREY,
  },
  containerTextError: {
    marginVertical: 20,
  },
  textError: {
    color: Colors.ERROR,
    fontSize: 16,
    margin: 10,
    textAlign: "center",
    fontFamily: Fonts.body,
  },
});

const cSyncItemStyles = StyleSheet.create({
  syncText: {
    fontSize: 15,
    paddingBottom: 5,
    fontFamily: Fonts.body,
    color: Colors.DGREY,
  },
  loaderContainer: {
    marginLeft: 20,
    width: 140,
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
  },
  loader: {
    marginRight: 10,
  },
  syncOkIcon: {
    alignSelf: "center",
    marginRight: 10,
    width: 20,
    height: 20,
  },
});

export { syncStyle, sendPending, cSyncItemStyles };
