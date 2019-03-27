import React, { Component } from 'react';
import { TouchableHighlight, Button, StyleSheet, Text, View, Image } from 'react-native';

export default class Homescreen extends Component {
  render() {
    const { navigate } = this.props.navigation;
    const HomePageButton = (props) => <Button {...props} style={styles.button} color="#5DACBD"/>

    return (
      <View style={styles.pageContainer}>
        <View style={styles.logoContainer}>
          <Image
            style={styles.img}
            source={{ uri: 'https://raw.githubusercontent.com/pgunasekara/4zp6/master/media/logo_transparent.png' }}
          />
        </View>

        <View style={styles.buttonContainer}>
          <HomePageButton
            title='Sign Up'
            onPress={() => navigate('SignUp', {})}
          />

          <HomePageButton
            title='Sign In'
            onPress={() => navigate('SignIn', {})}
          />
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  pageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'stretch',
  },
  logoContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
  },

  img: {
    justifyContent: 'center',
    width: 350,
    height: 350,
  },
  buttonContainer: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    height: 225,
    paddingBottom: 125,
    width: 250,
    alignSelf: "center"
  },
  button: {
    borderColor : "#5DACBD",
  },
});
