module.exports = {
    last24hours:function(posts){
        posts.filter(obj => new Date().getTime() - obj.time > 86400000)
    },
    pastMonth: function(posts){
        posts.filter(obj => new Date().getTime() - obj.time < 2592000000)
    },
    pastYear: function(posts){
        posts.filter(obj => new Date().getTime() - obj.time < 946080000000)
    },
    sortByDate: function(posts){
        posts.sort(function(a,b){
            return (a.time > b.time) ? -1 : ((b.time > a.time) ? 1 : 0)
        });
    },
    sortByPopular: function(posts){
        posts.sort(function(a,b){
            return (a.upvote - a.downvote > b.upvote - b.downvote) ? -1 : ((b.upvote - b.downvote > a.upvote - a.downvote) ? 1 :0)
        });
    }
}
