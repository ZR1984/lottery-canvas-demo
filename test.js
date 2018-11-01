/**
 * 绘制抽奖动画的工具
 * @param {String} parent 此动画显示的dom节点的 id 或 class名字或canvas对象 如： "#name" 或 ".name"
 * @param {Object} opts   参数对象
 * @param {Object} canvasPosition canvas左上角的坐标
 * @param {Number} canvasWidth canvas 的宽度
 * @param {Number} canvasHeight canvas 的高度
 * @param {String} numStr 要绘制的数字的字符串
 * @param {String} numDirection 要绘制的数字的方向 默认竖向："vertical" 横向为："horizontal"
 * @param {Number} numImgWidth 数字要绘制的宽度
 * @param {Number} numImgHeight 数字要绘制的高度
 * @param {Number} numStep 数字之间的间隔
 * @param {String} numType 数字图片的文件夹名字
 * @param {Object} winnerPosition 中奖数字的显示位置
 * @param {Number} rollSpeed 滚动的速度
 */
function LotteryTool(parent, opts = {}) {

    const {
        canvasPosition = {
                x: 0,
                y: 0
            },
            canvasWidth = 100,
            canvasHeight = 300,
            imgUrls = null,
            numStr = "",
            numDirection = 'vertical',
            numPosition = {
                x: 0,
                y: 0
            },
            numImgWidth = null,
            numImgHeight = null,
            numStep = 15,
            isRoll = false,
            rollDirection = 'down',
            numType = 'middle',
            winnerPosition= { x:0,y:0},
            rollSpeed = 10
    } = opts;

    if(Object.is(typeof parent, 'object')){
        this.canvas = parent;
        this.canvas.width = canvasWidth;
        this.canvas.height = canvasHeight;
        this.canvas.style = `position:absolute;left:${canvasPosition.x}px;top:${canvasPosition.y}px`;
    }else{
        this.parentDom = document.querySelector(parent);
        this.canvas = document.createElement('canvas');
        this.canvas.width = canvasWidth;
        this.canvas.height = canvasHeight;
        this.canvas.style = `position:absolute;left:${canvasPosition.x}px;top:${canvasPosition.y}px`;
        this.parentDom.append(this.canvas);
    }


    this.numStr = numStr;
    this.imgUrls = imgUrls;
    this.numArr = numStr.split('');
    this.numDirection = numDirection;
    this.numPosition = numPosition;
    this.numImgWidth = numImgWidth;
    this.numImgHeight = numImgHeight;
    this.numStep = numStep;
    this.numType = numType;
    this.isRoll = isRoll;
    this.rollDirection = rollDirection;
    this.canvasContext = this.canvas.getContext('2d');
    this.winnerPosition = winnerPosition;
    this.rollSpeed = rollSpeed;

    const len = this.numArr.length;
    this.sumHeight = len * numStep;

    this.imgLoadPromise = [];
    this.numObjArr = this.initNumberInfos()
    this.imgObjArr = this.initImgInfos()
}

LotteryTool.prototype.setNumStr = function(numStr){
    this.numStr = numStr;
    this.numArr = numStr.split('');
    this.numObjArr = this.initNumberInfos()

    return this;
}

LotteryTool.prototype.initImgInfos = function(){
    const {imgUrls,imgLoadPromise,canvasContext} = this;
    if(!imgUrls) return;
    
    const imgObjArr = [];
    if(Object.is(typeof imgUrls, 'string')){
        this.imgUrls = [imgUrls]
    }

    this.imgUrls.forEach(imgUrl => {
        const imgObj = new Img(imgUrl,{
            canvasContext
        })
        imgLoadPromise.push(imgObj.getImg())
        imgObjArr.push(imgObj)
    })

    return imgObjArr
}

LotteryTool.prototype.reset = function(){
    const {numObjArr} = this;
    numObjArr.forEach(numObj => {
        numObj.isRoll = true;
        numObj.isRender = true;
        numObj.x = numObj.originX;
        numObj.y = numObj.originY;
        numObj.imgObj = numObj.originImgObj;
    })
}


LotteryTool.prototype.setWinner = function (winNum='0') {
    const {
        numObjArr,
    } = this;
    numObjArr.forEach(numObj => {
        numObj.isRoll = false;
        numObj.isRender = false;
    });
    numObjArr.forEach(numObj => {
        if (Object.is(numObj.name, winNum)) {
            numObj.win()
        }
    });
}

LotteryTool.prototype.initNumberInfos = function () {
    const {
        numDirection,
        numStr
    } = this;
    if(!numStr) return;
    if (Object.is(numDirection, 'vertical')) {
        return this.initNumberInfosToCol()
    } else if (Object.is(numDirection, 'horizontal')) {
        return this.initNumberInfosToRow()
    }
}

LotteryTool.prototype.initNumberInfosToCol = function () {
    const {
        numStr,
        numPosition,
        numDirection,
        numStep,
        numImgWidth,
        numImgHeight,
        numType,
        canvasContext,
        sumHeight,
        imgLoadPromise,
        isRoll,
        rollDirection,
        winnerPosition
    } = this;

    const x = numPosition.x;
    const y = numPosition.y;
    const numArr = numStr.split('');
    const numObjArr = [];
    const map = new Map()
    numArr.forEach((num, index) => {
        const numObj = new Num({
            name: num,
            imgUrl: `./image/${numType}/${num}.png`,
            oddEvenUrl: `./image/${numType}/${Number(num) % 2?'odd':'even'}.png`,
            bigSmallUrl: `./image/${numType}/${Number(num) > 4?'big':'small'}.png`,
            x: x,
            y: y + index * numStep,
            width: numImgWidth,
            height: numImgHeight,
            canvasContext,
            sumHeight,
            isRoll,
            rollDirection,
            winnerPosition
        })

        if (num == "：" || num == ":") {
            numObj.imgUrl = `./image/${numType}/a.png`
        }

        imgLoadPromise.push(numObj.getImg())
        numObjArr.push(numObj)
        map.set(numObj.name, numObj)
    })

    if(isRoll){
        numArr.forEach((num, index) => {
            const numObjClone = new Num({
                name: num + '-clone',
                imgUrl: `./image/${numType}/${num}.png`,
                x: x,
                y: Object.is(rollDirection,'up')?y + index * numStep + sumHeight:y + index * numStep - sumHeight,
                width: numImgWidth,
                height: numImgHeight,
                canvasContext,
                sumHeight,
                isRoll,
                rollDirection
            })
    
            if (num == "：" || num == ":") {
                numObjClone.imgUrl = `./image/${numType}/a.png`
            }
    
            imgLoadPromise.push(numObjClone.getImg())
            numObjArr.push(numObjClone)
            map.set(numObjClone.name, numObjClone)
        })
    }

    numObjArr.forEach((numObj, i) => {
        numObj.nextNum = map.get(numObj.nextNumName);
        numObj.prevNum = map.get(numObj.prevNumName);
    })

    return numObjArr;
}

LotteryTool.prototype.initNumberInfosToRow = function () {
    const {
        numStr,
        numPosition,
        numDirection,
        numStep,
        numImgWidth,
        numImgHeight,
        numType,
        canvasContext,
        sumHeight,
        imgLoadPromise,
        isRoll,
        rollDirection
    } = this;

    const x = numPosition.x;
    const y = numPosition.y;
    const numArr = numStr.split('');
    const numObjArr = [];
    numArr.forEach((num, index) => {
        const numObj = new Num({
            name: num,
            imgUrl: `./image/${numType}/${num}.png`,
            x: x + index * numStep,
            y: y,
            width: numImgWidth,
            height: numImgHeight,
            canvasContext,
            sumHeight,
            isRoll,
            rollDirection
        })

        if (num == "：" || num == ":") {
            numObj.imgUrl = `./image/${numType}/a.png`
        }

        imgLoadPromise.push(numObj.getImg())
        numObjArr.push(numObj)
    })

    if(isRoll){
        const numObjClone = new Num({
            name: num + '-clone',
            imgUrl: `./image/${numType}/${num}.png`,
            x: x + index * numStep + sumHeight,
            y: y,
            width: numImgWidth,
            height: numImgHeight,
            canvasContext,
            sumHeight,
            isRoll,
        })

        if (num == "：" || num == ":") {
            numObjClone.imgUrl = `./image/${numType}/a.png`
        }

        imgLoadPromise.push(numObjClone.getImg())
        numObjArr.push(numObjClone)
    }

    return numObjArr;
}

LotteryTool.prototype.drawImage = function (callback) {
    const {
        canvasContext,
        canvas,
        numObjArr,
        imgObjArr,
        imgLoadPromise,
        rollSpeed
    } = this;
    canvasContext.clearRect(0, 0, canvas.width, canvas.height)
    Promise.all(imgLoadPromise).then(() => {
        numObjArr && numObjArr.forEach(numObj => {
            numObj.draw(rollSpeed)
        });

        imgObjArr && imgObjArr.forEach((imgObj)=>{
            imgObj.draw()
        })

    })
    if (callback) callback()

    return this;
}

function Num(opts = {}) {
    const {
        name = '0',
            x = 0,
            y = 0,
            width = 100,
            height = 100,
            imgUrl = '',
            oddEvenUrl= '',
            bigSmallUrl='',
            canvasContext = null,
            sumHeight = 1000,
            isRoll = false,
            isRender = true,
            rollDirection = 'down',
            winnerPosition={
                x:0,
                y:0,
            },
    } = opts;

    this.name = name;

    this.x = x;
    this.y = y;
    this.originX = x;
    this.originY = y;
    this.width = width;
    this.height = height;
    this.imgUrl = imgUrl;
    this.oddEvenUrl = oddEvenUrl;
    this.bigSmallUrl = bigSmallUrl;
    this.imgObj = null;
    this.originImgObj = null;
    this.oddEvenObj = null;
    this.bigSmallObj =null;
    this.isRoll = isRoll;
    this.isRender = isRender;
    this.canvasContext = canvasContext;
    this.sumHeight = sumHeight;
    this.rollDirection = rollDirection;
    this.target = Object.is(rollDirection,'up')?this.originY - sumHeight:this.originY + sumHeight;
    this.nextNumName = Number(name) + 1 > 9 ? '0' : Number(name) + 1 + '';
    this.prevNumName = Number(name) - 1 < 0 ? '9' : Number(name) - 1 + '';
    this.nextNum = null;
    this.prevNum = null;
    this.winnerPosition = winnerPosition;
}

Num.prototype.win = function () {
    const {
        nextNum,
        prevNum,
        winnerPosition,
        height,
        oddEvenObj,
        bigSmallObj
    } = this;
    this.isRender = true;
    prevNum.isRender = true;
    nextNum.isRender = true;

    prevNum.y = winnerPosition.y - height;
    this.y = winnerPosition.y;
    nextNum.y =  winnerPosition.y + height;

    setTimeout(() => {
        prevNum.imgObj = bigSmallObj
        nextNum.imgObj = oddEvenObj
    }, 1000);

}

Num.prototype.roll = function (rollSpeed = 10) {
    const {
        target,
        originY,
        rollDirection
    } = this;

    switch (rollDirection) {
        case 'up':
            this.y -= rollSpeed;
            if (this.y <= target) {
                this.y = originY;
            }
            break;
        default:
            this.y += rollSpeed;
            if (this.y >= target) {
                this.y = originY;
            }
            break;
    }
}

Num.prototype.draw = function (rollSpeed) {
    const {
        imgObj,
        x,
        y,
        width,
        height,
        canvasContext,
        isRoll,
        isRender
    } = this;
    if (!canvasContext) {
        throw Error('canvasContext undefined')
    }
    if (!imgObj) return;
    if (isRoll) {
        this.roll(rollSpeed)
    }
    if (isRender) {
        canvasContext.drawImage(imgObj, x, y, width || imgObj.width, height || imgObj.height);
    }
}

Num.prototype.getImg = function () {
    const {
        imgUrl,
        oddEvenUrl,
        bigSmallUrl
    } = this;

    new Promise(function (resolve, reject) {
        let obj = new Image();
        obj.src = oddEvenUrl;
        obj.onload = () => {
            resolve(obj);
        }
    }).then(data => {
        this.oddEvenObj = data;
    })

    new Promise(function (resolve, reject) {
        let obj = new Image();
        obj.src = bigSmallUrl;
        obj.onload = () => {
            resolve(obj);
        }
    }).then(data => {
        this.bigSmallObj = data;
    })

    return new Promise(function (resolve, reject) {
        let obj = new Image();
        obj.src = imgUrl;
        obj.onload = () => {
            resolve(obj);
        }
    }).then(data => {
        this.imgObj = data;
        this.originImgObj = data;
    })
}

function Img(url,opts={}){
    const {
        x = 0,
        y = 0,
        width = 0,
        height = 0,
        canvasContext = null,
    } = opts;
    
    this.url = url;
    this.width = width;
    this.height = height;
    this.x = x;
    this.y = y;
    this.imgObj = null;
    this.canvasContext = canvasContext;
}

Img.prototype.getImg = function () {
    const {
        url
    } = this;
    return new Promise(function (resolve, reject) {
        let obj = new Image();
        obj.src = url;
        obj.onload = () => {
            resolve(obj);
        }
    }).then(data => {
        this.imgObj = data;
        this.originImgObj = data;
    })
}

Img.prototype.draw = function () {
    const {
        imgObj,
        x,
        y,
        width,
        height,
        canvasContext,
    } = this;
    if (!canvasContext) {
        throw Error('canvasContext undefined')
    }
    if (!imgObj) return;
        canvasContext.drawImage(imgObj, x, y, width || imgObj.width, height || imgObj.height);
}

function CountDownWatch (count,opts = {}){
    const {
        onUpdate = null,
        onComplete = null,
        delayComplete = 0,
    } = opts;
    this.count = count;
    this.originCount = count;
    this.onUpdate = onUpdate;
    this.onComplete = onComplete;
    this.interval = null;
    this.delayComplete = delayComplete;
}

CountDownWatch.prototype.restart = function (){
    this.count = this.originCount;
    this.start()
}

CountDownWatch.prototype.start = function (){
    const {onUpdate,onComplete,delayComplete} = this
    this.interval = setInterval(()=>{
        onUpdate(this.count)
        if(this.count == 0){
            this.stop()
            setTimeout(()=>{
                onComplete(this.count)
            },delayComplete)
        }
        this.count--
    },1000)

    return this;
}

CountDownWatch.prototype.stop = function (){
    clearInterval(this.interval)

    return this;
}

