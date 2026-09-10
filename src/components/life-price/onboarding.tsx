"use client";

import type { UserSettings } from "../../domain/types";
import { SettingsForm } from "./settings-form";

export function Onboarding({ onSave }: { onSave: (settings: UserSettings) => void }) {
  return (
    <section className="onboarding page-enter">
      <div className="eyebrow">让价格重新有感觉</div>
      <h1>先认识一下<br />你的时间</h1>
      <p className="intro">告诉我们你的工作节奏，Life Price 会把价格换算成你真正付出的时间。</p>
      <SettingsForm submitLabel="开始换算" onSubmit={onSave} />
      <p className="privacy-note">所有数据仅保存在当前浏览器中。</p>
    </section>
  );
}
