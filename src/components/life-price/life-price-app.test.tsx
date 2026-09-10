import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LifePriceApp } from "./life-price-app";

describe("Life Price core flow", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  const savedStore = () => ({
    schemaVersion: 1,
    settings: {
      monthlyIncome: 8000,
      workDaysPerWeek: 5,
      workHoursPerDay: 8,
      hourlyIncome: 46.153846,
      updatedAt: new Date().toISOString(),
    },
    decisions: [{
      id: "coat",
      name: "一件外套",
      price: 699,
      workMinutes: 909,
      workDays: 1.89,
      workHoursPerDay: 8,
      usageCount: 20,
      costPerUse: 34.95,
      minutesPerUse: 45,
      decision: "skip",
      createdAt: new Date().toISOString(),
    }],
  });

  it("completes onboarding, calculates time, and saves only a skipped decision", async () => {
    const user = userEvent.setup();
    render(<LifePriceApp />);

    expect(await screen.findByRole("heading", { name: /先认识一下\s*你的时间/ })).toBeInTheDocument();
    await user.type(screen.getByLabelText("月收入"), "8000");
    await user.click(screen.getByRole("button", { name: "开始换算" }));

    expect(screen.getByRole("heading", { name: /你想买的东西\s*多少钱？/ })).toBeInTheDocument();
    await user.type(await screen.findByLabelText("商品价格"), "699");
    await user.click(screen.getByRole("button", { name: "换算" }));

    expect(screen.getByText("15小时09分钟")).toBeInTheDocument();
    expect(screen.getByText("≈ 1.89 个工作日")).toBeInTheDocument();

    await user.type(screen.getByLabelText("它是什么？（可选）"), "一件外套");
    await user.type(screen.getByLabelText("预计使用次数"), "20");
    expect(screen.getByText("¥34.95 / 次")).toBeInTheDocument();
    expect(screen.getByText(/约45分钟工作时间/)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "算了" }));
    expect(screen.getByRole("heading", { name: /你留下了\s*15小时09分钟/ })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "前往人生时间" }));
    expect(screen.getByText("一件外套")).toBeInTheDocument();
    expect(screen.getByText("¥699")).toBeInTheDocument();
  });

  it("does not save a decision marked worth exchanging", async () => {
    localStorage.setItem("life-price:v1", JSON.stringify({
      schemaVersion: 1,
      settings: {
        monthlyIncome: 8000,
        workDaysPerWeek: 5,
        workHoursPerDay: 8,
        hourlyIncome: 46.153846,
        updatedAt: new Date().toISOString(),
      },
      decisions: [],
    }));
    const user = userEvent.setup();
    render(<LifePriceApp />);

    await user.type(await screen.findByLabelText("商品价格"), "699");
    await user.click(screen.getByRole("button", { name: "换算" }));
    await user.click(screen.getByRole("button", { name: "值得交换" }));
    expect(screen.getByText("好，那就把这段时间换给它。")) .toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "前往人生时间" }));
    expect(screen.getByText("还没有留下记录")) .toBeInTheDocument();
  });

  it("shows a protected-memory warning for damaged storage without replacing it", async () => {
    localStorage.setItem("life-price:v1", "{damaged");
    render(<LifePriceApp />);
    expect(await screen.findByRole("status")).toHaveTextContent("刷新后可能无法保留数据");
    expect(localStorage.getItem("life-price:v1")).toBe("{damaged");
  });

  it("deletes a selected history record after confirmation", async () => {
    localStorage.setItem("life-price:v1", JSON.stringify(savedStore()));
    vi.spyOn(window, "confirm").mockReturnValue(true);
    const user = userEvent.setup();
    render(<LifePriceApp />);

    await user.click(await screen.findByRole("button", { name: "前往人生时间" }));
    await user.click(screen.getByRole("button", { name: /一件外套/ }));
    await user.click(screen.getByRole("button", { name: "删除记录" }));
    expect(screen.getByText("还没有留下记录")).toBeInTheDocument();
  });

  it("clears settings and history after confirmation", async () => {
    localStorage.setItem("life-price:v1", JSON.stringify(savedStore()));
    vi.spyOn(window, "confirm").mockReturnValue(true);
    const user = userEvent.setup();
    render(<LifePriceApp />);

    await user.click(await screen.findByRole("button", { name: "前往设置" }));
    await user.click(screen.getByRole("button", { name: "清除全部数据" }));
    expect(screen.getByRole("heading", { name: /先认识一下\s*你的时间/ })).toBeInTheDocument();
    expect(localStorage.getItem("life-price:v1")).toBeNull();
  });
});
