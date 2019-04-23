import React, { Component } from 'react';
import {Image, View, ScrollView, TextInput, Button, StyleSheet, TouchableWithoutFeedback, Keyboard, TouchableOpacity,  AsyncStorage } from 'react-native';
import {Card, ListItem} from 'react-native-elements';
import Icon from 'react-native-vector-icons/FontAwesome';
import firebase from 'react-native-firebase';
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
        this.state = {content: "",post_content: "",post_id : "", user: ""}
        this._retrieveData();
    }
    _retrieveData = () =>{
          AsyncStorage.getItem('user').then(val=>{
              this.setState({user:val})
          }).then(res=>{
              this.console.log("GOT IT")
          }).catch(err=>{
              console.log(err);
          });

    };

    componentDidMount(){
        return AsyncStorage.getItem('comment').then(val=>{
            const item = JSON.parse(val);
            this.setState({post_content: item.content, post_id: item.post_id});
        })
    }

    postComment = () => {
        const {content, post_content, post_id, user} = this.state;
        this.comment_ref.add({
            user: user,
            post_id: post_id,
            content: content,
            upvote: 1,
            downvote: 0,
            parent_id: "",
            date: new Date().getTime().toString(),
        }).then(data=>{
            this.user_ref.add({
                post : data.id,
                user: user,
                isUpvote: true
            });

        }).catch(err=> console.log(err));
    }

    render() {
      return (
        <View style={{ flex: 1, flexDirection: 'column' }}>
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
