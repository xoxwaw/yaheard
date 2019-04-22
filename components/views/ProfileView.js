import React, { Component } from 'react';
import { View, Text, StyleSheet, AsyncStorage, ScrollView} from 'react-native';
import { SwitchNavigator } from 'react-navigation'
import {Card} from 'react-native-elements'
import firebase from 'react-native-firebase';

export default class Profile extends React.Component {
    constructor(){
        super();
        this.ref = firebase.firestore().collection('users');
        this.user_post = firebase.firestore().collection('user_post');
        this.post_ref = firebase.firestore().collection('posts');
        this.storage = firebase.storage();
        this.state = {karma: 1, recent_posts : [], email: ""};
    }
    componentDidMount(){
        AsyncStorage.getItem('user').then(val=>{
            this.setState({email: val});
            this.unsubscribe = this.post_ref.where('user', '==', val).onSnapshot(this.onCollectionUpdate);
        });

    }
    componentWillUnmount() {
        this.unsubscribe();
    }

    onCollectionUpdate =(snapshot) =>{
        recent_posts = [];
        snapshot.forEach((doc)=>{
            const {body, downvote, isText, location, time, user, upvote} = doc.data();
            recent_posts.push({
                title : body.title,
                content: body.content,
                isText: isText,
                up : upvote,
                down: downvote,
                location: location,
                time: time
            });
        });
        this.setState({recent_posts: recent_posts});
        // this.user_post.
    }
  render() {
    return (
      <View style={{ flex: 1, flexDirection: 'column'}}>
        <Text>Hello, {this.state.username}</Text>
        <Text>Karma: {this.state.karma}</Text>
        <Text>{this.state.email}</Text>
        <ScrollView>
          <View containerStyle={{padding: 0}} >
          {
              this.state.recent_posts.map((u, i) => {
                      return (
                          <Card>
                          <Text>{u.title}</Text>
                          <Text>{u.up - u.down}</Text>
                          </Card>
                      );
                   })
          }
          </View>

        </ScrollView>
      </View>
    );
  }
}
