import { TouchableOpacity, Text, StyleSheet } from 'react-native'
import Ionicons from '@expo/vector-icons/Ionicons'
import Colors from '@styles/Colors'
import { Fonts, Radii, Shadow } from '@styles/Theme'

export default function Button ({ label, disabled, onPress, icon, iconSize = 24, bgColor = Colors.PRIMARY, iconColor = 'white' }) {

  return (
      <TouchableOpacity
        disabled={disabled}
        onPress={onPress}
        style={[styles.button, { backgroundColor: disabled ? Colors.GREY : bgColor }]}
      >
        {icon
          ?
            <Ionicons name={icon} size={iconSize} color={iconColor} onPress={onPress} />
          :
            <Text style={styles.label}>
              {label}
            </Text>
        }
      </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: Radii.lg,
    alignItems: "center",
    justifyContent: "center",
    ...Shadow.sm,
  },
  label: {
    fontFamily: Fonts.body,
    fontSize: 15,
    letterSpacing: 0.6,
    textTransform: "uppercase",
    color: Colors.WHITE,
  },
})
