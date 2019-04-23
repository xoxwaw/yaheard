import {AsyncStorage} from 'react-native';
module.exports = {
    navigateToPost: function(post){
        AsyncStorage.setItem('post', JSON.stringify(post))
        .then((val)=>console.log("set successfully!")).
        then(res=>this.props.navigation.navigate('routeFocus'))
    },
    navigateToComment: function(post){
        const item = {
            post_id: post.id,
            content: post.title,
        }
        AsyncStorage.setItem('comment', JSON.stringify(item))
        .then(val=> console.log("set successfully")).then(res=> this.props.navigation.navigate('routeComment'))
    }
}
