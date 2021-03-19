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
    { 
        duration: 4000,  // 期間
        gifts: config.gifts,
        giftsDeg: [], // 紀錄 gifts 角度
        targetDeg: 0, // 目標角度
        currentDeg: 0 // 當前角度
    },
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
    currentGiftDom: [],
    giftNameList: [], // 獎品 list [[xx, xx ,xx], [mm, mm, mm]]
    currentGiftNameItems: [],

    // 父層 DOM
    giftContainers() { return document.querySelectorAll('.gift-container') },
    giftContainersLen() { return this.giftContainers().length },

    // 子層 DOM
    gifts(parentId) {
        return this.giftContainers()[parentId].getElementsByClassName('gift');
    },
    
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
            this.giftStyle(i)
        }
    },

    // 子層 DOM style handler
    giftStyle(parentIndex) {
        const dom = this.gifts(parentIndex);
        const len = dom.length;
        config.rotate = ( 360 / len );
        const translateZ = '153.884'; // dodo

        for (let i = 0; i < len; i++) {
            dom[i].style.transform = "rotateX(" + (config.rotate * i) + "deg) translateZ(" + translateZ + "px)";
            this.logGiftsDeg(parentIndex, i);
        }
    },

    // 紀錄子層角度
    logGiftsDeg(parentIndex, index) {
        const currentName = giftData[parentIndex].gifts[index].name;
        giftData[parentIndex].giftsDeg[index] = {
            from: index === 0 ? 0 : giftData[parentIndex].giftsDeg[index - 1].to,
            to: index === 0 ? config.rotate : giftData[parentIndex].giftsDeg[index - 1].to + config.rotate,
            name: currentName
        }
    },

    // 當前資料處理
    currentGiftLog(index) {
        // 顯示獎品資料(結束角度 + 單片角度/2)
        const endDeg = giftData[index].currentDeg + (config.rotate / 2)
        giftData[index].giftsDeg.forEach((gift, i) => {
            if (endDeg >= gift.from && endDeg <= gift.to) {
                // 找到名字 加入樣式
                this.currentGiftNameItems.push(gift.name);
                this.currentGiftAddStyle(index, gift.name);
            }
        });
    },

    // 當前獎項標註
    currentGiftAddStyle(parentIndex, giftName) {
        const dom = this.gifts(parentIndex);
        for(let item of dom) {
            if (item.dataset.name == giftName) {
                this.currentGiftDom.push(item);
                item.classList.add('currentGift');
            };
        }
    },

    // 當前獎項紀錄 並恢復獎項樣式
    logGiftNameList() {
        this.giftNameList.push(this.currentGiftNameItems);
        // console.log('logGiftNameList: ', this.giftNameList);
        this.currentGiftNameItems = [];
        for(let item of this.currentGiftDom) {
            item.classList.remove('currentGift');
        }
    },

    // 開始轉動
    autoTurn() {
        if(!config.isRunning) {
            config.isRunning = true;
            this.currentGiftNameItems.length && this.logGiftNameList();
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
    autoTurnStop(index, parentDom) {
        // 把結束時的角度設定為當前角度
        giftData[index].currentDeg = giftData[index].targetDeg % 360;
        parentDom.style.setProperty('--currentDeg', `-${giftData[index].currentDeg}deg`);
        parentDom.classList.remove('autoTurn');
        // 紀錄當前資料
        this.currentGiftLog(index)
        if((index + 1) === this.giftContainersLen()) {
            config.isRunning = false;
            // this.logGiftNameList();
        }
    },

    // 
    openTurnLog() {
        console.log('openTurnLog');
        const logListDom = document.querySelector('.logList');
        console.log('logListDom: ', logListDom, this.giftNameList);
        logListDom.innerHTML += this.giftNameList.map(item=>{
            console.log('giftNameList: ', item);
            return `<li>${item}</li>`;
        }).join('');
    }
}

const onload = function() {
    // 繪製 DOM
    arrayToHtmlDOM(giftData, 'SHOW');
    
    // 繪製 樣式
    turnController.giftContainersStyle();

    // 掛載事件
    const turnBtn = document.querySelector('#TURN-BTN');
    const logBtn = document.querySelector('#LOG-BTN');
    turnBtn.addEventListener('click', function(){ turnController.autoTurn(); })
    // logBtn.addEventListener('click', function(){ turnController.openTurnLog(); })
}();

window.onload = onload;