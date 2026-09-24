"use client";

import { useState } from "react";
import { Play } from "lucide-react";
import { useLang, type Bi } from "@/components/Lang";
import { PageHead } from "@/components/Page";

type Video = { id: string; title: string; note: Bi };

const ENGLISH: Video[] = [
  { id: "ypOGOgEVDpQ", title: "Living in Valencia in 2026: Can You Still Afford a Beautiful Life?", note: { en: "What rent, food and daily life cost now.", ja: "今の家賃・食費・生活費。" } },
  { id: "hWA2co_2AFU", title: "Cost of Living in Valencia, Spain in 2026: What's Changed Since We Moved from California", note: { en: "A couple who moved from California.", ja: "カリフォルニアから移住したカップルの視点。" } },
  { id: "YKsjn9kS9ME", title: "Living in Valencia SPAIN, Pros & Cons - Could we live Here?", note: { en: "Honest pros and cons.", ja: "率直なメリットとデメリット。" } },
  { id: "VnDUo-2II8M", title: "What it's REALLY like Living in Valencia Spain?", note: { en: "First impressions: beaches, old town, lifestyle.", ja: "第一印象：ビーチ、旧市街、暮らし。" } },
  { id: "1XvRXSMVdMQ", title: "What it's REALLY like living in everyone's FAVORITE expat city", note: { en: "Why so many people are moving to Valencia.", ja: "なぜ多くの人がバレンシアに移住するのか。" } },
  { id: "CI2ClnSXwL8", title: "Living in Valencia, Spain as an American: Expectations vs Reality", note: { en: "An American's six years in Valencia.", ja: "アメリカ人のバレンシア生活6年。" } },
];

const JAPANESE: Video[] = [
  { id: "SvxsMhfzZ8A", title: "【スペイン移住Vlog】バレンシア中心街でお買い物と散策", note: { en: "A Japanese couple's first days after moving to Valencia.", ja: "バレンシアに移住した日本人夫婦の最初の日々。" } },
  { id: "bZwwg28T4RY", title: "【ルームツアー】スペイン バレンシアで住み始めたお部屋をご紹介", note: { en: "Room tour of their Valencia apartment.", ja: "バレンシアのアパートのルームツアー。" } },
  { id: "ASSm251DzJM", title: "スペイン・バレンシアのオススメの観光人気スポット！在住日本人が教えます！", note: { en: "Favourite spots, from a Japanese resident.", ja: "在住日本人おすすめのスポット。" } },
  { id: "bfYjjDDrEfc", title: "【海外Vlog】もう帰りたくない。スペイン・バレンシアで暮らすように旅した7日間", note: { en: "Living like a local: cafés, paella, bars.", ja: "暮らすような旅：カフェ、パエリア、バル。" } },
  { id: "iHD1NKtkAis", title: "【スペイン穴場】3度も「世界一住みやすい街」に選ばれたバレンシアの暮らしが最高すぎた", note: { en: "Long vlog on daily life and cooking in an Airbnb.", ja: "Airbnbでの自炊生活を含むロングVlog。" } },
];

function VideoCard({ v }: { v: Video }) {
  const { t } = useLang();
  const [play, setPlay] = useState(false);
  return (
    <article className="overflow-hidden rounded border border-stone-200 bg-white">
      <div className="relative aspect-video bg-stone-200">
        {play ? (
          <iframe
            className="absolute inset-0 h-full w-full"
            src={`https://www.youtube-nocookie.com/embed/${v.id}?autoplay=1&rel=0`}
            title={v.title}
            allow="autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <button onClick={() => setPlay(true)} className="group absolute inset-0" aria-label={`Play: ${v.title}`}>
            <img src={`https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`} alt="" loading="lazy" className="h-full w-full object-cover" />
            <span className="absolute inset-0 flex items-center justify-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-stone-900/80 text-white group-hover:bg-red-700">
                <Play className="h-5 w-5 fill-current" />
              </span>
            </span>
          </button>
        )}
      </div>
      <div className="p-3">
        <p className="text-sm font-medium leading-snug text-stone-900">{v.title}</p>
        <p className="mt-1 text-xs text-stone-500">{t(v.note)}</p>
        <a href={`https://www.youtube.com/watch?v=${v.id}`} target="_blank" rel="noreferrer" className="mt-2 inline-block text-xs font-medium text-indigo-700 hover:underline">
          {t({ en: "Open on YouTube", ja: "YouTubeで開く" })}
        </a>
      </div>
    </article>
  );
}

export default function Videos() {
  const { t } = useLang();
  return (
    <>
      <PageHead
        eyebrow={{ en: "Videos", ja: "動画" }}
        title={{ en: "Life in Valencia", ja: "バレンシアの暮らし" }}
        intro={{ en: "A shortlist to watch together: English videos on cost and daily life, and Japanese vlogs from people living there.", ja: "二人で観る動画リスト：費用や日常についての英語の動画と、現地に住む日本人のVlog。" }}
      />
      <h2 className="mb-3 font-serif text-xl font-semibold text-stone-900">{t({ en: "In English", ja: "英語" })}</h2>
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {ENGLISH.map((v) => <VideoCard key={v.id} v={v} />)}
      </div>
      <h2 className="mb-3 font-serif text-xl font-semibold text-stone-900">{t({ en: "Japanese vlogs", ja: "日本語のVlog" })}</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {JAPANESE.map((v) => <VideoCard key={v.id} v={v} />)}
      </div>
    </>
  );
}
