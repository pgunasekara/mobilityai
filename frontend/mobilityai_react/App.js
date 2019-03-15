import React, {Component} from 'react';
import {Platform, StyleSheet, Text, View} from 'react-native';
import {createStackNavigator, createAppContainer} from 'react-navigation';
import Homescreen from './App/Screens/Homescreen';
import PatientDataContainer from './App/Screens/PatientDataContainer';
import PatientAchievements from './App/Screens/Achievements';
import PatientData from './App/Screens/PatientData';
import PatientObservations from './App/Screens/PatientObservations';
import PatientList from './App/Screens/PatientList';
import PatientListItem from './App/Screens/PatientListItem';
import PatientForm from './App/Screens/NewPatientForm';
import SignUp from './App/Screens/SignUpForm';
import SignIn from './App/Screens/SignInForm';
import {MenuProvider} from 'react-native-popup-menu';

const AppNavigator = createStackNavigator({
  Home: {screen: Homescreen},
  PatientListItem: {screen: PatientListItem},
  PatientList: { screen: PatientList },
  PatientData: {screen: PatientDataContainer},
  PatientAchievements: {screen: PatientAchievements},
  PatientObservations: {screen: PatientObservations},
  PatientForm: {screen: PatientForm},
  SignUp: {screen: SignUp},
  SignIn: {screen: SignIn},
});

const AppContainer = createAppContainer(AppNavigator);

class App extends Component {
  render() {
    return (
      <MenuProvider>
        <AppContainer/>
      </MenuProvider>
    );
  }
}
export default App;
