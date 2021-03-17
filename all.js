// 相關設定
const config = {
    rotateY: -25,
    rollback: 0.3,
    fontSize: 100,
    height: 100,
    width: 200,
    gifts: Array.from(new Array(10), (val, index) => { return { type: 'text', name: index }}),
    trigger: null,
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

function autoTurnStop(i, element) {
    // 把結束時的角度設定為當前角度
    giftData[i].currentDeg = giftData[i].targetDeg % 360;
    element.style.setProperty('--currentDeg', `-${giftData[i].currentDeg}deg`);
    element.classList.remove('autoTurn');
    const endDeg = giftData[i].currentDeg + (data.rotate / 2)
}


function giftContainersStyle(isInit) {
    // 父層樣式處理
    const giftContainers = document.querySelectorAll('.gift-container');
    const giftContainersLen = giftContainers.length;
    for (let i = 0; i < giftContainersLen; i++) {
        if(isInit) {
            giftContainers[i].style.setProperty('--rotateY', config.rotateY + "deg")
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
            config.trigger = new Date();
            console.log(config.trigger);
            
            // 取得隨機角度(預設至少跑5圈)
            let randomDeg = (Math.random() * 360) + (360 * 5)
            randomDeg -= randomDeg % rotate // 減去餘數，避免有高低不一的狀況
            giftData[i].targetDeg = randomDeg
            // console.log('giftData[i].targetDeg: ', giftData[i].targetDeg);

            // 取得隨機回彈角度
            const randomRollBackDeg = config.rollback
                ? Math.random() * config.rollback + 1
                : 1
            // console.log('randomRollBackDeg: ', randomRollBackDeg);

            // 設定轉動角度
            giftContainers[i].style.setProperty('--targetDeg', `-${giftData[i].targetDeg}deg`)
            giftContainers[i].style.setProperty('--rollBackDeg', `${randomRollBackDeg}`)

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
    giftContainersStyle(false);
}

// 紀錄
function logGiftsDeg () {
  // 紀錄獎品角度
  gifts.forEach((gift, index) => {
    this.giftsDeg[index] = {
      from: index === 0 ? 0 : this.giftsDeg[index - 1].to,
      to: index === 0 ? this.rotate : this.giftsDeg[index - 1].to + this.rotate,
      name: gift.name
    }
  })
}



window.onload = function() {
    // 基本樣式
    giftContainersStyle(true);
    // 掛載事件
    const turnBtn = document.querySelector('#TURN');
    turnBtn.addEventListener('click', function(){ clickTurn(); })
}