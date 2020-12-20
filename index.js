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

const axios = require('axios').default

const generateQRCode = require('./src/utils/qrcode')
const phoneDB = require('./src/database/index').models.phone;

if(process.env.NODE_ENV !== 'development'){
    bot.telegram.getMe().then((botInfo) => {
        bot.options.username = botInfo.username
    })
    bot.telegram.setWebhook(`${URL}/bot${API_TOKEN}`);
    console.log('bot webhook setup')
}

expressApp.use(bot.webhookCallback(`/bot${API_TOKEN}`));

let doctors = [
    'Лікар Васильович',
    'Алла Хирурговна',
    'Главрач Олег',
    'Марія Іванівна',
    'Моргенштрен Тагирович',
    'Сергей Ниношвили Нугзарович',
    'Евгения Кролева',
    'Макс Илон',
    'Скриптонит Андриевский'
]

function paginate(array, page_size, page_number) {
    // human-readable page numbers usually start with 1, so we reduce 1 in the first argument
    return array.slice((page_number - 1) * page_size, page_number * page_size);
}

function getDocPage(array){
    let keys = [];
    array.forEach(function (value, i) {
        keys.push([Markup.callbackButton(value, `doc_${doctors.indexOf(value)}` )])
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
        let docs = paginate(doctors, pageSize, 1)
        let doctorButtons = getDocPage(docs)
        console.log('book command')
        ctx.reply('Оберіть лікаря',  Markup.inlineKeyboard(doctorButtons
            .concat([getPagination(1,pagesTotal) ])).extra(), );
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

async function docCase(ctx){
    try {
        let docId = ctx.update.callback_query.data.slice(4)[0]
        await ctx.reply('Обраний лікар: ' + doctors[docId])
        ctx.reply('Оберіть час',  Markup.inlineKeyboard(getTimes()).extra());
        console.log('docCase')
    } catch (e) {
        console.log("Something went wrong while doc case " + e);
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
    dateTimeArr.forEach((x, i) => times.push([Markup.callbackButton(x, `time_${i}` )]))
    return times
}

function timeCase(ctx){
    try {
        let timeId = ctx.update.callback_query.data.slice(5)
        ctx.reply('Обраний час: ' + dateTimeArr[timeId])
        ctx.reply('Запис до лікаря заброньовано!');
        console.log('timeCase')
    } catch (e) {
        console.log("Something went wrong while time " + e);
        ctx.reply(`Some server problem, contact bot creator @TGIfr`);
    }
}

const qrPage = 'http://192.168.0.105:3005/api/recipe/pdf/'
function qrCase(ctx){
    try {
        let qrId = ctx.update.callback_query.data.slice(3)
        console.log("Id in case")
        let qrLink = qrPage + qrId
        let path = generateQRCode(qrLink)
        ctx.replyWithPhoto({ source: path})
        console.log('qrCase')
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
});

bot.command('setphone', async (ctx) => {
    try {
        console.log('setphone command')

        ctx.reply('Відправте ваш номер телефону, будь ласка',

            Telegraf.Markup.keyboard([Telegraf.Markup.contactRequestButton('Надіслати свій контакт')])
                .oneTime()
                .resize()
                .extra())

    } catch (e) {
        console.log("Error while sephone command " + e);
        ctx.reply(`Some server problem, contact bot creator @TGIfr`);
    }
});

async function loadQR(phone){
    return (await axios.get('http://192.168.0.105:3005/api/recipe/phone/' + phone)).data
}



function getQR(qrCodes){
    let qr = []
    qrCodes.forEach((x, i) => qr.push([Markup.callbackButton(`Рецепт номер ${i+1}`, `qr_${x}` )]))
    return qr
}

bot.command('getrecipe', async (ctx) => {
    try {
        console.log('getrecipe command')
        let phone = (await phoneDB.findOne({tgId: ''+ctx.message.from.id}).exec()).phone
        if(!phone)
            ctx.reply('Введіть номер телефону через команду /setphone')
        else {
            let qrIDS = []
            try {
                qrIDS = await loadQR(phone)
                console.log(qrIDS)
            } catch (e){
                ctx.reply('Рецептів за вашим номером телефону не знайдено')
            }

            if(qrIDS.length > 0)
            {
                qrIDS = qrIDS.map(x => x.id)
                console.log(qrIDS)
                ctx.reply('Оберіть рецепт для отримання QR коду',
                Markup.inlineKeyboard(getQR(qrIDS)).extra())
            }
            else
                ctx.reply('Рецептів за вашим номером телефону не знайдено')
        }


    } catch (e) {
        console.log("Error while getrecipe command " + e);
        ctx.reply(`Some server problem, contact bot creator @TGIfr`);
    }
});

bot.on('contact',async (ctx) => {
    try {
        await phoneDB.create({tgId: '' + ctx.message.from.id, phone: ctx.message.contact.phone_number.slice(1)});

        console.log('getting phone command')
        ctx.reply('Номер телефону встановлено!', Telegraf.Extra.markup(Telegraf.Markup.removeKeyboard()))

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
[ ](https://i.imgur.com/0W9KOje.png)
Відправте ваш номер телефону, будь ласка`,

            Telegraf.Markup.keyboard([Telegraf.Markup.contactRequestButton('Надіслати свій контакт')])
                .oneTime()
                .resize()
                .extra())
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

