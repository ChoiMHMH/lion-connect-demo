import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it } from "vitest";
import { ConfirmProvider, useAlert, useConfirm } from "@/contexts/ConfirmContext";

function AlertHarness() {
  const alert = useAlert();
  const [done, setDone] = useState(false);

  return (
    <div>
      <button
        type="button"
        onClick={async () => {
          await alert({ title: "채용 공고가 수정되었습니다." });
          setDone(true);
        }}
      >
        저장
      </button>
      {done && <p>리스트 이동</p>}
    </div>
  );
}

function ConfirmHarness() {
  const confirm = useConfirm();
  const [result, setResult] = useState<string>("");

  return (
    <div>
      <button
        type="button"
        onClick={async () => {
          const ok = await confirm({ title: "삭제하시겠습니까?" });
          setResult(ok ? "확인됨" : "취소됨");
        }}
      >
        삭제
      </button>
      {result && <p>{result}</p>}
    </div>
  );
}

describe("ConfirmContext alert/confirm", () => {
  it("alert는 취소 없이 단일 확인 모달을 띄우고, 확인하면 후속 동작(리스트 이동)이 이어진다", async () => {
    const user = userEvent.setup();
    render(
      <ConfirmProvider>
        <AlertHarness />
      </ConfirmProvider>
    );

    await user.click(screen.getByRole("button", { name: "저장" }));

    expect(await screen.findByText("채용 공고가 수정되었습니다.")).toBeInTheDocument();
    // 안내 모달은 취소 버튼이 없다.
    expect(screen.queryByText("취소")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "확인" }));

    await waitFor(() => {
      expect(screen.getByText("리스트 이동")).toBeInTheDocument();
    });
  });

  it("confirm은 기존대로 취소/확인 두 버튼을 유지한다", async () => {
    const user = userEvent.setup();
    render(
      <ConfirmProvider>
        <ConfirmHarness />
      </ConfirmProvider>
    );

    await user.click(screen.getByRole("button", { name: "삭제" }));

    expect(await screen.findByText("삭제하시겠습니까?")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "취소" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "확인" }));

    await waitFor(() => {
      expect(screen.getByText("확인됨")).toBeInTheDocument();
    });
  });
});
