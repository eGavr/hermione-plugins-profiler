import EventEmitter from "events";

import oboe from "oboe";

const MAX_BUFFER_LENGTH = 100;

enum Events {
  chunk = "chunk",
  error = "error",
  complete = "complete",
  start = "start",
}

interface IFileLoader extends NodeJS.EventEmitter {
  on(event: `${Events.chunk}`, cb: (items: any[]) => void): this;
  on(event: `${Events.error}`, cb: (msg: string) => void): this;
  on(event: `${Events.start}`, cb: () => void): this;
  on(event: `${Events.complete}`, cb: () => void): this;
}

export const loadFile = (filePath: string) => {
  const emitter: IFileLoader = new EventEmitter();
  const stream = oboe(filePath);
  let hasErr = false;
  let buffer: any[] = [];
  const emitData = () => {
    emitter.emit(Events.chunk, buffer.concat());
    buffer = [];
  };

  stream
    .node("root.*", (node: any) => {
      buffer.push(node);

      if (buffer.length === MAX_BUFFER_LENGTH) {
        emitData();
      }
    })
    .on("start", () => emitter.emit(Events.start))
    .fail((err) => {
      const msg = err.body || err.thrown?.message || String(err);

      emitter.emit("error", msg);
      hasErr = true;
    })
    .done(() => {
      if (buffer.length > 0) {
        emitData();
      }

      if (!hasErr) {
        emitter.emit(Events.complete);
      }
    });

  return emitter;
};
