import { ref } from "vue";

export const headers = ref([
  {
    title: 'Name',
    key: 'name',
  },
  {
    title: 'Email',
    key: 'email',
  },
  {
    title: 'Dancer name',
    key: 'dancerName',
  },
  {
    title: 'Address',
    key: 'address',
  },
  {
    title: 'Timezone',
    key: 'timezone',
  },
  {
    title: 'Last plan',
    key: 'toExpiration.date',
  },
  {
    title: '',
    key: 'actions'
  }
]);
