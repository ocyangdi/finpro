// API测试功能
async function testEndpoint(endpoint, method, data = null) {
    const baseUrl = 'http://localhost:3001';
    let url = baseUrl + endpoint;
    
    // 处理GET请求的查询参数
    if (method === 'GET' && data) {
        const params = new URLSearchParams(data);
        url += '?' + params.toString();
    }
    
    const options = {
        method: method,
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include' // 包含cookies
    };

    // 处理POST/PUT请求的请求体
    if ((method === 'POST' || method === 'PUT') && data) {
        options.body = JSON.stringify(data);
    }

    try {
        const response = await fetch(url, options);
        
        // 检查响应内容类型
        const contentType = response.headers.get('content-type');
        let result;
        
        if (contentType && contentType.includes('application/json')) {
            result = await response.json();
        } else {
            result = await response.text();
        }
        
        // 创建更友好的结果显示
        const resultText = typeof result === 'string' ? result : JSON.stringify(result, null, 2);
        
        alert(`✅ ${method} ${endpoint}\n状态: ${response.status} ${response.statusText}\n响应类型: ${contentType || 'text/plain'}\n\n响应内容:\n${resultText}`);
    } catch (error) {
        alert(`❌ 请求失败: ${error.message}\n\n请检查：\n1. 后端服务器是否运行在 http://localhost:3001\n2. 网络连接是否正常\n3. 如果是认证端点，请先登录获取token`);
    }
}

// 语法高亮辅助函数
function highlightJSON(json) {
    return json
        .replace(/"(\w+)":/g, '<span class="json-key">"$1":</span>')
        .replace(/:"([^"]*)"/g, ':<span class="json-string">"$1"</span>')
        .replace(/:([0-9]+)/g, ':<span class="json-number">$1</span>')
        .replace(/:(true|false)/g, ':<span class="json-boolean">$1</span>')
        .replace(/:(null)/g, ':<span class="json-null">$1</span>');
}

// 页面加载时应用语法高亮和添加事件监听器
document.addEventListener('DOMContentLoaded', function() {
    const examples = document.querySelectorAll('.example-box');
    examples.forEach(example => {
        if (example.textContent.includes('{')) {
            example.innerHTML = highlightJSON(example.textContent);
        }
    });
    
    // 为所有测试按钮添加事件监听器
    const testButtons = document.querySelectorAll('.try-button');
    testButtons.forEach(button => {
        button.addEventListener('click', function() {
            const endpoint = this.getAttribute('data-endpoint');
            const method = this.getAttribute('data-method');
            const dataAttr = this.getAttribute('data-params');
            
            let data = null;
            if (dataAttr) {
                try {
                    data = JSON.parse(dataAttr);
                } catch (e) {
                    console.warn('Failed to parse data params:', dataAttr);
                }
            }
            
            testEndpoint(endpoint, method, data);
        });
    });
});