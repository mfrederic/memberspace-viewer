import { ref } from "vue";

export const headers = ref([
  {
    title: 'Name (approved)',
    key: 'name',
  },
  {
    key: 'status',
  },
  {
    title: 'Email (mailing list)',
    key: 'email',
  },
  {
    key: 'mailingList',
  },
  {
    title: 'Creation',
    key: 'creationDate',
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
    maxWidth: '120px',
  },
  {
    title: 'Plans',
    key: 'plans.length',
    maxWidth: '120px',
  },
  {
    title: 'Last plan',
    key: 'toExpiration.status',
  },
  {
    title: '',
    key: 'actions',
  }
]);
