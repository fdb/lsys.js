(function() {
const STEP_SIZE = 10;
const STEP_SIZE_SCALE = 0.9;
const ANGLE = 10;
const ANGLE_SCALE = 0.7;

function deg2rad(deg) {
    return deg * 0.01745329;
}

class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

class Transform {
    constructor() {
        // Column-first order:
        // a c e
        // b d f
        // 0 0 1
        this.m = [1, 0, 0, 1, 0, 0];
    }

    translate(tx, ty) {
        this.mult([1, 0, 0, 1, tx, ty]);
    }

    rotate(r) {
        this.mult([Math.cos(r), -Math.sin(r), Math.sin(r), Math.cos(r), 0, 0]);
    }

    mult(o) {
        const m = this.m;
        if (o.m) {
            o = o.m;
        }
        const r = [
            m[0] * o[0] + m[2] * o[1],
            m[1] * o[0] + m[3] * o[1],
            m[0] * o[2] + m[2] * o[3],
            m[1] * o[2] + m[3] * o[3],
            m[0] * o[4] + m[2] * o[5] + m[4],
            m[1] * o[4] + m[3] * o[5] + m[5]
        ];
        this.m = r;
    }

    map(pt) {
        const x = pt.x;
        const y = pt.y;
        const m = this.m;
        return new Point(x * m[0] + y * m[2] + m[4], x * m[1] + y * m[3] + m[5]);
    }
}

const MOVE_TO = 1;
const LINE_TO = 2;

class Path {
    constructor() {
        this.commands = [];
        this.points = [];
    }

    moveTo(x, y) {
        this.commands.push(MOVE_TO);
        this.points.push(new Point(x, y));
    }

    lineTo(x, y) {
        this.commands.push(LINE_TO);
        this.points.push(new Point(x, y));
    }

    toPathData() {
        let s = '';
        for (let i = 0; i < this.commands.length; i++) {
            let cmd = this.commands[i];
            let pt = this.points[i];
            if (cmd === MOVE_TO) {
                s += `M${pt.x} ${pt.y}`;
            } else if (cmd === LINE_TO) {
                s += `L${pt.x} ${pt.y}`;
            } else {
                throw new Error(`Invalid path command ${cmd}`);
            }
        }
        return s;
    }
}

class Context {
    constructor() {
        this.path = new Path();
        this.transform = new Transform();
        this.stack = [];
    }

    line(length) {
        // const pt1 = this.transform.map(new Point(0, 0));
        // this.path.moveTo(pt1.x, pt1.y);
         const pt2 = this.transform.map(new Point(0, -length));
        this.path.moveTo(this.transform.m[4], this.transform.m[5]);
        this.path.lineTo(pt2.x, pt2.y);
        //this.path.lineTo(this.transform.m[4], this.transform.m[5] * -length);
    }

    translate(tx, ty) {
        this.transform.translate(tx, ty);
    }

    rotate(r) {
        this.transform.rotate(r);
    }

    push() {
        this.stack.push(this.transform.m.slice());
    }

    pop() {
        this.transform.m = this.stack.pop();
    }
}

function lsys(generations, premise, rules) {
}

function parseRules(rules) {
    let d = {};
    for (let i = 0; i < rules.length; i++) {
        const rule = rules[i];
        const key = rule[0];
        if (rule[1] !== '=') {
            throw new Error('Rules should be in the format A=FF[F+F-B][-FBB]');
        }
        const val = rule.substring(2);
        d[key] = val;
    }
    return d;
}

function recurse(ctx, ruleBook, rule, generations, stepSize, angle) {
    if (generations <= 0) {
        return;
    } else if (generations < 1) {
        stepSize *= generations;
        angle *= generations;
    }
    for (let i = 0; i < rule.length; i++) {
        const c = rule[i];
        switch(c) {
            case 'F': ctx.line(stepSize); ctx.translate(0, -stepSize); break;
            case '+': ctx.rotate(deg2rad(angle)); break;
            case '-': ctx.rotate(deg2rad(-angle)); break;
            case '[': ctx.push(); break;
            case ']': ctx.pop(); break;
            default: { if (!ruleBook[c]) { throw new Error(`Could not find rule for ${c}.`); }}
        }
        if (ruleBook[c]) {
            const rule = ruleBook[c];
            recurse(ctx, ruleBook, rule, generations - 1, stepSize, angle);
        }
    }
}

function toPathData(premise, rules, generations, stepSize=STEP_SIZE, angle=ANGLE) {
    let ruleBook = parseRules(rules);
    let ctx = new Context();
    ctx.transform.translate(250, 450);
    recurse(ctx, ruleBook, premise, generations, stepSize, angle);
    return ctx.path.toPathData();
}

window.lsys = {toPathData};
})();
