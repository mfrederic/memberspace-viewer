<script setup lang="ts">
import { ref } from "vue";
import type { MemberEntity } from "@/core/interfaces/dataTypes";
import { copyToClipboard } from "@/core/utils/utils";
import ButtonBottomNav from "@/components/ButtonBottomNav.vue";

const props = defineProps<{
  selected: MemberEntity[];
}>();

function copySelectionAttrToClipboard(attr: Array<keyof MemberEntity>) {
  const value = props.selected
    .map((item) => attr.map((a) => item[a]).join(' '))
    .join('\n');
  copyToClipboard(value);
}
</script>

<template>
<v-bottom-navigation v-if="selected.length > 0">
  <button-bottom-nav
    :label="selected.length > 1 ? 'Copy names' : 'Copy name'"
    :icon="selected.length > 1 ? 'mdi-account-multiple' : 'mdi-account'"
    :title="selected.length > 1 ? 'Copy names' : 'Copy name'"
    @click="copySelectionAttrToClipboard(['firstName', 'lastName'])" />
  <button-bottom-nav
    :label="selected.length > 1 ? 'Copy emails' : 'Copy email'"
    :icon="selected.length > 1 ? 'mdi-email-multiple' : 'mdi-email'"
    :title="selected.length > 1 ? 'Copy emails' : 'Copy email'"
    @click="copySelectionAttrToClipboard(['email'])" />
  <button-bottom-nav
    :label="selected.length > 1 ? 'Copy addresses' : 'Copy address'"
    :icon="selected.length > 1 ? 'mdi-map-marker-multiple' : 'mdi-map-marker'"
    :title="selected.length > 1 ? 'Copy addresses' : 'Copy address'"
    @click="copySelectionAttrToClipboard(['address'])" />
  <button-bottom-nav
    :label="selected.length > 1 ? 'Copy dancers name' : 'Copy dancer name'"
    :icon="selected.length > 1 ? 'mdi-account-multiple' : 'mdi-account'"
    :title="selected.length > 1 ? 'Copy dancers name' : 'Copy dancer name'"
    @click="copySelectionAttrToClipboard(['dancerName'])" />
</v-bottom-navigation>
</template>