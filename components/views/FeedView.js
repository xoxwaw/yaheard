import React, { Component } from 'react';
import {Image, Alert, View, ScrollView, Text, Button, StyleSheet, RefreshControl, TouchableOpacity,  AsyncStorage, Dimensions } from 'react-native';
import { Card } from './Card';
import Icon from 'react-native-vector-icons/FontAwesome';
import firebase from 'react-native-firebase';

const win = Dimensions.get('window');
const image_width = win.width - 20;
const image_height = win.width * 0.922 * 0.75;
//these are the calculated values for the width and height of an image post reletive to the screen.

const styles = StyleSheet.create({
  content_container: {
    backgroundColor: '#68bb59',
  },
  content_item: {
    backgroundColor: 'whitesmoke',
    borderRadius: 10,
  },
  content: {
      fontSize: 12,
      paddingBottom: 20,
      marginRight: 20,
      marginTop: 20
  },
  control_button :{
    flex: 1,
    elevation: 10
  },
  title: {
        fontSize: 18,
        borderColor: '#9b9b9b',
        borderBottomWidth: 1,
        marginTop: 20,
        marginRight: 20
  },
  title_image: {
        marginTop: image_height,
        fontSize: 18,
        borderColor: '#9b9b9b',
        borderBottomWidth: 1,
  }
});

export default class Feed extends React.Component {

    constructor(){
        super();
        this.ref = firebase.firestore().collection('posts');
        this.user_post = firebase.firestore().collection('user_post');
        this.storage = firebase.storage();
        //orderBy: 0 - new, 1: popular, 2: controversial
        //byDate: 0 - today, 1: this week, 2: this month, 3: this year, 4: all time
        this.state = {refreshing: false, items: [], images: [], query: null, location: 'unknown', email: "", orderBy : 0, byDate: 0, allposts:[], last_ind:6};
        this._retrieveData();
    }
    _onRefresh = () => {
        this.setState({refreshing: true});
        this.unsubscribe = this.state.query.onSnapshot(this.onCollectionUpdate);
        this.setState({refreshing: false});
    }
    reload = ()=>{
        this.unsubscribe = this.state.query.onSnapshot(this.onCollectionUpdate);
    }
    savePostsToCaches(extra_posts){
        AsyncStorage.getItem('current_feed').then(val=>{
            var curr_feed = []
            if (val){
                var cur_feed = JSON.parse(val);
            }
            curr_feed.concat(extra_posts);
            AsyncStorage.setItem('current_feed', JSON.stringify(curr_feed)).then(val=>
            console.log());
        })
    }
    fetchNextPosts = ()=>{
        const ind = this.state.last_ind;
        var extra_posts = []
        if (ind >= this.state.allposts.length){
            Alert.alert("No more posts","Couldn't find any more posts in your current location! Try moving around.")
        }else{
            if (ind+5 < this.state.allposts.length){
                var items = this.state.items;
                extra_posts = this.state.allposts.slice(ind, ind+5)
                this.setState({last_ind: ind+5, items: items.concat(extra_posts)})
                console.log(ind,items,extra_posts)
            }else{
                extra_posts = this.state.allposts.slice(ind, this.state.allposts.length)
                this.setState({items: this.state.allposts, last_ind: this.state.allposts.length});
            }
        }
        this.savePostsToCaches(extra_posts)
    }
    componentDidMount() {
        navigator.geolocation.getCurrentPosition(
            position => {
                const location = {
                    longitude: position.coords.longitude,
                    latitude: position.coords.latitude
                }
                AsyncStorage.getItem('last_location').then(loc=>{
                    if (loc){
                        const last_loc = JSON.parse(loc);
                        if (Math.sqrt((Math.pow((location.longitude - last_loc.longitude), 2)+
                            Math.pow((location.latitude - last_loc.latitude),2))) <= 0.2){
                                var query = this.getDocumentNearBy(1.0);
                                this.setState({ query });
                                AsyncStorage.getItem('feed').then(items=>{
                                    if (items){
                                        const allposts = JSON.parse(items);
                                        this.setState({items: allposts.slice(0,5), last_ind: 6, allposts: allposts});
                                        console.log("GOT THEM");
                                        // this.reload();
                                    }else{
                                        this.reload();
                                    }
                                })
                            }else{
                                this.reload();
                            }
                    }
                })
                this.setState({ location });
                AsyncStorage.setItem('last_location', JSON.stringify(location)).then(val=>{
                    console.log();
                });

            },
            error => alert(error.message),
            { enableHighAccuracy: false, timeout: 50000}
        );
    }
    _retrieveData = () =>{
          AsyncStorage.getItem('user').then(val=>{
              this.setState({email:val})
          }).then(res=>{
              console.log("GOT IT")
          }).catch(err=>{
              console.log(err);
          });
    };

    upvote = (pid) =>{
        // this.user_post.where('user','==',this.state.email).where('post','==', pid).get().then((querySnapshot)=>{
        //     const items = [];
        //     querySnapshot.forEach(doc=>{
        //         const {isUpvote, post, user} = doc.data();
        //         items.push({
        //             id: doc.id,
        //             isUpvote: isUpvote,
        //             post: post,
        //             user: user
        //         })
        //     })
        //     if (items.length > 0){
        //         const {id,isUpvote, post, user} = items[0];
        //         console.log(user,id,isUpvote, post);
        //         this.user_post.doc(id).update("isUpvote",true);
        //         if (isUpvote == false){
        //             this.ref.doc(pid).update("upvote", firebase.firestore.FieldValue.increment(2))
        //         }else{
        //             this.ref.doc(pid).update("upvote", firebase.firestore.FieldValue.increment(-1));
        //             this.user_post.doc(id).delete();
        //         }
        //     }else{
        //         console.log(pid,this.state.email)
        //         this.user_post.add({
        //             user: this.state.email,
        //             post: pid,
        //             isUpvote: true
        //         });
        //         this.ref.doc(pid).update("upvote", firebase.firestore.FieldValue.increment(1))
        //     }
        // }).catch(err=>{
        //     console.log(err)
        // });
        // this.state.items.forEach(elem=>{
        //     if (elem.id == pid){
        //         elem.up += 1
        //     }
        // })
        var superitems = this.state.items;
        superitems.forEach(elem=>{
            if (elem.id == pid){
                AsyncStorage.getItem(elem.id+"voted").then(val=>{
                    if (val){
                        const value = JSON.parse(val);
                        if (value == true){
                            elem.up -= 1
                            AsyncStorage.removeItem(elem.id + "voted").then(val=>console.log())
                        }else{
                            elem.up += 2
                            AsyncStorage.setItem(elem.id+"voted", JSON.stringify(true)).then(val=>{console.log()})
                        }
                    }else{
                        elem.up += 1
                        AsyncStorage.setItem(elem.id+"voted", JSON.stringify(true)).then(val=>{console.log()})
                    }
                });
                AsyncStorage.getItem('upvoted').then(val=>{
                    var upvoted = []
                    if (val){
                        var upvoted = JSON.parse(val);
                    }
                    upvoted.push({
                        id: pid,
                        content: elem.id
                    });
                    AsyncStorage.setItem('upvoted', upvoted).then(val=>console.log())
                })
            }
        });

        this.setState({items: superitems})
        AsyncStorage.setItem('feed', JSON.stringify(superitems)).then(val=>{
            console.log("SAVE THE FEED")
        });

    }

    downvote= (pid) =>{
        // this.user_post.where('user','==',this.state.email).where('post','==', pid).get().then((querySnapshot)=>{
        //     const items = [];
        //     querySnapshot.forEach(doc=>{
        //         const {isUpvote, post, user} = doc.data();
        //         items.push({
        //             id: doc.id,
        //             isUpvote: isUpvote,
        //             post: post,
        //             user: user
        //         })
        //     })
        //     if (items.length > 0){
        //         const {id,isUpvote, post, user} = items[0];
        //         this.user_post.doc(id).update("isUpvote",false);
        //         if (isUpvote == true){
        //             this.ref.doc(pid).update("downvote", firebase.firestore.FieldValue.increment(2))
        //         }else{
        //             this.ref.doc(pid).update("downvote", firebase.firestore.FieldValue.increment(-1));
        //             this.user_post.doc(id).delete();
        //         }
        //     }else{
        //         console.log(pid,this.state.email)
        //         this.user_post.add({
        //             user: this.state.email,
        //             post: pid,
        //             isUpvote: false
        //         });
        //         this.ref.doc(pid).update("downvote", firebase.firestore.FieldValue.increment(1))
        //     }
        // }).catch(err=>{
        //     console.log(err)
        // })
        var superitems = this.state.items;
        superitems.forEach(elem=>{
            if (elem.id == pid){
                AsyncStorage.getItem(elem.id+"voted").then(val=>{
                    if (val){
                        const value = JSON.parse(val);
                        console.log(value)
                        if (value == false){
                            elem.down -= 1
                            AsyncStorage.removeItem(elem.id+"voted").then(val=>console.log())
                        }else{
                            elem.down += 2
                            AsyncStorage.setItem(pid+"voted", JSON.stringify(false)).then(val=>{console.log()})
                        }
                    }
                    else{
                        elem.down += 1
                        AsyncStorage.setItem(pid+"voted", JSON.stringify(false)).then(val=>{console.log()})
                    }
                })
            }
        });

        this.setState({items: superitems})
        AsyncStorage.setItem('feed', JSON.stringify(superitems)).then(val=>{
            console.log("SAVE THE FEED")
        })

    }

    getDocumentNearBy = (distance) => {
        const lat = 0.0144927536231884;
        const lon = 0.0181818181818182;
        const {longitude, latitude} = this.state.location;
        const lowerLat = latitude - (lat * distance);
        const lowerLon = longitude - (lon * distance);

        const greaterLat = latitude + (lat * distance)
        const greaterLon = longitude + (lon * distance)

        let lesserGeopoint = new firebase.firestore.GeoPoint(lowerLat,lowerLon)
        let greaterGeopoint = new firebase.firestore.GeoPoint(greaterLat, greaterLon)

        let docRef = firebase.firestore().collection("posts");

        let query = docRef.where("location", '>', lesserGeopoint).where("location", '<', greaterGeopoint)
        // if (this.state.orderBy == 0){
        //     query = query.orderBy("date","desc").limit(10);
        // }else if (this.state.orderBy == 1){
        //     query = query.orderBy("upvote", "desc")
        // }else if (this.state.orderBy == 2){
        //     query = query.orderBy("downvote","desc")
        // }
        return query;
    }

    onCollectionUpdate = (querySnapshot) => {
        const items = [];
        querySnapshot.forEach((doc) => {
            const {body, downvote, height, isText, location, time, upvote, user,width} = doc.data();
            items.push({
                user: user,
                post: body.content,
                title: body.title,
                up: upvote,
                isText: isText,
                location: location,
                down: downvote,
                id: doc.id,
                width: image_width,
                time: time,
                height: (height / width) * image_width,
            });
        });
        AsyncStorage.setItem('feed', JSON.stringify(items)).then(val=>{
            console.log("save the feed successfully");
        })
        this.setState({last_ind: 6, allposts:items});

        if (items.length > 6){
            this.setState({
            items:items.slice(0,6)
            });
        }
        this.savePostsToCaches(items.slice(0,6))

    }

    navigateToComment(post){
        const item = {
            post_id: post.id,
            content: post.title,
        }
        AsyncStorage.setItem('comment', JSON.stringify(item))
        .then(val=> console.log("set successfully")).then(res=> this.props.navigation.navigate('routeComment'))
    }
    navigateToPost(post){
        const items = {
            post_id: post.id,
            title: post.title,
            content: post.post,
            isText: post.isText,
            location: post.location,
            upvote: post.up,
            downvote: post.down,
            user: post.user,
            width: post.width,
            height: post.height,
            time: post.time,
        }
        AsyncStorage.setItem('post', JSON.stringify(items))
        .then((val)=>console.log("set successfully!")).then(res=>this.props.navigation.navigate('routeFocus'))
    }
    render() {
        return (

            <ScrollView contentContainerStyle={{ padding: 0, margin: 0 }}
                refreshControl={
                    <RefreshControl
                    refreshing={this.state.refreshing}
                    onRefresh={this._onRefresh}
                    color='#4C9A2A'
                />
                }
            >
                <View containerStyle={{margin: 0, padding: 0, zIndex: 0}} >
                {
                    this.state.items.map((u, i) => {
                        if (u.isText == true){
                            return (
                                <Card>
                                    <View style={{padding: 20}}>
                                        <TouchableOpacity onPress={()=>this.navigateToPost(u)}>
                                            <Text style={{ fontSize: 24 }}>{u.title}</Text>
                                            <Text style={{ fontSize: 16 }}>{u.post}</Text>
                                            <Text style={{fontSize: 10, color: '#333', paddingBottom: 20}}>Posted at {u.time}, {u.location.latitude}, {u.location.longitude}.</Text>
                                        </TouchableOpacity>
                                    </View>

                                    <View style={{ flex: 1, flexDirection: 'row' }}>

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

                                        <View>
                                            <Text style={{fontSize: 20, textAlign: 'center', flex: 1, marginTop: 10}}>{u.up - u.down}</Text>
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
                                        <View style={{flex: 3}}></View>
                                    </View>
                                </Card>
                            );
                        }else{
                            return (
                                <Card>

                                    <TouchableOpacity onPress={()=>this.navigateToPost(u)}>
                                        <View>
                                            <Image
                                                style= {{
                                                    width: u.width,
                                                    height: u.height,
                                                    position: 'absolute',
                                                    borderTopLeftRadius: 7,
                                                    borderTopRightRadius: 7,
                                                }}
                                                source={{uri: u.post}}
                                                resizeMode={"stretch"}
                                            />
                                        </View>
                                        <View style={{ padding: 20, marginTop: u.height }}>
                                            <Text style={{fontSize: 24}}>{u.title}</Text>
                                            <Text style={{fontSize: 10, color: '#333', paddingBottom: 20, flex: 1}}>Posted at {u.time}, {u.location.latitude}, {u.location.longitude}.</Text>
                                        </View>
                                    </TouchableOpacity>
                                    <View style={{ flex: 1, flexDirection: 'row'}}>
                                        <View style={styles.control_button}>
                                            <TouchableOpacity style={{padding:10}} onPress = {() => this.upvote(u.id)}>
                                                <Icon
                                                    style={{textAlign: "center"}}
                                                    size={25}
                                                    name='arrow-circle-up'
                                                    color='#4C9A2A'
                                                />
                                            </TouchableOpacity>
                                        </View>
                                        <View style={{flex: 1}}>
                                            <Text style={{fontSize: 20, textAlign: 'center', marginTop: 10}}>{u.up - u.down}</Text>
                                        </View>
                                        <View style={styles.control_button}>
                                            <TouchableOpacity style={{padding:10}} onPress = {() => this.downvote(u.id)}>
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
                                        <View style={{flex: 3}}></View>
                                    </View>
                                </Card>
                            )
                        }
                    })
                }
                </View>
            <View style={{ flexDirection: 'row', flex: 1, justifyContent: 'center', alignItems: 'center', marginVertical: 10 }}>
                <TouchableOpacity onPress={this.fetchNextPosts} style={{ backgroundColor: 'white', borderRadius: 30,  height: 50, width: 50, elevation: 5 }}>
                    <Icon
                        style={{textAlign: "center", padding: 10}}
                        size={30}
                        name='plus'
                        color='#4C9A2A'
                    />
                </TouchableOpacity>
            </View>
            </ScrollView>
        );
    }
}
