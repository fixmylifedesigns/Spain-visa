"use client";

import { useLang, type Bi } from "@/components/Lang";
import { Bullets, P, PageHead, Section, Source, Warn } from "@/components/Page";
import { ChecklistList, items } from "@/components/Checklist";

const STEPS: { title: Bi; body: Bi }[] = [
  { title: { en: "Fill in form DP-1", ja: "DP-1様式に記入" }, body: { en: "The California Declaration of Domestic Partnership. We both sign the same original.", ja: "カリフォルニア州ドメスティック・パートナーシップ宣言書。二人で同じ原本に署名。" } },
  { title: { en: "Notarize both signatures", ja: "両者の署名を公証" }, body: { en: "Signatures can be notarized separately, including abroad through an accepted notary route.", ja: "署名は別々に公証でき、認められた方法であれば海外でも可能。" } },
  { title: { en: "File with the Secretary of State", ja: "州務長官に提出" }, body: { en: "Mail or courier the original with the current state fee.", ja: "原本と所定の手数料を郵送または配送業者で提出。" } },
  { title: { en: "Order a certified copy", ja: "認証謄本を取得" }, body: { en: "The file-stamped certified declaration is what Spain needs, not a decorative certificate.", ja: "スペインで必要なのは受付印入りの認証謄本で、記念証明書ではありません。" } },
  { title: { en: "California apostille", ja: "カリフォルニア州のアポスティーユ" }, body: { en: "The Secretary of State apostilles the certified copy.", ja: "州務長官が認証謄本にアポスティーユを付与。" } },
  { title: { en: "Sworn Spanish translation", ja: "スペイン語の宣誓翻訳" }, body: { en: "A traductor jurado translates the whole apostilled packet, after the apostille, never before.", ja: "アポスティーユ取得後に、宣誓翻訳者（トラドゥクトール・フラード）が一式を翻訳。順番を逆にしない。" } },
  { title: { en: "File with Moeno's application", ja: "モエノの申請に添付" }, body: { en: "It becomes the proof of our relationship in her family-member application.", ja: "家族申請における二人の関係の証明になります。" } },
];

export default function Partnership() {
  const { t } = useLang();
  const rows = items.filter((i) => i.workflow === "domestic-partnership" || i.id === "dep-relationship");
  return (
    <>
      <PageHead
        eyebrow={{ en: "California registered domestic partnership", ja: "カリフォルニア州 登録ドメスティック・パートナーシップ" }}
        title={{ en: "Our relationship document for Spain", ja: "スペイン申請用の関係証明" }}
        intro={{
          en: "Moeno applies as Irving's family member, so we need to prove our relationship. Our plan is to use a California registered domestic partnership instead of registering a Spanish pareja de hecho.",
          ja: "モエノはアーヴィングの家族として申請するため、二人の関係を証明する必要があります。スペインのパレハ・デ・エチョ（事実婚登録）ではなく、カリフォルニア州の登録ドメスティック・パートナーシップを使う計画です。",
        }}
      />

      <Section title={{ en: "Why California instead of pareja de hecho", ja: "パレハ・デ・エチョではなくカリフォルニアを選ぶ理由" }}>
        <Bullets
          items={[
            { en: "Spain accepts a registered union. The UGE guidance for family members lists a certificate of registration of the partnership in a public registry. California's Domestic Partners Registry is a public state registry.", ja: "スペインは登録されたパートナー関係を認めています。UGEの家族向け案内には「公的登録簿におけるパートナー関係の登録証明書」が挙げられており、カリフォルニア州のドメスティック・パートナー登録簿は州の公的登録簿です。" },
            { en: "A Spanish pareja de hecho needs us to live there first. Regional registries generally require padrón in that region, so we couldn't register before filing in Málaga, and it would tie us to one city.", ja: "スペインのパレハ・デ・エチョは先に現地に住む必要があります。各州の登録簿は一般的にその地域での住民登録を求めるため、マラガでの申請前には登録できず、特定の都市に縛られてしまいます。" },
            { en: "Without any registration, we'd have to prove at least one continuous year of living together right before applying, with several kinds of evidence like joint accounts or a shared lease.", ja: "登録がない場合、申請直前に1年以上継続して同居していたことを、共同口座や共同の賃貸契約など複数の証拠で証明する必要があります。" },
            { en: "Lawyers note that a registered partner can be covered as a beneficiary, while an unregistered partner must bring separate health insurance.", ja: "弁護士によると、登録パートナーは扶養者として保障の対象になり得ますが、未登録の場合は個別に医療保険を用意する必要があります。" },
            { en: "We can do the whole thing from Japan: sign, notarize and file by mail.", ja: "署名・公証・郵送提出まで、すべて日本から手続きできます。" },
          ]}
        />
        <div className="flex flex-wrap gap-4 pt-1">
          <Source href="https://www.inclusion.gob.es/documents/d/unidadgrandesempresas/informacion-documentacion-pagina-web-familiares-v2" label={{ en: "UGE family-member guidance", ja: "UGE 家族向け案内" }} />
          <Source href="https://www.sos.ca.gov/registries/domestic-partners-registry" label={{ en: "California Domestic Partners Registry", ja: "カリフォルニア州 ドメスティック・パートナー登録" }} />
        </div>
      </Section>

      <Section title={{ en: "Step by step", ja: "手順" }}>
        <ol className="space-y-3">
          {STEPS.map((s, i) => (
            <li key={i} className="flex gap-3">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-stone-800 font-mono text-xs text-white">{i + 1}</span>
              <div>
                <p className="font-medium text-stone-900">{t(s.title)}</p>
                <p className="text-stone-600">{t(s.body)}</p>
              </div>
            </li>
          ))}
        </ol>
        <div className="flex flex-wrap gap-4 pt-1">
          <Source href="https://www.sos.ca.gov/registries/domestic-partners-registry/forms-fees" label={{ en: "DP-1 forms and fees", ja: "DP-1様式と手数料" }} />
          <Source href="https://www.sos.ca.gov/notary/request-apostille" label={{ en: "California apostille", ja: "カリフォルニア州アポスティーユ" }} />
        </div>
      </Section>

      <Warn
        title={{ en: "Before we rely on it:", ja: "確定する前に：" }}
        body={{
          en: "have our lawyer confirm the UGE will treat the California partnership as a registered union, get the certified copy close to filing so it's fresh, and keep backup evidence of our life together. A Spanish pareja de hecho stays a fallback once we live in Valencia.",
          ja: "UGEがカリフォルニアのパートナーシップを登録された関係として扱うか弁護士に確認すること。認証謄本は新しい日付になるよう申請直前に取得し、二人の生活の証拠も予備として保管。スペインのパレハ・デ・エチョはバレンシアに住んだ後の予備案として残します。",
        }}
      />

      <Section title={{ en: "Our checklist items", ja: "チェックリストの該当項目" }}>
        <P c={{ en: "Straight from the Google Sheet.", ja: "Googleスプレッドシートから。" }} />
        <ChecklistList list={rows} />
      </Section>
    </>
  );
}
