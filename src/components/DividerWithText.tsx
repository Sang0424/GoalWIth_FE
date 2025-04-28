import { View, Text } from "react-native";

export default function DividerWithText({text}:{text:string}){
    return(
        <View
          style={{
          flexDirection: "row",
          width: "85%",
          alignSelf: "center",
          marginBottom:16
        }}
        >
          <View
            style={{
              backgroundColor: '#d9d9d9',
              height: 1,
              flex: 1,
              alignSelf: "center",
            }}
          />
          <Text
            style={{
              alignSelf: "center",
              paddingHorizontal: 5,
              fontSize: 14,
              color:'#d9d9d9'
            }}
          >
            {text}
          </Text>
          <View
            style={{
              backgroundColor: '#d9d9d9',
              height: 1,
              flex: 1,
              alignSelf: "center",
            }}
          />
      </View>
    )
}