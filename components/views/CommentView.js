import React, { Component } from 'react';
import {Image, View, ScrollView, Text, Button, StyleSheet, FlatList, TouchableOpacity,  AsyncStorage } from 'react-native';
import {Card, ListItem} from 'react-native-elements';
import Icon from 'react-native-vector-icons/FontAwesome';
import firebase from 'react-native-firebase';

export default class Focus extends React.Component {
    constructor(){
        this.post_ref = firebase.firestore().collection('posts');
        this.comment_ref = firebase.firestore().collection('comments');
        this.state = {post_id : "", user: "", content: ""}
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
          AsyncStorage.getItem('post_id').then(val=>{
              this.setState({post_id:val})
          }).then(res=>{
              this.console.log("GOT IT")
          }).catch(err=>{
              console.log(err);
          });
    };
    
    componentDidMount(){

    }

    postComment = () => {

    }

    render() {
      return (
        <View style={{ flex: 1, flexDirection: 'column' }}>
        <View style={{ flex: 1, padding: 10 }}>
          <Button style={ styles.button } title="Comment!" color="#4C9A2A" onPress = {this.postComment} />
        </View>
        <View style={{ flex: 1, padding: 10 }}>
          <Button style={ styles.button } title="Reply!" color="#4C9A2A" onPress = {this.reply} />
        </View>
        </View>
      );
    }
}
