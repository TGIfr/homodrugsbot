
const getParameter = (message) => {
    let parameter = message.substr(message.indexOf(" ") + 1);
    if (parameter === undefined ||parameter === "" || parameter[0] === '/') {
        let e = new Error("No parameter")
        e.name = 'param'
        throw e;
    }

    return parameter;
}

const formatCocktailWithPreview = (c) => {
    console.log(c)
    let ingredients = ''
    if(c.ingredients){
        c.ingredients.forEach( i =>  {
            ingredients += i.ingredient
            if(i['measure'])
                ingredients += ' - ' + i['measure']
            ingredients +='\n'
        })
    }

    return `Name: ${c.name}
Type: ${c.type}
Glass type: ${c.glassType}

Ingredients:
${ingredients}
${c.instruction} 
[ ](${c.image})`
}


module.exports = {
    getParameter,
    formatCocktailWithPreview,
}
