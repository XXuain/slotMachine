// 相關設定
const config = {
    fontSize: 100,
    height: 100,
    width: 200,
    gifts: Array.from(new Array(10), (val, index) => { return { type: 'text', name: index }}),
    trigger: null,
    isRunning: false,
};
const data = {
    rotate: 0,
}
const giftData = [
    { duration: 4000, gifts: config.gifts, giftsDeg: [], targetDeg: 0, currentDeg: 0},
    { duration: 5000, gifts: config.gifts, giftsDeg: [], targetDeg: 0, currentDeg: 0},
    { duration: 6000, gifts: config.gifts, giftsDeg: [], targetDeg: 0, currentDeg: 0},
    { duration: 7000, gifts: config.gifts, giftsDeg: [], targetDeg: 0, currentDeg: 0},
]

const giftContainers = document.querySelectorAll('.gift-container');
const giftContainersLen = giftContainers.length;

// 停止處理
function autoTurnStop(index, element) {
    // 把結束時的角度設定為當前角度
    giftData[index].currentDeg = giftData[index].targetDeg % 360;
    element.style.setProperty('--currentDeg', `-${giftData[index].currentDeg}deg`);
    element.classList.remove('autoTurn');
    if((index + 1) === giftContainersLen) config.isRunning = false;
}


function giftContainersStyle(isInit) {
    // 父層樣式處理
    for (let i = 0; i < giftContainersLen; i++) {
        if(isInit) {
            giftContainers[i].style.setProperty('--fontSize', config.fontSize + "px")
            giftContainers[i].style.setProperty('--height', config.height + "px")
            giftContainers[i].style.setProperty('--width', config.width + "px")
            giftContainers[i].style.setProperty('--duration', giftData[i].duration + "ms")
            giftContainers[i].style.setProperty('--currentDeg', giftData[i].currentDeg + "deg")

            // 子層樣式
            const gifts = giftContainers[i].getElementsByClassName('gift');
            const giftsLen = gifts.length;
            for (let ii = 0; ii < giftsLen; ii++) {
                rotate = (360/giftsLen);
                const translateZ = '153.884'; // dodo
                gifts[ii].style.transform = "rotateX(" + (rotate * ii) + "deg) translateZ(" + translateZ + "px)";

                // 紀錄角度
                // giftData[i].giftsDeg.push({
                //     from: i === 0 ? 0 : giftData[i].giftsDeg[i - 1].to,
                //     to: i === 0 ? data.rotate : giftData[i].giftsDeg[i - 1].to + data.rotate,
                //     name: giftData[i].gifts[ii].name
                // })
            }
        } else {
            config.isRunning = true;
            config.trigger = new Date();
            
            // 取得隨機角度(預設至少跑5圈)
            let randomDeg = (Math.random() * 360) + (360 * 5)
            randomDeg -= randomDeg % rotate // 減去餘數，避免有高低不一的狀況
            giftData[i].targetDeg = randomDeg
            // console.log('giftData[i].targetDeg: ', giftData[i].targetDeg);

            // 設定轉動角度
            giftContainers[i].style.setProperty('--targetDeg', `-${giftData[i].targetDeg}deg`)

            giftContainers[i].classList.add('autoTurn')
            setTimeout(() => {
                this.autoTurnStop(i, giftContainers[i])
            }, giftData[i].duration + 200)
        }
    }
    console.log(giftData);
}

// turn 事件觸發
function clickTurn() {
    config.isRunning || giftContainersStyle(false);
}

window.onload = function() {
    // 基本樣式
    giftContainersStyle(true);
    // 掛載事件
    const turnBtn = document.querySelector('#TURN');
    turnBtn.addEventListener('click', function(){ clickTurn(); })
}