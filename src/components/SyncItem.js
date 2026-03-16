import { ActivityIndicator, Image, Text, View } from "react-native";

import iconOk from "@icons/ok.png";
import { cSyncItemStyles } from "@styles/SyncStyle";

export default function SyncItem(props) {
  const darkMode = props.darkMode === true;

  return (
    <View style={[cSyncItemStyles.loaderContainer, darkMode && cSyncItemStyles.loaderContainerDark]}>
      {props.showLoader ? (
        <ActivityIndicator style={[cSyncItemStyles.loader]} size="small" color={darkMode ? "#8FC3FF" : "#00ff00"} />
      ) : (
        <Image style={[cSyncItemStyles.syncOkIcon]} source={iconOk} />
      )}
      <Text style={[cSyncItemStyles.syncText, darkMode && cSyncItemStyles.syncTextDark]}>{props.text}</Text>
    </View>
  );
}
