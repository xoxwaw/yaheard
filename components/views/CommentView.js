import React, { Component } from 'react';
import {Text, View, TextInput, StyleSheet, TouchableWithoutFeedback, Keyboard, TouchableOpacity,  AsyncStorage } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import firebase from 'react-native-firebase';
//backend actions
const navigate = require('./Backend/Navigations');

const styles = StyleSheet.create({
    content_container: {
        backgroundColor: '#68bb59',
        padding: 20,
    },
    content_item: {
        backgroundColor: 'whitesmoke',
        borderRadius: 10,
        padding: 10,
        marginBottom: 10,
    },
    content: {
        fontSize: 12,
        paddingBottom: 20,
    },
    button : {
        marginLeft: 10,
        marginRight: 10,
        marginBottom: 20,
    },
    textbox : {
        marginTop: 80,
        height: 50,
        fontSize:16,
        width: '100%',
        marginTop: 8,
        marginVertical: 15,
        elevation: 0,
        marginLeft: 20,
        textAlignVertical: 'top'
    },
    inputCard : {
        marginVertical: 5,
        width: '100%',
        borderRadius: 8,
        flex: 8,
    }
});
export default class Focus extends React.Component {
    constructor(){
        super();
        this.post_ref = firebase.firestore().collection('posts');
        this.comment_ref = firebase.firestore().collection('comments');
        this.user_post = firebase.firestore().collection('user_post');
        this.state = {post: {}, user: "", content:""}
        this._retrieveData();
    }
    _retrieveData = () =>{
          AsyncStorage.getItem('user').then(val=>{
              this.setState({user:val})
          }).then(res=>{
              console.log("GOT IT")
          }).catch(err=>{
              console.log(err);
          });

    };

    componentDidMount(){
        return AsyncStorage.getItem('comment').then(val=>{
            const item = JSON.parse(val);
            this.setState({post: item});
        })
    }
    navigateToPost(post){
        console.log(post);
        AsyncStorage.setItem('post', JSON.stringify(post))
        .then((val)=>console.log("set successfully!")).
        then(res=>this.props.navigation.navigate('routeFocus'))
    }

    postComment = () => {
        const {post, user, content} = this.state;
        this.comment_ref.add({
            user: user,
            post_id: post.id,
            content: content,
            upvote: 1,
            downvote: 0,
            parent_id: "",
            date: new Date().getTime().toString(),
        }).then(data=>{
            this.user_post.add({
                post : data.id,
                user: user,
                isUpvote: true
            });
            this.navigateToPost(this.state.post);
        }).catch(err=> console.log(err));

    }

    render() {
        return (
            <View style={{ flex: 1, width: '100%', flexDirection: 'column' }}>
                <View style={{ padding: 10, position: 'absolute', elevation: 5}}>
                    <TouchableOpacity style={{ width: 50, height: 50, borderRadius: 30, elevation: 5 }} onPress={() => this.props.navigation.navigate('routeFeed') }>
                        <View style={{ width: 50, height: 50, backgroundColor: 'whitesmoke', borderRadius: 30, position: 'absolute', elevation: 5 }}>
                            <Icon
                                style={{textAlign: "center", padding: 15, elecation: 5}}
                                size={20}
                                name='arrow-left'
                                color='#4C9A2A'
                            />
                        </View>
                    </TouchableOpacity>
                </View>
                <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                    <View style={{ flex: 1, width: '100%', marginTop: 50}}>
                        <View style={styles.inputCard}>
                            <TextInput
                                multiline
                                style={styles.textbox}
                                placeholder="Write a comment..."
                                autoCapitalize="sentences"
                                numberOfLines={5}
                                adjustsFontSizeToFit={true}
                                minimumFontScale={0.1}
                                onChangeText={content => this.setState({ content })}
                            >
                            </TextInput>
                        </View>
                    <TouchableOpacity onPress = {this.postComment} style={{justifyContent: 'center',  alignItems: 'center', width: '100%', height: 80, backgroundColor: '#ddd', elevation: 5}}>
                        <Text style={{fontFamily: 'Pacifico-Bold', fontSize: 28, color: '#4C9A2A', width: '100%', textAlign: 'center'}}>Comment!</Text>
                    </TouchableOpacity>
                    </View>
                </TouchableWithoutFeedback>
            </View>
        );
    }
}
