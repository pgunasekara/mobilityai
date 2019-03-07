import React, {Component} from 'react';
import {Platform, StyleSheet, Text, View} from 'react-native';
import Icon from 'react-native-vector-icons/Octicons';
import {createStackNavigator, createAppContainer} from 'react-navigation';
import Homescreen from './App/Screens/Homescreen';
import PatientDataContainer from './App/Screens/PatientDataContainer';
import PatientAchievements from './App/Screens/Achievements';
import PatientData from './App/Screens/PatientData';
import PatientList from './App/Screens/PatientList';
import PatientListItem from './App/Screens/PatientListItem';
import PatientForm from './App/Screens/NewPatientForm';
import SignUp from './App/Screens/SignUpForm';
import SignIn from './App/Screens/SignInForm';

const MenuIcon = ({ navigate }) => <Icon 
    name='three-bars' 
    size={30} 
    color='#000' 
    style={{ marginLeft: 15 }}
  />;

const AppNavigator = createStackNavigator({
  Home: {screen: Homescreen},
  PatientListItem: {screen: PatientListItem},
  PatientList: {
    screen: PatientList,
    navigationOptions: ({ navigation }) => ({
      title: 'Patients',
      headerTitleStyle: { 
        textAlign:"center", 
        flex:1,
        paddingRight: 40
      },
      headerLeft: MenuIcon(navigation),
    })
  },
  PatientData: {screen: PatientDataContainer},
  PatientAchievements: {screen: PatientAchievements},
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
