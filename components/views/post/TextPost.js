import React, { Component } from 'react';
import { View, Text, StyleSheet, TextInput, AsyncStorage, TouchableWithoutFeedback, Keyboard, TouchableOpacity, Alert, BackHandler } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import firebase from 'react-native-firebase';

const storage = firebase.storage();


export default class TextPost extends React.Component {
  state = { post_title : "", post_content: '', errorMessage: null,user: "",  location: {}, isText: true, id:"" }
  constructor(props){
      super(props);
      this._retrieveData();
      this.ref = firebase.firestore().collection('posts');
      this.user_post = firebase.firestore().collection("user_post");

      this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
  }
    componentWillMount() {
        BackHandler.addEventListener('hardwareBackPress', this.handleBackButtonClick);
    }

    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', this.handleBackButtonClick);
    }

    handleBackButtonClick() {
        this.props.navigation.navigate('routeSelector')
        return true;
    }
    componentDidMount(){
        navigator.geolocation.getCurrentPosition(
            position => {
                const location = {
                    longitude: position.coords.longitude,
                    latitude: position.coords.latitude
                }
                this.setState({ location });
            },
            error => alert(error.message),
            { enableHighAccuracy: false, timeout: 50000}
        );
    }
    writePost = () => {
        /*write data into the database*/
        var {post_title, post_content, errorMessage, user,location, isText, id} = this.state;

        this.ref.add({
            content: post_content,
            title : post_title,
            isText : isText,
            user: user,
            upvote:1,
            downvote:0,
            location: new firebase.firestore.GeoPoint(location.latitude, location.longitude),
            time: new Date().getTime(),
            height: 0,
            width: 0
        }).then((data)=>{
            this.user_post.add({
                user: user,
                post: data.id,
                isUpvote: true
            })
            this.setState({id: data.id})
            dbactions.upvote(data.id, user, user);
            caches.upvote(post);
            //success callback
        }).catch((error)=>{
            //error callback
            console.log(error)
        });

    }

    handleTextPost = () =>{
        /*initial call for submiting post*/
        this.setState({isText: true});
        this.writePost();
    }
    _retrieveData = async () => {
            try {
                const value = await AsyncStorage.getItem('user');
                if (value !== null) {
                    // We have data!!
                    this.setState({user: value});
                }
            } catch (error) {
                alert(error);
                // Error retrieving data
            }
    };
    navigateToPost(){
        const items = {
            post_id: this.state.id,
            title: this.state.post_title,
            content: this.state.post_content,
            isText: true,
            location: this.state.location,
            upvote: 1,
            downvote: 0,
            user: this.state.user
        }
        AsyncStorage.setItem('post', JSON.stringify(items))
        .then((val)=>console.log("set successfully!")).then(res=>this.props.navigation.navigate('routeFocus'))
    }
    render() {
        return (
            <View style={{ width: '100%', flex: 1, flexDirection: 'column' }}>
                <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                    <View style={{ width: '100%', height: '100%' }}>
                        <View style={{ padding: 10 }}>
                            <TouchableOpacity style={{ width: 50, height: 50, borderRadius: 30 }} onPress={() => this.props.navigation.navigate('routeSelector') }>
                                <View style={{ width: 50, height: 50, backgroundColor: 'whitesmoke', borderRadius: 30, position: 'absolute', elevation: 5 }}>
                                    <Icon
                                        style={{textAlign: "center", padding: 15}}
                                        size={20}
                                        name='arrow-left'
                                        color='#4C9A2A'
                                    />
                                </View>
                            </TouchableOpacity>
                        </View>
                    <View style={styles.container}>
                        <View style={styles.inputCard}>
                            <TextInput
                                style={styles.titletextbox}
                                placeholder="Title"
                                autoCapitalize='sentences'
                                adjustsFontSizeToFit={true}
                                minimumFontScale={0.1}
                                onChangeText={post_title => this.setState({ post_title })}
                            />
                        </View>
                        <View style={styles.inputCard}>
                            <TextInput
                                multiline
                                style={styles.textbox}
                                placeholder="What did you hear?"
                                autoCapitalize='sentences'
                                numberOfLines={5}
                                adjustsFontSizeToFit={true}
                                minimumFontScale={0.1}
                                onChangeText={post_content => this.setState({ post_content })}
                            />
                        </View>
                        <View style={{ flex: 1, flexDirection: 'row', width: "100%", margin: 0}}>
                            <View style={{ flex: 1, justifyContent: 'flex-end', padding: 0, width: '100%' }}>
                                <TouchableOpacity style={{justifyContent: 'center',  alignItems: 'center', width: '100%', height: 80, backgroundColor: '#ddd', elevation: 5}} onPress={() => {
                                    if (this.state.post_content != "" && this.state.post_title != ""){
                                        this.handleTextPost();
                                        this.props.navigation.navigate('routeFeed');
                                    }
                                    else{
                                        console.log('NOTHING TO POST');
                                        Alert.alert('Cannot Post!','Please write something to post!');
                                    }
                                }}>
                                    <Text style={{fontFamily: 'Pacifico-Bold', fontSize: 28, color: '#4C9A2A', width: '100%', textAlign: 'center'}}>Post!</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </View>
                </TouchableWithoutFeedback>
            </View>
        );
    }
}
const styles = StyleSheet.create({
    button : {
        marginLeft: 10,
        marginRight: 10,
    },
    header : {
        fontSize: 18,
        color: '#4C9A2A',
        marginLeft: 20,
        marginTop: 5,
        flex: 1,
    },
    container : {
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        flex: 15,
    },
    titletextbox : {
        height: 40,
        width: '100%',
        fontSize:20,
        marginTop: 8,
        marginVertical: 15,
        textAlignVertical: 'top'
    },
    textbox : {
        height: 100,
        fontSize:13,
        width: '100%',
        textAlignVertical: 'top'
    },
    inputCard : {
        margin: 10,
        marginVertical: 5,
        width: '90%',
        backgroundColor: "#efefef",
        borderRadius: 8,
        justifyContent: 'center',
            alignItems: 'center',
    },
    inputTitleCard : {
        margin: 10,
        marginVertical: 5,
        width: 100,
        maxWidth: '100%',
        backgroundColor: "#efefef",
        borderRadius: 8,
    }
});
