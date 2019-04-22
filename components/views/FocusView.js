import React, { Component } from 'react';
import {Image, View, ScrollView, Text, Button, StyleSheet, FlatList, TouchableOpacity,  AsyncStorage, Dimensions } from 'react-native';
import {Card, ListItem} from 'react-native-elements';
import Icon from 'react-native-vector-icons/FontAwesome';
import firebase from 'react-native-firebase';

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
      fontSize: 12,
  },
  title: {
      fontSize: 14,
  }
});
export default class Focus extends React.Component {
    constructor(){
        super();
        this.post_ref = firebase.firestore().collection('posts');
        this.comment_ref = firebase.firestore().collection('comments');
        this.user_post = firebase.firestore().collection('user_post');
        this.state = {post_id : "", user: "", content: "", items : [], comments: []}
        this._retrieveData();
    }
    componentDidMount(){
        return AsyncStorage.getItem('post').then((value)=>{
            const item = JSON.parse(value);
            const items = [];
            console.log(item.post_id);
            items.push({
                user: item.user,
                post: item.content,
                title: item.title,
                up: item.upvote,
                isText: item.isText,
                location: item.location,
                down: item.downvote,
                height: item.height,
                width: item.width,
            });
            this.setState({items: items, post_id: item.post_id});
            AsyncStorage.getItem(item.post_id).then(val=>{
                if (val){
                    this.setState({comments: JSON.parse(val)})
                }else{
                    this.unsubscribe = this.comment_ref.where("post_id", "==", item.post_id).onSnapshot(this.onCollectionUpdate)
                }
            })
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
                id: doc.id
            });
            console.log(content, post_id, user)
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

    _retrieveData = () =>{
          AsyncStorage.getItem('user').then(val=>{
              this.setState({user:val})
          }).then(res=>{
              console.log("GOT IT")
          }).catch(err=>{
              console.log(err);
          });

    };

    upvote = (pid) =>{
        this.user_post.where('user','==',this.state.email).where('post','==', pid).get().then((querySnapshot)=>{
            const items = [];
            querySnapshot.forEach(doc=>{
                const {isUpvote, post, user} = doc.data();
                items.push({
                    id: doc.id,
                    isUpvote: isUpvote,
                    post: post,
                    user: user
                })
            })
            if (items.length > 0){
                const {id,isUpvote, post, user} = items[0];
                console.log(user,id,isUpvote, post);
                this.user_post.doc(id).update("isUpvote",true);
                if (isUpvote == false){
                    this.ref.doc(pid).update("upvote", firebase.firestore.FieldValue.increment(2))
                }else{
                    this.ref.doc(pid).update("upvote", firebase.firestore.FieldValue.increment(-1));
                    this.user_post.doc(id).delete();
                }
            }else{
                console.log(pid,this.state.email)
                this.user_post.add({
                    user: this.state.email,
                    post: pid,
                    isUpvote: true
                });
                this.ref.doc(pid).update("upvote", firebase.firestore.FieldValue.increment(1))
            }
        }).catch(err=>{
            console.log(err)
        })
    }

    downvote= (pid) =>{
        this.user_post.where('user','==',this.state.email).where('post','==', pid).get().then((querySnapshot)=>{
            const items = [];
            querySnapshot.forEach(doc=>{
                const {isUpvote, post, user} = doc.data();
                items.push({
                    id: doc.id,
                    isUpvote: isUpvote,
                    post: post,
                    user: user
                })
            })
            if (items.length > 0){
                const {id,isUpvote, post, user} = items[0];
                console.log(user,id,isUpvote, post);
                this.user_post.doc(id).update("isUpvote",false);
                if (isUpvote == true){
                    this.ref.doc(pid).update("downvote", firebase.firestore.FieldValue.increment(2))
                }else{
                    this.ref.doc(pid).update("downvote", firebase.firestore.FieldValue.increment(-1));
                    this.user_post.doc(id).delete();
                }
            }else{
                console.log(pid,this.state.email)
                this.user_post.add({
                    user: this.state.email,
                    post: pid,
                    isUpvote: false
                });
                this.ref.doc(pid).update("downvote", firebase.firestore.FieldValue.increment(1))
            }
        }).catch(err=>{
            console.log(err)
        })
    }
    comment =()=>{
        const item ={
            id: this.state.post_id,
            content: this.state.content
        }
    }
    reply=(comment)=>{
        const item = {
            id: comment.id,
            content: comment.content,
            post_id: this.state.post_id
        }
        AsyncStorage.setItem('comment', JSON.stringify(item))
        .then((val)=>console.log("set successfully!")).then(res=>this.props.navigation.navigate('routeReply'))
    }
    render() {
        return (
          <View style={{ flex: 1, flexDirection: 'column', width: '100%' }}>
          <ScrollView style={{ flex: 1, width: '100%'  }}>
              <View containerStyle={{padding: 0, width: '100%'}} >
                  <TouchableOpacity style={{ width: 40, height: 40, borderRadius: 30 }} onPress={() => this.props.navigation.navigate('routeFeed') }>
                      <View style={{ width: 40, height: 40, backgroundColor: 'whitesmoke', borderRadius: 30, position: 'absolute', elevation: 5 }}>
                          <Icon
                              style={{textAlign: "center", padding: 10}}
                              size={20}
                              name='arrow-left'
                              color='#4C9A2A'
                          />
                      </View>
                  </TouchableOpacity>
              {
                  this.state.items.map((u, i) => {
                      if (u.isText == true){
                          return (
                              <View>
                                  <Text style={styles.title}>{u.title}</Text>
                                  <View style={{ flex: 1, flexDirection: 'row', backgroundColor: '#ddd', height: 45}}>
                                        <View style={styles.control_button}>
                                            <TouchableOpacity style={{padding:10,}} onPress = {() => this.upvote(u.id)}>
                                                <Icon
                                                style={{textAlign: "center"}}
                                                size={25}
                                                name='arrow-circle-up'
                                                color='#4C9A2A'
                                                />
                                            </TouchableOpacity>
                                        </View>

                                        <View style={{ flex: 1 }}>
                                            <Text style={{fontSize: 20, textAlign: 'center', marginTop: 10}}>{u.up - u.down}</Text>
                                        </View>

                                        <View style={styles.control_button}>
                                            <TouchableOpacity style={{padding:10}} onPress={() => this.downvote(u.id)}>
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
                                            <TouchableOpacity style={{padding:10}} onPress={()=>this.navigateToComment(u)}>
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
                                  <Image
                                      style= {{
                                          width: win.width,
                                          height: (u.height / u.width) * win.width,
                                      }}
                                      source={{uri: u.post}}
                                      resizeMode={"contain"}
                                  />
                                  <Text>{u.title}</Text>
                                    <View style={{ flex: 1, flexDirection: 'row', backgroundColor: '#ddd', height: 45}}>
                                        <View style={styles.control_button}>
                                            <TouchableOpacity style={{padding:10,}} onPress = {() => this.upvote(u.id)}>
                                                <Icon
                                                style={{textAlign: "center"}}
                                                size={25}
                                                name='arrow-circle-up'
                                                color='#4C9A2A'
                                                />
                                            </TouchableOpacity>
                                        </View>

                                        <View style={{ flex: 1 }}>
                                            <Text style={{fontSize: 20, textAlign: 'center', marginTop: 10}}>{u.up - u.down}</Text>
                                        </View>

                                        <View style={styles.control_button}>
                                            <TouchableOpacity style={{padding:10}} onPress={() => this.downvote(u.id)}>
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
                                            <TouchableOpacity style={{padding:10}} onPress={()=>this.navigateToComment(u)}>
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
          
            <View style={{ backgroundColor: '#bbb', width: '100%', flex: 1 }}>
            {!this.state.comments.length && 
                (
                    <Card>
                        <Text>No Comments yet!</Text>
                    </Card> 
                )
            }
            {
                this.state.comments.map((u,i)=>{
                    return(
                        <Card>
                        <Text>{u.content}</Text>
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
  