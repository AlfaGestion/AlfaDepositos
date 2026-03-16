import CheckBox from "expo-checkbox";
import { StyleSheet, Text, TextInput, View } from "react-native";
import Colors from "@styles/Colors";
import { Fonts } from "@styles/Theme";

export default function ConfigItem(props) {
  const darkMode = props.darkMode === true;

  return (
    <View>
      {props.type == "input" ? (
        <View>
          <Text style={[styles.textTitle, darkMode && styles.textTitleDark]}>{props.title}</Text>
          <TextInput
            style={[styles.textInput, darkMode && styles.textInputDark]}
            placeholder={props.placeholder}
            placeholderTextColor={darkMode ? "#9CB2C8" : Colors.MUTED}
            onChangeText={(text) => props.handleChange(props.field, text)}
            value={props.value}
            keyboardType={props.keyboardType ? props.keyboardType : "default"}
          />
        </View>
      ) : props.type == "checkbox" ? (
        <View style={styles.checkboxContainer}>
          <CheckBox
            value={props.value}
            onValueChange={(text) => props.handleChange(props.field, text)}
            style={styles.checkbox}
            color={darkMode ? "#8FC3FF" : Colors.DBLUE}
          />
          <Text style={[styles.label, darkMode && styles.labelDark]}>{props.title}</Text>
        </View>
      ) : (
        <Text></Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  textTitle: {
    fontSize: 13,
    marginTop: 12,
    color: Colors.BLACK,
    fontFamily: Fonts.body,
    letterSpacing: 0.3,
  },
  textTitleDark: {
    color: "#E8F0F8",
  },
  textInput: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderColor: Colors.BORDER,
    borderWidth: 1,
    marginVertical: 8,
    borderRadius: 10,
    backgroundColor: Colors.SURFACE,
    color: Colors.BLACK,
    fontFamily: Fonts.body,
  },
  textInputDark: {
    backgroundColor: "#152332",
    borderColor: "#2D4154",
    color: "#E8F0F8",
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  checkbox: {
    alignSelf: "center",
  },
  label: {
    marginLeft: 8,
    color: Colors.BLACK,
    fontFamily: Fonts.body,
  },
  labelDark: {
    color: "#E8F0F8",
  },
});
