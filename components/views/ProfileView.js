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
            if (val){
                this.setState({email: val});
                this.fetchKarma();
                this.fetchUploaded();
            }
        }).catch(err=>console.log(err));
    }
    fetchKarma = () =>{
        var user =[]
        console.log(this.state.email);
        this.ref.where('email', '==', this.state.email).get().then(snapshot=>{
            snapshot.forEach(doc=>{

                const {email, karma} = doc.data();
                console.log(karma);
                this.setState({karma: karma});
            })
        })
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
        var upvoted = [];
        this.user_post.where('user','==',this.state.email).where('isUpvote','==',true).limit(10).get()
        .then(snapshot=>{
            snapshot.forEach(doc=>{
                var {isUpvote, post, user} = doc.data();
                this.post_ref.doc(post).get().then(data=>{
                    const {content, downvote, height, isText, location, time, title,upvote, user, width} = data.data();
                    upvoted.push({
                        title : title,
                        content: content,
                        isText: isText,
                        upvote : upvote,
                        downvote: downvote,
                        location: location,
                        time: time,
                        user: user,
                    });
                    this.setState({posts: upvoted});
                }).catch(err=>console.log(err))
            });
            if (upvoted.length == 0){
                this.setState({posts: []});
            }
        });
    }
    fetchUploaded =()=>{
        var uploaded = [];
        this.post_ref.where('user', '==', this.state.email).limit(10).get().then(snapshot=>{
            snapshot.forEach(doc=>{
                console.log("data", doc.data());
                const {content, downvote, height, isText, location, time, title,upvote, user, width} = doc.data();
                uploaded.push({
                    title : title,
                    content: content,
                    isText: isText,
                    upvote : upvote,
                    downvote: downvote,
                    location: location,
                    time: time,
                    user: user,
                });
                this.setState({posts: uploaded});
            });
            if (uploaded.length == 0){
                this.setState({posts: []})
            }

        }).catch(err=>console.log(err));
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
                          <Text>{u.upvote - u.downvote}</Text>
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
