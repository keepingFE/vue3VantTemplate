<template>
    <div class="quick-questions">
        <div class="questions-hint">你可以向我提问任何健康相关问题，例如：</div>
        <div class="questions-list">
            <div 
                v-for="(question, index) in questions" 
                :key="index"
                class="question-card"
                @click="handleQuestionClick(question)"
            >
                <van-icon name="chat-o" class="question-icon" />
                <span class="question-text">{{ question.text }}</span>
            </div>
        </div>
    </div>
</template>

<script setup>
const props = defineProps({
    questions: {
        type: Array,
        default: () => [
            { text: '高血压饮食应注意什么？', value: 'hypertension_diet' },
            { text: '三伏天养生注意事项？', value: 'summer_health' },
            { text: '吃哪些食物有助于降低血糖？', value: 'lower_blood_sugar' }
        ]
    }
})

const emit = defineEmits(['question-click'])

const handleQuestionClick = (question) => {
    emit('question-click', question)
}
</script>

<style lang="scss" scoped>
.quick-questions {
    padding: 0 16px 16px;

    .questions-hint {
        font-size: 13px;
        color: #666;
        margin-bottom: 12px;
        line-height: 1.5;
    }

    .questions-list {
        display: flex;
        flex-direction: column;
        gap: 8px;

        .question-card {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 12px 16px;
            background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
            border-radius: 12px;
            cursor: pointer;
            transition: all 0.3s ease;

            &:hover {
                transform: translateX(4px);
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            }

            .question-icon {
                font-size: 18px;
                color: #2196f3;
                flex-shrink: 0;
            }

            .question-text {
                flex: 1;
                font-size: 14px;
                color: #333;
                line-height: 1.4;
            }
        }
    }
}
</style>
