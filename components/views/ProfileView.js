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
        this.state = {username: "", karma: 1, recent_posts : [], email: ""};
    }
    componentDidMount(){
        this._retrieveData();
        this.unsubscribe = this.post_ref.where('user', '==', this.state.email).onSnapshot(this.onCollectionUpdate);
    }
    componentWillUnmount() {
        this.unsubscribe();
    }
    onCollectionUpdate =(snapshot) =>{
        recent_posts = [];
        snapshot.forEach((doc)=>{
            const {body, isText, location, time, user, vote} = doc.data();
            console.log(body.content);
            recent_posts.push({
                title : body.title,
                content: body.content,
                isText: isText,
                up : vote.upvote,
                down: vote.downvote,
                location: location,
                time: time
            });
        })
        this.setState({recent_posts: recent_posts});
    }
    _retrieveData = async () => {
          try {
              const value = await AsyncStorage.getItem('user');
              if (value !== null) {
                  // We have data!!
                  this.setState({email: value})
                  var query = this.ref.where("email", "==", value);
                  query.onSnapshot((snapshot) =>{
                      snapshot.forEach(child => {
                          const {email, karma, username} = child.data()
                          this.setState({
                              username: username,
                              email: email,
                              karma: karma});
                      })
                  });

              }
          } catch (error) {
              alert(error);
              // Error retrieving data
          }
    };

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
