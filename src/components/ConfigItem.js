import CheckBox from "expo-checkbox";
import { StyleSheet, Text, TextInput, View } from "react-native";
import Colors from "@styles/Colors";
import { Fonts } from "@styles/Theme";

export default function ConfigItem(props) {
  return (
    <View>
      {props.type == "input" ? (
        <View>
          <Text style={styles.textTitle}>{props.title}</Text>
          <TextInput
            style={styles.textInput}
            placeholder={props.placeholder}
            placeholderTextColor={Colors.MUTED}
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
          />
          <Text style={styles.label}>{props.title}</Text>
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
});
