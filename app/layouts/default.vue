<script setup lang="ts">
import SiteFooter from '~/components/footer/SiteFooter.vue';
import SiteHeader from '~/components/header/SiteHeader.vue';

</script>

<template>
  <div class="site-layout">
    <SiteHeader />
    <main class="site-main">
      <slot />
    </main>
    <SiteFooter/>
  </div>
</template>

