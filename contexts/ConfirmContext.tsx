"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { ConfirmModal } from "../components/ConfirmModal";

export type ConfirmOptions = {
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** 취소 버튼 숨김 (성공/안내용 단일 확인 모달) */
  hideCancel?: boolean;
  /** 확인 버튼 색상. 기본 danger(빨강), primary(브랜드) 선택 가능 */
  tone?: "danger" | "primary";
};

export type AlertOptions = Omit<ConfirmOptions, "cancelLabel" | "hideCancel">;

type InternalConfirmState = ConfirmOptions & {
  isOpen: boolean;
  resolve?: (value: boolean) => void;
};

type ConfirmContextValue = {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
  /** 단일 확인 버튼 안내 모달. 닫히면 resolve된다(성공 알림 등). */
  alert: (options: AlertOptions) => Promise<void>;
};

const ConfirmContext = createContext<ConfirmContextValue | null>(null);

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<InternalConfirmState | null>(null);

  const confirm = useCallback((options: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      setState({
        ...options,
        isOpen: true,
        resolve,
      });
    });
  }, []);

  const alert = useCallback(
    (options: AlertOptions) =>
      confirm({
        confirmLabel: "확인",
        tone: "primary",
        ...options,
        hideCancel: true,
      }).then(() => undefined),
    [confirm]
  );

  const handleResolve = (value: boolean) => {
    setState((prev) => {
      if (prev?.resolve) {
        prev.resolve(value);
      }
      return prev ? { ...prev, isOpen: false, resolve: undefined } : prev;
    });
  };

  return (
    <ConfirmContext.Provider value={{ confirm, alert }}>
      {children}
      {/* Global Confirm Modal Host */}
      {state?.isOpen && (
        <ConfirmModal
          open={state.isOpen}
          title={state.title}
          description={state.description}
          confirmLabel={state.confirmLabel || "확인"}
          cancelLabel={state.cancelLabel || "취소"}
          hideCancel={state.hideCancel}
          tone={state.tone}
          onClose={() => handleResolve(false)}
          onConfirm={() => handleResolve(true)}
        />
      )}
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) {
    throw new Error("useConfirm must be used within ConfirmProvider");
  }
  return ctx.confirm;
}

export function useAlert() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) {
    throw new Error("useAlert must be used within ConfirmProvider");
  }
  return ctx.alert;
}
