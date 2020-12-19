const axios = require('axios').default


const getFirstVideoLink = async (str, KEY) => {
    let res = await axios.get(`https://youtube.googleapis.com/youtube/v3/search?part=snippet&q=${str.trim()}cocktail&key=${KEY}`)
    let videoId = res.data.items[0].id.videoId
    return 'https://www.youtube.com/watch?v=' + videoId
}




module.exports = {
    getFirstVideoLink,
}
