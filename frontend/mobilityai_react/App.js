import React, {Component} from 'react';
import {Platform, StyleSheet, Text, View} from 'react-native';
import {createStackNavigator, createAppContainer} from 'react-navigation';
import Homescreen from './App/Screens/Homescreen';
import PatientData from './App/Screens/PatientData';
import PatientList from './App/Screens/PatientList';
import PatientListItem from './App/Screens/PatientListItem';
import PatientForm from './App/Screens/NewPatientForm';
import SignUp from './App/Screens/SignUpForm';
import SignIn from './App/Screens/SignInForm';

import PatientDataContainer from './App/Screens/PatientDataContainer';


const AppNavigator = createStackNavigator({
  Home: {screen: Homescreen},
  PatientListItem: {screen: PatientListItem},
  PatientList: {screen: PatientList},
  PatientData: {screen: PatientDataContainer},
  PatientForm: {screen: PatientForm},
  SignUp: {screen: SignUp},
  SignIn: {screen: SignIn},
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
