const qrcode = require('qrcode-terminal');
const fs = require('fs');
const { Client, MessageMedia ,LegacySessionAuth} = require('whatsapp-web.js');
const SESSION_FILE_PATH = './session.json';
const mime = require('mime-types');
const rmeme = require('rmeme');
const express = require('express');
const app = express();
const PORT = process.env.PORT || 8000
const path = require('path');
const weather = require('./modules/weather');
const fetch  = require('node-fetch');


app.get('/',function(req, res) {
    res.sendFile(path.join(__dirname, '/index.html'));

    let sessionData;
    if (fs.existsSync(SESSION_FILE_PATH)) {
        sessionData = require(SESSION_FILE_PATH);
    }
    
    
    const client = new Client({
        puppeteer: { args: ["--no-sandbox"] },
        ffmpeg:'./ffmpeg',
        session: sessionData
    }); 

   
    client.on('authenticated', (session) => {
        sessionData = session;
        fs.writeFile(SESSION_FILE_PATH, JSON.stringify(session), (err) => {
            if (err) {
                console.error(err);
            }
        });
    });
    client.on('qr', qr => {
        qrcode.generate(qr, { small: true });
    });
    client.on('message', message => {
        console.log(message.body);
    });
    
    client.on('message', async message => {
        let chat = await message.getChat();
        //console.log(chat);
        chat.sendSeen();

        if (message.body === 'تست') {
            message.reply('طسط');
            console.log(message);
        }else if (message.body === 'ميمز') {
            const ImageUrl = await rmeme.meme()
            console.log(ImageUrl);
            const memeImg = await MessageMedia.fromUrl(ImageUrl);
            client.sendMessage(message.from, message.reply(await memeImg))
        }else if (message.body === 'أحدف') {
                if (message.hasQuotedMsg) {
                    const quotedMsg = await message.getQuotedMessage();
                    if (quotedMsg.fromMe) {
                        quotedMsg.delete(true);
                    } else {
                        message.reply('I can only delete my own messages');
                    }
                }
            }else if (message.body === 'معلومات-المجموعة') {
                let chat = await message.getChat();
                if (chat.isGroup) {
                    message.reply(`
*معلومات المجموعة*
الإسم: ${chat.name}
الوصف: ${chat.description}
تاريخ التأسيس: ${chat.createdAt.toString()}
مأسسها: ${chat.owner.user}
الأعضاء: ${chat.participants.length}
                    `);
                } else {
                    message.reply('في المجموعات فقط');
                }
            }else if (message.body === 'معلومات') {
                let info = client.info;
                client.sendMessage(message.from, `
*معلومات*
الإسم: ${info.pushname}
الرقم: ${info.me.user}
                `);
            }else if(chat.isGroup){
                
            let grpid = chat.id._serialized;
            console.log("Group ID: " + grpid);

             if(message.body === 'ستيكر'){
                if(message.hasMedia){
                    message.downloadMedia().then(media => {
    
                        if (media) {
            
                            const mediaPath = './downloaded-media/';
            
                            if (!fs.existsSync(mediaPath)) {
                                fs.mkdirSync(mediaPath);
                            }
            
            
                            const extension = mime.extension(media.mimetype);
            
                            const filename = new Date().getTime();
            
                            const fullFilename = mediaPath + filename + '.' + extension;
            
                            // Save to file
                            try {
                                fs.writeFileSync(fullFilename, media.data, { encoding: 'base64' });
                                console.log('تم تحميل الملف', fullFilename);
                                console.log(fullFilename);
                                MessageMedia.fromFilePath(filePath = fullFilename)
                                client.sendMessage(message.from, new MessageMedia(media.mimetype, media.data, filename), { sendMediaAsSticker: true,stickerAuthor:"Created By Bot",stickerName:"Stickers"} )
                                fs.unlinkSync(fullFilename)
                                console.log(`تم!`,);
                            } catch (err) {
                                console.log('خطأ:', err);
                                console.log(`تم`,);
                            }
                        }
                    });
                }else{
                    message.reply(`أرسل الستيكر مع الأمر `)
                }
    
             }
             else if (message.body === 'الأوامر') {
                message.reply(
    `*الأوامر*
    1. ميمز
    2. معلومات-المجموعة'
    3. معلومات
    4. أحدف
    5. ستيكر أو س`
                )
            }else if(message.body === '-quote'){
                const apiData = await fetch('https://type.fit/api/quotes')
                const JsonData = await apiData.json();
                message.reply(`*${JsonData[ Math.floor(Math.random() * JsonData.length)].text}*`)
            }
        }else if(!chat.isGroup){
            if(message.hasMedia){
                message.downloadMedia().then(media => {

                    if (media) {
        
                        const mediaPath = './downloaded-media/';
        
                        if (!fs.existsSync(mediaPath)) {
                            fs.mkdirSync(mediaPath);
                        }
                        const extension = mime.extension(media.mimetype);
        
                        const filename = new Date().getTime();
        
                        const fullFilename = mediaPath + filename + '.' + extension;
        
                        // Save to file
                        try {
                            fs.writeFileSync(fullFilename, media.data, { encoding: 'base64' });
                            console.log('File downloaded successfully!', fullFilename);
                            console.log(fullFilename);
                            MessageMedia.fromFilePath(filePath = fullFilename)
                            client.sendMessage(message.from, new MessageMedia(media.mimetype, media.data, filename), { sendMediaAsSticker: true,stickerAuthor:"Created By Bot",stickerName:"Stickers"} )
                            fs.unlinkSync(fullFilename)
                            console.log(`File Deleted successfully!`,);
                        } catch (err) {
                            console.log('Failed to save the file:', err);
                            console.log(`File Deleted successfully!`,);
                        }
                    }
                })
        }else if(message.body === '-quote'){
            const apiData = await fetch('https://type.fit/api/quotes')
            const JsonData = await apiData.json();
            message.reply(`*${JsonData[ Math.floor(Math.random() * JsonData.length)].text}*`)
        }

        else if (message.body === 'الأوامر') {
            message.reply(
                `*الأوامر*
                1. ميمز
                2. معلومات-المجموعة'
                3. معلومات
                4. أحدف
                5. ستيكر أو س`
            )
        }
        
    }
    })
    
    
    client.on('ready', () => {
        console.log('Client is ready!');
    });
    
    client.initialize();
    
    
    res.send()

});


app.listen(PORT,()=>{
    console.log(`PORT LISTENING ON ${PORT}`);
})

