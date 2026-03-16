import { StyleSheet, Text } from "react-native";

export default function ItemLineTextValue(props) {
  const darkMode = props.darkMode === true;

  return (
    <Text style={[styles.text, darkMode && styles.textDark]}>
      {props.text} : {props.tabs}
      <Text style={[styles.innerText, darkMode && styles.innerTextDark]}>{props.value}</Text>
    </Text>
  );
}

const styles = StyleSheet.create({
  text: {
    fontSize: 15,
    padding: 5,
    paddingVertical: 10,
    color: "#1B1B1B",
    borderBottomColor: "#D5DCE4",
    borderBottomWidth: 1,
    fontWeight: "bold",
  },
  textDark: {
    color: "#E8F0F8",
    borderBottomColor: "#2D4154",
  },
  innerText: {
    fontWeight: "normal",
  },
  innerTextDark: {
    color: "#BFD0E0",
  },
});
