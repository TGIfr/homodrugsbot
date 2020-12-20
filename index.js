if(process.env.NODE_ENV !== 'production')
    require('dotenv').config()


const Telegraf = require('telegraf');
const Markup = Telegraf.Markup;
const express = require('express');
const expressApp = express();

const API_TOKEN = process.env.TOKEN || '';
const PORT = process.env.PORT || 3000;
const URL = process.env.URL || 'localhost';

const bot = new Telegraf(API_TOKEN);

const KEY = process.env.YOUTUBE_API_KEY;



// const {
//     getParameter,
//     formatCocktailWithPreview,
// } = require('./src/utils/telegramMessages.js')


if(process.env.NODE_ENV !== 'development'){
    bot.telegram.getMe().then((botInfo) => {
        bot.options.username = botInfo.username
    })
    bot.telegram.setWebhook(`${URL}/bot${API_TOKEN}`);
    console.log('bot webhook setup')
}




expressApp.use(bot.webhookCallback(`/bot${API_TOKEN}`));

var bookPages = 100;

let doctors = ['sdf', 'asdfsafd', 'arhgf', 'sfdaujfd', 'asvbfadsf', 'asdfadfhfds', 'asdfawerfsd', 'asdsanbdf', 'asdfaxcvsdf', 'asdsdffasdf', 'asdfabsdbsdf']
function paginate(array, page_size, page_number) {
    // human-readable page numbers usually start with 1, so we reduce 1 in the first argument
    return array.slice((page_number - 1) * page_size, page_number * page_size);
}

function getDocPage(array){
    let keys = [];
    array.forEach(function (value, i) {
        keys.push([Markup.callbackButton(value, i )])
    });

    return keys
}

function getPagination( current, maxpage ) {
    let keys = [];
    if (current>1) keys.push(Markup.callbackButton(`«1`, '1' ));
    if (current>2) keys.push(Markup.callbackButton(`‹${current-1}`, (current-1).toString() ));
    keys.push(Markup.callbackButton(`-${current}-`,  current.toString() ));
    if (current<maxpage-1) keys.push(Markup.callbackButton(`${current+1}›`, (current+1).toString() ))
    if (current<maxpage) keys.push(Markup.callbackButton( `${maxpage}»`, maxpage.toString() ));

    return keys
}

bot.command('/book', async(ctx) => {
    ctx.reply('Choose a doctor',  Markup.inlineKeyboard([getPagination(25,bookPages),[
        Markup.callbackButton('👍', 'like'),
        Markup.callbackButton('👎', 'dislike')
    ]] ).extra(), );
});
bot.on('callback_query', async(ctx) => {
    try {
        console.log(ctx.update.callback_query.message);

        ctx.editMessageText('Page:' + ctx.update.callback_query.data,
            Telegraf.Markup.inlineKeyboard(getPagination(parseInt(ctx.update.callback_query.data),bookPages)).extra())
    } catch (e) {
        console.log("Something went wrong while inspiration " + e);
        ctx.reply(`Some server problem, contact bot creator @TGIfr`);
    }
    // function (message) {
    // var msg = message.message;
    // var editOptions = Object.assign({}, getPagination(parseInt(message.data), bookPages), { chat_id: msg.chat.id, message_id: msg.message_id});
    // bot.editMessageText('Page: ' + message.data, editOptions);
});


bot.command('pagination', async(ctx) => {
    try {
        console.log('pagination command');
        ctx.reply('Page: 25', {reply_markup: getPagination(25,bookPages)});
    } catch (e) {
        console.log("Something went wrong while pagination " + e);
        ctx.reply(`Some server problem, contact bot creator @TGIfr`);
    }
});

// bot.command('getbyname', async(ctx) => {
//     try {
//         let parameter = getParameter( ctx.message.text)
//         if (parameter === undefined) {
//             ctx.reply(`No parameter`)
//             return
//         }
//         let cocktails = await getCocktailByName(parameter)
//         if (!cocktails.length) {
//             ctx.reply(`cocktail with name ${parameter} not found`)
//             return
//         }
//         let cocktail = formatCocktailWithPreview(cocktails[0])
//
//         console.log('getbyname command');
//         ctx.replyWithMarkdown(cocktail)
//         ctx.reply(await getFirstVideoLink(cocktails[0].name, KEY))
//     } catch (e) {
//         if(e.name === 'param' || e.name === 'TypeError: Cannot read property \'length\' of undefined'){
//             ctx.reply('No parameter')
//             console.log("No parameter at getbyname")
//         } else {
//             console.log("Something went wrong while getbyname " + e.name);
//             ctx.reply("No parameter")
//         }
//     }
// });
//
//
// bot.command('getbyingredient', async (ctx) => {
//     try {
//         let parameter = getParameter( ctx.message.text)
//         if (parameter === undefined) {
//
//             ctx.reply(`No parameter`)
//             return
//         }
//         let cocktails = await getCocktailsByIngredient(parameter)
//         if (!cocktails.length) {
//             ctx.reply(`cocktails with ingredient ${parameter} not found`)
//             return
//         }
//
//         console.log('getbyingredient command');
//         cocktails.forEach(c => ctx.replyWithMarkdown(formatCocktailWithPreview(c[0])))
//     } catch (e) {
//         if(e.name === 'param' || e.name === 'TypeError: Cannot read property \'length\' of undefined'){
//             ctx.reply('No parameter')
//             console.log("No parameter at getbyingredient")
//         } else {
//             console.log("Something went wrong while getbyingredient " + e);
//             ctx.reply("No parameter")
//         }
//     }
// });
//
// bot.command('random', async (ctx) => {
//     try {
//         let cocktail = await getRandomCocktail()
//
//         console.log('random command');
//         ctx.replyWithMarkdown(formatCocktailWithPreview(cocktail))
//     } catch (e) {
//         console.log("Something went wrong while random command " + e);
//         ctx.reply(`Some server problem, contact bot creator @TGIfr`);
//     }
// });
//
bot.command('setphone', async (ctx) => {
    try {
        console.log('setphone command')

        ctx.reply('Send me your number please',

            Telegraf.Markup.keyboard([Telegraf.Markup.contactRequestButton('Надіслати свій контакт')])
                .oneTime()
                .resize()
                .extra())

    } catch (e) {
        console.log("Error while sephone command " + e);
        ctx.reply(`Some server problem, contact bot creator @TGIfr`);
    }
});

bot.on('contact',async (ctx) => {
    try {
        console.log(ctx.message.contact.phone_number)
        console.log(ctx.message.chat.id)
        console.log('getting phone command')
        ctx.reply('Номер телефону встановлено!', Telegraf.Extra.markup(Telegraf.Markup.removeKeyboard()))

    } catch (e) {
        console.log("Error while getting command " + e);
        ctx.reply(`Some server problem, contact bot creator @TGIfr`);
    }
});

bot.command(/\/qr_[0-9]+/,async (ctx) => {
    try {
        console.log(ctx)
        ctx.reply('fuckkk')

    } catch (e) {
        console.log("Error while getting command " + e);
        ctx.reply(`Some server problem, contact bot creator @TGIfr`);
    }
});

bot.command('hui', async (ctx) => {
    ctx.reply(`И что ты хотел тут увидеть?
Аффтар: TGIfr
Дизигн: max
Команда сервиса homo: TGIfr, max, demyd, oigen, tryamm`);
});

bot.command('start', async (ctx) => {
    ctx.replyWithMarkdown(`Доброго здоров'я, пацієнте!\n
/start - отримати інформацію про можливі команди
/getrecipe - подивитися доступні рецепти
/book - записатися на прийом до лікаря
/setphone - встановити номер телефону
[ ](${URL}/hello.png)`);
});

// and at the end just start server on PORT
expressApp.get('/', (req, res) => {
    res.send('Hello World!');
});
expressApp.get('/hello.png', (req, res) => {
    res.sendFile(__dirname + '/img/hello.png');
});
expressApp.get('/goodbye.png', (req, res) => {
    res.sendFile(__dirname + '/img/goodbye.png');
});
expressApp.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

if(process.env.NODE_ENV === 'development'){
    bot.telegram.deleteWebhook()
    bot.startPolling()
}

