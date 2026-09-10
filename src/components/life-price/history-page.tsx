"use client";

import { ChevronRight, Trash2, X } from "lucide-react";
import { useMemo, useState } from "react";
import { calculateMonthlySummary, getLocalMonthKey } from "../../domain/calculations";
import { formatCurrency, formatLocalDate, formatMonthLabel, formatWorkMinutes } from "../../domain/formatting";
import type { DecisionRecord } from "../../domain/types";

export function HistoryPage({ decisions, onDelete }: { decisions: DecisionRecord[]; onDelete: (id: string) => void }) {
  const currentKey = getLocalMonthKey(new Date());
  const monthKeys = useMemo(() => Array.from(new Set([currentKey, ...decisions.map((record) => getLocalMonthKey(record.createdAt))])).filter(Boolean).sort().reverse(), [currentKey, decisions]);
  const [monthKey, setMonthKey] = useState(currentKey);
  const [selected, setSelected] = useState<DecisionRecord | null>(null);
  const records = decisions.filter((record) => getLocalMonthKey(record.createdAt) === monthKey).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const summary = calculateMonthlySummary(decisions, monthKey);

  return (
    <section className="history-page page-enter">
      <div className="page-heading">
        <p className="eyebrow">没有发生的消费</p>
        <h1>我保住的人生时间</h1>
        <p>按你当时的收入折算，这些选择相当于多少工作时间。</p>
      </div>

      <label className="month-select">
        <span className="sr-only">选择月份</span>
        <select value={monthKey} onChange={(e) => setMonthKey(e.target.value)}>
          {monthKeys.map((key) => <option key={key} value={key}>{formatMonthLabel(key, currentKey)}</option>)}
        </select>
      </label>

      <div className="summary-block">
        <span>{formatMonthLabel(monthKey, currentKey)}</span>
        <p>你放弃了</p>
        <strong>{formatCurrency(summary.totalPrice)}</strong>
        <p>的消费，相当于</p>
        <h2>{formatWorkMinutes(summary.totalMinutes)}</h2>
        <small>约 {summary.totalWorkDays.toFixed(2)} 个工作日</small>
      </div>

      {records.length ? (
        <div className="history-list">
          {records.map((record) => (
            <button key={record.id} type="button" onClick={() => setSelected(record)}>
              <span><strong>{record.name}</strong><small>{formatCurrency(record.price)} · {formatLocalDate(record.createdAt)}</small></span>
              <span className="record-time">{formatWorkMinutes(record.workMinutes)}<ChevronRight size={18} /></span>
            </button>
          ))}
        </div>
      ) : (
        <div className="empty-state"><span className="empty-clock" /><h2>还没有留下记录</h2><p>当你选择“算了”，时间会在这里慢慢累积。</p></div>
      )}

      {selected && (
        <div className="dialog-backdrop" role="presentation" onMouseDown={() => setSelected(null)}>
          <section className="detail-sheet" role="dialog" aria-modal="true" aria-labelledby="detail-title" onMouseDown={(e) => e.stopPropagation()}>
            <button className="icon-button" type="button" aria-label="关闭详情" onClick={() => setSelected(null)}><X size={21} /></button>
            <p className="eyebrow">消费详情</p>
            <h2 id="detail-title">{selected.name}</h2>
            <dl>
              <div><dt>价格</dt><dd>{formatCurrency(selected.price)}</dd></div>
              <div><dt>等价工作时间</dt><dd>{formatWorkMinutes(selected.workMinutes)}</dd></div>
              <div><dt>等价工作日</dt><dd>{selected.workDays.toFixed(2)} 天</dd></div>
              {selected.usageCount !== null && <div><dt>预计使用次数</dt><dd>{selected.usageCount} 次</dd></div>}
              {selected.costPerUse !== null && <div><dt>单次价格</dt><dd>{formatCurrency(selected.costPerUse)}</dd></div>}
              {selected.minutesPerUse !== null && <div><dt>单次等价时间</dt><dd>{formatWorkMinutes(selected.minutesPerUse)}</dd></div>}
              <div><dt>创建日期</dt><dd>{new Intl.DateTimeFormat("zh-CN", { dateStyle: "long" }).format(new Date(selected.createdAt))}</dd></div>
            </dl>
            <button className="danger-button" type="button" onClick={() => { if (window.confirm("确定删除这条记录吗？")) { onDelete(selected.id); setSelected(null); } }}><Trash2 size={17} />删除记录</button>
          </section>
        </div>
      )}
    </section>
  );
}
