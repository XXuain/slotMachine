// 相關設定
const config = {
    fontSize: 100,
    height: 100,
    width: 200,
    gifts: Array.from(new Array(10), (val, index) => { return { type: 'text', name: index }}),
    isRunning: false,
    rotate: 0,
};

const giftData = [
    { duration: 4000, gifts: config.gifts, giftsDeg: [], targetDeg: 0, currentDeg: 0},
    { duration: 5000, gifts: config.gifts, giftsDeg: [], targetDeg: 0, currentDeg: 0},
    { duration: 6000, gifts: config.gifts, giftsDeg: [], targetDeg: 0, currentDeg: 0},
    { duration: 7000, gifts: config.gifts, giftsDeg: [], targetDeg: 0, currentDeg: 0},
]

// 繪製 DOM Structure
const arrayToHtmlDOM = (arr, id) => {
    const el = document.querySelector('#' + id);
    el.innerHTML += arr.map(item => {
        let str = '';
        str +=  item.gifts.map(gift => {
            return `<div class="gift" data-name="${gift.name}"><img src="./assets/item-${gift.name}.png"></div>`
        }).join('');
        return `<div class="gift-container flat">${str}</div>`;
    }).join('')
}

const turnController = {
    // 父層 DOM
    giftContainers() { return document.querySelectorAll('.gift-container') },
    giftContainersLen() { return this.giftContainers().length },
    
    // 父層 DOM style handler
    giftContainersStyle(){
        const dom = this.giftContainers();
        const len = this.giftContainersLen();
        for (let i = 0; i < len; i++) {
            dom[i].style.setProperty('--fontSize', config.fontSize + "px")
            dom[i].style.setProperty('--height', config.height + "px")
            dom[i].style.setProperty('--width', config.width + "px")
            dom[i].style.setProperty('--duration', giftData[i].duration + "ms")
            dom[i].style.setProperty('--currentDeg', giftData[i].currentDeg + "deg")
            this.giftStyle(dom[i])
        }
    },

    // 子層 DOM style handler
    giftStyle(parentDom) {
        const dom = parentDom ? parentDom.getElementsByClassName('gift') : [];
        const len = dom.length;
        config.rotate = ( 360 / len );
        const translateZ = '153.884'; // dodo

        for (let i = 0; i < len; i++) {
            dom[i].style.transform = "rotateX(" + (config.rotate * i) + "deg) translateZ(" + translateZ + "px)";
        }
    },

    // 開始轉動
    autoTurn() {
        if(!config.isRunning) {
            config.isRunning = true;
            const giftDataLen = giftData.length;
            const dom = this.giftContainers();
    
            for(let i = 0; i < giftDataLen; i++) {
                let randomDeg = (Math.random() * 360) + (360 * 5) // 取得隨機角度(預設至少跑5圈)
                randomDeg -= randomDeg % config.rotate // 減去餘數，避免有高低不一的狀況
                giftData[i].targetDeg = randomDeg
    
                // 設定轉動角度
                dom[i].style.setProperty('--targetDeg', `-${giftData[i].targetDeg}deg`)
                dom[i].classList.add('autoTurn')
                setTimeout(() => {
                    this.autoTurnStop(i, dom[i])
                }, giftData[i].duration + 200)
            }
        }
    },

    // 停止轉動
    autoTurnStop(index, dom) {
        // 把結束時的角度設定為當前角度
        giftData[index].currentDeg = giftData[index].targetDeg % 360;
        dom.style.setProperty('--currentDeg', `-${giftData[index].currentDeg}deg`);
        dom.classList.remove('autoTurn');
        if((index + 1) === this.giftContainersLen()) config.isRunning = false;
    }
}

const onload = function() {
    // 繪製 DOM
    arrayToHtmlDOM(giftData, 'SHOW');
    
    // 繪製 樣式
    turnController.giftContainersStyle();

    // 掛載事件
    const turnBtn = document.querySelector('#TURN');
    turnBtn.addEventListener('click', function(){ turnController.autoTurn(); })
}();

window.onload = onload;