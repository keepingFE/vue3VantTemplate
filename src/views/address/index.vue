<template>
    <div class="address-list">
        <van-nav-bar :title="$t('address.listTitle')" left-arrow fixed placeholder @click-left="onClickLeft" />

        <van-address-list v-model="chosenAddressId" :list="list" :disabled-list="disabledList"
            :disabled-text="$t('address.disabledText')" :default-tag-text="$t('address.defaultTag')" @add="onAdd"
            @edit="onEdit" @select="onSelect" />
    </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useAddressStore } from '@/store/modules/address';
import { storeToRefs } from 'pinia';

const router = useRouter();
const route = useRoute();
const { t } = useI18n();
const addressStore = useAddressStore();
const { selectedId, list } = storeToRefs(addressStore);

// 使用 store 中的选中项
const chosenAddressId = selectedId;

// 暂时将所有 store 地址作为可用地址
const disabledList = ref([]);

const onClickLeft = () => {
    router.back();
};

const onAdd = () => {
    router.push('/address/edit');
};

const onEdit = (item, index) => {
    router.push({ path: '/address/edit', query: { id: item.id } });
};

const onSelect = (item, index) => {
    addressStore.setAddress(item.id);
    // 稍作延迟后返回，让用户看到选中的效果
    setTimeout(() => {
        router.back();
    }, 200);
};
</script>

<style lang="scss" scoped>
.address-list {
    min-height: 100vh;
    background-color: #f7f8fa;

    :deep(.van-nav-bar__content) {
        background-color: #fff;
    }
}
</style>
