// tests

const {
  getCocktailByName,
  getCocktailsByIngredient,
  getRandomCocktail,
} = require('./core/api-bridge/bridge')

const {
  getFirstVideoLink
} = require('./core/api-bridge/youtubeApi')

// getCocktailByName('margarita').then((data) => console.log(data))
// getCocktailsByIngredient('Gin') .then((data) => console.log(data))
// getRandomCocktail().then((data) => console.log(data))
getFirstVideoLink("margarita").then((data) => console.log(data))

