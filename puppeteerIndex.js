const puppeteer = require('puppeteer');
const fs = require('fs');
var result,style;

(async () => {
	// puppeteer部分
	const browser = await puppeteer.launch();

	// 新建浏览器
	const page = await browser.newPage();
    // 执行函数
    // let url = 'https://mp.weixin.qq.com/s/sM1xf50g2Gg7n2t8GQh6pw';
    let url = 'https://mp.weixin.qq.com/s/PNh0tKBZwuS5zp9wI9snTA';
	let {title,article,style} = await example4(page, browser, url);
    // 关闭浏览器
	await browser.close();
	// node部分 处理
	await nodeExample(title, article, style);

})();

async function nodeExample(title, article, style){
	fs.writeFile('newFile.html','<!DOCTYPE html><html><body>'+style+title+article+'</body></html>',function(err, stats) {
		if (err) {
		   return console.error(err);
		}
		console.log('文件创建成功');
	});
}

// 截屏
async function example1(page, browser){
	// 跳转新页面
	await page.goto('http://m.test.66buy.com.cn',{
		waitUntil:'load'
	});
	// 截屏
	await page.screenshot({
		path: 'test.png',
		fullPage: true
	})
}


// 懒加载及数据滚动加载
async function example2(page,browser){
	await page.goto('https://mp.weixin.qq.com/s/sM1xf50g2Gg7n2t8GQh6pw',{
	    waitUntil:'networkidle2'
	});
	await autoScroll(page);
	//全屏截取
	await page.screenshot({
	    path: 'example2.png',
	    fullPage: true
	});
}
async function autoScroll(page){ // 自动滚动函数
    await page.evaluate(async () => {
        await new Promise((resolve, reject) => {
            var totalHeight = 0;
            var distance = 200;
            var timer = setInterval(() => {
                var scrollHeight = document.body.scrollHeight;
                window.scrollBy(0, distance);
                totalHeight += distance;

                if(totalHeight >= scrollHeight){
                    clearInterval(timer);
                    resolve();
                }
            }, 200);
        });
    });
}

// 模拟移动设备
const devices = require('puppeteer/DeviceDescriptors');
const iPhone6 = devices['iPhone 6'];
async function example3(page,browser){
    await page.goto('http://m.test.66buy.com.cn',{
        waitUntil:'networkidle2'  //默认值 load
    });
    //await page.emulate(iPhone6);
    await page.emulate({
        viewport: {
            width: 375,
            height: 667,
            isMobile: true
        },
        userAgent: '"Mozilla/5.0 (iPhone; CPU iPhone OS 9_1 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Version/9.0 Mobile/13B143 Safari/601.1"'
    });

    await autoScroll(page);
    await page.waitFor(3*1000); 
}

// 页面爬取及自动化页面操作
async function example4(page, browser, url){
    var title
        ,article
        ,style
        ;
    await page.goto(url,{
        waitUntil:'networkidle2'  //默认值 load
    });
    await page.setViewport({
        width: 1185, 
        height: 800
    });

    // 文章标题
    title = await page.evaluate(()=>{ 
        let element;
        if(document.querySelector('.rich_media_title')){ //微信公众号
            element = document.querySelector('.rich_media_title');
            return element.outerHTML ;
        }else if(document.querySelector('.Post-Title')){ // 知乎专栏
            element = document.querySelector('.Post-Title');
            return element.outerHTML ;        
        }else if(document.querySelector('.dh300 #content h1')){ // 前端网 www.qdfuns.com
            element = document.querySelector('.dh300 #content h1');
            return element.outerHTML ; 
        }else if(document.querySelector('.article-title-box h1')){ // CSDN文章
            element = document.querySelector('.article-title-box h1');
            return element.outerHTML ; 
        }else if(document.querySelector('.article .title')){ // 简书
            element = document.querySelector('.article .title');
            return element.outerHTML ; 
        }else if(document.querySelector('.wtitle h1')){ // 脚本之家 手机版
            element = document.querySelector('.wtitle h1');
            return element.outerHTML ;
        }else if(document.querySelector('.article-content h1')){ // 脚本之家 pc
            element = document.querySelector('.article-content h1');
            return element.outerHTML ;
        }else if(document.querySelector('.postTitle')){ // 博客园
            element = document.querySelector('.postTitle');
            return element.outerHTML ;
        }else if(document.querySelector('.post-topheader__info h1')){ // segmentFault
            element = document.querySelector('.post-topheader__info h1');
            return element.outerHTML ;
        }else{
            return '默认标题'
        }
    })

    // 文章内容主体
    article = await page.evaluate(()=>{ 
        let element;
        if(document.querySelector('.rich_media_content')){ //微信公众号
            element = document.querySelector('.rich_media_content');
            return element.outerHTML ;
        }else if(document.querySelector('.Post-RichText')){ // 知乎专栏
            element = document.querySelector('.Post-RichText');
            return element.outerHTML ;        
        }else if(document.querySelector('.md_view')){ //前端网
            element = document.querySelector('.md_view'); 
            return element.outerHTML ; 
        }else if(document.querySelector('article')){ //CSDN
            element = document.querySelector('article'); 
            return element.outerHTML ; 
        }else if(document.querySelector('.article .show-content')){ //简书
            element = document.querySelector('.article .show-content'); 
            return element.outerHTML ; 
        }else if(document.querySelector('section')){ // 脚本之家 手机版
            element = document.querySelector('section');
            return element.outerHTML ;
        }else if(document.querySelector('.article-content border')){ // 脚本之家 pc
            element = document.querySelector('.article-content border');
            return element.outerHTML ;
        }else if(document.querySelector('#cnblogs_post_body')){ // 博客园
            element = document.querySelector('#cnblogs_post_body');
            return element.outerHTML ;
        }else if(document.querySelector('.article__content')){ // segmentFault
            element = document.querySelector('.article__content');
            return element.outerHTML ;
        }else{
            return '默认内容'
        }
        
    })

    // 样式
    style = await page.evaluate(()=>{ 
        let element
            ,element1
            ;
        if(document.querySelector('[href$="v=Gaa"]')){ // 前端网
            element = document.querySelector('[href$="v=Gaa"]');
            return '<link href='+element.href+' rel="stylesheet">';
        }else if(document.querySelector('article [href$=".css"]')){ // CSDN
            element = document.querySelector('article [href$=".css"]');
            return '<link href='+element.href+' rel="stylesheet">';
        }else if(document.querySelector('link[href*="/notes/show"]')){ // 简书
            element = document.querySelector('link[href*="/notes/show"]');
            return '<link href='+element.href+' rel="stylesheet">';
        }else if(document.querySelector('link[href$="base.css"]')){ // 脚本之家
            element = document.querySelector('link[href$="base.css"]');
            element1 = document.querySelector('link[href$="common.css"]');
            return '<link href="'+element.href+'"  rel="stylesheet">'+'<link href="'+element1.href+'" rel="stylesheet">';
        }else if(document.querySelector('[href$=".css"]')){ // 知乎专栏
            element = document.querySelector('[href$=".css"]');
            return '<link href='+element.href+' rel="stylesheet">';
        }else if(document.querySelector('link[href^="/bundles/blog-common.css"]')){ // 博客园
            element = document.querySelector('link[href^="/bundles/blog-common.css"]');
            element1 = document.querySelector('#MainCss');
            return '<link href="'+element.href+'"  rel="stylesheet">'+'<link href="'+element1.href+'" rel="stylesheet">';
        }else if(document.querySelector('[href$="global.css"]')){ // segmentFault
            element = document.querySelector('[href$="global.css"]');
            return '<link href='+element.href+' rel="stylesheet">';
        }else if(document.querySelector('style')){ //微信公众号
            element = document.querySelector('style');
            return '<style>'+element.innerHTML+'</style>' ;
        }
        
    })
    return {title,article,style}
}