import React, { Component } from 'react';
import { View, Text, StyleSheet, TextInput, Button, AsyncStorage, Platform, Image } from 'react-native';
import { SwitchNavigator } from 'react-navigation'
import firebase from 'react-native-firebase';
import ImagePicker from 'react-native-image-picker';

const storage = firebase.storage()

export default class Create extends React.Component {
  state = { post_title : "", post_content: '', errorMessage: null,user: "",  location: {}, isText: true }
  constructor(props){
      super(props);
      this._retrieveData();
      this.ref = firebase.firestore().collection('posts');
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
          error => Alert.alert(error.message),
          { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
      );
  }

  uploadImage = (uri, mime = 'image/png') => {
          const sessionId = new Date().getTime().toString();
          const path = 'images/' + sessionId + ".png";
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
      var {post_title, post_content, errorMessage, user,location, isText} = this.state;

      this.ref.add({
          body: {
              content: post_content,
              title : post_title,
          },
          isText : isText,
          user: user,
          vote : {
              upvote: 1,
              downvote: 0
          },
          location: location,
          time: new Date().getTime()
      }).then((data)=>{
          console.log("Upload successfully")
          //success callback
      }).catch((error)=>{
          //error callback
          console.log(error)
      });
      this.props.navigation.navigate('routeMain');
  }
  clearText = () => {
    //not yet written
  }

  handleTextPost = () =>{
      this.setState({isText: true});
      this.writePost();
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
              // You can also display the image using data:
              // const source = { uri: 'data:image/jpeg;base64,' + response.data };
              this.uploadImage(response.uri);
              // .catch(error => console.log(error));
          }
      });

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
        <Text style={styles.header}>What did you hear?</Text>
        <View style={styles.container}>
          <TextInput
            multiline
            style={styles.textbox}
            placeholder=""
            autoCapitalize="none"
            numberOfLines={5}
            adjustsFontSizeToFit={true}
            minimumFontScale={0.1}
            onChangeText={post_content => this.setState({ post_content })}
            // value={this.state.post_content}
          />

          <View style={{ flex: 1, flexDirection: 'row', width: "100%", margin: 20}}>
            <View style={{ flex: 1, padding: 10 }}>
              <Button style={ styles.button } title="Post!" color="#4C9A2A" onPress = {this.handleTextPost} />
            </View>
            <View style={{ flex: 1, padding: 10 }}>
              <Button style={ styles.button } title="Clear" color="#4C9A2A" onPress = {this.handleImagePost}/>
            </View>
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
    marginTop: 20,
    flex: 1,
  },
  container : {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    flex: 15,
  },
  textbox : {
    backgroundColor: '#ddd',
    borderColor: '#ccc',
    borderWidth: 2,
    width: '90%',
    marginBottom: 10,
    height: 200,
  }
});
