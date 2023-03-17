const puppeteer = require('puppeteer-extra')
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
puppeteer.use(StealthPlugin())
const sharp = require('sharp');
const  fetch = require('node-fetch')
const fs = require('fs');


async function start(url,fields){
    const browser = await puppeteer.launch({
        headless: true,
        executablePath: require('puppeteer').executablePath(),
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        ignoreDefaultArgs: ['--disable-extensions']
    })
    const page = await browser.newPage()
    try{
        await page.goto(url,{ timeout: 0})
        let object = {}
        const data = await page.evaluate(()=> {
            const data1 = Array.from(
                document.querySelectorAll("body > main > div.Table_Data > div.Data > div > div > table > tbody > tr > td:nth-child(2)")
            ).map((image) => image.textContent);
            
            return data1
        })    
        const dat = data
        for (let i=0;i<fields.length;i++){
            object[fields[i]] = dat[i]
        }
        await page.close()
        await browser.close()
        return object
    }
    catch(e){
        console.log(e)
        return;
    }
}

async function scrapping(id){
    const browser = await puppeteer.launch({
        headless: true, 
        executablePath: require('puppeteer').executablePath(),
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        ignoreDefaultArgs: ['--disable-extensions']
    })
    const page = await browser.newPage()
    let result = {}
    let status = await page.goto('https://qesot.com/cars/en/product/'+id+'/', { timeout: 0});
    status = status.status();
    console.log("status",status)
    const data = await page.evaluate(()=> {
        const  data = document.querySelectorAll("body > main > div.Table_Data > div.Data > div > div > table > tbody > tr > td:nth-child(1)")
        let fields= []
        for (let i=0;i<data.length;i++){
            let v = data[i].textContent.replace(/ /g, '');
            v = v.replace(/\n/g, '');
            v = v.replace(".", '');
            fields.push(v)
        }
        
        const srcs = Array.from(
            document.querySelectorAll("body > main > div:nth-child(4) > div:nth-child(3) > div > div > div > a > span > img")
            
            // document.querySelectorAll(".product_box .Screenshots .ImgBox img")
          ).map((image) => image.getAttribute("src"));
        return {"images": srcs,"fields": fields}
    })
    let temparrayimg=[]
    
    for(let i = 0;i<data.images.length;i++){
        let source = data.images[i]
        const fimg = await fetch(source)
        const fimgb = await fimg.buffer()
        const metadata = await sharp(fimgb).metadata()
        let src= await sharp(fimgb).extract({
                top: 30,
                left:0,
                height: metadata.height-60,
                width: metadata.width,
            }).toFormat('jpeg').toBuffer();
        temparrayimg.push("data:image/jpeg" + ";base64," + src.toString('base64'))
    }    
    result['images'] = temparrayimg
    let fields = data.fields
    await page.close()
    await browser.close()

    let languages = ['en','fr','es','ru','de','it','gr','tr','ro','fi','se','no','pl']
    // let languages = ['en']
    for (let i=0;i<languages.length;i++){
        result[languages[i]] = await start('https://qesot.com/cars/'+languages[i]+'/product/'+id+'/',fields)
    }
    return result
}

module.exports = scrapping

