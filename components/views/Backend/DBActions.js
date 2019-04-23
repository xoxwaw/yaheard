import firebase from 'react-native-firebase';
import {AsyncStorage} from 'react-native';
const caches = require('./DBActions')
const ref = firebase.firestore().collection('posts');
const user_post = firebase.firestore().collection('user_post');
const storage = firebase.storage();

const voteAction = function(pid,uid, _isUpvote){
    const label = _isUpvote ? "upvote" : "downvote";
    user_post.where('user','==',uid).where('post','==', pid).get().then((querySnapshot)=>{
        //find if the database has registered this combination(user, post) before
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
        if (items.length > 0){//if there is a combination then update this combination
            const {id,isUpvote, post, user} = items[0];
            user_post.doc(id).update("isUpvote",_isUpvote);
            if (isUpvote != _isUpvote){// if the user changed their mind(if upvote then downvote or downvote then upvote)
                ref.doc(pid).update(label, firebase.firestore.FieldValue.increment(2))
            }else{//if already upvote, or downvote then changed their mind about not doing this
                ref.doc(pid).update(label, firebase.firestore.FieldValue.increment(-1));
                user_post.doc(id).delete();
            }
        }else{//if there is no record then create one
            user_post.add({
                user: uid,
                post: pid,
                isUpvote: _isUpvote
            });
            ref.doc(pid).update(label, firebase.firestore.FieldValue.increment(1))
        }
    }).catch(err=>{
        console.log(err)
    });
};
module.exports = {
    writePost: function(post){
        /*parameter: post object*/
        this.ref.add(post).then(data=>{
            this.user_post.add({
                post : data.id,
                user: user,
                isUpvote: true
            });
            caches.savePostToCaches(data.doc());
        }).catch(err=>console.log(err));
    },
    upvote:function(pid, uid){
        /*parameter: post id -pid, user id*/
        voteAction(pid,uid,true);
    },
    downvote: function(pid, uid){
        /*parameter: post id, user id*/
        voteAction(pid,uid,false);
    },
    postComment: function(pid){
        /*comment on a post
        paramter: post id*/
    },
    postReply: function(pid, cid){
        /*reply to a comment in a post
        parameter: post id, comment id*/
    }
}
