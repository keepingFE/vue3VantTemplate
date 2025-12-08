<template>
    <div class="address-edit">
        <van-nav-bar :title="isEdit ? $t('address.editTitle') : $t('address.addTitle')" left-arrow fixed placeholder
            @click-left="onClickLeft" />

        <van-address-edit :area-list="areaList" show-postal show-delete show-set-default show-search-result
            :search-result="searchResult"
            :area-columns-placeholder="[$t('address.province'), $t('address.city'), $t('address.county')]"
            @save="onSave" @delete="onDelete" @change-detail="onChangeDetail" />
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { showToast } from 'vant';
import { areaList } from '@vant/area-data';
import { useI18n } from 'vue-i18n';

const router = useRouter();
const route = useRoute();
const { t } = useI18n();

const searchResult = ref([]);

const isEdit = computed(() => !!route.query.id);

const onClickLeft = () => {
    router.back();
};

const onSave = (content) => {
    //   showToast('save');
    showToast(t('common.saveSuccess'));
    router.back();
};

const onDelete = () => {
    //   showToast('delete');
    showToast(t('common.deleteSuccess'));
    router.back();
};

const onChangeDetail = (val) => {
    if (val) {
        searchResult.value = [
            {
                name: '黄龙万科中心',
                address: '杭州市西湖区',
            },
        ];
    } else {
        searchResult.value = [];
    }
};
</script>

<style lang="scss" scoped>
.address-edit {
    min-height: 100vh;
    background-color: #f7f8fa;
}
</style>
