import React, { Component } from 'react';
import {withNavigation  } from 'react-navigation';
import {Image, ActivityIndicator, Alert, View, ScrollView, Text, StyleSheet, RefreshControl, TouchableOpacity,  AsyncStorage, Dimensions, BackHandler } from 'react-native';
import { Card } from './Card';
import Icon from 'react-native-vector-icons/FontAwesome';
import firebase from 'react-native-firebase';

//backend actions
const dbactions = require('./Backend/DBActions');
const caches = require('./Backend/CachesActions');
const navigate = require('./Backend/Navigations');
const client = require('./Backend/Client')

const win = Dimensions.get('window');
const image_width = win.width - 20;
const image_height = win.width * 0.922 * 0.75;
//these are the calculated values for the width and height of an image post reletive to the screen.
const MAXIMUM_MOVING_DISTANCE = 0.01;

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

class Feed extends React.Component {

    constructor(){
        super();
        this.ref = firebase.firestore().collection('posts');
        this.user_post = firebase.firestore().collection('user_post');
        this.storage = firebase.storage();
        this.state = {loadingMorePosts: false, refreshing: false, items: [], images: [], query: null,
            location: 'unknown', email: "", orderBy : 0, byDate: 0, allposts:[], last_ind:6};
        this._retrieveData();

        this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
    }
    componentWillMount() {
        BackHandler.addEventListener('hardwareBackPress', this.handleBackButtonClick);
    }

    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', this.handleBackButtonClick);
    }

    handleBackButtonClick() {
        this.props.navigation.navigate('routeFeed')
        return true;
    }
    _onRefresh = () => {
        this.setState({refreshing: true});
        this.getLocation()
        this.setState({last_ind: 5})
        this.setState({refreshing: false});
    }
    reload = ()=>{
        this.getLocation();
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
        this.setState({loadingMorePosts: true}); // for loading indicator at bottom of feed;
        const ind = this.state.last_ind;
        if (ind >= this.state.feedlength){
            Alert.alert("No more posts",
            "Couldn't find any more posts in your current location! Try moving around.")
        }else{
            if (ind+5 < this.state.feedlength){
                this.setState({last_ind: ind+5});
            }else{
                this.setState({last_ind: this.state.feedlength})
            }
        }
        this.setState({items: this.state.allposts.slice(0, this.state.last_ind)});
        this.setState({loadingMorePosts: false}); // for loading indicator at bottom of feed
    }
    componentDidMount() {
        this.getLocation();

    }

    getLocation =() =>{
        navigator.geolocation.getCurrentPosition(
            position => {
                const location = {
                    longitude: position.coords.longitude,
                    latitude: position.coords.latitude
                }
                this.setState({ location });
                var query = this.getDocumentNearBy(MAXIMUM_MOVING_DISTANCE);
                this.setState({query: query})
                this.unsubscribe = query.onSnapshot(this.onCollectionUpdate);
                AsyncStorage.setItem('last_location', JSON.stringify(location)).then(val=>{
                    console.log();
                });

            },
            error => alert(error.message),
            { enableHighAccuracy: false, timeout: 50000, maximumAge: 0}
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

    getDocumentNearBy = (distance) => {
        const lat = 0.0144927536231884; //conversion unit
        const lon = 0.0181818181818182;
        const {longitude, latitude} = this.state.location;
        const lowerLat = latitude - (lat * distance);
        const lowerLon = longitude - (lon * distance);

        const greaterLat = latitude + (lat * distance)
        const greaterLon = longitude + (lon * distance)

        let lesserGeopoint = new firebase.firestore.GeoPoint(lowerLat,lowerLon)
        let greaterGeopoint = new firebase.firestore.GeoPoint(greaterLat, greaterLon)

        let docRef = firebase.firestore().collection("posts");
        let query = docRef.where("location", '>', lesserGeopoint).where("location", '<', greaterGeopoint).orderBy("location","asc")
        return query;
    }

    onCollectionUpdate = (querySnapshot) => {
        const items = [];
        querySnapshot.forEach((doc) => {
            const {content, downvote, height, isText, location, time,title, upvote, user,width} = doc.data();
            items.push({
                user: user,
                content: content,
                title: title,
                upvote: upvote,
                isText: isText,
                location: location,
                downvote: downvote,
                id: doc.id,
                width: image_width,
                time: time,
                height: (height / width) * image_width,
            });
        });
        AsyncStorage.setItem('feed', JSON.stringify(items)).then(val=>{
            console.log("save the feed successfully");
        });
        this.setState({allposts: items});
        client.sortByPopular(this.state.allposts);
        AsyncStorage.getItem('sortTime').then(val=>{
            console.log(val)
            if (val == 'day'){
                const allposts = client.last24hours(this.state.allposts)
                this.setState({allposts: allposts})
                allposts.forEach(elem=>
                console.log(new Date().getTime()- elem.time))
            }else if(val == 'month'){
                const allposts = client.pastMonth(this.state.allposts)
                this.setState({allposts: allposts})
            }else if (val == 'year'){
                const allposts = client.pastYear(this.state.allposts)
                this.setState({allposts: allposts})
            }
            this.setState({feedlength: this.state.allposts.length});
        }).catch(err => console.log(err));
        AsyncStorage.getItem('sortType').then(val =>{
            console.log(val)
            if (val == 'new'){
                client.sortByDate(this.state.allposts)
            }else if (val == 'popular'){
                client.sortByPopular(this.state.allposts);
            }
        }).catch(err=>console.log(err));
        // client.sortByDate(this.state.allposts);

        if (this.state.feedlength == 0){
            this.setState({items: []})
        }else if (this.state.last_ind <= this.state.feedlength){
            this.setState({items: this.state.allposts.slice(0, this.state.last_ind)});
        }else{
            this.setState({items: this.state.allposts});
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
    navigateToComment(post){
        AsyncStorage.setItem('comment', JSON.stringify(post))
        .then(val=> console.log("set successfully")).then(res=> this.props.navigation.navigate('routeComment'))
    }
    navigateToPost(post){
        console.log(post)
        AsyncStorage.setItem('post', JSON.stringify(post))
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
            <View style={{ width: '100%', justifyContent: 'center', alignItems: 'center' }}>
                <Card>
                    <Text style={{padding: 10}}>{this.state.location.longitude},{this.state.location.latitude}</Text>
                </Card>
            </View>
            <View containerStyle={{margin: 0, padding: 0, zIndex: 0}} >
                {
                    this.state.items.map((u, i) => {
                        if (u.isText == true){
                            return (
                                <Card>
                                    <View style={{padding: 20}}>
                                        <TouchableOpacity onPress={()=>this.navigateToPost(u)}>
                                            <Text style={{ fontSize: 24 }}>{u.title}</Text>
                                            <Text style={{ fontSize: 16 }}>{u.content}</Text>
                                        </TouchableOpacity>
                                    </View>

                                    <View style={{ flex: 1, flexDirection: 'row', backgroundColor: '#ddd', height: 45, borderBottomLeftRadius: 8, borderBottomRightRadius: 8 }}>

                                        <View style={styles.control_button}>
                                            <TouchableOpacity style={{padding:10,}} onPress = {() => this._upvote(u)}>
                                                <Icon
                                                style={{textAlign: "center"}}
                                                size={20}
                                                name='arrow-circle-up'
                                                color='#4C9A2A'
                                                />
                                            </TouchableOpacity>
                                        </View>

                                        <View style={{ flex: 1 }}>
                                            <Text style={{fontSize: 20, textAlign: 'center', marginTop: 10}}>{u.upvote - u.downvote}</Text>
                                        </View>

                                        <View style={styles.control_button}>
                                            <TouchableOpacity style={{padding:10}} onPress={() => this._downvote(u)}>
                                                <Icon
                                                    style={{textAlign: "center"}}
                                                    size={20}
                                                    name='arrow-circle-down'
                                                    color='#4C9A2A'
                                                />
                                            </TouchableOpacity>
                                        </View>

                                        <View style={styles.control_button}>
                                            <TouchableOpacity style={{padding:10}} onPress={()=>this.navigateToComment(u)}>
                                                <Icon
                                                    style={{textAlign: "center"}}
                                                    size={20}
                                                    name='comments'
                                                    color='#333'
                                                />
                                            </TouchableOpacity>
                                        </View>

                                        <View style={{flex: 3, flexDirection: 'column', height: '100%'}}>
                                            <View style={{ flex: 1 }}></View>
                                            <Text style={{fontSize: 12, color: '#555', flex: 1, marginLeft: 10, width: '100%', textAlign: 'center'}}>{dbactions.msToTime(new Date().getTime() - u.time)} ago.</Text>
                                            <View style={{ flex: 1 }}></View>
                                        </View>
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
                                                source={{uri: u.content}}
                                                resizeMode={"stretch"}
                                            />
                                        </View>
                                        <View style={{marginTop: u.height }}>
                                            <Text style={{margin: 20, fontSize: 24}}>{u.title}</Text>
                                        </View>
                                    </TouchableOpacity>
                                    <View style={{ flex: 1, flexDirection: 'row', backgroundColor: '#ddd', height: 45, borderBottomLeftRadius: 8, borderBottomRightRadius: 8 }}>
                                        <View style={styles.control_button}>
                                            <TouchableOpacity style={{padding:10}} onPress = {() => this._upvote(u)}>
                                                <Icon
                                                    style={{textAlign: "center"}}
                                                    size={20}
                                                    name='arrow-circle-up'
                                                    color='#4C9A2A'
                                                />
                                            </TouchableOpacity>
                                        </View>
                                        <View style={{flex: 1}}>
                                            <Text style={{fontSize: 20, textAlign: 'center', marginTop: 10}}>{u.upvote - u.downvote}</Text>
                                        </View>
                                        <View style={styles.control_button}>
                                            <TouchableOpacity style={{padding:10}} onPress = {() => this._downvote(u)}>
                                                <Icon
                                                    style={{textAlign: "center"}}
                                                    size={20}
                                                    name='arrow-circle-down'
                                                    color='#4C9A2A'
                                                />

                                            </TouchableOpacity>
                                        </View>
                                        <View style={styles.control_button}>
                                            <TouchableOpacity style={{padding:10}} onPress={()=>this.navigateToComment(u)}>
                                                <Icon
                                                    style={{textAlign: "center"}}
                                                    size={20}
                                                    name='comments'
                                                    color='#333'
                                                />
                                            </TouchableOpacity>
                                        </View>
                                        <View style={{flex: 3, flexDirection: 'column', height: '100%'}}>
                                            <View style={{ flex: 1 }}></View>
                                            <Text style={{fontSize: 12, color: '#555', flex: 1, marginLeft: 10, width: '100%', textAlign: 'center'}}>{dbactions.msToTime(new Date().getTime() - u.time)} ago.</Text>
                                            <View style={{ flex: 1 }}></View>
                                        </View>
                                    </View>
                                </Card>
                            )
                        }
                    })
                }
                </View>
            <View style={{ flexDirection: 'row', flex: 1, justifyContent: 'center', alignItems: 'center', marginVertical: 10 }}>
                <TouchableOpacity onPress={this.fetchNextPosts} style={{ backgroundColor: 'white', borderRadius: 30,  height: 50, width: 50, elevation: 5 }}>
                    {!this.state.loadingMorePosts &&
                        <Icon
                            style={{textAlign: "center", padding: 10}}
                            size={30}
                            name='arrow-down'
                            color='#4C9A2A'
                        />
                    }
                    {this.state.loadingMorePosts &&
                        <ActivityIndicator style={{ position: 'absolute' }} size="small" color="#4C9A2A" />
                    }
                </TouchableOpacity>
            </View>
            </ScrollView>
        );
    }
}



export default withNavigation(Feed);
