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

//TODO get doctors
//TODO map doctors name and id
let doctors = ['sdf', 'asdfsafd', 'arhgf', 'sfdaujfd', 'asvbfadsf', 'asdfadfhfds', 'asdfawerfsd', 'asdsanbdf', 'asdfaxcvsdf', 'asdsdffasdf', 'asdfabsdbsdf']
function paginate(array, page_size, page_number) {
    // human-readable page numbers usually start with 1, so we reduce 1 in the first argument
    return array.slice((page_number - 1) * page_size, page_number * page_size);
}

function getDocPage(array){
    let keys = [];
    //TODO  doctors name and id
    array.forEach(function (value, i) {
        keys.push([Markup.callbackButton(value, `doc_${i}` )])
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
const pageSize = 3
const pagesTotal = Math.ceil(doctors.length/pageSize)

bot.command('/book', async(ctx) => {
    try {
        let docs = paginate(doctors, pageSize, 2)
        let doctorButtons = getDocPage(docs)
        console.log('book command')
        ctx.reply('Choose a doctor',  Markup.inlineKeyboard(doctorButtons
            .concat([getPagination(2,pagesTotal) ])).extra(), );
    } catch (e) {
        console.log("Something went wrong while book command" + e);
        ctx.reply(`Some server problem, contact bot creator @TGIfr`);
    }

});

function pageCase(ctx){
    try {
        let docs = paginate(doctors, pageSize, parseInt(ctx.update.callback_query.data))
        let doctorButtons = getDocPage(docs)
        ctx.editMessageText('Choose a doctor',  Markup.inlineKeyboard(doctorButtons
            .concat([getPagination(parseInt(ctx.update.callback_query.data),pagesTotal) ]))
            .extra(), );

        console.log('pageCase')
    } catch (e) {
        console.log("Something went wrong while other callback " + e);
        ctx.reply(`Some server problem, contact bot creator @TGIfr`);
    }
}

const dateTimeArr = [
    '12:00 22.12',
    '12:30 22.12',
    '13:00 22.12',
    '13:30 22.12',
    '14:00 22.12',
]

function getTimes(){
    let times = []
    dateTimeArr.forEach((x, i) => times.push(Markup.callbackButton(x, `time_${i}` )))
    return times
}
function docCase(ctx){
    try {
        let docId = ctx.update.callback_query.data.slice(4)[0]
        ctx.reply('kinda made a booking ' + doctors[docId])
        ctx.reply('Choose time',  Markup.inlineKeyboard(getTimes()).extra());
        console.log('docCase')
    } catch (e) {
        console.log("Something went wrong while doc case " + e);
        ctx.reply(`Some server problem, contact bot creator @TGIfr`);
    }
}

function timeCase(ctx){
    try {
        let timeId = ctx.update.callback_query.data.slice(5)[0]
        ctx.reply('kinda chose time ' + dateTimeArr[timeId])
        ctx.reply('Here is time!');
        //TODO booking
        console.log('timeCase')
    } catch (e) {
        console.log("Something went wrong while time " + e);
        ctx.reply(`Some server problem, contact bot creator @TGIfr`);
    }
}

function qrCase(ctx){
    try {
        let timeId = ctx.update.callback_query.data.slice(3)[0]
        ctx.reply('qr id ' + dateTimeArr[timeId])
        ctx.reply('Here is time!');
        console.log('timeCase')
    } catch (e) {
        console.log("Something went wrong while time " + e);
        ctx.reply(`Some server problem, contact bot creator @TGIfr`);
    }
}

bot.on('callback_query', async(ctx) => {
    console.log('callback_query')
    if(ctx.update.callback_query.data.match(/doc_/))
        docCase(ctx)
    else if(ctx.update.callback_query.data.match(/time_/))
        timeCase(ctx)
    else if(ctx.update.callback_query.data.match(/qr_/))
        qrCase(ctx)
    else
        pageCase(ctx)

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

