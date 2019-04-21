import React, { Component } from 'react';
import {Image, View, ScrollView, Text, Button, StyleSheet, FlatList, TouchableOpacity,  AsyncStorage } from 'react-native';
import {Card, ListItem} from 'react-native-elements';
import Icon from 'react-native-vector-icons/FontAwesome';
import firebase from 'react-native-firebase';

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
  content: {
      fontSize: 12,
  },
  title: {
      fontSize: 14,
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
    componentDidMount() {
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
        if (this.state.query == null){
            this.unsubscribe = this.ref.onSnapshot(this.onCollectionUpdate);
        }

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


    componentWillUnmount() {
        this.unsubscribe();
    }

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
            const {body, downvote, isText, location, time, upvote, user} = doc.data();
            items.push({
                user: user,
                post: body.content,
                title: body.title,
                up: upvote,
                isText: isText,
                location: location,
                down: downvote,
                id: doc.id
            });

        });
        this.setState({
        items:items
        });
    }
    navigateToPost(id){
        AsyncStorage.setItem('post_id', id).then(val => {
            console.log("set successfully");
        }).catch(err=> {console.log(err)});
        this.props.navigation.navigate('routeFocus');
    }
  render() {
    return (
        <ScrollView>
          <View containerStyle={{padding: 0}} >
          {
              this.state.items.map((u, i) => {
                  if (u.isText == true){
                      return (
                          <Card>
                          <TouchableOpacity onPress={()=>this.navigateToPost(u.id)}>
                            <Text style={styles.title}>{u.title}</Text>
                            </TouchableOpacity>
                          <Text style={styles.content}>{u.post}</Text>
                          <Text style={{fontSize: 10, color: '#BBB'}}>{u.location.latitude}, {u.location.longitude}</Text>
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
                          <View><Text>{u.up - u.down}</Text></View>
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
						  <TouchableOpacity style={{padding:10}}>
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
                          <TouchableOpacity onPress={()=>this.navigateToPost(u.id)}>
                            <Text style={styles.title}>{u.title}</Text>
                            </TouchableOpacity>
                          <Image
                            style={{width: 300, height: 200}}
                            source={{uri: u.post}}
                          />
                          <Text style={{fontSize: 10, color: '#BBB'}}>{u.location.latitude}, {u.location.longitude}</Text>
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
                           <View><Text>{u.up - u.down}</Text></View>
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
						  <TouchableOpacity style={{padding:10}}>
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
