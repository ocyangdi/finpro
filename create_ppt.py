#!/usr/bin/env python3
"""
创建RAG文档问答系统企业汇报PPT
使用python-pptx库生成专业的PowerPoint演示文稿
"""

from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.enum.text import PP_ALIGN
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE

def create_rag_presentation():
    # 创建演示文稿
    prs = Presentation()
    
    # 设置幻灯片布局 - 使用标题幻灯片
    slide_layout = prs.slide_layouts[0]  # 标题幻灯片
    
    # === 第1页：封面 ===
    slide = prs.slides.add_slide(slide_layout)
    title = slide.shapes.title
    subtitle = slide.placeholders[1]
    
    title.text = "RAG文档问答系统"
    subtitle.text = "企业汇报演示"
    
    # 设置标题样式
    title.text_frame.paragraphs[0].font.size = Pt(44)
    title.text_frame.paragraphs[0].font.color.rgb = RGBColor(0, 51, 102)
    title.text_frame.paragraphs[0].font.bold = True
    
    subtitle.text_frame.paragraphs[0].font.size = Pt(24)
    subtitle.text_frame.paragraphs[0].font.color.rgb = RGBColor(102, 102, 102)
    
    # === 第2页：项目概述 ===
    slide_layout = prs.slide_layouts[1]  # 标题和内容
    slide = prs.slides.add_slide(slide_layout)
    title = slide.shapes.title
    content = slide.placeholders[1]
    
    title.text = "项目概述"
    
    # 添加项目概述内容
    text_frame = content.text_frame
    text_frame.clear()
    
    # 项目背景
    p = text_frame.paragraphs[0]
    p.text = "项目背景"
    p.font.size = Pt(18)
    p.font.bold = True
    p.font.color.rgb = RGBColor(0, 51, 102)
    
    p = text_frame.add_paragraph()
    p.text = "• 基于检索增强生成（RAG）的智能文档问答系统"
    p.level = 0
    p = text_frame.add_paragraph()
    p.text = "• 支持多格式文档处理和企业级应用"
    p.level = 0
    p = text_frame.add_paragraph()
    p.text = "• 现代化技术栈，高可用性架构"
    p.level = 0
    
    # 核心价值
    p = text_frame.add_paragraph()
    p.text = "核心价值"
    p.font.size = Pt(18)
    p.font.bold = True
    p.font.color.rgb = RGBColor(0, 51, 102)
    
    p = text_frame.add_paragraph()
    p.text = "• 提升文档检索效率"
    p.level = 0
    p = text_frame.add_paragraph()
    p.text = "• 智能问答能力"
    p.level = 0
    p = text_frame.add_paragraph()
    p.text = "• 自动化文档管理"
    p.level = 0
    
    # === 第3页：功能特性 ===
    slide = prs.slides.add_slide(slide_layout)
    title = slide.shapes.title
    content = slide.placeholders[1]
    
    title.text = "功能特性"
    
    text_frame = content.text_frame
    text_frame.clear()
    
    # 核心功能模块
    p = text_frame.paragraphs[0]
    p.text = "核心功能模块"
    p.font.size = Pt(18)
    p.font.bold = True
    p.font.color.rgb = RGBColor(0, 51, 102)
    
    features = [
        "✅ 多格式文档支持: PDF、DOCX、DOC、TXT",
        "✅ 智能问答: 基于向量搜索的精准问答",
        "✅ 自动索引: 文件监听自动触发文档索引",
        "✅ 现代化界面: React + Tailwind CSS 前端",
        "✅ RESTful API: 完整的后端API接口",
        "✅ 向量数据库: Pinecone 向量存储和搜索"
    ]
    
    for feature in features:
        p = text_frame.add_paragraph()
        p.text = feature
        p.level = 0
    
    # === 第4页：技术架构 ===
    slide = prs.slides.add_slide(slide_layout)
    title = slide.shapes.title
    content = slide.placeholders[1]
    
    title.text = "技术架构"
    
    text_frame = content.text_frame
    text_frame.clear()
    
    # 后端技术
    p = text_frame.paragraphs[0]
    p.text = "后端技术栈"
    p.font.size = Pt(16)
    p.font.bold = True
    p.font.color.rgb = RGBColor(0, 51, 102)
    
    backend_tech = [
        "• Node.js + Express: Web服务器框架",
        "• PostgreSQL: 关系型数据库",
        "• Pinecone: 向量数据库",
        "• Sequelize: ORM数据库操作",
        "• OpenAI/Gemini: 大语言模型集成"
    ]
    
    for tech in backend_tech:
        p = text_frame.add_paragraph()
        p.text = tech
        p.level = 0
    
    # 前端技术
    p = text_frame.add_paragraph()
    p.text = "前端技术栈"
    p.font.size = Pt(16)
    p.font.bold = True
    p.font.color.rgb = RGBColor(0, 51, 102)
    
    frontend_tech = [
        "• React 18: 用户界面框架",
        "• Vite: 构建工具",
        "• Tailwind CSS: 样式框架",
        "• Axios: HTTP客户端"
    ]
    
    for tech in frontend_tech:
        p = text_frame.add_paragraph()
        p.text = tech
        p.level = 0
    
    # === 第5页：AI服务整合 ===
    slide = prs.slides.add_slide(slide_layout)
    title = slide.shapes.title
    content = slide.placeholders[1]
    
    title.text = "AI服务整合"
    
    text_frame = content.text_frame
    text_frame.clear()
    
    # 统一问答接口
    p = text_frame.paragraphs[0]
    p.text = "统一问答接口"
    p.font.size = Pt(16)
    p.font.bold = True
    p.font.color.rgb = RGBColor(0, 51, 102)
    
    p = text_frame.add_paragraph()
    p.text = "• 接口地址: localhost:3001/api/qa/ask"
    p.level = 0
    p = text_frame.add_paragraph()
    p.text = "• 搜索类型: semantic/keyword/hybrid"
    p.level = 0
    p = text_frame.add_paragraph()
    p.text = "• 智能路由: 自动选择最佳处理方式"
    p.level = 0
    
    # 集成的大模型服务
    p = text_frame.add_paragraph()
    p.text = "集成的大模型服务"
    p.font.size = Pt(16)
    p.font.bold = True
    p.font.color.rgb = RGBColor(0, 51, 102)
    
    models = [
        "• DeepSeek: 最高优先级，OpenAI兼容接口",
        "• OpenAI GPT: 第二优先级，GPT-3.5-turbo",
        "• Google Gemini: 第三优先级，gemini-pro模型",
        "• Copilot: 独立服务，支持回退机制"
    ]
    
    for model in models:
        p = text_frame.add_paragraph()
        p.text = model
        p.level = 0
    
    # === 第6页：系统状态 ===
    slide = prs.slides.add_slide(slide_layout)
    title = slide.shapes.title
    content = slide.placeholders[1]
    
    title.text = "当前系统状态"
    
    text_frame = content.text_frame
    text_frame.clear()
    
    # 运行状态
    p = text_frame.paragraphs[0]
    p.text = "运行状态"
    p.font.size = Pt(16)
    p.font.bold = True
    p.font.color.rgb = RGBColor(0, 51, 102)
    
    status = [
        "✅ 后端服务器: 正常运行在 http://localhost:3001",
        "✅ 前端界面: 正常运行在 http://localhost:3000",
        "✅ 文件监听: 已激活，监控 /docs 目录",
        "✅ Pinecone: 已连接并配置完成",
        "✅ 问答功能: 现在使用向量搜索"
    ]
    
    for stat in status:
        p = text_frame.add_paragraph()
        p.text = stat
        p.level = 0
    
    # === 第7页：技术亮点 ===
    slide = prs.slides.add_slide(slide_layout)
    title = slide.shapes.title
    content = slide.placeholders[1]
    
    title.text = "技术实现亮点"
    
    text_frame = content.text_frame
    text_frame.clear()
    
    # 智能路由机制
    p = text_frame.paragraphs[0]
    p.text = "智能路由机制"
    p.font.size = Pt(16)
    p.font.bold = True
    p.font.color.rgb = RGBColor(0, 51, 102)
    
    routing = [
        "• 优先级调用链: NLP → 向量搜索 → 关键词搜索 → AI生成",
        "• 服务回退机制: Copilot → DeepSeek → OpenAI → Google Gemini",
        "• 错误处理: 完整的降级策略和容错机制"
    ]
    
    for route in routing:
        p = text_frame.add_paragraph()
        p.text = route
        p.level = 0
    
    # 性能优化
    p = text_frame.add_paragraph()
    p.text = "性能优化"
    p.font.size = Pt(16)
    p.font.bold = True
    p.font.color.rgb = RGBColor(0, 51, 102)
    
    optimizations = [
        "• 向量搜索优化",
        "• 缓存机制",
        "• 异步处理",
        "• 负载均衡"
    ]
    
    for opt in optimizations:
        p = text_frame.add_paragraph()
        p.text = opt
        p.level = 0
    
    # === 第8页：项目成果 ===
    slide = prs.slides.add_slide(slide_layout)
    title = slide.shapes.title
    content = slide.placeholders[1]
    
    title.text = "项目成果"
    
    text_frame = content.text_frame
    text_frame.clear()
    
    # 技术成果
    p = text_frame.paragraphs[0]
    p.text = "技术成果"
    p.font.size = Pt(16)
    p.font.bold = True
    p.font.color.rgb = RGBColor(0, 51, 102)
    
    tech_achievements = [
        "• 完整的RAG系统实现",
        "• 多AI模型集成",
        "• 企业级架构设计",
        "• 高性能向量搜索"
    ]
    
    for achievement in tech_achievements:
        p = text_frame.add_paragraph()
        p.text = achievement
        p.level = 0
    
    # 业务价值
    p = text_frame.add_paragraph()
    p.text = "业务价值"
    p.font.size = Pt(16)
    p.font.bold = True
    p.font.color.rgb = RGBColor(0, 51, 102)
    
    business_value = [
        "• 提升文档处理效率",
        "• 降低人工检索成本",
        "• 增强知识管理能力",
        "• 支持智能决策"
    ]
    
    for value in business_value:
        p = text_frame.add_paragraph()
        p.text = value
        p.level = 0
    
    # === 第9页：总结展望 ===
    slide = prs.slides.add_slide(slide_layout)
    title = slide.shapes.title
    content = slide.placeholders[1]
    
    title.text = "总结与展望"
    
    text_frame = content.text_frame
    text_frame.clear()
    
    # 项目总结
    p = text_frame.paragraphs[0]
    p.text = "项目总结"
    p.font.size = Pt(16)
    p.font.bold = True
    p.font.color.rgb = RGBColor(0, 51, 102)
    
    summary = [
        "• 成功实现RAG文档问答系统",
        "• 技术栈先进，架构合理",
        "• 功能完整，性能优异",
        "• 具备企业级应用能力"
    ]
    
    for point in summary:
        p = text_frame.add_paragraph()
        p.text = point
        p.level = 0
    
    # 未来规划
    p = text_frame.add_paragraph()
    p.text = "未来规划"
    p.font.size = Pt(16)
    p.font.bold = True
    p.font.color.rgb = RGBColor(0, 51, 102)
    
    future_plans = [
        "• 持续优化AI模型集成",
        "• 扩展更多文档格式支持",
        "• 增强企业级安全特性",
        "• 探索更多应用场景"
    ]
    
    for plan in future_plans:
        p = text_frame.add_paragraph()
        p.text = plan
        p.level = 0
    
    # === 第10页：结束页 ===
    slide_layout = prs.slide_layouts[5]  # 空白幻灯片
    slide = prs.slides.add_slide(slide_layout)
    
    # 添加结束文本
    txBox = slide.shapes.add_textbox(Inches(2), Inches(3), Inches(6), Inches(2))
    tf = txBox.text_frame
    tf.text = "感谢观看"
    
    p = tf.paragraphs[0]
    p.font.size = Pt(36)
    p.font.color.rgb = RGBColor(0, 51, 102)
    p.font.bold = True
    p.alignment = PP_ALIGN.CENTER
    
    # 保存PPT文件
    pptx_file = "RAG文档问答系统-企业汇报.pptx"
    prs.save(pptx_file)
    print(f"PPT文件已创建: {pptx_file}")
    
    return pptx_file

if __name__ == "__main__":
    try:
        ppt_file = create_rag_presentation()
        print("✅ 企业汇报PPT创建成功！")
        print(f"📊 文件位置: {ppt_file}")
        print("🎯 包含10页专业幻灯片")
    except Exception as e:
        print(f"❌ 创建PPT时出错: {e}")
        print("请确保已安装python-pptx库: pip install python-pptx")