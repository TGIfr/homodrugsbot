const { compose, filter, map, prop } = require('lodash/fp')

const {
  INGREDIENT_KEY,
  MEASURE_KEY,
  SUCCESS_PROMISE_STATUS,
} = require('../constants')

const getDrinkValues = (objectKeyPrefix, drink) =>
  compose(
    map((key) => drink[key]),
    filter((key) => key.includes(objectKeyPrefix) && drink[key] !== null),
    Object.keys
  )(drink)

const mergeIngredientsAndMeasures = (ingredients, measures) => {
  return ingredients.map((ingredient, index) => ({
    ingredient: ingredient,
    measure: index < measures.length ? measures[index] : null,
  }))
}

const mapDrink = (drink) =>
  drink && {
    name: drink.strDrink,
    category: drink.strCategory,
    type: drink.strAlcoholic,
    glassType: drink.strGlass,
    instruction: drink.strInstructions,
    image: drink.strDrinkThumb,
    ingredients: mergeIngredientsAndMeasures(
      getDrinkValues(INGREDIENT_KEY, drink),
      getDrinkValues(MEASURE_KEY, drink)
    ),
  }

const getDrinksFromResponse = compose(prop('drinks'), prop('data'))

const mapDrinksArray = compose(map(mapDrink), getDrinksFromResponse)

const mapPromisesResults = (results) =>
  results.reduce(
    (acc, result) =>
      result.status === SUCCESS_PROMISE_STATUS
        ? [...acc, mapDrinksArray(result.value)]
        : [...acc],
    []
  )

module.exports = {
  mapDrinksArray,
  getDrinksFromResponse,
  mapPromisesResults,
}
