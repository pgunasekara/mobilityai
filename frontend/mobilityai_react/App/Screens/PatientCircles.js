import React, { Component } from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { Icon } from 'react-native-elements'

// Creating the circle buttons for the activity
export default class Circle extends Component {
     render() {
         return (
             <View>
                 <View style={[styles.center,  { color: this.props.color }]}>
                     <Icon
                         raised
                         reverse
                         name={this.props.activityIcon}
                         type={this.props.iconLib}
                         color={this.props.color}
                         size={28}
                     />
                 </View>
                 <Text style={styles.textFont}>{this.props.activity}</Text>
             </View>
         )
     }
 }

const styles = StyleSheet.create({ 
    center: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center'
    },

    textFont: {
        fontSize: 10,
        textAlign: 'center',
        flex: 1,
        justifyContent: 'space-between'
    },
});
