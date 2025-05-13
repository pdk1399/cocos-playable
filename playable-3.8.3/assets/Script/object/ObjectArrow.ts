import { _decorator, Component, director, Node, Vec2, Vec3 } from 'cc';
import { ConstantBase } from '../ConstantBase';
const { ccclass, property } = _decorator;

@ccclass('ObjectArrow')
export class ObjectArrow extends Component {

    // @property({ group: { name: 'Main' }, type: [Node] })
    @property([Node])
    SwitchTarget: Node[] = [];

    // @property({ group: { name: 'Main' }, type: [Node] })
    @property([Node])
    SwitchRenderer: Node[] = [];

    // @property({ group: { name: 'Main' }, type: [Vec2] })
    @property([Vec2])
    SwitchOffset: Vec2[] = [];

    m_target: Node;
    m_renderer: Node;
    m_offset: Vec3;

    protected onLoad(): void {
        if (this.SwitchTarget.length != this.SwitchRenderer.length) {
            console.error("SwitchTarget and SwitchRenderer length mismatch");
            return;
        }

        director.on(ConstantBase.CONTROL_SWITCH, this.onSwitch, this);

        this.m_target = this.SwitchTarget[0];

        this.m_renderer = this.SwitchRenderer[0];
        this.SwitchRenderer.forEach(t => {
            if (t != this.m_renderer)
                t.active = false;
        });

        while (this.SwitchOffset.length < this.SwitchTarget.length) {
            this.SwitchOffset.push(new Vec2(0, 0));
        }
        this.m_offset = new Vec3(this.SwitchOffset[0].x, this.SwitchOffset[0].y, 0);
    }

    protected lateUpdate(dt: number): void {
        this.node.worldPosition = this.m_target.worldPosition.clone();
    }

    onSwitch(index: number) {
        this.m_target = this.SwitchTarget[index];

        this.m_renderer.active = false;
        this.m_renderer = this.SwitchRenderer[index];
        this.m_renderer.active = true;

        this.m_offset = new Vec3(this.SwitchOffset[index].x, this.SwitchOffset[index].y, 0);
    }
}