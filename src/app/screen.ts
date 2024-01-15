import computer_init, { render as computer_render } from "core";

self.onmessage = (e) => {
  let initialized = computer_init(undefined, e.data.memory);
  let ctx = e.data.canvas.getContext("2d");
  ctx.fillStyle = "rgb(177, 247, 121)";

  self.onmessage = async () => {
    await initialized;
    computer_render(ctx);
  };
};

self.postMessage("ready");
