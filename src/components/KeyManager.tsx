"use client";
import { useEffect, useState } from "react";
import { loadLanguage, loadUserKey, saveUserKey, clearUserKey } from "@/lib/storage";
import { useToast } from "./Toast";

export function KeyManager({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [key, setKey] = useState("");
  const [hasKey, setHasKey] = useState(false);
  const [language, setLanguage] = useState<"zh" | "en">("zh");
  const { push } = useToast();

  useEffect(() => {
    if (open) {
      const id = window.setTimeout(() => {
        const k = loadUserKey();
        setLanguage(loadLanguage());
        setKey(k ?? "");
        setHasKey(!!k);
      }, 0);
      return () => window.clearTimeout(id);
    }
  }, [open]);

  if (!open) return null;

  const save = () => {
    if (!key.trim()) { push(language === "en" ? "Enter an API key" : "请输入 API key", "error"); return; }
    saveUserKey(key.trim());
    push(language === "en" ? "Saved locally" : "已保存到本地", "success");
    onClose();
  };

  const remove = () => {
    clearUserKey();
    setKey("");
    setHasKey(false);
    push(language === "en" ? "Local key cleared" : "已清除本地 key", "info");
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4">
      <div className="card w-full max-w-md">
        <h2 className="text-lg font-semibold">
          {language === "en" ? "Use your own API key (optional)" : "使用你自己的 API Key（可选）"}
        </h2>
        <p className="mt-2 text-sm text-neutral-600">
          {language === "en"
            ? "You can use the built-in trial quota. Add your own key only when the quota is exhausted or you want your own limits."
            : "不需要也能用——网站默认提供免费试用额度。只有当本月额度耗尽，或你想用自己的更高配额时，才需要在这里填入。"}
        </p>
        <p className="mt-2 text-xs text-neutral-500">
          {language === "en"
            ? "DeepSeek API key. Stored only in your browser localStorage."
            : "DeepSeek API key。仅保存在你浏览器 localStorage，不会上传服务器。"}
          <a
            className="ml-1 underline"
            href={language === "en" ? "https://api-docs.deepseek.com/" : "https://platform.deepseek.com/api_keys"}
            target="_blank" rel="noreferrer"
          >
            {language === "en" ? "Get one →" : "如何获取 →"}
          </a>
        </p>
        <input
          type="password"
          className="input mt-4"
          placeholder="sk-..."
          value={key}
          onChange={(e) => setKey(e.target.value)}
        />
        <div className="mt-4 flex justify-end gap-2">
          {hasKey && (
            <button className="btn-ghost text-red-600" onClick={remove}>{language === "en" ? "Clear" : "清除"}</button>
          )}
          <button className="btn-ghost" onClick={onClose}>{language === "en" ? "Cancel" : "取消"}</button>
          <button className="btn-primary" onClick={save}>{language === "en" ? "Save" : "保存"}</button>
        </div>
      </div>
    </div>
  );
}
