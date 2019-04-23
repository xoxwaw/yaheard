import {AsyncStorage} from 'react-native';



module.exports = {
    savePostToCaches: function(extra_posts){
        AsyncStorage.getItem('current_feed').then(val=>{
            var curr_feed = []
            if (val){
                var cur_feed = JSON.parse(val);
            }
            curr_feed.concat(extra_posts);
            AsyncStorage.setItem('current_feed', JSON.stringify(curr_feed)).then(val=>
            console.log());
        })
    },
    recentUploadedCaches: function(post){
        /*save the most recent uploaded to caches.
        parameter: post object*/
        AsyncStorage.getItem('recent_uploaded').then(val=>{
            var recent_posts = [];
            if (val){
                recent_posts = JSON.parse(val)
            }
            recent_posts.push(post);
            AsyncStorage.setItem('recent_uploaded', JSON.stringify(recent_posts))
            .then(val=>console.log("saved"));
        })
    },
    upvote: function(post){
        // AsyncStorage.removeItem('upvoted').then(val=>console.log('remove'));
        AsyncStorage.getItem(post.id+"voted").then(val=>{
            if (val){
                console.log(post.up);
                const value = JSON.parse(val);
                if (value == true){
                    post.up -= 1
                    AsyncStorage.removeItem(post.id + "voted").then(val=>console.log())
                }else{
                    post.up += 2
                    AsyncStorage.setItem(post.id+"voted", JSON.stringify(true)).then(val=>{console.log()})
                }
            }else{
                post.up += 1
                AsyncStorage.setItem(post.id+"voted", JSON.stringify(true)).then(val=>{console.log()})
            }
        });
        AsyncStorage.getItem('upvoted').then(val=>{
            var upvoted = []
            if (val){
                var upvoted = JSON.parse(val);
            }
            var index = upvoted.indexOf(post);
            if (index > -1){
                console.log("key exists")
            }else{
                upvoted.push(post);
            }
            AsyncStorage.setItem('upvoted', JSON.stringify(upvoted)).then(val=>console.log())
        })
    },
    downvote: function(post){
        AsyncStorage.getItem(post.id+"voted").then(val=>{
            if (val){
                const value = JSON.parse(val);
                if (value == false){
                    post.down -= 1
                    AsyncStorage.removeItem(post.id + "voted").then(val=>console.log())
                }else{
                    post.down += 2
                    AsyncStorage.setItem(post.id+"voted", JSON.stringify(false)).then(val=>{console.log()})
                }
            }else{
                post.down += 1
                AsyncStorage.setItem(post.id+"voted", JSON.stringify(false)).then(val=>{console.log()})
            }
        });
        AsyncStorage.getItem('upvoted').then(val=>{
            var upvoted = []
            if (val){
                var upvoted = JSON.parse(val);
            }
            var index = upvoted.indexOf(post);
            if (index > -1){
                upvoted.splice(index,1);
            }
            AsyncStorage.setItem('upvoted', JSON.stringify(upvoted)).then(val=>console.log())
        })
    }
}
