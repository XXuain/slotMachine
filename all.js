// 相關設定
const config = {
    fontSize: 100,
    height: 100,
    width: 200,
    gifts: Array.from(new Array(10), (val, index) => { return { type: 'text', name: index }}),
    rotate: 0,
};

const giftData = [
    { 
        duration: 1000,  // 期間
        gifts: config.gifts,
        giftsDeg: [], // 紀錄 gifts 角度
        targetDeg: 0, // 目標角度
        currentDeg: 0 // 當前角度
    },
    { duration: 2000, gifts: config.gifts, giftsDeg: [], targetDeg: 0, currentDeg: 0},
    { duration: 3000, gifts: config.gifts, giftsDeg: [], targetDeg: 0, currentDeg: 0},
    { duration: 4000, gifts: config.gifts, giftsDeg: [], targetDeg: 0, currentDeg: 0},
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
    currentGiftDomItems: [],
    giftNameList: [], // 獎品 list [[xx, xx ,xx], [mm, mm, mm]]
    currentGiftNameList: [],
    currentGiftNameItems: [],
    isOpen: false,
    isRunning: false,

    // 父層 DOM
    giftContainers() { return document.querySelectorAll('.gift-container') },
    giftContainersLen() { return this.giftContainers().length },

    // 子層 DOM
    gifts(parentIndex) {
        return this.giftContainers()[parentIndex].getElementsByClassName('gift');
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

    // 紀錄各個資料 用紀錄角度找到名字 並回傳
    currentGiftName(index) {
        // 顯示獎品資料(結束角度 + 單片角度/2)
        const endDeg = giftData[index].currentDeg + (config.rotate / 2)
        let giftName = null;
        giftData[index].giftsDeg.forEach((gift, i) => {
            if (endDeg >= gift.from && endDeg <= gift.to) {
                giftName = gift.name;
            }
        });
        return giftName;
    },

    // 回傳當前 gift dom
    currentGiftDom(parentIndex, giftName) {
        const dom = this.gifts(parentIndex);
        let giftDom = null;
        for(let item of dom) {
            item.dataset.name == giftName && (giftDom = item);
        }
        return giftDom;
    },

    // 當前獎項紀錄 並恢復獎項樣式
    removeGiftStyle() {
        for(let item of this.currentGiftDomItems) {
            item.classList.remove('currentGift');
        }
        this.currentGiftNameItems = [];
    },

    // 開始轉動
    autoTurn() {
        if(!this.isRunning) {
            this.isRunning = true;
            this.closeTurnLog();
            this.currentGiftNameItems.length && this.removeGiftStyle();
            const giftDataLen = giftData.length;
            const dom = this.giftContainers();
    
            for(let i = 0; i < giftDataLen; i++) {
                let randomDeg = (Math.random() * 360) + (360 * 3) // 取得隨機角度(預設至少跑5圈)
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
        
         // 紀錄各個資料
        const giftName = this.currentGiftName(index);
        this.currentGiftNameItems.push(giftName);
        
        // 加上樣式
        const giftDom = this.currentGiftDom(index, giftName);
        this.currentGiftDomItems.push(giftDom);
        giftDom.classList.add('currentGift');
        
        // 所有都停止時
        if((index + 1) === this.giftContainersLen()) {
            this.isRunning = false;
            this.currentGiftNameList.push(this.currentGiftNameItems);
        }
    },

    // 開啟彈窗處理
    openTurnLog() {
        const dialog = document.querySelector('.dialog');
        const logListDom = document.querySelector('.logList');
        this.isOpen = !this.isOpen;
        if(this.isOpen && !this.isRunning) {
            dialog.classList.add('show');
            if(this.currentGiftNameList.length) {
                logListDom.innerHTML += this.currentGiftNameList.map(item=>{
                    return `<li>${item.join(',')}</li>`;
                }).join('');
                this.giftNameList.push(this.currentGiftNameList);
                this.currentGiftNameList = [];
            }
        } else {
            this.closeTurnLog()
        }
    }, 

    // 關閉彈窗處理
    closeTurnLog() {
        const dialog = document.querySelector('.dialog');
        dialog.classList.remove('show');
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
    logBtn.addEventListener('click', function(){ turnController.openTurnLog(); })
}();

window.onload = onload;