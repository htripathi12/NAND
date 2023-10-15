import Population from "./population.js";
import Vector from "./vector.js";
import Dot from "./dot.js";
import Util from "./util.js";
import Brain from "./brain.js";

export class Main {
    static main() {
        Util.init();
        Brain.init();
        const goal = new Vector(500, 128);
        Dot.init(goal);
        Population.init();

        Util.drawRect(goal.getX() - 2, goal.getY() - 2, 4, 4);
        const population = new Population();
        setInterval(() => {
            if (population.allDotsDead()) {
                Util.clearScreen();
                Util.drawRect(goal.getX() - 2, goal.getY() - 2, 4, 4);
                population.naturalSelection();
                population.mutateBabies();
            } else {
                population.update();
                population.show();
            }
        }, 25);
    }
}
Main.main();