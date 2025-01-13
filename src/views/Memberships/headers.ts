import { ref } from "vue";

export const headers = ref([
  {
    title: 'Name',
    key: 'name',
  },
  {
    key: 'active',
  },
  {
    title: 'Members',
    key: 'members',
  },
  {
    title: 'Recurring',
    key: 'recurringCount',
  },
  {
    title: 'Active',
    key: 'activeCount',
  },
  {
    title: 'Inactive',
    key: 'inactiveCount',
  },
  {
    title: '',
    key: 'actions',
    sortable: false,
  }
])