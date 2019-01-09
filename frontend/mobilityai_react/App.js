/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, {Component} from 'react';
import {Platform, StyleSheet, Text, View} from 'react-native';
import {createStackNavigator, createAppContainer} from 'react-navigation';
import Homescreen from './App/Screens/Homescreen';
import PatientData from './App/Screens/PatientData';
import PatientListItem from './App/Screens/PatientListItem';


const AppNavigator = createStackNavigator({
  Home: {screen: Homescreen},
  PatientListItem: {screen: PatientListItem},
  PatientData: {screen: PatientData},
});

const AppContainer = createAppContainer(AppNavigator);

class App extends Component {
  render() {
    return (
      <AppContainer/>
    );
  }
}
export default App;