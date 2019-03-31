import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Icon } from 'react-native-elements';
import DialogInput from 'react-native-dialog-input';
import ActionButton from 'react-native-action-button';

import { AddObservations, GetObservations } from '../Lib/Api';

export default class PatientObservations extends React.Component {
    static navigationOptions = ({ navigation }) => {
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

    /*
        Load observation when the component is mounted on rendering.
     */
    componentDidMount() {
        this.updateObs();
    }

    showDialog(show) {
        this.setState({ isDialogVisible: show });
    }

    /*
        Reload list of observations to render 
     */
    updateObs() {
        const observation = ({firstName, lastName, comment}) => (
            <View style={[styles.obsBoxesDir, styles.box]}>
                <Text style={[styles.obsBox, styles.nameText]}>
                    {`${firstName} ${lastName}`}
                </Text>
                <Text style={[styles.obsBox, styles.commentText]}>
                    {comment}
                </Text>
            </View>
        );

        GetObservations(this.props.navigation.getParam('id')).then((observationJson) => {
            const obsList = observationJson.map((json) => <Observation {...json} />);

            this.setState({ obsList: obsList });
        })
    }

    /*
        Insert a new Observation and then reload the observations.
     */
    addObs(comment) {
        const pID = this.props.navigation.getParam('id');
        const uID = this.props.navigation.getParam('userId');

        AddObservations(uID, pID, comment)
            .then(() => this.updateObs());

        this.setState({ 
            comment: "",
            isDialogVisible: false
        });
    }

    render() {
        return (
            <View style={{flex: 1}}>
                <ScrollView>
                    <View style={styles.container}>
                        {this.state.obsList}
                    </View>
                    </ScrollView>


                    <DialogInput isDialogVisible={this.state.isDialogVisible}
                        title={"Observations"}
                        message={"Enter any additional observations below: "}
                        submitInput={(inputText) => { this.addObs(inputText) }}
                        closeDialog={() => this.showDialog(false) }>
                    </DialogInput>

                    <ActionButton buttonColor="rgba(231,76,60,1)"
                        onPress={() => this.showDialog(true)}
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