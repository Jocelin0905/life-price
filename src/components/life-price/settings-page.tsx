"use client";

import { ShieldCheck, Trash2 } from "lucide-react";
import type { UserSettings } from "../../domain/types";
import { SettingsForm } from "./settings-form";

export function SettingsPage({ settings, onSave, onClear }: { settings: UserSettings; onSave: (settings: UserSettings) => void; onClear: () => void }) {
  return (
    <section className="settings-page page-enter">
      <div className="page-heading"><p className="eyebrow">你的时间基准</p><h1>我的收入</h1><p>修改后只影响新的换算，过去的记录不会改变。</p></div>
      <SettingsForm initial={settings} submitLabel="保存修改" onSubmit={onSave} />
      <div className="data-note"><ShieldCheck size={22} /><div><strong>数据只属于你</strong><p>所有数据仅保存在当前浏览器中。Life Price 不会上传你的收入或消费数据。</p></div></div>
      <button className="danger-button" type="button" onClick={() => { if (window.confirm("确定删除所有设置和历史记录吗？")) onClear(); }}><Trash2 size={17} />清除全部数据</button>
    </section>
  );
}
