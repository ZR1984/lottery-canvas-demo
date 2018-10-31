/**
 * 绘制抽奖动画的工具
 * @param {String} parent 此动画显示的dom节点的 id 或 class名字 如： "#name" 或 ".name"
 * @param {Object} opts   参数对象
 * @param {Object} canvasPosition canvas左上角的坐标
 * @param {Number} canvasWidth canvas 的宽度
 * @param {Number} canvasHeight canvas 的高度
 * @param {String} numStr 要绘制的数字的字符串
 * @param {String} numDirection 要绘制的数字的方向 默认横向："vertical" 竖向为："horizontal"
 * @param {Number} numImgWidth 数字要绘制的宽度
 * @param {Number} numImgHeight 数字要绘制的高度
 * @param {Number} numStep 数字之间的间隔
 * @param {String} numType 数字图片的文件夹名字
 */
function LotteryTool(parent, opts = {}) {
    this.parentDom = document.querySelector(parent);
    const {
        canvasPosition = {
                x: 0,
                y: 0
            },
            canvasWidth = 100,
            canvasHeight = 300,
            numStr = "123456",
            numDirection = 'vertical',
            numPosition = {
                x: 0,
                y: 0
            },
            numImgWidth = null,
            numImgHeight = null,
            numStep = 15,
            isRoll = false,
            rollDirection = 'down'
    } = opts;

    this.numStr = numStr;
    this.numArr = numStr.split('');
    this.canvas = document.createElement('canvas');
    this.canvas.width = canvasWidth;
    this.canvas.height = canvasHeight;
    this.canvas.style = `position:absolute;left:${canvasPosition.x};top:${canvasPosition.y}`;
    // this.canvas.style.backgroundColor = "red";
    this.parentDom.append(this.canvas);
    this.numDirection = numDirection;
    this.numPosition = numPosition;
    this.numImgWidth = numImgWidth;
    this.numImgHeight = numImgHeight;
    this.numStep = numStep;
    this.numType = 'middle'
    this.isRoll = isRoll;
    this.rollDirection = rollDirection;
    this.canvasContext = this.canvas.getContext('2d');

    const len = this.numArr.length;
    this.sumHeight = len * numStep;
    // LotteryTool.prototype.roll = function(){
    //     this.numPosition.y += 1
    //     this.drawNumbers()
    //     console.log('d')
    //     requestAnimationFrame(roll)
    // }

    this.imgLoadPromise = [];
    this.numObjArr = this.initNumberInfos()

}

LotteryTool.prototype.setWinner = function () {
    const {
        numObjArr
    } = this;
    numObjArr.forEach(numObj => {
        numObj.isRoll = false;
        numObj.isRender = false;
    });
    numObjArr.forEach(numObj => {
        if (Object.is(numObj.name, '0')) {
            numObj.win()
        }
    });
}

LotteryTool.prototype.initNumberInfos = function () {
    const {
        numDirection
    } = this;
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
        rollDirection
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
            x: x,
            y: y + index * numStep,
            width: numImgWidth,
            height: numImgHeight,
            canvasContext,
            sumHeight,
            isRoll,
            rollDirection
        })

        //纵向绘制图片
        if (numDirection == 'horizontal') {
            numObj.x = x + index * numStep;
            numObj.y = y;
        }

        if (num == "：" || num == ":") {
            numObj.imgUrl = `./image/${numType}/a.png`
        }

        imgLoadPromise.push(numObj.getImg())
        numObjArr.push(numObj)
        map.set(numObj.name, numObj)
    })

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
        })

        if (num == "：" || num == ":") {
            numObj.imgUrl = `./image/${numType}/a.png`
        }

        imgLoadPromise.push(numObj.getImg())
        numObjArr.push(numObj)

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
    })

    return numObjArr;
}

LotteryTool.prototype.drawImage = function (rollSpeed, callback) {
    const {
        canvasContext,
        canvas,
        numObjArr,
        imgLoadPromise,
    } = this;
    canvasContext.clearRect(0, 0, canvas.width, canvas.height)
    Promise.all(imgLoadPromise).then(() => {
        numObjArr.forEach(numObj => {
            numObj.draw(rollSpeed)
        });
    })
    if (callback) callback()
}

function Num(opts = {}) {
    const {
        name = '0',
            x = 0,
            y = 0,
            width = 100,
            height = 100,
            imgUrl = '',
            canvasContext = null,
            sumHeight = 1000,
            isRoll = false,
            isRender = true,
            rollDirection = 'down'
    } = opts;

    this.name = name;
    this.x = x;
    this.y = y;
    this.originX = x;
    this.originY = y;
    this.width = width;
    this.height = height;
    this.imgUrl = imgUrl;
    this.imgObj = null;
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
}

Num.prototype.win = function () {
    const {
        nextNum,
        prevNum
    } = this;
    this.isRender = true;
    prevNum.isRender = true;
    nextNum.isRender = true;

    prevNum.y = 0;
    this.y = 100;
    nextNum.y = 200;

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
        imgUrl
    } = this;
    return new Promise(function (resolve, reject) {
        let obj = new Image();
        obj.src = imgUrl;
        obj.onload = () => {
            resolve(obj);
        }
    }).then(data => {
        this.imgObj = data;
    })
}