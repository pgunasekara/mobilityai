import React, {Component} from 'react';

import {Text, View, Image, StyleSheet} from 'react-native';

export default class PatientListItem extends Component {
    constructor(props) {
        super(props);

        this.state = {
            name: props.name,
            picture: props.picture,
            first: props.first,
        };
    }
    render() {
        return (
            <View style={this.state.first ?  styles.firstRow : styles.row}>
                <Image 
                    style = {styles.image}
                    source = {{uri: this.state.picture}}
                 />
                 <View style={styles.textContainer}>
                    <Text style={styles.text}>{this.state.name}</Text>
                 </View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        borderBottomWidth: 1,
        borderBottomColor: 'grey',
    },
    firstRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        borderBottomWidth: 1,
        borderBottomColor: 'grey',
        borderTopWidth: 1,
        borderTopColor: 'grey',
    },
    image: {
        width: 50, 
        height: 50,
        borderRadius: 25,
        flex: 0,
    },
    textContainer: {
        flex: 1,
        textAlign: "center",
        justifyContent: 'center',
        alignItems: 'center',
    },
    text: {
        fontWeight: "bold",
        fontSize: 30,
    }
});