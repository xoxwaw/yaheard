import React, { Component } from 'react';
import { withNavigation  } from 'react-navigation';
import {Image, ImageBackground, View, ScrollView, Text, Button, StyleSheet, BackHandler, TouchableOpacity,  AsyncStorage, Dimensions } from 'react-native';
import { Card } from './Card';
import Icon from 'react-native-vector-icons/FontAwesome';
import firebase from 'react-native-firebase';

//backend actions
const dbactions = require('./Backend/DBActions');
const caches = require('./Backend/CachesActions');
const navigate = require('./Backend/Navigations');

const win = Dimensions.get('window');

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
  control_button :{
    flex: 1,
    elevation: 10
  },
  content: {
      fontSize: 15,
  },
  title: {
      fontSize: 20,
      textAlign: 'center',
      width: '100%'
  }
});
export default class Focus extends React.Component {
    constructor(){
        super();
        this.post_ref = firebase.firestore().collection('posts');
        this.comment_ref = firebase.firestore().collection('comments');
        this.user_post = firebase.firestore().collection('user_post');
        this.state = {post_id : "", user: "", content: "", items : [], comments: [], post:{}}
        this._retrieveData();
    }
    componentWillMount() {
        BackHandler.addEventListener('hardwareBackPress', this.handleBackButtonClick);
    }

    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', this.handleBackButtonClick);
    }

    handleBackButtonClick() {
        return true;
    }
    componentDidMount(){
        return AsyncStorage.getItem('post').then((value)=>{
            const item = JSON.parse(value);
            const items = [];
            items.push(item);
            console.log(items);
            this.setState({items: items, post_id: item.id, post: item});
            this.unsubscribe = this.comment_ref.where("post_id", "==", item.id).onSnapshot(this.onCollectionUpdate)
        })
    }
    onCollectionUpdate = (querySnapshot) => {
        const comments = [];
        querySnapshot.forEach(doc=>{
            const {content, date, downvote, parent_id, post_id,upvote, user} = doc.data()
            comments.push({
                content: content,
                date: date,
                up: upvote,
                down: downvote,
                parent_id: parent_id,
                user: user,
                id: doc.id,
            });
        });
        this.comment_tree = comments.filter(obj => obj.parent_id == "")
        this.comment_tree.forEach(elem=>{
            this.buildTree(elem, comments)
        })
        this.setState({comments: this.comment_tree})
        console.log(this.comment_tree);
        AsyncStorage.setItem(this.state.post_id, JSON.stringify(this.comment_tree)).then(data=>{
            console.log("SAVE THE COMMENTS");
        })
    }

    buildTree(node, comments){
        node.response = comments.filter(obj => obj.parent_id == node.id)
        if (node.response.length > 0){
            node.response.forEach(elem=>{
                this.buildTree(elem, comments);
            })
        }
    }
    _upvote(post){
        var superitems = this.state.items;
        superitems.forEach(elem=>{
            if (elem.id == post.id){
                caches.upvote(post);
                dbactions.upvote(post.id, this.state.email, post.user);
            }
        });
        this.setState({items: superitems});

    }
    _downvote(post){
        var superitems = this.state.items;
        superitems.forEach(elem=>{
            if (elem.id == post.id){
                caches.downvote(post);
                dbactions.downvote(post.id, this.state.email, post.user);
            }
        });
        this.setState({items: superitems});
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
    comment =()=>{
        AsyncStorage.setItem('comment', JSON.stringify(this.state.post))
        .then((val)=>console.log("set successfully!")).then(res=>this.props.navigation.navigate('routeComment'))
    }
    reply=(comment)=>{
        const item = {
            id: comment.id,
            content: comment.content,
            post_id: this.state.post_id
        }
        AsyncStorage.setItem('post', JSON.stringify(this.state.post)).then(res=>console.log())
        AsyncStorage.setItem('comment', JSON.stringify(item))
        .then((val)=>console.log("set successfully!")).then(res=>this.props.navigation.navigate('routeReply'));
    }

    renderComment(node, depth=0){
        return (
            <View style={{ padding: 15 }}>
            <Text style={{ marginBottom: 10 }}>{node.content}</Text>
                <View style={{ flex: 1, flexDirection: 'row'}}>
                    <View style={{ flex: 2 }}></View>
                    <View style={{ flex: 2 }}>
                        <Text style={{ width: '100%', textAlign: 'center', color: '#bbb' }}>{dbactions.msToTime(new Date().getTime() - node.date)} ago.</Text>
                    </View>

                    <View style={{ flex: 1 }}>
                        <Text style={{ width: '100%', textAlign: 'center' }}>|</Text>
                    </View>

                    <View style={{ flex: 1 }}>
                        <TouchableOpacity onPress={()=>this.reply(node)}>
                            <Text style={{ width: '100%', textAlign: 'center', color: '#7bc484' }}>Reply</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={{ flex: 1 }}>
                        <Text style={{ width: '100%', textAlign: 'center' }}>|</Text>
                    </View>

                    <View style={{ flex: 1 }}>
                        <TouchableOpacity>
                            <Text style={{ width: '100%', textAlign: 'center', color: '#c47b7b' }}>Report</Text>
                        </TouchableOpacity>
                    </View>

                </View>
                {node.response &&
                    node.response.map((u,i) => this.renderComment(u, depth+1))
                }
            </View>
        )
    }
    render() {
        return (
          <View style={{ flex: 1, flexDirection: 'column', width: '100%' }}>
            <ScrollView style={{ flex: 1, width: '100%'  }}>
                <View containerStyle={{padding: 0, width: '100%'}} >

              {
                  this.state.items.map((u, i) => {
                      if (u.isText == true){
                          return (
                                <View>
                                    <View style={{ padding: 10, backgroundColor: 'whitesmoke', width: '100%' }}>
                                        <TouchableOpacity style={{ width: 50, height: 50, borderRadius: 30 }} onPress={() => this.props.navigation.navigate('routeFeed') }>
                                            <View style={{ width: 50, height: 50, backgroundColor: 'whitesmoke', borderRadius: 30, position: 'absolute', elevation: 5 }}>
                                                <Icon
                                                    style={{textAlign: "center", padding: 15}}
                                                    size={20}
                                                    name='arrow-left'
                                                    color='#4C9A2A'
                                                />
                                            </View>
                                        </TouchableOpacity>
                                    </View>
                                    <View style={{ padding: 15, backgroundColor: 'whitesmoke'}}>
                                        <Text style={styles.title}>{u.title}</Text>
                                        <Text style={styles.content}>{u.content}</Text>
                                    </View>
                                    <View style={{ flex: 1, flexDirection: 'row', backgroundColor: '#ddd', height: 45}}>
                                        <View style={styles.control_button}>
                                            <TouchableOpacity style={{padding:10,}} onPress = {() => this._upvote(u)}>
                                                <Icon
                                                style={{textAlign: "center"}}
                                                size={25}
                                                name='arrow-circle-up'
                                                color='#4C9A2A'
                                                />
                                            </TouchableOpacity>
                                        </View>

                                        <View style={{}}>
                                            <Text style={{fontSize: 20, textAlign: 'center', marginTop: 10}}>{u.upvote - u.downvote}</Text>
                                        </View>

                                        <View style={styles.control_button}>
                                            <TouchableOpacity style={{padding:10}} onPress={() => this._downvote(u)}>
                                                <Icon
                                                    style={{textAlign: "center"}}
                                                    size={25}
                                                    name='arrow-circle-down'
                                                    color='#4C9A2A'
                                                />
                                            </TouchableOpacity>
                                        </View>

                                        <View style={styles.control_button}>
                                            <TouchableOpacity style={{padding:10}}>
                                                <Icon
                                                    style={{textAlign: "center"}}
                                                    size={25}
                                                    name='flag'
                                                    color='#c45e5e'
                                                />
                                            </TouchableOpacity>
                                        </View>

                                        <View style={styles.control_button}>
                                            <TouchableOpacity style={{padding:10}} onPress={()=>this.comment()}>
                                                <Icon
                                                    style={{textAlign: "center"}}
                                                    size={25}
                                                    name='comments'
                                                    color='#333'
                                                />
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                              </View>
                          );
                      }else{
                          return (
                              <View style={{ width: '100%' }}>


                                    <ImageBackground
                                        style= {{
                                            width: win.width,
                                            height: (u.height / u.width) * win.width,
                                        }}
                                        source={{uri: u.content}}
                                        resizeMode={"contain"}
                                    >
                                        <View style={{ padding: 10 }}>
                                            <TouchableOpacity style={{ width: 50, height: 50, borderRadius: 30 }} onPress={() => this.props.navigation.navigate('routeFeed') }>
                                                <View style={{ width: 50, height: 50, backgroundColor: 'whitesmoke', borderRadius: 30, position: 'absolute', elevation: 5 }}>
                                                    <Icon
                                                        style={{textAlign: "center", padding: 15}}
                                                        size={20}
                                                        name='arrow-left'
                                                        color='#4C9A2A'
                                                    />
                                                </View>
                                            </TouchableOpacity>
                                        </View>
                                    </ImageBackground>

                                    <View style={{ padding: 15, backgroundColor: 'whitesmoke'}}>
                                        <Text style={styles.title}>{u.title}</Text>
                                    </View>
                                    <View style={{ flex: 1, flexDirection: 'row', backgroundColor: '#ddd', height: 45}}>
                                        <View style={styles.control_button}>
                                            <TouchableOpacity style={{padding:10,}} onPress = {() => this._upvote(u)}>
                                                <Icon
                                                style={{textAlign: "center"}}
                                                size={25}
                                                name='arrow-circle-up'
                                                color='#4C9A2A'
                                                />
                                            </TouchableOpacity>
                                        </View>

                                        <View style={{}}>
                                            <Text style={{fontSize: 20, textAlign: 'center', marginTop: 10}}>{u.upvote - u.downvote}</Text>
                                        </View>

                                        <View style={styles.control_button}>
                                            <TouchableOpacity style={{padding:10}} onPress={() => this._downvote(u)}>
                                                <Icon
                                                    style={{textAlign: "center"}}
                                                    size={25}
                                                    name='arrow-circle-down'
                                                    color='#4C9A2A'
                                                />
                                            </TouchableOpacity>
                                        </View>

                                        <View style={styles.control_button}>
                                            <TouchableOpacity style={{padding:10}}>
                                                <Icon
                                                    style={{textAlign: "center"}}
                                                    size={25}
                                                    name='flag'
                                                    color='#c45e5e'
                                                />
                                            </TouchableOpacity>
                                        </View>

                                        <View style={styles.control_button}>
                                            <TouchableOpacity style={{padding:10}} onPress={()=>this.comment(u)}>
                                                <Icon
                                                    style={{textAlign: "center"}}
                                                    size={25}
                                                    name='comments'
                                                    color='#333'
                                                />
                                            </TouchableOpacity>
                                        </View>
                                    </View>

                              </View>
                          )
                      }

                  })
              }
              </View>

            <View style={{ backgroundColor: '#bbb', width: '100%', minHeight: '100%' }}>
            {!this.state.comments.length &&
                (
                    <Card>
                        <Text style={{ fontSize: 20, padding: 15, width: '100%', textAlign: 'center', color: 'gray' }}>No Comments yet!</Text>
                    </Card>
                )
            }
            {
                this.state.comments.map((u,i)=>{
                    return(
                        <Card>
                        {this.renderComment(u)}
                        </Card>
                    )
                })
            }

            </View>
          </ScrollView>
          </View>
        );
      }
  }
