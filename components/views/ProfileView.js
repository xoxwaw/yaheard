import React, { Component } from 'react';
import { View, Text, StyleSheet, AsyncStorage, ScrollView, Button, TouchableOpacity} from 'react-native';
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
        this.state = {karma: 1, posts : [], email: ""};
    }
    componentDidMount(){
        AsyncStorage.getItem('user').then(val=>{
            this.setState({email: val});
            AsyncStorage.getItem('recent_uploaded').then(value=>{
                if (value){
                    const recent_posts = JSON.parse(value);
                    this.setState({posts: recent_posts})
                }else{
                    this.unsubscribe = this.post_ref.where('user', '==', val).limit(5).onSnapshot(this.onCollectionUpdate);
                }
            })
        });
    }
    onCollectionUpdate =(snapshot) =>{
        const recent_posts = [];
        snapshot.forEach((doc)=>{
            const {body, downvote, height, isText, location, time, user, upvote, width} = doc.data();
            recent_posts.push({
                title : body.title,
                content: body.content,
                isText: isText,
                up : upvote,
                down: downvote,
                location: location,
                time: time,
                user: user,
            });
        });
        console.log("RECENT"+recent_posts)
        this.setState({posts: recent_posts});
        AsyncStorage.setItem('recent_uploaded',JSON.stringify(recent_posts)).
        then(val=>console.log("saved recent posts"));
        // this.user_post.
    }
    fetchRecent = () =>{
        AsyncStorage.getItem('current_feed').then(val=>{
            if (val){
                const recent_viewed = JSON.parse(val);
                this.setState({posts: recent_viewed.reverse()})
            }else{
                this.setState({posts: []})
            }
        })
    }
    fetchUpvoted = () =>{
        AsyncStorage.getItem('upvoted').then(val=>{
            if (val){
                const upvoted = JSON.parse(val);
                this.setState({posts: upvoted.reverse()});
            }else{
                this.setState({posts: []})
            }
        });
    }
    fetchUploaded =()=>{
        AsyncStorage.getItem('recent_uploaded').then(val=>{
            if (val){
                const uploaded = JSON.parse(val);
                this.setState({posts: uploaded.reverse()});
            }else{
                this.setState({posts: []});
            }
        });
    }
    // navigateToPost(post){
    //     const items = {
    //         post_id: post.id,
    //         title: post.title,
    //         content: post.content,
    //         isText: post.isText,
    //         location: post.location,
    //         upvote: post.up,
    //         downvote: post.down,
    //         user: post.user
    //     }
    //     AsyncStorage.setItem('post', JSON.stringify(items))
    //     .then((val)=>console.log("set successfully!")).then(res=>this.props.navigation.navigate('routeFocus'))
    // }

  render() {
    return (
      <View style={{ flex: 1, flexDirection: 'column'}}>
        <Text>Karma: {this.state.karma}</Text>
        <Text>{this.state.email}</Text>
        <Button title="History" onPress={this.fetchRecent}/>
        <Button title="Upvoted" onPress={this.fetchUpvoted}/>
        <Button title="Recently uploaded" onPress = {this.fetchUploaded}/>
        <ScrollView>
          <View containerStyle={{padding: 0}} >
          {
              this.state.posts.map((u, i) => {
                      return (
                          <Card>
                          <TouchableOpacity>
                          <Text>{u.title}</Text>
                          </TouchableOpacity>
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
