<script setup lang="ts">
import { useRoute } from 'vue-router'
const route = useRoute()
</script>

<template>
  <div>
    <!-- ==================== DESKTOP NAVIGATION BAR ==================== -->
    <nav class="hidden lg:flex bg-background border-b border-outline-variant justify-between items-center h-16 px-margin-desktop w-full sticky top-0 z-50">
      <div class="flex items-center gap-8">
        <span class="font-display text-2xl font-bold text-primary uppercase tracking-tighter cursor-pointer hover:opacity-90 transition-opacity">
          VideoVerse
        </span>
        <div class="flex gap-6">
          <NuxtLink 
            :class="route.path === '/' ? 'text-primary font-bold border-b-2 border-primary pb-2 font-label-md text-label-md transition-all' : 'text-on-surface-variant font-medium hover:text-primary transition-colors duration-200 font-label-md text-label-md'" 
            to="/"
          >
            Vimeo
          </NuxtLink>
          <NuxtLink 
            :class="route.path === '/youtube' ? 'text-primary font-bold border-b-2 border-primary pb-2 font-label-md text-label-md transition-all' : 'text-on-surface-variant font-medium hover:text-primary transition-colors duration-200 font-label-md text-label-md'" 
            to="/youtube"
          >
            YouTube
          </NuxtLink>
          <NuxtLink 
            :class="route.path === '/showcase' ? 'text-primary font-bold border-b-2 border-primary pb-2 font-label-md text-label-md transition-all' : 'text-on-surface-variant font-medium hover:text-primary transition-colors duration-200 font-label-md text-label-md'" 
            to="/showcase"
          >
            Showcase
          </NuxtLink>
          <NuxtLink 
            :class="route.path === '/playlist' ? 'text-primary font-bold border-b-2 border-primary pb-2 font-label-md text-label-md transition-all' : 'text-on-surface-variant font-medium hover:text-primary transition-colors duration-200 font-label-md text-label-md'" 
            to="/playlist"
          >
          Playlist
          </NuxtLink>
          <NuxtLink 
            :class="route.path === '/topics' ? 'text-primary font-bold border-b-2 border-primary pb-2 font-label-md text-label-md transition-all' : 'text-on-surface-variant font-medium hover:text-primary transition-colors duration-200 font-label-md text-label-md'" 
            to="/topics"
          >
          Topic
          </NuxtLink>
        </div>
      </div>
      <!-- <div class="flex items-center gap-6">
        <div class="relative hidden lg:block">
          <input
            class="bg-surface-container-high border-none rounded-full px-6 py-2 w-64 text-label-md focus:ring-2 focus:ring-primary focus:outline-none placeholder-on-surface-variant/50 transition-all duration-300"
            placeholder="Search videos..."
            type="text"
          />
        </div>
        <div class="flex items-center gap-4">
          <button class="material-symbols-outlined text-on-surface-variant hover:text-primary transition-all duration-200 hover:scale-110 active:scale-90 cursor-pointer">
            notifications
          </button>
          <button class="material-symbols-outlined text-on-surface-variant hover:text-primary transition-all duration-200 hover:scale-110 active:scale-90 cursor-pointer">
            apps
          </button>
          <button class="bg-primary hover:bg-primary/90 text-on-primary font-label-md text-label-md px-4 py-2 rounded-xl active:scale-95 transition-all duration-200 cursor-pointer shadow-md hover:shadow-lg">
            Upload
          </button>
          <div class="w-10 h-10 rounded-full border border-outline-variant overflow-hidden shadow-inner cursor-pointer hover:border-primary transition-colors duration-200">
            <img
              alt="User profile"
              class="w-full h-full object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCkLcQ03OZXe1bl1ozq1qQkBv988JLOP81pFI3QNQeelAebn1aspNzK4vmW-MSTgiANtzYza4OFbINFaVyjDhrr2SmQhAuYTiKVV4n6cGDicU2UQ1mD5r_rHJmKa2MiHjMAdF9Ce_KVO0RMzKVlW2OOfs8giafKE8OXwEsJ7I_wP4K065MBxXPsMRuSSxSl8nrR1wK7WEthgAUToJucJFxErLHrla-bPQmw5Une6JlXf_o0wMJp63UYfX_oeHhhG737y1deeQfoG_0"
            />
          </div>
        </div>
      </div> -->
    </nav>

    <!-- ==================== BOTTOM NAVBAR (MOBILE ONLY) ==================== -->
    <nav class="lg:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center h-16 px-2 bg-surface-container border-t border-outline-variant shadow-lg rounded-t-xl">
      <NuxtLink
        :class="route.path === '/' ? 'flex flex-col items-center justify-center text-primary bg-primary-container/10 rounded-full py-1 px-4 active:scale-95 transition-transform tap-highlight-none' : 'flex flex-col items-center justify-center text-on-surface-variant active:scale-95 transition-transform tap-highlight-none'"
        to="/"
      >
        <span class="material-symbols-outlined text-[24px]">home</span>
        <span class="font-label-sm text-[10px] mt-0.5 font-bold">Vimeo</span>
      </NuxtLink>
      <NuxtLink
        :class="route.path === '/youtube' ? 'flex flex-col items-center justify-center text-primary bg-primary-container/10 rounded-full py-1 px-4 active:scale-95 transition-transform tap-highlight-none' : 'flex flex-col items-center justify-center text-on-surface-variant active:scale-95 transition-transform tap-highlight-none'"
        to="/youtube"
      >
        <span class="material-symbols-outlined text-[24px]" style="font-variation-settings: 'FILL' 1;">explore</span>
        <span class="font-label-sm text-[10px] mt-0.5">YouTube</span>
      </NuxtLink>
      <NuxtLink
        :class="route.path === '/playlist' ? 'flex flex-col items-center justify-center text-primary bg-primary-container/10 rounded-full py-1 px-4 active:scale-95 transition-transform tap-highlight-none' : 'flex flex-col items-center justify-center text-on-surface-variant active:scale-95 transition-transform tap-highlight-none'"
        to="/playlist"
      >
        <span class="material-symbols-outlined text-[24px]">playlist_play</span>
        <span class="font-label-sm text-[10px] mt-0.5 font-bold">Showcase</span>
      </NuxtLink>
      <!-- <a class="flex flex-col items-center justify-center text-on-surface-variant active:scale-95 transition-transform tap-highlight-none" href="#">
        <span class="material-symbols-outlined text-[24px]">subscriptions</span>
        <span class="font-label-sm text-[10px] mt-0.5">Subscribed</span>
      </a>
      <a class="flex flex-col items-center justify-center text-on-surface-variant active:scale-95 transition-transform tap-highlight-none" href="#">
        <span class="material-symbols-outlined text-[24px]">video_library</span>
        <span class="font-label-sm text-[10px] mt-0.5">Library</span>
      </a> -->
    </nav>
  </div>
</template>