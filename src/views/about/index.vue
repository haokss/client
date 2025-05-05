<template>
    <div>
        <h3 class="title">本项目由haoks支持，更多详情见以后</h3>
    </div>
        <h1>SSE 通知演示</h1>
    <div id="notifications"></div>
</template>

<script>
    // 1. 创建 EventSource 连接
    const eventSource = new EventSource('http://localhost:8080/events');

    // 2. 监听消息事件
    eventSource.onmessage = function(event) {
        const data = JSON.parse(event.data);
        const notificationDiv = document.createElement("div");
        notificationDiv.innerHTML = `<strong>${data.title}</strong>: ${data.message}`;
        document.getElementById("notifications").appendChild(notificationDiv);
    };

    // 3. 监听错误事件
    eventSource.onerror = function(event) {
        console.error("SSE 连接错误:", event);
    };
</script>