self.onmessage = function (e) {
  let ctx = e.data.getContext("2d");
  self.onmessage = () => {
    const imageData = ctx.createImageData(212, 256);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      data[i] = 0;
      data[i + 1] = 0;
      data[i + 2] = 0;
      data[i + 3] = 255;
    }
    for (let i = 50; i < 120; i++) {
      for (let j = 50; j < 120; j++) {
        const index = (i + j * imageData.width) * 4;
        data[index] = 255;
        data[index + 1] = 0;
        data[index + 2] = 0;
        data[index + 3] = 255;
      }
    }
    ctx.putImageData(imageData, 0, 0);
    // ctx.commit();
  };
};
