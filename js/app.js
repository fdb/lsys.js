const { h, Component, render } = preact;

const PRESETS = {
    'tree1': { premise: 'A', rules: ['A=FFF[+F+FA][-F-FA]'], generations: 7, stepSize: 10, angle: 7},
    'tree2': { premise: 'F', rules: ['F=F[+F][-F]'], generations: 7, stepSize: 10, angle: 18},
    'plant_a': { premise: 'F', rules: ['F=F[+F]F[-F]F'], generations: 4, stepSize: 10, angle: 20},
    'plant_c': { premise: 'F', rules: ['F=FF-[-F+F+F]+[+F-F-F]'], generations: 4, stepSize: 10, angle: 20},
    'koch': { premise: 'F-F-F-F', rules: ['F=F-F+F+FF-F-F+F'], generations: 4, stepSize: 2, angle: 90},
};

const RULE_INPUTS = 5

class Editor extends Component {

    onChangeGenerations(e) {
        this.props.onChangeGenerations(parseFloat(e.target.value));
    }

    onChangeStepSize(e) {
        this.props.onChangeStepSize(parseFloat(e.target.value));
    }

    onChangeAngle(e) {
        this.props.onChangeAngle(parseFloat(e.target.value));
    }

    onChangePremise(e) {
        this.props.onChangePremise(e.target.value);
    }

    onChangeRule(ruleIndex, e) {
        this.props.onChangeRule(ruleIndex, e.target.value);
    }

    onChangePreset(e) {
        this.props.onChangePreset(e.target.value);
    }

    render(props) {
        let ruleInputs = [];
        for (let i = 0; i < RULE_INPUTS; i++) {
            let rule = props.rules[i];
            let input = h('input', {type: 'text', class: 'rule', value: rule, onInput: this.onChangeRule.bind(this, i)});
            ruleInputs.push(input);
        }
        let presetKeys = Object.keys(props.presets);
        let presetOptions = presetKeys.map(p => h('option', {key: p}, p));
        return h('div', {class: 'editor'},
            h('div', {class: 'form-row presets'},
                h('select', {onChange: this.onChangePreset.bind(this)}, presetOptions)
            ),
            h('div', {class: 'form-row'},
                h('label', {}, 'Generations'),
                h('input', {type: 'range', value: props.generations, min: 0, max: 10, step: 0.01, onInput: this.onChangeGenerations.bind(this)}),
                h('span', {class: 'value'}, props.generations)
            ),
            h('div', {class: 'form-row'},
                h('label', {}, 'Step Size'),
                h('input', {type: 'range', value: props.stepSize, min: 0, max: 10, step: 0.01, onInput: this.onChangeStepSize.bind(this)}),
                h('span', {class: 'value'}, props.stepSize)
            ),
            h('div', {class: 'form-row'},
                h('label', {}, 'Angle'),
                h('input', {type: 'range', value: props.angle, min: -90, max: 90, step: 0.01, onInput: this.onChangeAngle.bind(this)}),
                h('span', {class: 'value'}, props.angle)
            ),
            h('div', {class: 'form-row'},
                h('label', {}, 'Premise'),
                h('input', {type: 'text', value: props.premise, onInput: this.onChangePremise.bind(this)})
            ),
            h('div', {class: 'form-row'},
                h('label', {}, 'Rules'),
                ruleInputs
            ),
            h('div', {class: 'spacer'}),
            h('div', {class: 'footer'},
                'Play with ',
                h('a', {href: 'https://en.wikipedia.org/wiki/L-system', target: '_blank'}, 'Lindenmayer systems'),
                ' in your browser.',
                h('br'),
                'lsys.js is free software hosted on ',
                h('a', {href: 'https://github.com/fdb/lsys.js', target: '_blank'}, 'GitHub'),
                '.'
            )
        );
    }
}

class Viewer extends Component {
    render(props) {
        return h('svg', {width: 500, height: 500},
            h('path', {d: props.d, fill: 'none', stroke: 'black'})
        );
    }
}

class App extends Component {
    constructor(props) {
        super(props);
        this.setPreset('tree1');
        //this.state = {premise: 'A', rules: ['A=FFF[+F+FA][-F-FA]'], generations: 5.2, stepSize: 10, angle: 20};
    }

    setPreset(name) {
        const preset = PRESETS[name];
        console.log(JSON.stringify(preset));
        this.setState(JSON.parse(JSON.stringify(preset)));
    }

    render(props, state) {
        let d;
        let errView;
        try {
            d = lsys.toPathData(state.premise, state.rules, state.generations, state.stepSize, state.angle);
        } catch(e) {
            errView = h('div', {class: 'err'}, e.stack);
        }

        return h('div', {class: 'app'},
            h(Editor, {
                presets: PRESETS,
                premise: this.state.premise,
                rules: this.state.rules,
                generations: this.state.generations,
                stepSize: this.state.stepSize,
                angle: this.state.angle,
                onChangePreset: (name) => this.setPreset(name),
                onChangeGenerations: (generations) => this.setState({generations}),
                onChangeStepSize: (stepSize) => this.setState({stepSize}),
                onChangeAngle: (angle) => this.setState({angle}),
                onChangeRule: (i, rule) => { this.state.rules[i] = rule; this.setState({rules: this.state.rules}) },
                onChangePremise: (premise) => this.setState({premise}),
            }),
            h(Viewer, {d}),
            errView
        );
    }

}

render(h(App), document.querySelector('#root'));
