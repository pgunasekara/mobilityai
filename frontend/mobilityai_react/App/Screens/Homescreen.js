import React, { Component } from 'react';
import { Platform, Button, StyleSheet, Text, View, Image } from 'react-native';

export default class Homescreen extends Component {
  render() {
    const { navigate } = this.props.navigation;

    return (
      <View style={styles.container1}>
        {/* Initial screen displaying logo and buttons for users to either Sign up or Sign in */}
        <View style={styles.container2}>
          <Image
            style={styles.img}
            source={{ uri: 'https://raw.githubusercontent.com/pgunasekara/4zp6/master/media/logo_transparent.png'}}
          />
        </View>

        {/* Button redirecting users to Sign Up page */}
        <View style={styles.buttons}>
          <Button 
            title='Sign Up'
            onPress={() => navigate('SignUp', {})}
            color="#5DACBD"
          />

        {/* Button redirecting users to Sign in page */}
          <Button 
            title='Sign In'
            onPress={() => navigate('SignIn', {})}
            color="#5DACBD"
          />

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
  },

  container2: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
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
