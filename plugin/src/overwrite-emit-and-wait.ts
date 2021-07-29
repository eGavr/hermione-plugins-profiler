import { HermioneEvent } from "./types";

export function overwriteEmitAndWait({
  emitAndWait,
  onInit,
  onFinish,
}: {
  emitAndWait: Hermione["emitAndWait"];
  onInit: () => Promise<any>;
  onFinish: () => Promise<any>;
}): Hermione["emitAndWait"] {
  return (event: HermioneEvent, ...args: any[]) => {
    const emit = () => emitAndWait(event, ...args);

    if (event === "init") {
      return onInit().then(() => emit());
    }

    if (event === "endRunner") {
      return emit().finally(() => onFinish());
    }

    return emit();
  };
}
