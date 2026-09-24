"use client";

import { useLang, type Bi } from "@/components/Lang";
import { Bullets, P, PageHead, Section, Source, Warn } from "@/components/Page";
import { ChecklistList, items, progress, SheetLink } from "@/components/Checklist";

const TIMELINE: { when: Bi; what: Bi }[] = [
  { when: { en: "3+ months before", ja: "3か月以上前" }, what: { en: "Vet checks Mui's microchip is ISO 11784/11785 and that her rabies shot came after the chip and is still valid.", ja: "獣医がマイクロチップがISO 11784/11785規格であること、狂犬病ワクチンがチップ装着後に接種され有効期限内であることを確認。" } },
  { when: { en: "2–3 months before", ja: "2〜3か月前" }, what: { en: "Book Mui on Iberia and buy a crate that fits their size rules. Airlines have limited pet spots.", ja: "イベリア航空でムイの予約を取り、規定サイズのクレートを購入。ペットの枠は限られています。" } },
  { when: { en: "At least 2 weeks before", ja: "少なくとも2週間前" }, what: { en: "Notify Japan's Animal Quarantine Service (AQS) and apply for the export inspection.", ja: "動物検疫所（AQS）に事前届出し、輸出検査を申請。" } },
  { when: { en: "Final 10 days", ja: "出発前10日以内" }, what: { en: "Vet exam and EU animal health certificate. It must be signed by an official vet no more than 10 days before Mui arrives in the EU.", ja: "獣医の診察とEU動物衛生証明書。ムイがEUに到着する前10日以内に公的獣医の署名が必要。" } },
  { when: { en: "Arrival", ja: "到着" }, what: { en: "Documents and microchip are checked at the airport of entry. No quarantine if everything is in order.", ja: "入国空港で書類とマイクロチップを確認。問題なければ係留なし。" } },
  { when: { en: "In Valencia", ja: "バレンシアで" }, what: { en: "Register Mui with the city, find a vet, and get her EU pet passport for future trips.", ja: "市にムイを登録し、獣医を見つけ、今後の旅行用にEUペットパスポートを取得。" } },
];

const TITLES: Record<string, Bi> = {
  "pet-chip": { en: "Verify Mui microchip and rabies sequencing", ja: "ムイのマイクロチップと狂犬病ワクチンの順序を確認" },
  "pet-airline": { en: "Reserve Iberia pet transport and compliant crate", ja: "イベリア航空のペット輸送と規定クレートを予約" },
  "pet-export": { en: "Japan AQS export process", ja: "動物検疫所（AQS）の輸出手続き" },
  "pet-eu-cert": { en: "EU animal health certificate / non-commercial movement declaration", ja: "EU動物衛生証明書・非商業移動の申告" },
  "pet-eu-passport": { en: "Obtain EU pet passport in Spain", ja: "スペインでEUペットパスポートを取得" },
};

export default function Mui() {
  const { t } = useLang();
  const rows = items.filter((i) => i.workflow === "pet");
  return (
    <>
      <PageHead
        eyebrow={{ en: "Mui · Japan → Spain", ja: "ムイ · 日本 → スペイン" }}
        title={{ en: "Bringing Mui home to Spain", ja: "ムイをスペインの新しい家へ" }}
        intro={{
          en: "Everything Mui needs to fly from Japan and settle in with us in Valencia.",
          ja: "ムイが日本から飛んで、バレンシアで私たちと暮らし始めるまでに必要なこと。",
        }}
      />

      <Section title={{ en: "What the EU requires", ja: "EUの要件" }}>
        <Bullets
          items={[
            { en: "An ISO microchip, implanted before the rabies vaccine.", ja: "ISO規格のマイクロチップ（狂犬病ワクチンより前に装着）。" },
            { en: "A valid rabies vaccination. After a first-ever shot, wait at least 21 days before travel.", ja: "有効な狂犬病ワクチン。初回接種の場合は、渡航まで21日以上あける。" },
            { en: "An EU animal health certificate from an official vet, issued no more than 10 days before arrival. Spain asks for it in Spanish as well as English.", ja: "公的獣医が発行するEU動物衛生証明書（到着前10日以内に発行）。スペインは英語に加えスペイン語での記載を求めます。" },
            { en: "A rabies antibody (titer) test is needed from most non-EU countries, but not from countries on the EU's list. Confirm Japan's status with our vet or the EU checker.", ja: "狂犬病抗体価検査はほとんどのEU域外の国から必要ですが、EUのリストに載っている国からは不要。日本の扱いは獣医またはEUの確認ツールで確認。" },
          ]}
        />
        <div className="flex flex-wrap gap-4 pt-1">
          <Source href="https://food.ec.europa.eu/animals/live-animal-movements/dogs-cats-and-ferrets/bringing-pet-eu-non-eu-country_en" label={{ en: "EU: bringing a pet from outside the EU", ja: "EU：域外からのペットの持ち込み" }} />
          <Source href="https://europa.eu/youreurope/citizens/travel/carry/pets-and-other-animals/index_en.htm" label={{ en: "Your Europe: pet travel checker", ja: "Your Europe：ペット渡航の確認" }} />
          <Source href="https://www.maff.go.jp/aqs/english/animal/dog/export.html" label={{ en: "Japan AQS: exporting dogs", ja: "動物検疫所：犬の輸出" }} />
        </div>
      </Section>

      <Section title={{ en: "Mui's timeline", ja: "ムイのタイムライン" }}>
        <ol className="space-y-3">
          {TIMELINE.map((s, i) => (
            <li key={i} className="grid gap-1 border-l-2 border-emerald-700 pl-3 sm:grid-cols-[10rem_1fr] sm:gap-4">
              <p className="font-mono text-xs font-medium text-emerald-800">{t(s.when)}</p>
              <p>{t(s.what)}</p>
            </li>
          ))}
        </ol>
      </Section>

      <Warn
        title={{ en: "If Mui might ever go back to Japan:", ja: "将来ムイが日本に戻る可能性があるなら：" }}
        body={{
          en: "Japan's re-entry rules need two rabies shots, an antibody test at an approved lab and a long waiting period. Ask AQS before we leave whether doing the antibody test in Japan now would shorten that later.",
          ja: "日本への再入国には狂犬病ワクチン2回、指定検査機関での抗体価検査、そして長い待機期間が必要です。出国前に、今のうちに日本で抗体価検査をしておけば後の待機を短縮できるか、動物検疫所に確認すること。",
        }}
      />

      <Section title={{ en: "In Spain", ja: "スペインで" }}>
        <Bullets
          items={[
            { en: "Choose a flat that accepts dogs in writing (the Valencia homes page only lists pet-friendly ones).", ja: "犬OKが書面で確認できる物件を選ぶ（バレンシアの物件ページはペット可のみ掲載）。" },
            { en: "Register Mui with the Valencia city council and a local vet.", ja: "バレンシア市役所と地元の獣医にムイを登録。" },
            { en: "Check the current rules on dog-owner liability insurance under Spain's animal welfare law.", ja: "スペインの動物福祉法に基づく飼い主の賠償責任保険について、最新のルールを確認。" },
            { en: "Get the EU pet passport so Mui can travel within Europe.", ja: "ヨーロッパ内を旅行できるようEUペットパスポートを取得。" },
          ]}
        />
      </Section>

      <Section title={{ en: "Mui's checklist from our Google Sheet", ja: "Googleスプレッドシートのムイのチェックリスト" }}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <P c={{ en: `${progress(rows)}% done. Update statuses in the sheet.`, ja: `進捗${progress(rows)}%。ステータスはスプレッドシートで更新。` }} />
          <SheetLink />
        </div>
        <ChecklistList list={rows} titles={TITLES} />
      </Section>
    </>
  );
}
