"use client";

import Link from "next/link";
import { useLang, type Bi } from "@/components/Lang";
import { Bullets, PageHead, Source, Warn } from "@/components/Page";

type Phase = { where: Bi; when: Bi; title: Bi; steps: Bi[]; note?: { title: Bi; body: Bi }; sources?: { href: string; label: Bi }[] };

const PHASES: Phase[] = [
  {
    where: { en: "Japan", ja: "日本" },
    when: { en: "Now → filing day", ja: "今 → 申請日" },
    title: { en: "Build the paperwork", ja: "書類をそろえる" },
    steps: [
      { en: "Register our California domestic partnership, then get the certified copy, apostille and sworn Spanish translation.", ja: "カリフォルニア州でドメスティック・パートナーシップを登録し、認証謄本・アポスティーユ・スペイン語の宣誓翻訳を取得。" },
      { en: "Employer requests the SSA Certificate of Coverage and signs the Spain posted-worker letter (lawyer reviews the wording).", ja: "雇用主がSSAの適用証明書を申請し、スペイン赴任レターに署名（文言は弁護士が確認）。" },
      { en: "Order police certificates (FBI and Japan), experience evidence and Spain-compliant health insurance for both of us.", ja: "犯罪経歴証明（FBI・日本）、職歴の証明、スペインの基準を満たす医療保険（二人分）を用意。" },
      { en: "Start Mui's prep: microchip and rabies check, Iberia booking, Japan export inspection.", ja: "ムイの準備開始：マイクロチップと狂犬病ワクチンの確認、イベリア航空の予約、日本の輸出検査。" },
    ],
  },
  {
    where: { en: "Málaga", ja: "マラガ" },
    when: { en: "Arrival → approval", ja: "到着 → 許可" },
    title: { en: "File the Digital Nomad Visa", ja: "デジタルノマドビザを申請" },
    steps: [
      { en: "Enter Spain lawfully and keep every proof of entry (boarding passes, stamp).", ja: "合法的にスペインへ入国し、入国の証拠（搭乗券・スタンプ）をすべて保管。" },
      { en: "Our lawyer files Irving's teleworker residence permit online with the UGE, with Moeno's family-member application at the same time.", ja: "弁護士がUGEにアーヴィングのテレワーカー居住許可をオンライン申請。同時にモエノの家族申請も提出。" },
      { en: "The filing is online and based on lawful presence in Spain, so we don't need padrón in Málaga for this step.", ja: "申請はオンラインで、スペインに合法的に滞在していることが条件のため、この段階でマラガの住民登録は不要。" },
      { en: "Wait for the favourable resolution. The official guidance is a 20-day decision window.", ja: "許可決定を待つ。公式の案内では審査期間は20日。" },
    ],
    sources: [
      { href: "https://www.inclusion.gob.es/web/unidadgrandesempresas/teletrabajadores", label: { en: "UGE — Teleworkers", ja: "UGE — テレワーカー" } },
      { href: "https://www.inclusion.gob.es/documents/d/unidadgrandesempresas/informacion-documentacion-pagina-web-familiares-v2", label: { en: "UGE — Family members", ja: "UGE — 家族" } },
    ],
  },
  {
    where: { en: "Madrid", ja: "マドリード" },
    when: { en: "Within 1 month of approval", ja: "許可から1か月以内" },
    title: { en: "Get our TIE cards", ja: "TIE（外国人身分証）を取得" },
    steps: [
      { en: "Book fingerprint appointments (toma de huellas) for both of us as soon as the approvals arrive.", ja: "許可が出たらすぐに二人分の指紋採取（トマ・デ・ウエジャス）を予約。" },
      { en: "Bring passports, both approval letters, the EX-17 form, photos and the paid fee (Modelo 790, código 012).", ja: "パスポート、許可通知、EX-17申請書、写真、手数料の支払い証明（790様式・コード012）を持参。" },
      { en: "Collect the cards a few weeks later and keep copies.", ja: "数週間後にカードを受け取り、コピーを保管。" },
    ],
    note: {
      title: { en: "Confirm with our lawyer:", ja: "弁護士に確認：" },
      body: {
        en: "the TIE is normally issued in the province where you live, and many police offices ask for padrón as proof of address. Ask exactly what address proof the Madrid office will accept from us, and plan to update the address once we're registered in Valencia.",
        ja: "TIEは通常、居住している県で発行され、多くの警察署で住所証明として住民登録（パドロン）を求められます。マドリードの窓口がどの住所証明を受け付けるか正確に確認し、バレンシアで住民登録した後に住所変更する予定を立てておくこと。",
      },
    },
  },
  {
    where: { en: "Valencia", ja: "バレンシア" },
    when: { en: "After the TIE", ja: "TIE取得後" },
    title: { en: "Make it home", ja: "新しい家へ" },
    steps: [
      { en: "Pick a flat that allows padrón and Mui, ideally with both our names on the lease.", ja: "住民登録とムイが可能な物件を選ぶ。できれば二人の名義で契約。" },
      { en: "Register both of us on the padrón. This starts our residence evidence for citizenship.", ja: "二人とも住民登録。これが国籍申請のための居住証明の始まり。" },
      { en: "Update our address with the police/extranjería, N26, insurance and our tax adviser.", ja: "警察・外国人局、N26、保険、税理士に住所変更を届け出る。" },
      { en: "Register Mui with the local council, find a vet and get her EU pet passport.", ja: "ムイを市役所に登録し、獣医を見つけてEUペットパスポートを取得。" },
    ],
  },
  {
    where: { en: "Ongoing", ja: "継続" },
    when: { en: "From day one", ja: "初日から" },
    title: { en: "Protect the long game", ja: "長期計画を守る" },
    steps: [
      { en: "Keep a complete travel log for the 2-year citizenship route.", ja: "2年での国籍取得ルートのため、出入国記録をすべて残す。" },
      { en: "Ask the tax adviser about the Beckham regime deadline right after approval.", ja: "許可後すぐに税理士にベッカム法の申請期限を確認。" },
      { en: "Plan the CCSE exam around months 15–20.", ja: "CCSE試験は15〜20か月目ごろに受験予定。" },
    ],
  },
];

export default function Plan() {
  const { t } = useLang();
  return (
    <>
      <PageHead
        eyebrow={{ en: "Game plan", ja: "ゲームプラン" }}
        title={{ en: "Málaga → Madrid → Valencia", ja: "マラガ → マドリード → バレンシア" }}
        intro={{
          en: "We file the visa from Málaga and get our TIE in Madrid, since neither step needs us registered at an address there. That buys us time to find the right home in Valencia.",
          ja: "ビザはマラガから申請し、TIEはマドリードで取得します。どちらもその場所での住民登録を前提にしないため、バレンシアでじっくり家を探す時間が取れます。",
        }}
      />
      <ol className="relative space-y-5 border-l-2 border-stone-300 pl-5">
        {PHASES.map((p, i) => (
          <li key={i} className="relative">
            <span className="absolute -left-[29px] top-1 flex h-4 w-4 items-center justify-center rounded-full border-2 border-stone-800 bg-[#f7f4ec]" aria-hidden="true" />
            <section className="rounded border border-stone-200 bg-white p-5">
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-stone-500">
                {t(p.where)} · {t(p.when)}
              </p>
              <h2 className="mt-1 font-serif text-xl font-semibold text-stone-900">{t(p.title)}</h2>
              <div className="mt-3 text-sm leading-relaxed text-stone-700">
                <Bullets items={p.steps} />
              </div>
              {p.note && <div className="mt-4"><Warn title={p.note.title} body={p.note.body} /></div>}
              {p.sources && (
                <div className="mt-3 flex flex-wrap gap-4">
                  {p.sources.map((s) => <Source key={s.href} href={s.href} label={s.label} />)}
                </div>
              )}
            </section>
          </li>
        ))}
      </ol>
      <p className="mt-6 text-sm text-stone-600">
        {t({ en: "Every step maps to items in the ", ja: "各ステップの詳細は" })}
        <Link href="/checklist/" className="font-medium text-indigo-700 hover:underline">{t({ en: "checklist", ja: "チェックリスト" })}</Link>
        {t({ en: ".", ja: "にあります。" })}
      </p>
    </>
  );
}
