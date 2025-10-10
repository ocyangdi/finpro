const QAService = require('./services/qaService');

async function testSingleWordReimbursement() {
    console.log('=== 测试单字"报销"的NLP识别 ===\n');
    
    const qaService = new QAService();
    
    // 等待NLP模型初始化
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 测试用例：单字"报销"
    const testCases = [
        '报销',
        '报销是什么',
        '报销是什么？',
        '怎么报销',
        '怎么报销？',
        '报销流程'
    ];
    
    for (const question of testCases) {
        console.log(`测试问题: "${question}"`);
        
        try {
            const nlpResponse = await qaService.nlpConversation(question);
            
            if (nlpResponse) {
                console.log(`✅ NLP识别成功:`);
                console.log(`   - 意图: ${nlpResponse.intent}`);
                console.log(`   - 置信度: ${nlpResponse.confidence}`);
                console.log(`   - 回答: ${nlpResponse.answer}`);
                console.log(`   - 来源: ${nlpResponse.source}`);
            } else {
                console.log(`❌ NLP识别失败: 未识别到意图或置信度低于阈值`);
                
                // 测试answerQuestion方法
                const fullResponse = await qaService.answerQuestion(question);
                console.log(`   - 降级回答: ${fullResponse.answer}`);
                console.log(`   - 置信度: ${fullResponse.confidence}`);
                console.log(`   - 来源: ${fullResponse.source}`);
            }
        } catch (error) {
            console.log(`❌ 处理失败: ${error.message}`);
        }
        
        console.log('---\n');
    }
    
    console.log('=== 测试完成 ===');
}

// 运行测试
testSingleWordReimbursement().catch(console.error);