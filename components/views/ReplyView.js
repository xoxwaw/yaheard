import React, { Component } from 'react';
import {Keyboard, View, TextInput, Text, Button, StyleSheet, TouchableWithoutFeedback, TouchableOpacity,  AsyncStorage } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import firebase from 'react-native-firebase';

const styles = StyleSheet.create({
  content_container: {
    backgroundColor: '#68bb59',
    padding: 20,
  },
  button : {
    marginLeft: 10,
    marginRight: 10,
    marginBottom: 20,
  },
});
export default class Focus extends React.Component {
    constructor(){
        super();
        this.post_ref = firebase.firestore().collection('posts');
        this.comment_ref = firebase.firestore().collection('comments');
        this.user_post = firebase.firestore().collection('user_post');
        this.state = {comment_content: "",comment_id:"",content: "",post_id : "", user: "",post: {}}
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
          AsyncStorage.getItem('post').then(val=>{
              const value = JSON.parse(val)
              this.setState({post: value});
          }).then(res=>{
              console.log("Got the post")
          }).catch(err =>{
              console.log(err)
          })
    };

    componentDidMount(){
        return AsyncStorage.getItem('comment').then(val=>{
            const item = JSON.parse(val);
            this.setState({comment_id: item.id, comment_content: item.content, post_id: item.post_id});
        })
    }
    submitReply = () =>{
        const {comment_content, comment_id, content, post_id, user, post} = this.state;
        this.comment_ref.add({
            user: user,
            downvote: 0,
            upvote: 1,
            parent_id: comment_id,
            post_id: post_id,
            content: content,
            date: new Date().getTime().toString()
        }).then(data=>{
            this.user_post.add({
                post : data.id,
                user: user,
                isUpvote: true
            });
            this.navigateToPost();
        }).catch(err=> console.log(err));
    }
    navigateToPost(){
        AsyncStorage.setItem('post', JSON.stringify(this.state.post))
        .then((val)=>console.log("set successfully!")).then(res=>this.props.navigation.navigate('routeFocus'))
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
                            placeholder="Write a reply..."
                            autoCapitalize="sentences"
                            numberOfLines={5}
                            adjustsFontSizeToFit={true}
                            minimumFontScale={0.1}
                            onChangeText={content => this.setState({ content })}
                        >
                        </TextInput>
                    </View>
                <TouchableOpacity onPress = {this.submitReply} style={{justifyContent: 'center',  alignItems: 'center', width: '100%', height: 80, backgroundColor: '#ddd', elevation: 5}}>
                    <Text style={{fontFamily: 'Pacifico-Bold', fontSize: 28, color: '#4C9A2A', width: '100%', textAlign: 'center'}}>Reply!</Text>
                </TouchableOpacity>
                </View>
            </TouchableWithoutFeedback>
        </View>
      );
    }
}
