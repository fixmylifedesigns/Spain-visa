"use client";

import { Bullets, P, PageHead, Section, Source, Warn } from "@/components/Page";
import { ChecklistList, items } from "@/components/Checklist";

export default function N26() {
  return (
    <>
      <PageHead
        eyebrow={{ en: "Banking · N26", ja: "銀行 · N26" }}
        title={{ en: "Our Spanish bank: N26", ja: "スペインの銀行：N26" }}
        intro={{
          en: "Irving's N26 account is already open with our NIE, so we arrive with a working Spanish account. Here's what it does for us and what to update after the move.",
          ja: "アーヴィングのN26口座はNIEを使ってすでに開設済みなので、到着時点でスペインの口座が使えます。できることと、引っ越し後に更新することをまとめました。",
        }}
      />

      <Section title={{ en: "What we get", ja: "できること" }}>
        <Bullets
          items={[
            { en: "A Spanish IBAN starting with ES. N26 has given Spanish IBANs to accounts opened in Spain since April 2019, so landlords, utilities and employers treat it as a local account.", ja: "ESで始まるスペインのIBAN。N26は2019年4月以降スペインで開設された口座にスペインのIBANを発行しているため、大家さん・公共料金・雇用主からは国内口座として扱われます。" },
            { en: "Direct debits for rent, phone, electricity and insurance.", ja: "家賃・携帯・電気・保険の口座引き落とし。" },
            { en: "Bizum for instant payments to people by phone number, which is how many landlords and friends in Spain get paid.", ja: "電話番号で即時送金できるBizum。スペインでは大家さんや友人への支払いによく使われます。" },
            { en: "Deposits protected up to €100,000.", ja: "預金は10万ユーロまで保護。" },
            { en: "Once we're Spanish residents with a local tax ID, the Instant Savings space becomes available.", ja: "スペインの居住者として税番号を持てば、インスタント貯蓄も利用可能に。" },
          ]}
        />
        <div className="flex flex-wrap gap-4 pt-1">
          <Source href="https://n26.com/en-es" label={{ en: "N26 Spain", ja: "N26 スペイン" }} />
        </div>
      </Section>

      <Section title={{ en: "Taxes", ja: "税金" }}>
        <P c={{
          en: "N26 says an account with a Spanish ES IBAN counts as a Spanish account, so it doesn't need to be declared as a foreign account. A German DE IBAN would. Check that our IBAN starts with ES.",
          ja: "N26によると、ESで始まるスペインのIBANの口座はスペインの口座として扱われるため、海外口座として申告する必要はありません（ドイツのDE IBANの場合は必要）。私たちのIBANがESで始まることを確認しておくこと。",
        }} />
        <P c={{
          en: "Our U.S. accounts are a separate question for the tax adviser once we become Spanish tax residents.",
          ja: "スペインの税務上の居住者になった後のアメリカの口座については、別途税理士に相談。",
        }} />
        <Source href="https://support.n26.com/en-eu/account-and-personal-details/taxes/do-i-have-to-declare-my-n26-account-in-spain" label={{ en: "N26 support: declaring the account", ja: "N26サポート：口座の申告" }} />
      </Section>

      <Warn
        title={{ en: "Visa bank statements:", ja: "ビザ用の銀行明細：" }}
        body={{
          en: "the DNV needs three months of statements that show salary deposits matching the pay stubs. Keep salary landing in the same account through filing, and don't move payroll to N26 before then without asking our lawyer.",
          ja: "DNVでは、給与明細と一致する給与振込が載った3か月分の明細が必要です。申請が終わるまで給与の振込先は変えず、弁護士に相談せずにN26へ切り替えないこと。",
        }}
      />

      <Section title={{ en: "After the move", ja: "引っ越し後にやること" }}>
        <Bullets
          items={[
            { en: "Update our address to the Valencia flat once we're on the padrón.", ja: "住民登録後、住所をバレンシアの物件に更新。" },
            { en: "Add the TIE number and update tax residency in the app when we become Spanish tax residents.", ja: "スペインの税務居住者になったら、アプリでTIE番号を追加し税務上の居住国を更新。" },
            { en: "Moeno can open her own N26 once she has her NIE or TIE.", ja: "モエノもNIEまたはTIEを取得すれば自分のN26口座を開設できます。" },
            { en: "The TIE fee (Modelo 790, código 012) is usually paid at a bank. Check whether N26 can pay it; if not, pay at a collaborating bank.", ja: "TIEの手数料（790様式・コード012）は通常銀行で支払います。N26で払えるか確認し、無理なら提携銀行で支払い。" },
          ]}
        />
      </Section>

      <Section title={{ en: "From our checklist", ja: "チェックリストより" }}>
        <ChecklistList list={items.filter((i) => i.id === "arrival-bank" || i.id === "dnv-bank")} />
      </Section>
    </>
  );
}
