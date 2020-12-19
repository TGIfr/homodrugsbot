const axios = require('axios').default
const URL = process.env.URL || 'localhost';
const {
  INSPIRATION_LINK,
  SEARCH_BY_NAME_URL,
  SEARCH_BY_INGREDIENT_URL,
  GET_BY_ID_URL,
  GET_RANDOM_URL,
} = require('../../constants')
const {
  getDrinksFromResponse,
  mapDrinksArray,
  mapPromisesResults,
} = require('../../utils/mapRecipes')

const getCocktailByName = async (name) => {
  const response = await axios.get(SEARCH_BY_NAME_URL.concat(name))
  return mapDrinksArray(response)
}

const getCocktailsByIngredient = async (ingredient) => {
  const response = await axios.get(SEARCH_BY_INGREDIENT_URL.concat(ingredient))

  const respArray = getDrinksFromResponse(response)

  const drinks = respArray.length < 10 ? respArray : respArray.slice(0, 10)

  const promises = []
  drinks.forEach((drink) => {
    promises.push(axios.get(GET_BY_ID_URL.concat(drink.idDrink)))
  })
  const responses = await Promise.allSettled(promises)

  return mapPromisesResults(responses)
}

const getRandomCocktail = async () => {
  const response = await axios.get(GET_RANDOM_URL)

  return mapDrinksArray(response)[0]
}

const getMongolian = () => `Name: Mongolian
Type: rest in peace
Glass type: eeeem... whatever

Ingredients:
cola - 1/3
beer - 1/3
vodka - 1/3

Just find someone who will make it
Optionally eat some activated coal in case of 0.5l one...

[ ](${URL}/goodbye.png)`

const getInspiration = () => INSPIRATION_LINK

module.exports = {
  getCocktailByName,
  getCocktailsByIngredient,
  getRandomCocktail,
  getMongolian,
  getInspiration,
}
