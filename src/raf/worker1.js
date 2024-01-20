requestAnimationFrame(() => self.postMessage("worker1 works"));
new Worker('worker2.js').onmessage = () => self.postMessage("worker2 works");