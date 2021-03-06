import React from 'react';
import { Alert, Platform, StyleSheet, Text, View, ScrollView, TextInput, Slider, Button, Picker } from 'react-native';
const Field = (props) => <TextInput style={styles.field} {...props} />;

import { CheckBox } from 'react-native-elements'
import RadioForm, { RadioButton, RadioButtonInput, RadioButtonLabel } from 'react-native-simple-radio-button';

import { AddPatientData, UpdatePatientData, PatientData } from '../Lib/Api';

export default class PatientForm extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            id: this.props.navigation.getParam('id') ? this.props.navigation.getParam('id') : null,
            firstName: this.props.navigation.getParam('firstName') ? this.props.navigation.getParam('firstName') : "",
            lastName: this.props.navigation.getParam('lastName') ? this.props.navigation.getParam('lastName') : "",
            update: this.props.navigation.getParam('update') ? true : false,
            formAssistantName : "",
            baselineWalk: 0,
            baselineSit: 0,
            baselineLay: 0,
            baselineStand: 0,
            conditionThatBroughtThem: "Orthopedic",
            bodyPartsInvolved: {
                neck: false,
                middleBackRibs: false,
                lowerBack: false,
                shoulderArmOrElbow: false,
                handOrWrist: false,
                pelvisHipLegOrKnee: false,
                footOrAnkle: false,
                other: false,
            },
            onsetOfCondition: "",
            previousSurgery: false,
            severityOfCondition: "Not severe",
            livingSituation: "community",
            walkingSituation: "Never",
            difficultyWithBasicMobility: "Unable",
            difficultyWithDailyAcitity: "Unable",
            steps: 0,
            consent: this.props.navigation.getParam('update') ? true : false,
        }

        this.loadStateFromApi = this.loadStateFromApi.bind(this);

        if (this.props.navigation.getParam('id') && this.props.navigation.getParam('update')){
            PatientData(this.props.navigation.getParam('id'))
            .then(this.loadStateFromApi);
        }
        console.log(this.state)
    }

    static navigationOptions = ({ navigation }) => {
        var update = navigation.getParam('update')

        if (update) {
            return {
                title: "Patient Information"
            }
        } else {
            return {
                title: "Create New Patient"
            }
        }
    }

    getSurveyData() {
        var update = this.props.navigation.getParam('update');

        // if (update) {
        //     PatientData(this.props.id).then((patientJson) => {
        //         this.setState({ surveyInfo: patientJson })

        //         this.setState({

        //         })
        //     })
        // } else {

        // }
    }

    loadStateFromApi(json){
        const data = JSON.parse(json.data);
        console.log(data)
        this.setState({
            formAssistantName : data["formAssistantName"],
            baselineWalk: data["baselineWalk"],
            baselineSit: data["baselineSit"],
            baselineLay: data["baselineLay"],
            baselineStand: data["baselineStand"],
            conditionThatBroughtThem: data['conditionThatBroughtThem'],
            bodyPartsInvolved: data["bodyPartsInvolved"],
            severityOfCondition : data["severityOfCondition"],
            onsetOfCondition : data["onsetOfCondition"],
            previousSurgery : data["previousSurgery"],
            livingSituation: data["livingSituation"],
            walkingSituation: data["walkingSituation"],
            difficultyWithBasicMobility: data["difficultyWithBasicMobility"],
            difficultyWithDailyAcitity: data["difficultyWithDailyAcitity"],
            steps: data["steps"]
        });
        console.log(this.state)
    }

    componentDidMount() {
        this.getSurveyData();
    };

    submitForm() {
        const totalTimeSpent = parseInt(this.state.baselineLay) + parseInt(this.state.baselineStand)
            + parseInt(this.state.baselineWalk) + parseInt(this.state.baselineSit);

        console.log("Total time spent " + totalTimeSpent);

        if (totalTimeSpent > 60){
            Alert.alert("Hourly Baseline mobility measurements values add up to over 60!",
                'Please make sure add valid baseline mobility measurements.');
            return false;
        }

        let response = null;
        if (!this.state.update){
            response = AddPatientData(JSON.stringify(this.state));
            this.props.navigation.state.params.onGoBack();
        }else{
            response = UpdatePatientData(this.state.id, JSON.stringify(this.state));
        }
        this.props.navigation.goBack();
    }

    onChanged(text) {
        let newText = '';
        let numbers = '0123456789';

        for (var i = 0; i < text.length; i++) {
            if (numbers.indexOf(text[i]) > -1) {
                newText = newText + text[i];
            }
            else {
                // your call back function
                alert("please enter numbers only");
            }
        }
        this.setState({ onsetOfCondition: newText });
    }

    validateSixtyMinuteTime(val){
        const intRep = parseInt(val, 10) || -1

        if (intRep > 60 || intRep < 0) {
            return -1;
        }
        return intRep;
    }

    render() {
        const maxHours = 24;
        const baselineStepSize = 0.25;
        const SliderField = (props) => {
            return <Slider style={styles.slider}
                {...props}
                onAfterChange={() => this.props.update(this.state)}
            />;
        }
        
        const radio_props = [
            { label: "Yes", value: true },
            { label: "No", value: false },
        ];

        const BodyPartsInvolvedCheckList = (props) => {
            return <View>
                <CheckBox
                    title='Neck'
                    checked={this.state.bodyPartsInvolved.neck}
                    onPress={() => this.setState({ bodyPartsInvolved: { ...this.state.bodyPartsInvolved, neck: !this.state.bodyPartsInvolved.neck } })} />
                <CheckBox
                    title='Middle back/ribs'
                    checked={this.state.bodyPartsInvolved.middleBackRibs}
                    onPress={() => this.setState({ bodyPartsInvolved: { ...this.state.bodyPartsInvolved, middleBackRibs: !this.state.bodyPartsInvolved.middleBackRibs } })} />
                <CheckBox
                    title='Lower back'
                    checked={this.state.bodyPartsInvolved.lowerBack}
                    onPress={() => this.setState({ bodyPartsInvolved: { ...this.state.bodyPartsInvolved, lowerBack: !this.state.bodyPartsInvolved.lowerBack } })} />
                <CheckBox
                    title='Shoulder, arm or elbow'
                    checked={this.state.bodyPartsInvolved.shoulderArmOrElbow}
                    onPress={() => this.setState({ bodyPartsInvolved: { ...this.state.bodyPartsInvolved, shoulderArmOrElbow: !this.state.bodyPartsInvolved.shoulderArmOrElbow } })} />
                <CheckBox
                    title='Hand or wrist'
                    checked={this.state.bodyPartsInvolved.handOrWrist}
                    onPress={() => this.setState({ bodyPartsInvolved: { ...this.state.bodyPartsInvolved, handOrWrist: !this.state.bodyPartsInvolved.handOrWrist } })} />
                <CheckBox
                    title='Pelvis, hip, leg or knee'
                    checked={this.state.bodyPartsInvolved.pelvisHipLegOrKnee}
                    onPress={() => this.setState({ bodyPartsInvolved: { ...this.state.bodyPartsInvolved, pelvisHipLegOrKnee: !this.state.bodyPartsInvolved.pelvisHipLegOrKnee } })} />
                <CheckBox
                    title='Foot or ankle'
                    checked={this.state.bodyPartsInvolved.footOrAnkle}
                    onPress={() => this.setState({ bodyPartsInvolved: { ...this.state.bodyPartsInvolved, footOrAnkle: !this.state.bodyPartsInvolved.footOrAnkle } })} />
                <CheckBox
                    title='Other'
                    checked={this.state.bodyPartsInvolved.other}
                    onPress={() => this.setState({ bodyPartsInvolved: { ...this.state.bodyPartsInvolved, other: !this.state.bodyPartsInvolved.other } })} />
            </View>;
        };

        return (
            <View style={styles.container}>
                <ScrollView contentContainerStyle={styles.scrollable}>
                    <View style={{ paddingBottom: 100 }}>
                        <Text style={styles.sliderText}>First Name:</Text>
                        <Field onChangeText={(firstName) => this.setState({ firstName })}
                            value={this.state.firstName}
                            placeholder="Enter First Name..."
                            editable={!this.state.update}
                        />
                        <Text style={styles.sliderText}>Last Name:</Text>
                        <Field onChangeText={(lastName) => this.setState({ lastName })}
                            placeholder="Enter Last Name..."
                            value={this.state.lastName}
                            editable={!this.state.update}
                        />
                        <Text style={styles.sliderText}>Average minutes spent standing per hour:</Text>
                        <Field 
                            placeholder="Hourly minutes spent standing..."
                            keyboardType='numeric'
                            onChangeText={(baselineStand) => this.setState({ baselineStand }) }
                            onSubmitEditing={(evt) => {
                                const baselineStand = this.validateSixtyMinuteTime(this.state.baselineStand);
                                this.setState({baselineStand})
                            }}
                            value={this.state.baselineStand && this.state.baselineStand != -1 ? this.state.baselineStand.toString() : null}
                        />
                        { this.state.baselineStand == -1
                            ? <Text style={styles.errorMessage}>Please enter valid value for baseline standing</Text>
                            : null
                        }
                        <Text style={styles.sliderText}>Average minutes spent walking per hour:</Text>
                        <Field 
                            placeholder="Hourly minutes spent walking..."
                            keyboardType='numeric'
                            onChangeText={(baselineWalk) => this.setState({ baselineWalk }) }
                            onSubmitEditing={(evt) => {
                                const baselineWalk = this.validateSixtyMinuteTime(this.state.baselineWalk);
                                this.setState({baselineWalk})
                            }}
                            value={this.state.baselineWalk && this.state.baselineWalk != -1 ? this.state.baselineWalk.toString() : null}
                        />
                        { this.state.baselineWalk == -1
                            ? <Text style={styles.errorMessage}>Please enter valid value for baseline walking</Text>
                            : null
                        }
                        <Text style={styles.sliderText}>Average minutes spent sitting per hour:</Text>
                        <Field 
                            placeholder="Hourly minutes spent sitting..."
                            keyboardType='numeric'
                            onChangeText={(baselineSit) => this.setState({ baselineSit }) }
                            onSubmitEditing={(evt) => {
                                const baselineSit = this.validateSixtyMinuteTime(this.state.baselineSit);
                                this.setState({baselineSit})
                            }}
                            value={this.state.baselineSit && this.state.baselineSit != -1 ? this.state.baselineSit.toString() : null}
                        />
                        { this.state.baselineSit == -1
                            ? <Text style={styles.errorMessage}>Please enter valid value for baseline sitting</Text>
                            : null
                        }
                        <Text style={styles.sliderText}>Average minutes spent lying down per hour:</Text>
                        <Field 
                            placeholder="Hourly minutes spent lying down..."
                            keyboardType='numeric'
                            onChangeText={(baselineLay) => this.setState({ baselineLay }) }
                            onSubmitEditing={(evt) => {
                                const baselineLay = this.validateSixtyMinuteTime(this.state.baselineLay);
                                this.setState({baselineLay})
                            }}
                            value={this.state.baselineLay && this.state.baselineLay != -1 ? this.state.baselineLay.toString() : null}
                        />
                        { this.state.baselineLay == -1
                            ? <Text style={styles.errorMessage}>Please enter valid value for baseline lying down</Text>
                            : null
                        }
                        <View style={styles.inputGroup}>
                            <Text style={styles.sliderText}>Type of condition that brought them to therapy</Text>
                            <Picker
                                selectedValue={this.state.conditionThatBroughtThem}
                                onValueChange={(itemValue, itemIndex) => this.setState({ conditionThatBroughtThem: itemValue })}>
                                <Picker.Item label="Orthopedic" value="Orthopedic" />
                                <Picker.Item label="Neurologic" value="Neurologic" />
                                <Picker.Item label="Cardiopulmonary" value="Cardiopulmonary" />
                                <Picker.Item label="Major Medical Condition" value="Major Medical Condition" />
                                <Picker.Item label="Other" value="Other" />
                            </Picker>
                        </View>
                        {this.state.conditionThatBroughtThem == "Orthopedic" ?
                            <View style={styles.inputGroup}>
                                <Text style={styles.sliderText}>Body parts involved</Text>
                                <BodyPartsInvolvedCheckList />
                            </View>
                            : null
                        }
                        <View style={styles.inputGroup}>
                            <Text style={styles.sliderText}>Time since onset of the condition that brought them to therapy (in days)</Text>
                            <TextInput
                                style={{ height: 40, borderColor: 'gray', borderWidth: 1 }}
                                keyboardType='numeric'
                                onChangeText={(text) => this.onChanged(text)}
                                value={this.state.onsetOfCondition}
                            />
                        </View>
                        <View style={styles.inputGroup}>
                            <Text style={styles.sliderText}>Previous surgery for the primary condiition that brought them to therapy</Text>
                            <RadioForm
                                radio_props={radio_props}
                                formHorizontal={true}
                                initial={0}
                                onPress={(value) => { this.setState({ previousSurgery: value }) }}
                                style={{ justifyContent: 'space-evenly' }}
                            />
                        </View>
                        <View style={styles.inputGroup}>
                            <Text style={styles.sliderText}>Severity of the primary condition that brought them to therapy</Text>
                            <Picker
                                selectedValue={this.state.severityOfCondition}
                                onValueChange={(itemValue, itemIndex) => this.setState({ severityOfCondition: itemValue })}>
                                <Picker.Item label="Not severe" value="Not severe" />
                                <Picker.Item label="Mildly severe" value="Mildly severe" />
                                <Picker.Item label="Moderately severe" value="Moderately severe" />
                                <Picker.Item label="Extremely severe" value="Extremely severe" />
                            </Picker>
                        </View>
                        <View style={styles.inputGroup}>
                            <Text style={styles.sliderText}>Living situation</Text>
                            <Picker
                                selectedValue={this.state.livingSituation}
                                onValueChange={(itemValue, itemIndex) => this.setState({ livingSituation: itemValue })}>
                                <Picker.Item label="Living in the community" value="community" />
                                <Picker.Item label="Hospital/Nursing Home/Assisted Living Facility" value="facility" />
                            </Picker>
                        </View>
                        <View style={styles.inputGroup}>
                            <Text style={styles.sliderText}>Which sentence is the best to describe you walking situation?</Text>
                            <Picker
                                selectedValue={this.state.walkingSituation}
                                onValueChange={(itemValue, itemIndex) => this.setState({ walkingSituation: itemValue })}>
                                <Picker.Item label="Never use a walking device or wheelchair" value="Never" />
                                <Picker.Item label="Use a cane, walker or other walking device at least some of the time, but never use a wheelchair" value="cane" />
                                <Picker.Item label="Use a walking device at least some of the time and a wheelchair at least some of the time" value="walkingDevice" />
                                <Picker.Item label="Use a wheelchair, never walk" value="wheelchair" />
                            </Picker>
                        </View>
                        <View style={styles.inputGroup}>
                            <Text style={styles.sliderText}>How much DIFFICULTY do you currently have bending over from a standing position to pick up a piece of clothing from the floor without holding onto anything?</Text>
                            <Picker
                                selectedValue={this.state.difficultyWithBasicMobility}
                                onValueChange={(itemValue, itemIndex) => this.setState({ difficultyWithBasicMobility: itemValue })}>
                                <Picker.Item label="Unable" value="Unable" />
                                <Picker.Item label="A Lot" value="A Lot" />
                                <Picker.Item label="A Little" value="A Little" />
                                <Picker.Item label="None" value="None" />
                            </Picker>
                        </View>
                        <View style={styles.inputGroup}>
                            <Text style={styles.sliderText}>How much DIFFICULTY do you currently have chopping or slicing vegetables (eg: onions or peppers)?</Text>
                            <Picker
                                selectedValue={this.state.difficultyWithDailyAcitity}
                                onValueChange={(itemValue, itemIndex) => this.setState({ difficultyWithDailyAcitity: itemValue })}>
                                <Picker.Item label="Unable" value="Unable" />
                                <Picker.Item label="A Lot" value="A Lot" />
                                <Picker.Item label="A Little" value="A Little" />
                                <Picker.Item label="None" value="None" />
                            </Picker>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.sliderText}>Step Goal</Text>
                            <TextInput
                                style={{ height: 40, borderColor: 'gray', borderWidth: 1, marginBottom: 10 }}
                                keyboardType='numeric'
                                onChangeText={(steps) => this.setState({steps})}
                                value={this.state.steps ? this.state.steps.toString() : ""}
                            />
                        </View>

                        <Text style={styles.sliderText}>Who is filling out this form?</Text>
                        <Field onChangeText={(formAssistantName) => this.setState({ formAssistantName })}
                            placeholder="Enter First and Last Name..."
                            value={this.state.formAssistantName}
                        />
                        {
                            this.state.update == false ?
                            <CheckBox
                                title='I consent to my data being collected and analyzed by MobilityAI'
                                checked={this.state.consent}
                                onPress={() => {
                                    let consent = !this.state.consent;
                                    this.setState({ consent: consent });
                                }}
                            /> : <View />
                        }
                        <Button style={styles.submit} onPress={() => this.submitForm()}
                                title={this.state.update ? "Update" : "Submit"}/>
                    </View>
                </ScrollView>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
    },
    scrollable: {
        flexGrow: 1,
        justifyContent: "space-between",
    },
    field: {
        height: 50,
        paddingLeft: 6,
        borderColor: 'gray',
        borderWidth: 1,
        margin: 15,
        borderRadius: 5
    },
    titleText: {
        fontSize: 35,
        fontWeight: 'bold',
        textAlign: 'center',
        color: '#555333',
        marginTop: 20
    },
    submit: {
        backgroundColor: "#68a0cf",
        overflow: "hidden",
        marginTop: 100
    },
    errorMessage: {
        color: "red",
        fontSize: 18,
        marginTop: -10,
        marginLeft: 15,
        marginBottom: 20
    },
    sliderText: {
        fontSize: 20,
        color: '#555333',
        fontWeight: '500',
        paddingLeft: 20
    },
    inputGroup: {
        paddingTop: 10,
    }
});
