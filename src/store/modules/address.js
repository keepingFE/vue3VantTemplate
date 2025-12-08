import { defineStore } from 'pinia'

export const useAddressStore = defineStore('address', {
  state: () => ({
    selectedId: '1',
    list: [
      {
        id: '1',
        name: '张三',
        tel: '13000000000',
        address: '浙江省杭州市西湖区文三路 138 号东方通信大厦 7 楼 501 室',
        isDefault: true,
      },
      {
        id: '2',
        name: '李四',
        tel: '13100000000',
        address: '浙江省杭州市拱墅区莫干山路 50 号',
      },
      {
        id: '3',
        name: '王五',
        tel: '13200000000',
        address: '浙江省杭州市滨江区江南大道 15 号',
        isDefault: false
      }
    ]
  }),
  getters: {
    currentAddress: (state) => {
        return state.list.find(item => item.id === state.selectedId) || state.list[0]
    }
  },
  actions: {
    setAddress(id) {
        this.selectedId = id
    }
  },
  persist: {
      key: 'address-store',
      storage: localStorage,
  }
})
