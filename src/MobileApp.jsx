/** @format */

import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { PaperProvider } from 'react-native-paper';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { colors } from './theme';
import BackIcon from './components/icons/BackIcon';

import SongListScreen from './screens/SongListScreen.jsx';
import SongDetailScreen from './screens/SongDetailScreen.jsx';
import AddSongScreen from './screens/AddSongScreen.jsx';
import MySongScreen from './screens/SongText.jsx';

const Stack = createNativeStackNavigator();

// This is a reusable config for screens that need a custom back button,
// but we will hide the header for AddSongScreen as well.
const screenOptions = (navigation) => ({
	headerStyle: {
		backgroundColor: colors.sage,
	},
	headerTintColor: colors.cream,
	headerTitleStyle: {
		fontWeight: 'bold',
	},
	headerShadowVisible: false,
	headerLeft: () => (
		<TouchableOpacity
			onPress={() => navigation.goBack()}
			style={{ marginLeft: 10 }}>
			<BackIcon
				size={20}
				color={colors.cream}
			/>
		</TouchableOpacity>
	),
});

export default function MobileApp() {
	return (
		<GestureHandlerRootView style={{ flex: 1 }}>
			<View style={styles.container}>
				<PaperProvider>
					<NavigationContainer>
						<Stack.Navigator initialRouteName='My Songs'>
							<Stack.Screen
								name='My Songs'
								component={SongListScreen}
								options={{ headerShown: false }}
							/>
							<Stack.Screen
								name='Song Details'
								component={SongDetailScreen}
								options={{ headerShown: false }}
							/>
							<Stack.Screen
								name='Add Song'
								component={AddSongScreen}
								options={{ headerShown: false }} // Hide the default header here too
							/>
						</Stack.Navigator>
					</NavigationContainer>
				</PaperProvider>
			</View>
		</GestureHandlerRootView>
	);
}

const styles = StyleSheet.create({ container: { flex: 1 } });
