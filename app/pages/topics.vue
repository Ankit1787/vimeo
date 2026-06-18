<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from "vue";
import { useVideoPlayer, type VideoItem } from "~/composables/useVideoPlayer";
import VideoPlayer from "~/components/video/VideoPlayer.vue";

definePageMeta({ layout: false });

useHead({
  title: "The Craft of Leadership",
  link: [
    {
      rel: "stylesheet",
      href: "https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@400;500;600;700;800;900&family=Inter:wght@400;500;600;700&display=swap",
    },
    {
      rel: "stylesheet",
      href: "https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap",
    },
  ],
});

interface Card {
  title: string;
  description: string;
}

interface Section {
  key: string;
  title: string;
  intro: string;
  cards: Card[];
  videos?: Card[];
  layout: "split" | "grid";
}

const sections: Section[] = [
  {
    key: "mindset",
    title: "LEADERSHIP MINDSET",
    intro:
      "This series captures the essence of ownership, keeping it simple — customer focused and winning together. Together, we learn, grow and win as one team with a shared purpose.",
    layout: "split",
    cards: [
      {
        title: "ACT LIKE AN OWNER",
        description:
          "Embracing an ownership mindset transforms how you lead, how you show up, and how you drive meaningful results. Acting like an owner is about stepping into full responsibility for your area — owning not just the outcomes, but the thinking, decisions, and behaviors that create them. It means looking ahead, anticipating challenges before they surface, and asking the important questions others may overlook",
      },
      {
        title: "KEEP IT SIMPLE & CUSTOMER FOCUSED",
        description:
          "Keeping it simple starts with clarity. Partners should know what the priorities are, why they matter, and how to deliver on them. Clear expectations eliminate guesswork, reduce stress, and allow teams to move with confidence. When partners understand the “why” and the “what,” they can focus their energy on creating meaningful customer connections.",
      },
      {
        title: "WIN TOGETHER",
        description:
          "Winning together starts with meaningful connection — coaching through listening, checking in, and understanding what partners need to feel supported and confident. Coaching also brings clarity by helping partners understand goals, expectations, and priorities so the work feels lighter and teams stay aligned. It means helping partners unpack the load, stepping in when someone is struggling, and celebrating growth and progress along the way.",
      },
    ],
    
  },
  {
    key: "skills",
    title: "LEADERSHIP SKILLS",
    intro:
      "Discover the essentials of great leadership in this video series designed to help you grow your confidence, strengthen your impact, and lead with humanity.",
    layout: "grid",
    cards: [
      {
        title: "BUILDING TRUST",
        description:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed varius commodo ullamcorper. Fusce nec dignissim turpis. Proin volutpat quis augue sed egestas. Cras nulla enim. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed varius commodo ullamcorper. Fusce nec dignissim turpis.",
      },
      {
        title: "HAVING DIFFICULT CONVERSATIONS",
        description:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed varius commodo ullamcorper. Fusce nec dignissim turpis. Proin volutpat quis augue sed egestas. Cras nulla enim. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed varius commodo ullamcorper. Fusce nec dignissim turpis.",
      },
      {
        title: "COACHING",
        description:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed varius commodo ullamcorper. Fusce nec dignissim turpis. Proin volutpat quis augue sed egestas. Cras nulla enim. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed varius commodo ullamcorper. Fusce nec dignissim turpis.",
      },
      {
        title: "INFLUENCING BROADLY",
        description:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed varius commodo ullamcorper. Fusce nec dignissim turpis. Proin volutpat quis augue sed egestas. Cras nulla enim. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed varius commodo ullamcorper. Fusce nec dignissim turpis.",
      },
    ],
    videos:[{
        title: "ACT LIKE AN OWNER",
        description:
          "Embracing an ownership mindset transforms how you lead, how you show up, and how you drive meaningful results. Acting like an owner is about stepping into full responsibility for your area — owning not just the outcomes, but the thinking, decisions, and behaviors that create them. It means looking ahead, anticipating challenges before they surface, and asking the important questions others may overlook",
      }],
  },
  {
    key: "development",
    title: "LEADERSHIP DEVELOPMENT",
    intro:
      "This video series is designed to help teams grow stronger together by building the everyday leadership skills that drive connection, clarity, and shared success.",
    layout: "grid",
    cards: [
      {
        title: "CREATING INCLUSIVE TEAMS",
        description:
          "Blurb about Act Like an Owner insights. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed varius commodo ullamcorper. Fusce nec dignissim turpis. Proin volutpat quis augue sed egestas. Cras nulla enim. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed varius commodo ullamcorper. Fusce nec dignissim turpis.",
      },
      {
        title: "EMOTIONAL INTELLIGENCE",
        description:
          "Blurb about Act Like an Owner insights. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed varius commodo ullamcorper. Fusce nec dignissim turpis. Proin volutpat quis augue sed egestas. Cras nulla enim. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed varius commodo ullamcorper. Fusce nec dignissim turpis.",
      },
      {
        title: "LEADING THROUGH CHANGE",
        description:
          "Blurb about Act Like an Owner insights. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed varius commodo ullamcorper. Fusce nec dignissim turpis. Proin volutpat quis augue sed egestas. Cras nulla enim. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed varius commodo ullamcorper. Fusce nec dignissim turpis.",
      },
      {
        title: "GROWING TOGETHER",
        description:
          "Blurb about Act Like an Owner insights. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed varius commodo ullamcorper. Fusce nec dignissim turpis. Proin volutpat quis augue sed egestas. Cras nulla enim. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed varius commodo ullamcorper. Fusce nec dignissim turpis.",
      },
    ],
  },
];

const showcaseId = "12107219";
const videos = ref<VideoItem[]>([]);
const isLoading = ref(true);
const errorMsg = ref("");

const fetchVideos = async () => {
  try {
    const res = await $fetch<any>(`/api/vimeo/showcase/${showcaseId}`);
    if (res?.success && Array.isArray(res.videos)) {
      videos.value = res.videos;
    } else {
      errorMsg.value = res?.error || "Failed to load videos.";
    }
  } catch (e: any) {
    errorMsg.value = e?.message || "Failed to load videos.";
  } finally {
    isLoading.value = false;
  }
};

// Each card maps to one showcase video by global index (cycled).
const videoForCard = (
  sectionIdx: number,
  cardIdx: number,
): VideoItem | null => {
  if (videos.value.length === 0) return null;
  let offset = 0;
  for (let i = 0; i < sectionIdx; i++) offset += sections[i].cards.length;
  return videos.value[(offset + cardIdx) % videos.value.length];
};

const thumbForCard = (sectionIdx: number, cardIdx: number): string => {
  return videoForCard(sectionIdx, cardIdx)?.thumbnail || "";
};

// Carousel elements & scrolling
const skillsScrollRef = ref<HTMLDivElement | null>(null);
const devScrollRef = ref<HTMLDivElement | null>(null);

const scrollCarousel = (el: HTMLDivElement | null, dir: number) => {
  if (!el) return;
  const cards = el.querySelectorAll("[data-card]");
  if (cards.length === 0) return;

  const firstVisible = [...cards].findIndex((card) => {
    const rect = (card as HTMLElement).getBoundingClientRect();
    const containerRect = el.getBoundingClientRect();
    return rect.left >= containerRect.left - 10;
  });

  const nextIndex = Math.max(0, Math.min(cards.length - 1, firstVisible + dir));

  const targetCard = cards[nextIndex] as HTMLElement;
  const targetScrollLeft = targetCard.offsetLeft - el.offsetLeft - 8;

  // Custom quadratic ease-in-out scroll animation
  const start = el.scrollLeft;
  const change = targetScrollLeft - start;
  const duration = 350; // ms
  const startTime = performance.now();

  const animate = (currentTime: number) => {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);

    const ease =
      progress < 0.5
        ? 2 * progress * progress
        : -1 + (4 - 2 * progress) * progress;

    el.scrollLeft = start + change * ease;

    if (progress < 1) {
      requestAnimationFrame(animate);
    }
  };

  requestAnimationFrame(animate);
};

// ---------- Modal state ----------
const modalOpen = ref(false);
const modalSection = ref<Section | null>(null);
const modalVideos = ref<VideoItem[]>([]);

const playerState = useVideoPlayer(modalVideos);

const openModal = async (sectionIdx: number, cardIdx: number) => {
  const section = sections[sectionIdx];
  const startVideo = videoForCard(sectionIdx, cardIdx);

  // Find start video index inside the fetched Vimeo list
  const startIdx = startVideo
    ? videos.value.findIndex((v) => v.vimeoId === startVideo.vimeoId)
    : 0;

  // Create modular video playlist based on clicked item
  const list: VideoItem[] = [];
  for (let i = 0; i < videos.value.length; i++) {
    list.push(videos.value[(startIdx + i) % videos.value.length]);
  }

  modalSection.value = section;
  modalVideos.value = list;
  playerState.currentIndex.value = 0;
  modalOpen.value = true;

  if (import.meta.client) document.body.style.overflow = "hidden";

  // Force-load the correct clicked video on mount/modal open
  nextTick(async () => {
    await playerState.changeVideo(0);
  });
};

const closeModal = () => {
  modalOpen.value = false;
  modalSection.value = null;
  if (import.meta.client) document.body.style.overflow = "";
};

// Fetch relative video in modal (offset = -1 for prev, 0 for current, 1 for next)
const getRelativeVideo = (offset: number): VideoItem | null => {
  if (modalVideos.value.length === 0) return null;
  const total = modalVideos.value.length;
  const currentIdx = playerState.currentIndex.value;
  const targetIdx = (currentIdx + offset + total) % total;
  return modalVideos.value[targetIdx];
};

const handlePlaylistThumbnailClick = (offset: number) => {
  if (offset === 0) return;
  if (offset === -1) {
    playerState.previous();
  } else if (offset === 1) {
    playerState.next();
  }
};

// Keyboard navigation listener
const handleKeyDown = (e: KeyboardEvent) => {
  if (!modalOpen.value) return;
  if (e.key === "ArrowLeft") {
    playerState.previous();
  } else if (e.key === "ArrowRight") {
    playerState.next();
  } else if (e.key === "Escape") {
    closeModal();
  }
};

watch(modalOpen, async (open) => {
  if (open) {
    await nextTick();
    if (playerState.containerRef.value) {
      playerState.initPlayer(playerState.containerRef.value).catch(() => {});
    }
  }
});

onMounted(() => {
  fetchVideos();
  if (import.meta.client) {
    window.addEventListener("keydown", handleKeyDown);
  }
});

onUnmounted(() => {
  if (import.meta.client) {
    window.removeEventListener("keydown", handleKeyDown);
  }
});
</script>

<template>
  <div class="min-h-screen bg-white text-neutral-900 font-body">
    <section
      v-for="(section, sIdx) in sections"
      :key="section.key"
      :class="section.key == 'skills' ? 'bg-[#f1f1f0]' : 'bg-white'"
    >
      <div class="max-w-[1240px] mx-auto px-4 md:px-8  py-12">
        <!-- Green banner -->
        <div class="bg-[#1b3d36] text-white px-6 py-5 mb-8">
          <h2
            class="font-display text-lg md:text-xl font-bold tracking-wide uppercase mb-1"
          >
            {{ section.title }}
          </h2>
          <p
            class="text-xs md:text-sm text-white/90 leading-relaxed max-w-4xl font-medium"
          >
            {{ section.intro }}
          </p>
        </div>

        <!-- ===== SPLIT LAYOUT (Mindset): text | BIG video | 3 smaller thumbs (same height as main video) ===== -->
        <div v-if="section.layout === 'split'" class="space-y-12">
          <div
            v-for="(card, cIdx) in section.cards"
            :key="card.title"
            class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch"
          >
            <!-- Col 1: text (top-aligned) -->
            <div class="lg:col-span-3 flex flex-col justify-start">
              <h3
                class="font-display font-bold text-xl tracking-tight text-neutral-900 mb-3 border-b border-[#1b3d36]/20 pb-1 self-start uppercase"
              >
                {{ card.title }}
              </h3>
              <p class="text-sm text-neutral-600 leading-relaxed font-medium">
                {{ card.description }}
              </p>
            </div>

            <!-- Col 2: big featured video -->
            <div class="lg:col-span-6 flex items-center">
              <button
                type="button"
                @click="openModal(sIdx, cIdx)"
                class="relative block w-full aspect-video bg-neutral-200 overflow-hidden group focus:outline-none"
              >
                <img
                  v-if="thumbForCard(sIdx, cIdx)"
                  :src="thumbForCard(sIdx, cIdx)"
                  :alt="card.title"
                  class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                />
                <div
                  v-else
                  class="w-full h-full bg-neutral-300 animate-pulse"
                ></div>
                <div
                  class="absolute inset-0 bg-black/15 flex items-center justify-center transition-colors group-hover:bg-black/30"
                >
                  <div
                    class="w-16 h-16 rounded-full bg-white/95 flex items-center justify-center shadow-lg"
                  >
                    <span
                      class="material-symbols-outlined text-3xl text-black translate-x-[1px]"
                      >play_arrow</span
                    >
                  </div>
                </div>
              </button>
            </div>

            <!-- Col 3: 3 smaller thumbs, stretched to match Col 2 height -->
            <div class="lg:col-span-3 flex flex-col gap-2 h-full">
              <button
                v-for="t in 3"
                :key="t"
                type="button"
                @click="openModal(sIdx, (cIdx + t) % section.cards.length)"
                class="relative w-full flex-1 bg-neutral-200 overflow-hidden group focus:outline-none border-b-2 border-[#1b3d36]"
              >
                <img
                  v-if="thumbForCard(sIdx, (cIdx + t) % section.cards.length)"
                  :src="thumbForCard(sIdx, (cIdx + t) % section.cards.length)"
                  :alt="section.cards[(cIdx + t) % section.cards.length].title"
                  class="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div
                  v-else
                  class="absolute inset-0 bg-neutral-300 animate-pulse"
                ></div>
                <div
                  class="absolute inset-0 bg-black/20 flex items-center justify-center opacity-70 group-hover:opacity-100 transition-opacity"
                >
                  <div
                    class="w-8 h-8 rounded-full bg-white/95 flex items-center justify-center shadow-md"
                  >
                    <span
                      class="material-symbols-outlined text-base text-black translate-x-[1px]"
                      >play_arrow</span
                    >
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>

        <!-- ===== SKILLS & DEVELOPMENT: horizontal carousel flanked by green capsule chevrons ===== -->
        <div v-else class="relative px-2">
          <div class="relative">


          
          <!-- Left Chevron Button (Green Capsule) -->
          <button
            type="button"
            @click="
              scrollCarousel(sIdx === 1 ? skillsScrollRef : devScrollRef, -1)
            "
            class="absolute left-[-15px] top-[30%] -translate-y-1/2 z-10 w-7 h-14 bg-[#1b3d36] hover:bg-[#15302b] rounded-full text-white flex items-center justify-center shadow-lg transition-colors cursor-pointer focus:outline-none border-none"
          >
            <span class="material-symbols-outlined text-xl font-bold"
              >chevron_left</span
            >
          </button>

          <!-- Scrollable Row (no-scrollbar) -->
          <div
            :ref="
              (el) => {
                if (sIdx === 1) skillsScrollRef = el as any;
                else devScrollRef = el as any;
              }
            "
            class="flex gap-8 overflow-x-auto no-scrollbar snap-x snap-mandatory scroll-smooth pb-3 px-1"
          >
            <button
              v-for="(card, cIdx) in section.cards"
              :key="card.title"
              data-card
              type="button"
              @click="openModal(sIdx, cIdx)"
              class="text-left group focus:outline-none snap-start shrink-0"
              style="width: calc((100% - 4rem) / 3)"
            >
              <!-- Thumbnail (Sharp corners + Green bottom border) -->
              <div
                class="relative w-full aspect-video bg-neutral-200 overflow-hidden mb-4 shadow-sm group-hover:shadow-md transition-shadow duration-300 border-b-4 border-[#1b3d36]"
              >
                <img
                  v-if="thumbForCard(sIdx, cIdx)"
                  :src="thumbForCard(sIdx, cIdx)"
                  :alt="card.title"
                  class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div
                  v-else
                  class="w-full h-full bg-neutral-300 animate-pulse"
                ></div>
                <!-- Play overlay -->
                <div
                  class="absolute inset-0 bg-black/15 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                >
                  <div
                    class="w-12 h-12 rounded-full bg-white/95 flex items-center justify-center shadow-md"
                  >
                    <span
                      class="material-symbols-outlined text-2xl text-[#1b3d36] translate-x-[1.5px] font-bold"
                      >play_arrow</span
                    >
                  </div>
                </div>
              </div>

              <!-- Title & Description -->
              <h3
                class="font-display font-extrabold text-[14px] uppercase tracking-wider text-neutral-900 mb-2 group-hover:text-[#1b3d36] transition-colors leading-snug"
              >
                {{ card.title }}
              </h3>
              <p
                class="text-xs text-neutral-600 leading-relaxed font-medium line-clamp-3"
              >
                {{ card.description }}
              </p>
            </button>
          </div>

          <!-- Right Chevron Button (Green Capsule) -->
          <button
            type="button"
            @click="
              scrollCarousel(sIdx === 1 ? skillsScrollRef : devScrollRef, 1)
            "
            class="absolute right-[-15px] top-[30%] -translate-y-1/2 z-10 w-7 h-14 bg-[#1b3d36] hover:bg-[#15302b] rounded-full text-white flex items-center justify-center shadow-lg transition-colors cursor-pointer focus:outline-none border-none"
          >
            <span class="material-symbols-outlined text-xl font-bold"
              >chevron_right</span
            >
          </button>
          </div>
          <div>
                  <button
              v-for="(card, cIdx) in section.videos"
              :key="card.title"
              data-card
              type="button"
              @click="openModal(sIdx, cIdx)"
              class="text-left group focus:outline-none snap-start shrink-0"
              style="width: calc((100% - 4rem) / 3)"
            >
              <!-- Thumbnail (Sharp corners + Green bottom border) -->
              <div
                class="relative w-full aspect-video bg-neutral-200 overflow-hidden mb-4 shadow-sm group-hover:shadow-md transition-shadow duration-300 border-b-4 border-[#1b3d36]"
              >
                <img
                  v-if="thumbForCard(sIdx, cIdx)"
                  :src="thumbForCard(sIdx, cIdx)"
                  :alt="card.title"
                  class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div
                  v-else
                  class="w-full h-full bg-neutral-300 animate-pulse"
                ></div>
                <!-- Play overlay -->
                <div
                  class="absolute inset-0 bg-black/15 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                >
                  <div
                    class="w-12 h-12 rounded-full bg-white/95 flex items-center justify-center shadow-md"
                  >
                    <span
                      class="material-symbols-outlined text-2xl text-[#1b3d36] translate-x-[1.5px] font-bold"
                      >play_arrow</span
                    >
                  </div>
                </div>
              </div>

              <!-- Title & Description -->
              <h3
                class="font-display font-extrabold text-[14px] uppercase tracking-wider text-neutral-900 mb-2 group-hover:text-[#1b3d36] transition-colors leading-snug"
              >
                {{ card.title }}
              </h3>
              <p
                class="text-xs text-neutral-600 leading-relaxed font-medium line-clamp-3"
              >
                {{ card.description }}
              </p>
            </button>
          </div>

        </div>
      </div>
    </section>

    <!-- ===== MODAL: white card, main video + 3-video playlist with arrow keys ===== -->
    <div
      v-if="modalOpen"
      class="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-3 md:p-6"
      @click.self="closeModal"
    >
      <div
        class="bg-white rounded-lg w-full max-w-[950px] shadow-2xl relative overflow-hidden"
      >
        <!-- Close button -->
        <button
          type="button"
          @click="closeModal"
          class="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-black/20 hover:bg-black/40 text-white flex items-center justify-center transition-all cursor-pointer border-none"
        >
          <span class="material-symbols-outlined text-lg font-bold">close</span>
        </button>

        <!-- Main Video Container -->
        <div class="p-4 md:p-6 bg-black">
          <VideoPlayer :player-state="playerState" />
        </div>

        <!-- Custom Playlist Row Flanked by Chevrons -->
        <div
          class="p-5 md:p-7 bg-white border-t border-neutral-100 flex flex-col items-center"
        >
          <h4
            class="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-4"
          >
            Leadership Playlist
          </h4>

          <div
            class="flex items-center justify-center gap-4 w-full max-w-[700px]"
          >
            <!-- Left Chevron Button -->
            <button
              type="button"
              @click="playerState.previous()"
              class="w-7 h-12 bg-[#1b3d36] hover:bg-[#15302b] rounded-full text-white flex items-center justify-center shadow-md cursor-pointer shrink-0 transition-colors focus:outline-none border-none"
            >
              <span class="material-symbols-outlined text-xl font-bold"
                >chevron_left</span
              >
            </button>

            <!-- Exactly 3 Video Thumbnails -->
            <div class="flex gap-4 items-center justify-center w-full">
              <button
                v-for="offset in [-1, 0, 1]"
                :key="offset"
                type="button"
                @click="handlePlaylistThumbnailClick(offset)"
                class="relative w-[30%] aspect-video rounded bg-neutral-100 overflow-hidden group focus:outline-none transition-all duration-300"
                :class="
                  offset === 0
                    ? 'ring-4 ring-[#1b3d36] scale-105 z-10 shadow-lg'
                    : 'opacity-65 hover:opacity-90 ring-1 ring-neutral-200 shadow-sm'
                "
              >
                <img
                  v-if="getRelativeVideo(offset)"
                  :src="getRelativeVideo(offset).thumbnail"
                  :alt="getRelativeVideo(offset).title"
                  class="w-full h-full object-cover"
                />

                <div
                  v-if="getRelativeVideo(offset)"
                  class="absolute bottom-1 right-1 text-[9px] bg-black/75 text-white px-1 rounded font-semibold"
                >
                  {{ getRelativeVideo(offset).duration }}
                </div>

                <!-- Active Indicator / Play Icon overlay -->
                <div
                  v-if="offset !== 0 && getRelativeVideo(offset)"
                  class="absolute inset-0 bg-black/15 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <div
                    class="w-8 h-8 rounded-full bg-white/95 flex items-center justify-center shadow-md"
                  >
                    <span
                      class="material-symbols-outlined text-[16px] text-[#1b3d36] translate-x-[1px] font-bold"
                      >play_arrow</span
                    >
                  </div>
                </div>
              </button>
            </div>

            <!-- Right Chevron Button -->
            <button
              type="button"
              @click="playerState.next()"
              class="w-7 h-12 bg-[#1b3d36] hover:bg-[#15302b] rounded-full text-white flex items-center justify-center shadow-md cursor-pointer shrink-0 transition-colors focus:outline-none border-none"
            >
              <span class="material-symbols-outlined text-xl font-bold"
                >chevron_right</span
              >
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading / error toast -->
    <div
      v-if="isLoading"
      class="fixed bottom-4 right-4 bg-neutral-900/85 text-white text-xs px-3 py-2 rounded-md"
    >
      Loading showcase…
    </div>
    <div
      v-if="errorMsg"
      class="fixed bottom-4 right-4 bg-red-600 text-white text-xs px-3 py-2 rounded-md"
    >
      {{ errorMsg }}
    </div>
  </div>
</template>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
