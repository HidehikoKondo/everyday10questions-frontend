

function fetchGASData() {
    const url = 'https://script.google.com/macros/s/AKfycbw-18UJfH0RQSG2MvBtPHL6Kq5Xh8p8zb16D2HwLZQIbYUwZGXDe3yrMS2wIGKOI-hqcQ/exec'; // GASのデプロイURL

    fetch(url, {
        method: 'GET',
        mode: 'cors', // CORS 対応を利用
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json(); // レスポンスをJSONとしてパース
        })
        .then(data => {
            for (const key in data) {
                if (data.hasOwnProperty(key)) { // オブジェクト自身のプロパティのみ処理
                    console.log(`${key}: ${data[key]}`);
                }
            }
            console.log('Response data:', data); // コンソールに出力
        })
        .catch(error => {
            console.error('Error during fetch request:', error);
        });
}



// 関数を実行
// fetchGASData();


// fnを使うための設定
window.fn = {};

window.fn.open = function () {
    var menu = document.getElementById('menu');
    menu.open();
};

window.fn.load = function (page) {
    var content = document.getElementById('content');
    var menu = document.getElementById('menu');
    content.load(page)
        .then(menu.close.bind(menu));
};

