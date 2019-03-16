import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Icon } from 'react-native-elements'
import DialogInput from 'react-native-dialog-input';
import ActionButton from 'react-native-action-button';

import { AddObservations, GetObservations } from '../Lib/Api';

export default class PatientObservations extends React.Component {
    static navigationOptions = ({ navigation }) => {
        var id = navigation.getParam('id');

        return {
            title: "Nurse's Observations"
        };
    }
    constructor(props) {
        super(props);
        this.state = {
            id: props.id,
            userId: props.userId,
            comment: "",
            obsList: [],
            isDialogVisible: false,
        };
    }

    componentDidMount() {
        GetObservations(this.props.navigation.getParam('id')).then((observationJson) => {
            var i;
            var obsList2 = [];
            for (i = 0; i < observationJson.length; i++) {
                console.log(observationJson[i]);

                obsList2.push(
                    <View style={[styles.obsBoxesDir, styles.box]}>
                        <Text style={[styles.obsBox, styles.nameText]}>
                            {observationJson[i]['firstName'] + ' ' + observationJson[i]['lastName']}
                        </Text>
                        <Text style={[styles.obsBox, styles.commentText]}>
                            {observationJson[i]['comment']}
                        </Text>
                    </View>
                );
            }
            this.setState({ obsList: obsList2 });
        })
    }

    showDialog(show) {
        this.setState({ isDialogVisible: show });
    }

    addObs(comment) {
        var pID = this.props.navigation.getParam('id');
        var uID = this.props.navigation.getParam('userId');

        let response = AddObservations(uID, pID, comment)
        console.log(JSON.stringify(response));
        this.setState({ comment: "" });

        this.setState({ isDialogVisible: false });
    }

    render() {
        return (
            <View>
                <ScrollView>
                    <View style={styles.container}>
                        {this.state.obsList}
                    </View>
                    </ScrollView>


                    <DialogInput isDialogVisible={this.state.isDialogVisible}
                        title={"Observations"}
                        message={"Enter any additional observations below: "}
                        submitInput={(inputText) => { this.addObs(inputText) }}
                        closeDialog={() => { this.showDialog(false) }}>
                    </DialogInput>

                    <ActionButton buttonColor="rgba(231,76,60,1)"
                        onPress={() => {
                            this.showDialog(true);
                            console.log("SHOWING BOX")
                        }}
                        degrees={0}>
                        <Icon name="md-create" style={styles.actionButtonIcon} />
                    </ActionButton>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'stretch',
    },

    nameText: {
        textAlign: 'left',
        fontSize: 15,
        fontWeight: 'bold',
        paddingLeft: 5,
    },

    box: {
        borderWidth: 0.5,
        borderColor: 'grey',
        borderRadius: 8,
        marginLeft: 5,
        marginRight: 5,
        padding: 2,
    },

    commentText: {
        paddingLeft: 5,
        paddingRight: 5,
    },

    obsBoxesDir: {
        flexDirection: 'column'
    },

    obsBox: {
        marginLeft: 5,
        marginRight: 5,
    },

    actionButtonIcon: {
        fontSize: 20,
        height: 22,
        color: 'white',
    },
})