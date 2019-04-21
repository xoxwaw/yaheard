import React, { Component } from 'react';
import { View, Text, StyleSheet, TextInput, Button, AsyncStorage, Platform, Image, TouchableOpacity } from 'react-native';
import { withNavigation  } from 'react-navigation';
import Icon from 'react-native-vector-icons/FontAwesome';
import firebase from 'react-native-firebase';
import ImagePicker from 'react-native-image-picker';
import ImageResizer from 'react-native-image-resizer';
import RNFetchBlob from 'react-native-fetch-blob';
import * as Progress from 'react-native-progress';

const storage = firebase.storage();

export default class ImagePost extends React.Component {
  state = { post_title : "", post_content: '', errorMessage: null,user: "",  location: {}, isText: true, imageURL : ""}
  constructor(props){
      super(props);
      this._retrieveData();
      this.ref = firebase.firestore().collection('posts');
      this.user_ref = firebase.firestore().collection('user_post');
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
  uploadImage = () => {
        //set view to loading image
        var uri = this.state.imageURL;
        var mime = 'image/jpeg'
          const sessionId = new Date().getTime().toString();
          const path = 'images/' + sessionId + ".jpeg";
          console.log(path)
          const imageRef = storage.ref(path);
          imageRef.put(uri, { contentType: mime }).then((snapshot)=>{
              setTimeout(()=>{
                  imageRef.getDownloadURL().then((url)=>{
                      this.setState({post_content: url, isText: false});
                      this.writePost();
                      console.log(this.state);
                  }).catch((error)=>{
                      console.log(error.message);
                  })
              },3000
          )

      });

  }
  writePost = () => {
      var {post_title, post_content, errorMessage, user,location, isText, imageURL} = this.state;
      this.ref.add({
          body: {
              content: post_content,
              title : post_title,
          },
          isText : isText,
          user: user,
          upvote: 1,
          downvote: 0,
          location: new firebase.firestore.GeoPoint(location.latitude, location.longitude),
          time: new Date().getTime()
      }).then((data)=>{
          this.user_ref.add({
              post : data.id,
              user: user,
              isUpvote: true
          })
          //success callback
      }).catch((error)=>{
          //error callback
          console.log(error)
      });

      this.props.navigation.navigate('routeMain');
  }
  handleImagePost = () => {
      this.setState({isText: false});
      this._takePicture();
  }
  _takePicture = () => {
      const options = {
          title: 'Select Photo',
          storageOptions: {
              skipBackup: true,
              path: 'images',
          },
      };

      /**
      * The first arg is the options object for customization (it can also be null or omitted for default options),
      * The second arg is the callback which sends object: response (more info in the API Reference)
      */
      ImagePicker.showImagePicker(options, (response) => {
          console.log('Response = ', response);

          if (response.didCancel) {
              console.log('User cancelled image picker');
          } else if (response.error) {
              console.log('ImagePicker Error: ', response.error);
          } else if (response.customButton) {
              console.log('User tapped custom button: ', response.customButton);
          } else {
              const source = { uri: response.uri };
              console.log(response.uri)
              this.resize(response.uri);
          }
      });

    }

    resize = (uri) =>{
        ImageResizer.createResizedImage(uri, 800,600, 'JPEG', 80)
        .then((data) =>{
            console.log(data.uri);
            this.setState({imageURL: data.uri})
            this.uploadImage(data.uri);
            console.log("Upload successfully");
        }).catch(err =>{
            console.log(err);
            alert('Unable to resize');
        })
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
          <TouchableOpacity style={styles.touch} onPress={() => this.props.navigation.navigate('routeSelector') }>
            <Icon
              style={{textAlign: "center"}}
              size={25}
              name='arrow-left'
              color='#4C9A2A'
            />
          </TouchableOpacity>
          <Text style={styles.header}>Create Image Post</Text>
        </View>
        <View style={styles.container}>
          <TextInput
            multiline
            style={styles.textbox}
            placeholder="Title"
            autoCapitalize="none"
            numberOfLines={5}
            adjustsFontSizeToFit={true}
            minimumFontScale={0.1}
            onChangeText={post_title => this.setState({ post_title })}
            // value={this.state.post_content}
          />
          <Progress.Circle color="#4C9A2A" progress={0.4} size={50} />

          <View style={{ flex: 1, flexDirection: 'row', width: "100%", margin: 20}}>
            <View style={{ flex: 1, padding: 10 }}>
                <Button style={ styles.button } title="Choose Image" color="#4C9A2A" onPress={() => {
                    this.handleImagePost()
                    this.props.navigation.navigate('routeFeed') 
                }}/>
            </View>
            <View style={{ flex: 1, padding: 10 }}>
              <Button style={ styles.button } title="Post!" color="#4C9A2A" onPress = {this.uploadImage} />
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
    marginBottom: 20,
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
  textbox : {
    height: 40,
    fontSize:20,
    width: '90%',
    borderColor: '#9b9b9b',
    borderBottomWidth: 1,
    marginTop: 8,
    marginVertical: 15
  },
});
