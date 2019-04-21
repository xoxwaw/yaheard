import React, { Component } from 'react';
import { View, Text, StyleSheet, TextInput, Button, AsyncStorage, Platform, Image, TouchableOpacity, Alert } from 'react-native';
import { withNavigation  } from 'react-navigation';
import Icon from 'react-native-vector-icons/FontAwesome';
import firebase from 'react-native-firebase';
import RNFetchBlob from 'react-native-fetch-blob';
import { tsConstructSignatureDeclaration } from '@babel/types';

const storage = firebase.storage();


export default class TextPost extends React.Component {
  state = { post_title : "", post_content: '', errorMessage: null,user: "",  location: {}, isText: true }
  constructor(props){
      super(props);
      this._retrieveData();
      this.ref = firebase.firestore().collection('posts');
      this.user_post = firebase.firestore().collection("user_post");
  }
  componentDidMount(){
      navigator.geolocation.getCurrentPosition(
          position => {
              const location = {
                  longitude: position.coords.longitude,
                  latitude: position.coords.latitude
              }
              this.setState({ location });
          },
          error => alert(error.message),
          { enableHighAccuracy: false, timeout: 50000}
      );
  }
  writePost = () => {
      var {post_title, post_content, errorMessage, user,location, isText} = this.state;

      this.ref.add({
          body: {
              content: post_content,
              title : post_title,
          },
          isText : isText,
          user: user,
          upvote:1,
          downvote:0,
          location: new firebase.firestore.GeoPoint(location.latitude, location.longitude),
          time: new Date().getTime()
      }).then((data)=>{
          this.user_post.add({
              user: user,
              post: data.id,
              isUpvote: true
          })
          console.log("Upload successfully")
          //success callback
      }).catch((error)=>{
          //error callback
          console.log(error)
      });

  }
  clearText = () => {
    //not yet written
  }

  handleTextPost = () =>{
      this.setState({isText: true});
      this.writePost();
  }
  _retrieveData = async () => {
        try {
            const value = await AsyncStorage.getItem('user');
            if (value !== null) {
                // We have data!!
                this.setState({user: value});
            }
        } catch (error) {
            alert(error);
            // Error retrieving data
        }
  };
  render() {
    return (
      <View style={{ width: '100%', flex: 1, flexDirection: 'column' }}>

        <View style={{ flexDirection: 'row', height: 30, backgroundColor: 'whitesmoke' }}>

          <View style={{ flex: 1, height: '100%' }}>
            <TouchableOpacity style={styles.touch} onPress={() => this.props.navigation.navigate('routeSelector') }>
              <Icon
                style={{textAlign: "center"}}
                size={25}
                name='arrow-left'
                color='#4C9A2A'
              />
            </TouchableOpacity>
          </View>

          <View style={{ flex: 8, height: '100%' }}>
            <Text style={styles.header}>Create Text Post</Text>
          </View>

        </View>

        <View style={styles.container}>
        <TextInput
            multiline
            style={styles.titletextbox}
            placeholder="Title"
            autoCapitalize="none"
            numberOfLines={5}
            adjustsFontSizeToFit={true}
            minimumFontScale={0.1}
            onChangeText={post_title => this.setState({ post_title })}
          />
          <TextInput
            multiline
            style={styles.textbox}
            placeholder="What did you hear?"
            autoCapitalize="none"
            numberOfLines={5}
            adjustsFontSizeToFit={true}
            minimumFontScale={0.1}
            onChangeText={post_content => this.setState({ post_content })}
          />
          <View style={{ flex: 1, flexDirection: 'row', width: "100%", margin: 20}}>
            <View style={{ flex: 1, padding: 10 }}>
                <Button style={ styles.button } title="Post!" color="#4C9A2A" onPress={() => {
                    if (this.state.post_content != ""){
                        this.handleTextPost();
                        this.props.navigation.navigate('routeFeed');
                    }
                    else{
                        console.log('NOTHING TO POST');
                        Alert.alert('Cannot Post!','Please write something to post!');
                    }
                }}/>
            </View>
            <View style={{ flex: 1, padding: 10 }}>
              <Button style={ styles.button } title="Clear" color="#4C9A2A" onPress = {this._takePicture}/>
            </View>
          </View>
            <View>
                <Text style={{ fontSize: 10, color: '#BBB', marginBottom: 20 }}>Currently posting from ({this.state.location.latitude}, {this.state.location.longitude})</Text>
            </View>
        </View>
      </View>
    );
  }
}
const styles = StyleSheet.create({
  button : {
    marginLeft: 10,
    marginRight: 10,
  },
  header : {
    fontSize: 18,
    color: '#4C9A2A',
    marginLeft: 20,
    marginTop: 5,
    flex: 1,
  },
  container : {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    flex: 15,
  },
  titletextbox : {
    height: 40,
    fontSize:20,
    width: '90%',
    borderColor: '#9b9b9b',
    borderBottomWidth: 1,
    marginTop: 8,
    marginVertical: 15
  },
  textbox : {
    height: 40,
    fontSize:13,
    width: '90%',
    borderColor: '#9b9b9b',
    borderBottomWidth: 1,
    marginTop: 8,
    marginVertical: 15
  }
});
