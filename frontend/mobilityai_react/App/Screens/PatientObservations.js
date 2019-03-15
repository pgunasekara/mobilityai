import React from 'react';
import { TouchableOpacity, Button, ScrollView, StyleSheet, Text, View, TextInput, Dimensions } from 'react-native';

import { AddObservations } from '../Lib/Api';

const height = Dimensions.get('window').height;
export default class PatientObservations extends React.Component {
    static navigationOptions = ({ navigation }) => {
        return {
            title: "Nurse's Observations"
        }
    }
    constructor(props) {
        super(props);
        this.state = {
            id: props.id,
            userId: props.userId,
            comment: "",
        };
    }

    addObs() {
        var pID = this.props.navigation.getParam('id');
        var uID = this.props.navigation.getParam('userId');

        let response = AddObservations(uID, pID, this.state.comment)
        console.log(JSON.stringify(response));
        this.setState({ comment: "" });
    }

    render() {
        return (
            <ScrollView>
                <View style={styles.container}>
                    <View style={styles.obsBoxesDir}>
                        <TextInput
                            editable={false}
                            style={[styles.obsBox, { height: 20 }]}
                        />
                        <TextInput
                            editable={false}
                            style={styles.obsBox}
                        />

                    </View>
                    <View>
                        <Text style={styles.title}>Add Observation</Text>
                        <TextInput
                            editable={true}
                            maxLength={200}
                            multiline={true}
                            style={styles.addBox}
                            onChangeText={(comment) => this.setState({ comment })}
                            value={this.state.comment}
                        />
                    </View>
                    <View style={styles.addBtn}>
                            <Button
                                title="Add"
                                onPress={() => this.addObs()}
                                color="#5DACBD"
                            />
                        </View>
                </View>
            </ScrollView>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'stretch',
        height: height * 0.9,
    },

    title: {
        textAlign: 'left',
        fontSize: 20,
        padding: 10,
        color: "#5DACBD",
    },

    addBox: {
        height: height * 0.2,
        borderColor: 'black',
        borderWidth: 2,
        borderRadius: 10,
        textAlign: 'center',
        marginRight: 5,
        marginLeft: 5,
        textAlignVertical: 'top',
        textAlign: 'left',
    },

    addBtn: {
        position: 'absolute',
        bottom: 20,
        right: 20,
        borderRadius: 100,
    },

    obsBoxesDir: {
        flexDirection: 'column'
    },

    obsBox: {
        borderWidth: 2,
        borderColor: 'grey',
        marginLeft: 5,
        marginRight: 5,
    },
})