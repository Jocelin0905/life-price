"use client";

import { ArrowRight, RotateCcw } from "lucide-react";
import { useMemo, useState } from "react";
import { calculatePriceResult, calculateUsageCost } from "../../domain/calculations";
import { formatCurrency, formatWorkMinutes } from "../../domain/formatting";
import { parsePositiveNumber } from "../../domain/validation";
import type { DecisionRecord, UserSettings } from "../../domain/types";

type Stage = "entry" | "result" | "worth" | "skip";

export function Calculator({ settings, onSkip }: { settings: UserSettings; onSkip: (record: DecisionRecord) => void }) {
  const [priceInput, setPriceInput] = useState("");
  const [name, setName] = useState("");
  const [usageInput, setUsageInput] = useState("");
  const [stage, setStage] = useState<Stage>("entry");
  const [price, setPrice] = useState<number | null>(null);

  const result = useMemo(() => price ? calculatePriceResult(price, settings) : null, [price, settings]);
  const usage = useMemo(() => {
    if (!result || !usageInput) return null;
    const count = Number(usageInput);
    if (!Number.isInteger(count) || count <= 0) return null;
    return calculateUsageCost(result.price, result.workMinutes, count);
  }, [result, usageInput]);

  const reset = () => {
    setPriceInput(""); setName(""); setUsageInput(""); setPrice(null); setStage("entry");
  };

  if ((stage === "worth" || stage === "skip") && result) {
    return (
      <section className="decision-feedback page-enter">
        <div className={stage === "skip" ? "feedback-orbit saved" : "feedback-orbit"}><span /></div>
        {stage === "skip" ? (
          <><p>这一刻，你没有交换。</p><h1>你留下了<br /><strong>{formatWorkMinutes(result.workMinutes)}</strong></h1></>
        ) : (
          <><p>这是一次清楚的选择。</p><h1>好，那就把这段时间<br />换给它。</h1></>
        )}
        <button className="text-button" type="button" onClick={reset}><RotateCcw size={17} />再算一笔</button>
      </section>
    );
  }

  if (stage === "entry") {
    const parsedPrice = parsePositiveNumber(priceInput);
    return (
      <section className="price-entry page-enter">
        <div className="time-symbol" aria-hidden="true"><span className="time-hand" /></div>
        <div>
          <p className="eyebrow">换一个角度看价格</p>
          <h1>你想买的东西<br />多少钱？</h1>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); if (parsedPrice) { setPrice(parsedPrice); setStage("result"); } }}>
          <label className="hero-price-input">
            <span className="sr-only">商品价格</span><b>¥</b>
            <input aria-label="商品价格" inputMode="decimal" value={priceInput} onChange={(e) => setPriceInput(e.target.value)} placeholder="699" autoFocus />
          </label>
          <button className="primary-button" type="submit" disabled={!parsedPrice}>换算 <ArrowRight size={19} /></button>
        </form>
        <p className="gentle-note">钱花出去之前，先看看它需要多少时间。</p>
      </section>
    );
  }

  if (!result) return null;
  const usageInvalid = usageInput !== "" && !usage;

  const saveSkip = () => {
    onSkip({
      id: typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `lp_${Date.now()}`,
      name: name.trim() || "未命名消费",
      price: result.price,
      workMinutes: result.workMinutes,
      workDays: result.workDays,
      workHoursPerDay: settings.workHoursPerDay,
      usageCount: usage?.usageCount ?? null,
      costPerUse: usage?.costPerUse ?? null,
      minutesPerUse: usage?.minutesPerUse ?? null,
      decision: "skip",
      createdAt: new Date().toISOString(),
    });
    setStage("skip");
  };

  return (
    <section className="result-page page-enter">
      <button className="back-link" type="button" onClick={reset}>重新输入</button>
      <div className="result-hero">
        <span className="result-price">{formatCurrency(result.price)}</span>
        <p>需要交换</p>
        <h1>{formatWorkMinutes(result.workMinutes)}</h1>
        <p>的工作时间</p>
        <strong>≈ {result.workDays.toFixed(2)} 个工作日</strong>
      </div>

      <div className="optional-section">
        <label className="field">
          <span>它是什么？（可选）</span>
          <input aria-label="它是什么？（可选）" value={name} onChange={(e) => setName(e.target.value)} placeholder="一双鞋 / AirPods / 一顿大餐……" />
        </label>
        <div className="usage-block">
          <label className="field">
            <span>你预计会使用多少次？</span>
            <span className="unit-field"><input aria-label="预计使用次数" inputMode="numeric" value={usageInput} onChange={(e) => setUsageInput(e.target.value)} placeholder="20" /><b>次</b></span>
          </label>
          {usageInvalid && <p className="field-error">请输入大于 0 的整数。</p>}
          {usage && (
            <div className="usage-result page-enter">
              <strong>{formatCurrency(usage.costPerUse)} / 次</strong>
              <p>每次使用，相当于约{formatWorkMinutes(usage.minutesPerUse)}工作时间。</p>
            </div>
          )}
          {!usageInput && <p className="skip-usage">暂时不算使用成本，也可以继续决定。</p>}
        </div>
      </div>

      <div className="decision-actions">
        <button className="primary-button" type="button" onClick={() => setStage("worth")}>值得交换</button>
        <button className="secondary-button" type="button" onClick={saveSkip}>算了</button>
      </div>
    </section>
  );
}
