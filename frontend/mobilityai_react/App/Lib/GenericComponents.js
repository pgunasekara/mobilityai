import React from 'react';
import { TouchableOpacity, Button, ScrollView, StyleSheet, Text, View, TextInput } from 'react-native';

export const LoadingComponent = ({message}) => <View><Text>{message}</Text></View>;

export const TitledTextInput = ({title, compStyle, ...props}) => {
	return (
		<View>
            <Text>{title}</Text>
            <TextInput
                style={compStyle}
                placeholder={title}
                {...props}
            />
		</View>
	)
}