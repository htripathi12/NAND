import Population from "./population.js";
import AccelerationVector from "./accelerationvector.js";
import Dot from "./dot.js";
import Util from "./util.js";
import Brain from "./brain.js";

export default class Main {
    static #brainSize;
    static #populationCount;
    static #initialX;
    static #initialY;
    static #goalX;
    static #goalY;
    static #onlyBest;
    static #obstacles;

    static #generationString;
    static #goalStepCountString;
    static #NAString;
    static #placeString;
    static #loadingString;
    static #escString;

    static init() {
        let i = 0;
        Main.#generationString = "Generation: ";
        Main.#goalStepCountString = "Goal step count: ";
        Main.#NAString = "NA";
        Main.#placeString = "Place obstacles with the arrow, enter, and delete keys.";
        Main.#escString = "Press esc to finish.";
        Main.#loadingString = "Loading...";
        Main.#obstacles = new Array(512);
        while (!(i > 511)) {
            Main.#obstacles[i] = false;
            i++;
        }
    }

    static async main() {
        Util.init();
        AccelerationVector.init();
        Population.init();
        Main.init();

        Util.drawRectangle(70, 57, 442, 154);
        Util.setColor(false);
        Util.drawRectangle(72, 59, 440, 152);
        console.log("Welcome to my genetic algorithm simulation!");
        console.log("The objective is for dots to reach a goal in");
        console.log("as little steps as possible.");
        console.log("Press any key to start.");
        await new Promise(resolve => {
            function tmp() {
                if (!(Util.keyPressed() > 0)) {
                    Util.random();
                    setTimeout(tmp, 0);
                } else {
                    resolve();
                }
            }
            tmp();
        });
        Util.drawRectangle(70, 57, 442, 154);

        Main.#initialX = 10;
        Main.#initialY = 128;
        Main.#goalX = 500;
        Main.#goalY = 128;
        Main.#onlyBest = false;
        await Main.selectObstacles();
        Util.clearScreen();
        console.log(Main.#loadingString);
        Main.#brainSize = 145;
        Main.#populationCount = 60;

        Brain.config(Main.#brainSize);
        Dot.config(Main.#initialX, Main.#initialY, Main.#goalX, Main.#goalY, Main.#brainSize, Main.#obstacles);
        Population.config(Main.#populationCount, Main.#brainSize, Main.#onlyBest);

        Main.refreshDisplay();
        window.interval = 25;
        async function tmp() {
            if (!Population.allDotsDead()) {
                Population.update();
            } else {
                Population.naturalSelection();
                if (Util.keyPressed() === 140) {
                    await Main.selectObstacles();
                }
                Main.refreshDisplay();
            }
            setTimeout(tmp, window.interval);
        }
        tmp();
    }

    static async selectObstacles() {
        let selectorX = 0;
        let selectorY = 0;
        let selectorIndex = 0;
        let key = 0;
        let drag = 0;
        let draggingEnter = 0;
        console.log(Main.#placeString);
        console.log(Main.#escString);
        selectorX = 256;
        selectorY = 112;
        selectorIndex = 240;
        key = 1;
        while (!(key === 140)) {
            await new Promise(resolve => {
                function tmp() {
                    if (!(key > 0)) {
                        key = Util.keyPressed();
                        setTimeout(tmp, 0);
                    } else {
                        resolve();
                    }
                }
                tmp();
            });
            Util.setColor(Main.#obstacles[selectorIndex] === true);
            Util.drawRectangle(selectorX, selectorY, selectorX + 15, selectorY + 15);
            Util.setColor(true);
            if (!(key === 140)) {
                Main.drawGoal();
                Util.drawRectangle(Main.#initialX - 1, Main.#initialY - 1, Main.#initialX + 1, Main.#initialY + 1);
                if (!(key === 130)) {
                    if (!(key === 131)) {
                        if (!(key === 132)) {
                            if (!((!(key === 133)) || (selectorY === 240))) {
                                selectorY = selectorY + 16;
                                selectorIndex = selectorIndex + 32;
                            }
                        } else if (!(selectorX === 496)) {
                            selectorX = selectorX + 16;
                            selectorIndex = selectorIndex + 1;
                        }
                    } else if (!(selectorY === 0)) {
                        selectorY = selectorY - 16;
                        selectorIndex = selectorIndex - 32;
                    }
                } else if (!(selectorX === 0)) {
                    selectorX = selectorX - 16;
                    selectorIndex = selectorIndex - 1;
                }
                Util.drawRectangle(selectorX, selectorY, selectorX + 15, selectorY + 15);
                Util.setColor(false);
                Util.drawRectangle(selectorX + 1, selectorY + 1, selectorX + 14, selectorY + 14);
                Util.setColor(true);
                Util.drawRectangle(selectorX + 2, selectorY + 2, selectorX + 13, selectorY + 13);
                if ((key === 128) || (key === 129)) {
                    drag = !(drag && (draggingEnter === (key === 128)));
                    draggingEnter = key === 128;
                    await new Promise(resolve => {
                        function tmp() {
                            if (!(key === 0)) {
                                key = Util.keyPressed();
                                setTimeout(tmp, 0);
                            } else {
                                resolve();
                            }
                        }
                        tmp();
                    });
                }
                if (drag) {
                    Main.#obstacles[selectorIndex] = draggingEnter;
                }
                if (!(key === 1)) {
                    key = 0;
                } else {
                    // wait for key release
                    await new Promise(resolve => {
                        function tmp() {
                            if (!(Util.keyPressed() === 0)) {
                                setTimeout(tmp, 0);
                            } else {
                                resolve();
                            }
                        }
                        tmp();
                    });
                    // wait for key press then hide
                    await new Promise(resolve => {
                        function tmp() {
                            if (!(Util.keyPressed() > 0)) {
                                setTimeout(tmp, 0);
                            } else {
                                resolve();
                            }
                        }
                        tmp();
                    });
                    Util.setColor(false);
                    Util.drawRectangle(40, 34, 480, 56);
                    Util.setColor(true);
                    Main.drawObstacles();
                    key = 2;
                }
                await new Promise(resolve => setTimeout(resolve, 50));
            }
        }
        Main.flood();
    }

    static flood() {
        let index = 0;
        let newIndex = 0;
        let dist = 0;
        let allowUp;
        let allowDown;
        let allowRight;
        let allowLeft;
        let initialFitness;
        index = Main.getGridIndex(Main.#goalX, Main.#goalY);
        let queue = [index];
        Main.#obstacles[index] = 0;
        while (queue.length > 0) {
            index = queue.shift();
            dist = Main.#obstacles[index];
            allowUp = index > 31;
            allowDown = index < 480;
            allowRight = (index & 31) !== 31;
            allowLeft = (index & 31) !== 0;

            if (allowUp) {
                newIndex = index - 32;
                if (Main.#obstacles[newIndex] === false) {
                    Main.#obstacles[newIndex] = dist + 5;
                    queue.push(newIndex);
                }
            }
            if (allowRight) {
                newIndex = index + 1;
                if (Main.#obstacles[newIndex] === false) {
                    Main.#obstacles[newIndex] = dist + 5;
                    queue.push(newIndex);
                }
            }
            if (allowDown) {
                newIndex = index + 32;
                if (Main.#obstacles[newIndex] === false) {
                    Main.#obstacles[newIndex] = dist + 5;
                    queue.push(newIndex);
                }
            }
            if (allowLeft) {
                newIndex = index - 1;
                if (Main.#obstacles[newIndex] === false) {
                    Main.#obstacles[newIndex] = dist + 5;
                    queue.push(newIndex);
                }
            }

            if (allowUp && allowRight) {
                newIndex = index - 31;
                if (Main.#obstacles[newIndex] === false) {
                    Main.#obstacles[newIndex] = dist + 7;
                    queue.push(newIndex);
                }
            }

            if (allowUp && allowLeft) {
                newIndex = index - 33;
                if (Main.#obstacles[newIndex] === false) {
                    Main.#obstacles[newIndex] = dist + 7;
                    queue.push(newIndex);
                }
            }

            if (allowDown && allowRight) {
                newIndex = index + 33;
                if (Main.#obstacles[newIndex] === false) {
                    Main.#obstacles[newIndex] = dist + 7;
                    queue.push(newIndex);
                }
            }

            if (allowDown && allowLeft) {
                newIndex = index + 31;
                if (Main.#obstacles[newIndex] === false) {
                    Main.#obstacles[newIndex] = dist + 7;
                    queue.push(newIndex);
                }
            }
        }
        initialFitness = Math.trunc(32767 / Main.#obstacles[Main.getGridIndex(Main.#initialX, Main.#initialY)]) - 1;
        index = 0;
        while (!(index > 511)) {
            if (Main.#obstacles[index] !== true) {
                Main.#obstacles[index] = Math.min(3276, Math.max(1, Math.trunc(32767 / Main.#obstacles[index]) - initialFitness));
            }
            index++;
        }
    }

    static drawGoal() {
        Util.drawRectangle(Main.#goalX - 2, Main.#goalY - 2, Main.#goalX + 2, Main.#goalY + 2);
    }

    static drawObstacles() {
        let i = 0;
        let obstacleX;
        let obstacleY;

        while (!(i > 511)) {
            obstacleY = 0;
            obstacleX = i;
            while (!(obstacleX < 32)) {
                obstacleX -= 32;
                obstacleY += 16;
            }
            obstacleX = i - (obstacleY + obstacleY);
            obstacleX = obstacleX + obstacleX;
            obstacleX = obstacleX + obstacleX;
            obstacleX = obstacleX + obstacleX;
            obstacleX = obstacleX + obstacleX;
            if (Main.#obstacles[i] === true) {
                Util.drawRectangle(obstacleX, obstacleY, obstacleX + 15, obstacleY + 15);
            }/* else if (Main.#obstacles[i] !== false) {
                Util.drawText(Main.#obstacles[i], obstacleX + 8, obstacleY + 8);
            }*/
            i++;
        }
    }

    static refreshDisplay() {
        Main.drawGoal();
        Main.drawObstacles();
        console.log(Main.#generationString + Population.getGen());
        if (!(Dot.getMinStep() === 32767)) {
            console.log(Main.#goalStepCountString + Dot.getMinStep());
        } else {
            console.log(Main.#goalStepCountString + Main.#NAString);
        }
    }

    static getGridIndex(posX, posY) {
        let ret = 0;
        while (!(posY < 16)) {
            posY -= 16;
            ret += 32;
        }
        // ret should be (tmp2 / 16) * 32

        while (!(posX < 16)) {
            posX -= 16;
            ret++;
        }
        // ret should be (tmp2 / 16) * 32 + (tmp / 16)
        return ret;
    }
}
Main.main();