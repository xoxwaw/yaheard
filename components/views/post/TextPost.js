import React, { Component } from 'react';
import { View, Text, StyleSheet, TextInput, Button, AsyncStorage, Platform, Image, TouchableOpacity } from 'react-native';
import { withNavigation  } from 'react-navigation';
import Icon from 'react-native-vector-icons/FontAwesome';
import firebase from 'react-native-firebase';
import ImagePicker from 'react-native-image-picker';
import RNFetchBlob from 'react-native-fetch-blob';
import * as Progress from 'react-native-progress';


const storage = firebase.storage()

// Prepare Blob support
const Blob = RNFetchBlob.polyfill.Blob
const fs = RNFetchBlob.fs
window.XMLHttpRequest = RNFetchBlob.polyfill.XMLHttpRequest
window.Blob = Blob

const uploadImage = (uri, mime = 'application/octet-stream') => {
    // return new Promise((resolve, reject) => {
        // const uploadUri = Platform.OS === 'ios' ? uri.replace('file://', '') : uri
        const sessionId = new Date().getTime()
        // let uploadBlob = null
        const imageRef = storage.ref('images').child(`${sessionId}`)
        imageRef.put(uri, { contentType: mime });
        // this.setState({uploadURL: imageRef.getDownloadURL()})
        // fs.readFile(uploadUri, 'base64')
        // .then((data) => {
        //     return Blob.build(data, { type: `${mime};BASE64` })
        // })
        // .then((blob) => {
        //     uploadBlob = blob
        //     return imageRef.put(blob, { contentType: mime })
        // })
        // .then(() => {
        //     uploadBlob.close()
        //     return imageRef.getDownloadURL()
        // })
        // .then((url) => {
        //     resolve(url)
        // })
        // .catch((error) => {
        //     reject(error)
        // })
    // })
  }
export default class TextPost extends React.Component {
  state = { post_content: '', errorMessage: null,user: "", image : null }
  constructor(props){
      super(props);
      this._retrieveData();
      this.ref = firebase.firestore().collection('posts');
  }
  writePost = () => {
      var {post_content, errorMessage, user, url} = this.state;
      this.ref.add({
          post: post_content,
          user: user,
          upvote: 1,
          downvote: 0,
      }).then((data)=>{
          //success callback
      }).catch((error)=>{
          //error callback
          alert(error)
      });
      this.props.navigation.navigate('routeMain');
  }
  clearText = () => {
    //not yet written
  }


  _takePicture = () => {
      const options = {
          title: 'Select Photo',
          customButtons: [{ name: 'fb', title: 'Choose Photo from Facebook' }],
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
              uploadImage(response.uri);
              this.setState({image: source});
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
              <Button style={ styles.button } title="Post!" color="#4C9A2A" onPress = {this.writePost} />
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
  }
});
