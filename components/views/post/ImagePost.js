import React, { Component } from 'react';
import { View, ActivityIndicator, Text, StyleSheet, TextInput, Button, AsyncStorage, Keyboard, TouchableWithoutFeedback, Image, TouchableOpacity, Alert, Dimensions, BackHandler } from 'react-native';
import { withNavigation  } from 'react-navigation';
import Icon from 'react-native-vector-icons/FontAwesome';
import firebase from 'react-native-firebase';
import ImagePicker from 'react-native-image-picker';
import ImageResizer from 'react-native-image-resizer';
import RNFetchBlob from 'react-native-fetch-blob';
import * as Progress from 'react-native-progress';

const storage = firebase.storage();
const win = Dimensions.get('window');
const image_width = win.width * 0.922;
const image_height = win.width * 0.922 * 0.75;
export default class ImagePost extends React.Component {
  state = { loading: false, loaded: false, post_title : "", post_content: '', errorMessage: null,user: "",
            location: {}, isText: false, imageURL : "", id:"", width:800, height:600}
  constructor(props){
      super(props);
      this._retrieveData();
      this.ref = firebase.firestore().collection('posts');
      this.user_ref = firebase.firestore().collection('user_post');

      this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
  }
    componentWillMount() {
        BackHandler.addEventListener('hardwareBackPress', this.handleBackButtonClick);
    }

    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', this.handleBackButtonClick);
    }

    handleBackButtonClick() {
        this.props.navigation.navigate('routeSelector')
        return true;
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
        this.setState({loading: true});
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
      var {post_title, post_content, errorMessage, user,location, isText, imageURL, id, height, width} = this.state;
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
          time: new Date().getTime(),
          height: height,
          width: width
      }).then((data)=>{
          this.user_ref.add({
              post : data.id,
              user: user,
              isUpvote: true
          });
          this.setState({id: data.id});
          AsyncStorage.getItem('recent_uploaded').then(val=>{
              const {body, downvote, height,isText, location, time, upvote, user, width} = data.doc();
              var recent_post = [];
              const new_post = {
                  title : body.title,
                  content: body.content,
                  isText: isText,
                  up : upvote,
                  down: downvote,
                  location: location,
                  time: time,
                  width: width,
                  height: height,
                  user: user
              };
              if (val){
                  var recent_posts = JSON.parse(val);
              }
              recent_posts.push(new_post)
              AsyncStorage.setItem('recent_uploaded', JSON.stringify(recent_posts))
              .then(val=>console.log("saved"));
          })
          //success callback
          this.setState({ loaded: true });
      }).catch((error)=>{
          //error callback
          console.log(error)
      });
  }
  handleImagePost = () => {
      this.setState({isText: false, loaded: false, loading: false});
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

              this.setState({
                imageSource: source,
              });

              console.log(response.uri)
              this.resize(response.uri);
          }
      });

    }

    resize = (uri) =>{
        Image.getSize(uri, (width, height) =>{
            const h = parseInt(height * (800/width))
            this.setState({width: 800, height: h});
            ImageResizer.createResizedImage(uri, 800, h, 'JPEG', 80)
            .then((data) =>{
                console.log(data.uri);
                this.setState({imageURL: data.uri})
                this.uploadImage(data.uri);
                console.log("Upload successfully");
            }).catch(err =>{
                console.log(err);
                alert('Unable to resize');
            })
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
  navigateToPost(){
      const items = {
          post_id: this.state.id,
          title: this.state.post_title,
          content: this.state.post_content,
          isText: false,
          location: this.state.location,
          upvote: 1,
          downvote: 0,
          user: this.state.user
      }
      AsyncStorage.setItem('post', JSON.stringify(items))
      .then((val)=>console.log("set successfully!")).then(res=>this.props.navigation.navigate('routeFocus'))
  }
  render() {
    return (
      <View style={{ width: '100%', flex: 1, flexDirection: 'column' }}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <View style={{ width: '100%', height: '100%' }}>
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
            <View style={styles.inputCard}>
                
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
            </View>
            <View style={{ marginTop: 150, marginBottom: 200, width: '100%', justifyContent: 'center', alignItems: 'center' }}>
                {!this.state.loaded && this.state.loading &&
                    <ActivityIndicator style={{ position: 'absolute' }}size="large" color="#4C9A2A" />
                }
                {this.state.loaded &&
                    <Image style={{ width: '100%', height: 300, position: 'absolute' }} resizeMode='contain' onLoad={this._onLoad} source={{ uri: this.state.imageURL }}/>
                }
            </View>
                <View style={{ margin: 20 }}>
                    <Button  title="Choose Image" color="#4C9A2A" onPress={this.handleImagePost}/>
                </View>

                <View style={{ margin: 20 }}>
                    {this.state.loaded &&
                        <Button title="Post!" color="#4C9A2A" onPress = {()=>{
                            if (this.state.post_content.length > 0){
                                this.navigateToPost()
                            }
                            else{
                                alert("You must choose a photo to upload")
                            }
                        }}/>
                    }
                </View>
            </View>
            </View>
            </TouchableWithoutFeedback>
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
    width: '100%',
    flexDirection: 'column',
    flex: 1,

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
  inputCard : {
    padding: 10,
    margin: 20,
    marginVertical: 5,
    width: '90%',
    backgroundColor: "#efefef",
    borderRadius: 8,
}
});
