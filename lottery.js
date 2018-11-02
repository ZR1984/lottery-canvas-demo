function Lottery() {
    this.bgImg = new LotteryTool(document.querySelector("#canvas"), {
        imgUrls: "./image/1_new.png",
        canvasWidth: 1124,
        canvasHeight: 708,
    })

    this.topNumber = new LotteryTool('.lotteryAnimat', {
        numStr: "",
        numDirection: 'horizontal',
        numPosition: {
            x: 0,
            y: 0
        },
        numType: 'top-middle',
        numStep: 75,
        numImgWidth: 80,
        numImgHeight: 80,
        canvasWidth: 400,
        canvasHeight: 90,
        canvasPosition: {
            x: 450,
            y: 5
        },
    })

    this.currentPeriods = new LotteryTool('.lotteryAnimat', {
        numStr: "20181101008",
        numDirection: 'horizontal',
        numPosition: {
            x: 0,
            y: 0
        },
        numType: 'periods',
        numStep: 15,
        numImgWidth: 30,
        numImgHeight: 30,
        canvasWidth: 200,
        canvasHeight: 50,
        canvasPosition: {
            x: 225,
            y: 18
        },
    })

    this.nextPeriods = new LotteryTool('.lotteryAnimat', {
        numStr: "20181101008",
        numDirection: 'horizontal',
        numPosition: {
            x: 0,
            y: 0
        },
        numType: 'periods',
        numStep: 15,
        numImgWidth: 30,
        numImgHeight: 30,
        canvasWidth: 200,
        canvasHeight: 50,
        canvasPosition: {
            x: 910,
            y: 10
        },
    })

    this.lotteryTime = new LotteryTool('.lotteryAnimat', {
        numStr: "14:10:00",
        numDirection: 'horizontal',
        numPosition: {
            x: 0,
            y: 0
        },
        numType: 'lottery-time',
        numStep: 13,
        numImgWidth: 30,
        numImgHeight: 30,
        canvasWidth: 200,
        canvasHeight: 50,
        canvasPosition: {
            x: 950,
            y: 50
        },
    })

    this.countDown = new LotteryTool('.lotteryAnimat', {
        numStr: "",
        numDirection: 'horizontal',
        numPosition: {
            x: 0,
            y: 0
        },
        numType: 'count-down',
        numStep: 35,
        numImgWidth: 60,
        numImgHeight: 60,
        canvasWidth: 120,
        canvasHeight: 50,
        canvasPosition: {
            x: 500,
            y: 100
        },
    })

    this.staticImgArr = [this.bgImg, this.topNumber, this.currentPeriods, this.nextPeriods, this.lotteryTime, this.countDown]
    this.rollNumbers = createRollNumbers()


    this.winNumStr = "12345"

    this.renderStatic()
    this.displayResult()
    this.watch = new CountDownWatch(0, {
        onUpdate: (count) => {
            this.countDown.setNumStr(String(count))
            if (count >= 100) {
                this.countDown.setX(0)
            } else if (count >= 10) {
                this.countDown.setX(15)
            } else {
                this.countDown.setX(30)
            }
            this.countDown.drawImage()
            if (count == 0) {
                this.countDown.stopRender()
            }
        }
    })
}

Lottery.prototype.setWinNum = function (numStr) {
    this.winNumStr = numStr
}

Lottery.prototype.displayResult = function () {
    const {
        rollNumbers,
        winNumStr
    } = this;
    rollNumbers.forEach((colObj, i) => {
        colObj.setWinner(winNumStr.charAt(i))
    })
}

Lottery.prototype.restart = function () {
    const {
        rollNumbers
    } = this;
    rollNumbers.forEach((colObj, i) => {
        colObj.reset();
    })
}

Lottery.prototype.renderStatic = function (callback) {
    const {
        staticImgArr
    } = this;
    staticImgArr.forEach(staticImg => {
        staticImg.drawImage()
    })
}

Lottery.prototype.render = function (callback) {
    const {
        rollNumbers
    } = this;
    rollNumbers.forEach((colObj, i) => {
        colObj.drawImage(callback)
    })
}




function createRollNumbers() {
    const arr = []
    for (let index = 0; index < 5; index++) {
        arr.push(
            new LotteryTool('.lotteryAnimat', {
                numStr: "0123456789",
                numDirection: 'vertical',
                numPosition: {
                    x: 0,
                    y: 50
                },
                numStep: 100,
                numImgWidth: 100,
                numImgHeight: 100,
                isRoll: true,
                rollDirection: 'down',
                canvasWidth: 100,
                canvasHeight: 320,
                canvasPosition: {
                    x: 160 + index * 170,
                    y: 180
                },
                winnerPosition: {
                    y: 120
                },
                rollSpeed: rand(10, 25)
            })
        )
    }
    return arr;
}

function rand(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}