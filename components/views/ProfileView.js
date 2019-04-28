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
                        width: width,
                        height: height,
                        id: doc.id
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
                    width: width,
                    height: height,
                    id: doc.id
                });
                this.setState({posts: uploaded});
            });
            if (uploaded.length == 0){
                this.setState({posts: []})
            }

        }).catch(err=>console.log(err));
    }
    navigateToPost(post){
        AsyncStorage.setItem('post', JSON.stringify(post))
        .then((val)=>console.log("set successfully!")).then(res=>this.props.navigation.navigate('routeFocus'))
    }

  render() {
    return (
      <View style={{ flex: 1, flexDirection: 'column', width: '100%'}}>
        <View style={{ width: '100%', backgroundColor: '#ddd' }}>
            <Text style={{ margin: 10, paddingBottom: 5, fontSize: 20, borderColor: '#555', borderBottomWidth: 0.5 }}>{this.state.email}</Text>
            <Text style={{ marginLeft: 10, fontSize: 12 }}>(Only you can see this profile)</Text>
            <Text style={{ margin: 10, paddingBottom: 5, fontSize: 20 }}>Karma: {this.state.karma}</Text>
        </View>
        <View style={{ flexDirection: 'row', width: '100%', backgroundColor: '#ddd'}}>
            <TouchableOpacity style={{ elevation: 5, justifyContent: 'center',  alignItems: 'center', margin: 5, flex: 1, height: 40, borderRadius: 50, backgroundColor: '#efefef' }} onPress={this.fetchUpvoted}>
                <Text style={{ fontSize: 15, color: '#444', width: '100%', textAlign: 'center'}}>Upvoted</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{ elevation: 5, justifyContent: 'center',  alignItems: 'center', margin: 5, flex: 1, height: 40, borderRadius: 50, backgroundColor: '#efefef' }} onPress = {this.fetchUploaded}>
                <Text style={{ fontSize: 15, color: '#444', width: '100%', textAlign: 'center'}}>Uploads</Text>
            </TouchableOpacity>
        </View>
        <ScrollView>
            <View containerStyle={{padding: 0}} >
                {
                    this.state.posts.map((u, i) => {
                        return (
                            <Card>
                            <TouchableOpacity onPress = {()=> this.navigateToPost(u)}>
                                <Text>{u.title}{!u.title && "*No Title*"} - ({u.upvote - u.downvote})</Text>
                            </TouchableOpacity>
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
