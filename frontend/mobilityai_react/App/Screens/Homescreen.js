import React, { Component } from 'react';
import { Platform, Button, StyleSheet, Text, View, Image } from 'react-native';

// import PatientList from './PatientList';
import SignUp from './SignUpForm';
import { Tile } from 'react-native-elements';

export default class Homescreen extends Component {
  render() {
    const { navigate } = this.props.navigation;

    return (
      <View style={styles.container1}>
        <View style={styles.container2}>
          <Image
            style={styles.img}
            source={{ uri: 'https://raw.githubusercontent.com/pgunasekara/4zp6/master/media/logo_transparent.png'}}
          />
        </View>
        {/* <Text style={styles.welcome}>MobilityAI</Text> */}
        <View style={styles.buttons}>
          <Button 
            title='Sign Up'
            onPress={() => navigate('SignUp', {})}
            color="#5DACBD"
          />

          <Button 
            title='Sign In'
            onPress={() => navigate('SignIn', {})}
            color="#5DACBD"
          />
          {/* <SignUp navigation = {this.props.navigation} /> */}
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container1: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'stretch',
    // backgroundColor: '#F5FCFF',
  },
  container2: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    // alignItems: 'center',
    // backgroundColor: '#F5FCFF',
  },
  img: {
    justifyContent: 'center',
    width: 350,
    height: 350,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
  },
});
