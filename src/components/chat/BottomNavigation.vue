<template>
    <div class="bottom-navigation">
        <div class="nav-items">
            <div 
                v-for="(item, index) in navItems" 
                :key="index"
                class="nav-item"
                :class="{ active: item.active }"
                @click="handleNavClick(item)"
            >
                <div class="nav-icon-wrapper">
                    <van-icon :name="item.icon" class="nav-icon" />
                    <span v-if="item.badge" class="nav-badge">
                        {{ item.badge }}
                    </span>
                </div>
                <span class="nav-text">
                    {{ item.text }}
                </span>
            </div>
        </div>
    </div>
</template>

<script setup>
const props = defineProps({
    navItems: {
        type: Array,
        default: () => [
            { 
                text: '健康咨询', 
                icon: 'chat-o',
                active: true,
                type: 'consult'
            },
            { 
                text: '报告解读', 
                icon: 'description',
                badge: '54人',
                active: false,
                type: 'report'
            },
            { 
                text: '智能导诊', 
                icon: 'orders-o',
                badge: '64人',
                active: false,
                type: 'guide'
            }
        ]
    }
})

const emit = defineEmits(['nav-click'])

const handleNavClick = (item) => {
    emit('nav-click', item)
}
</script>

<style lang="scss" scoped>
.bottom-navigation {
    background: #fff;
    border-top: 1px solid #f0f0f0;

    .nav-items {
        display: flex;
        align-items: center;
        justify-content: space-around;
        padding: 8px 0;

        .nav-item {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 4px;
            cursor: pointer;
            transition: all 0.3s ease;

            .nav-icon-wrapper {
                position: relative;

                .nav-icon {
                    font-size: 24px;
                    color: #999;
                }

                .nav-badge {
                    position: absolute;
                    top: -4px;
                    right: -20px;
                    background: #ff4444;
                    color: #fff;
                    font-size: 10px;
                    padding: 2px 6px;
                    border-radius: 10px;
                    white-space: nowrap;
                }
            }

            .nav-text {
                font-size: 12px;
                color: #999;
            }

            &.active {
                .nav-icon {
                    color: #2196f3;
                }

                .nav-text {
                    color: #2196f3;
                    font-weight: 600;
                }
            }

            &:hover:not(.active) {
                .nav-icon {
                    color: #666;
                }

                .nav-text {
                    color: #666;
                }
            }
        }
    }
}
</style>
