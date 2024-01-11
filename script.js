

document.addEventListener("DOMContentLoaded", function() {
    // 定义背景图数组
    var backgroundImages = [
        "url('../images/bg1.jpg')",
        "url('../images/bg2.jpg')",
        "url('../images/bg3.jpg')",
        "url('../images/bg4.jpg')",
        // 添加更多的背景图路径
    ];

    // 获取背景容器元素
    var backgroundContainer = document.querySelector("body");

    // 随机选择一个背景图
    function getRandomBackground() {
        var randomIndex = Math.floor(Math.random() * backgroundImages.length);
        return backgroundImages[randomIndex];
    }

    // 设置初始背景图
    backgroundContainer.style.backgroundImage = getRandomBackground();
});
