import React, { Component } from 'react';
import {Text,Image, View, ScrollView, TextInput, Button, StyleSheet, TouchableWithoutFeedback, Keyboard, TouchableOpacity,  AsyncStorage } from 'react-native';
import {Card, ListItem} from 'react-native-elements';
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
    height: 100,
    fontSize:13,
    width: '100%',
    borderColor: '#9b9b9b',
    borderBottomWidth: 1,
    marginTop: 8,
    marginVertical: 15
  },
  inputCard : {
      padding: 10,
      margin: 20,
      marginVertical: 5,
      width: '90%',
      backgroundColor: "#efefef",
      borderRadius: 8,
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
        <View style={{ flex: 1, flexDirection: 'column' }}>
        <Text>{this.state.post.title}</Text>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                <View style={{ flex: 1, padding: 10 }}>
                    <View style={styles.inputCard}>
                        <TextInput
                            multiline
                            style={styles.textbox}
                            placeholder="Write a comment..."
                            autoCapitalize="none"
                            numberOfLines={5}
                            adjustsFontSizeToFit={true}
                            minimumFontScale={0.1}
                            onChangeText={content => this.setState({ content })}
                        />
                    </View>
                <Button style={ styles.button } title="Comment!" color="#4C9A2A" onPress = {this.postComment} />
                </View>
            </TouchableWithoutFeedback>
        </View>
      );
    }
}
