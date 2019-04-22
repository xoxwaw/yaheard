import React, { Component } from 'react';
import {Image, View, ScrollView, Text, Button, StyleSheet, FlatList, TouchableOpacity,  AsyncStorage, Dimensions } from 'react-native';
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
  },
  title: {
        fontSize: 18,
        borderColor: '#9b9b9b',
        borderBottomWidth: 1,
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
        this.state = {items: [], images: [], query: null, location: 'unknown', email: "", orderBy : 0, byDate: 0};
        this._retrieveData();
    }

    reload = () =>{
        navigator.geolocation.getCurrentPosition(
            position => {
                const location = {
                    longitude: position.coords.longitude,
                    latitude: position.coords.latitude
                }
                console.log(location);
                this.setState({ location });
                var query = this.getDocumentNearBy(1.0);
                this.setState({ query });
                this.unsubscribe = query.onSnapshot(this.onCollectionUpdate);
            },
            error => alert(error.message),
            { enableHighAccuracy: false, timeout: 50000}
        );
    }
    componentDidMount() {
        AsyncStorage.getItem('feed').then(items=>{
            if (items){
                const allposts = JSON.parse(items);
                this.setState({items: allposts});
                console.log("GOT THEM")
            }else{
                this.reload();
            }
        })
        // if (this.state.query == null){
        //     this.unsubscribe = this.ref.onSnapshot(this.onCollectionUpdate);
        // }

        // this.loadImage("images/image.png");
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


    // componentWillUnmount() {
    //     this.unsubscribe();
    // }

    loadImage(path) {
        setTimeout(() => {
        this.storage.ref(path).getDownloadURL()
          .then((url) => {
            this.setState({imgURL: {uri: url}});
          });
      }, 2000);
    }

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
                height: height * image_width/width,
            });

        });
        AsyncStorage.setItem('feed', JSON.stringify(items)).then(val=>{
            console.log("save successfully");
        })
        this.setState({
        items:items
        });

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
            user: post.user
        }
        AsyncStorage.setItem('post', JSON.stringify(items))
        .then((val)=>console.log("set successfully!")).then(res=>this.props.navigation.navigate('routeFocus'))
    }
    render() {
        return (

            <ScrollView contentContainerStyle={{ padding: 0, margin: 0 }}>
            <Button onPress={this.reload} title="RELOAD"/>
                <View containerStyle={{margin: 0, padding: 0, zIndex: 0}} >
                {
                    this.state.items.map((u, i) => {
                        if (u.isText == true){
                            return (
                                <Card>
                                    <TouchableOpacity onPress={()=>this.navigateToPost(u)}>
                                        <Text style={styles.title}>{u.title}</Text>
                                    </TouchableOpacity>
                                    <Text style={styles.content}>{u.post}</Text>
                                    <Text style={{fontSize: 10, color: '#BBB', paddingBottom: 20}}>{u.location.latitude}, {u.location.longitude}</Text>
                                    <View style={{ flex: 1, flexDirection: 'row' }}>
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
                                        <View>
                                            <Text>{u.up - u.down}</Text>
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
                                                <Text
                                                    style={{textAlign: "center"}}
                                                    size={25}
                                                    color='#4C9A2A'>
                                                    {'report'}
                                                </Text>
                                            </TouchableOpacity>
                                        </View>
                                        <View style={styles.control_button}>
                                            <TouchableOpacity style={{padding:10}} onPress={()=>this.navigateToComment(u)}>
                                                <Text
                                                    style={{textAlign: "center"}}
                                                    size={25}
                                                    color='#4C9A2A'>
                                                    {'comment'}
                                                </Text>

                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </Card>
                            );
                        }else{
                            return (
                                <Card>
                                    <TouchableOpacity onPress={()=>this.navigateToPost(u)}>
                                        <View style={{ height: u.height - 285 }}>
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
                                        <Text style={styles.title_image}>{u.title}</Text>
                                    </TouchableOpacity>
                                    <Text style={{fontSize: 10, color: '#BBB', paddingBottom: 20}}>{u.location.latitude}, {u.location.longitude}</Text>
                                    <View style={{ flex: 1, flexDirection: 'row' }}>
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
                                        <View>
                                            <Text>{u.up - u.down}</Text>
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
                                                <Text
                                                    style={{textAlign: "center"}}
                                                    size={25}
                                                    color='#4C9A2A'>
                                                    {'report'}
                                                </Text>
                                            </TouchableOpacity>
                                        </View>
                                        <View style={styles.control_button}>
                                            <TouchableOpacity style={{padding:10}} onPress={()=>this.navigateToComment(u)}>
                                                <Text
                                                    style={{textAlign: "center"}}
                                                    size={25}
                                                    color='#4C9A2A'>
                                                    {'comment'}
                                                </Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </Card>
                            )
                        }
                    })
                }
                </View>
            </ScrollView>
        );
    }
}
