"use client";
import { loadLanguage } from "@/lib/storage";

export function BudgetExhaustedModal({
  open, onUseKey, onCancel,
}: { open: boolean; onUseKey: () => void; onCancel: () => void }) {
  if (!open) return null;
  const language = loadLanguage();
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4">
      <div className="card max-w-md text-center">
        <h2 className="text-lg font-semibold">
          {language === "en" ? "Monthly trial quota exhausted" : "本月试用额度已用完"}
        </h2>
        <p className="mt-2 text-sm text-neutral-600">
          {language === "en"
            ? "This demo has a monthly trial budget. You can enter your own DeepSeek API key to continue; it stays only in your browser."
            : "这个 demo 是免费提供的，每月有 ¥200 的预算。本月已经用完了。你可以输入自己的 DeepSeek API key 继续，key 仅保存在你浏览器本地，不会上传服务器。"}
        </p>
        <div className="mt-5 flex justify-center gap-3">
          <button className="btn-ghost" onClick={onCancel}>{language === "en" ? "Maybe later" : "下次再来"}</button>
          <button className="btn-primary" onClick={onUseKey}>{language === "en" ? "Enter my key" : "输入我的 key"}</button>
        </div>
      </div>
    </div>
  );
}
