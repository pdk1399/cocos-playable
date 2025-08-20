import { _decorator, CCBoolean, CCFloat, CCString, Component, director, math, Node, v3, Vec3 } from 'cc';
import { SpineBase } from '../../renderer/SpineBase';
import { BodyAttackX } from '../hit/BodyAttackX';
const { ccclass, property, requireComponent } = _decorator;

@ccclass('FollowOffset')
@requireComponent(SpineBase)
export class BodyMoveFollowXYOffset extends Component {

    @property(Node)
    Follow: Node = null;

    @property({ group: { name: 'Event' }, type: CCBoolean })
    Once: boolean = false;
    @property({ group: { name: 'Event' }, type: CCString })
    OnFollow: string = '';
    @property({ group: { name: 'Event' }, type: CCFloat })
    Delay: number = 0;

    @property({ group: { name: 'Move' }, type: CCBoolean })
    FaceX: boolean = true;
    @property({ group: { name: 'Move' }, type: CCFloat })
    RatioMove: number = 0.025;
    @property({ group: { name: 'Move' }, type: CCFloat })
    RatioRun: number = 0.05;

    @property({ group: { name: 'Anim' }, type: CCBoolean })
    StartRight: boolean = true;
    @property({ group: { name: 'Anim' }, type: CCString })
    AnimIdle: string = 'idle';
    @property({ group: { name: 'Anim' }, type: CCString })
    AnimMove: string = 'move';
    @property({ group: { name: 'Anim' }, type: CCString })
    AnimRun: string = 'run';

    @property({ group: { name: 'Offset' }, type: CCFloat })
    OffsetX: number = -300;
    @property({ group: { name: 'Offset' }, type: CCFloat })
    OffsetY: number = 350;
    @property({ group: { name: 'Offset' }, type: CCFloat })
    OffsetSlowX: number = 300;

    m_folow: boolean = true;
    m_far: boolean = true;
    m_dir: number = 1;
    m_move: boolean = false;

    m_bodyAttack: BodyAttackX = null;
    m_spine: SpineBase = null;

    protected onLoad(): void {
        this.m_bodyAttack = this.getComponent(BodyAttackX);
        this.m_spine = this.getComponent(SpineBase);

        if (this.OnFollow != '')
            director.on(this.OnFollow, this.onFollowEvent, this);
    }

    protected start(): void {
        this.m_dir = this.StartRight ? 1 : -1;
        this.m_spine.onFaceDir(this.StartRight ? 1 : -1);
        this.onFollowForce(this.Follow);
    }

    protected lateUpdate(dt: number): void {
        if (this.getAttack() || this.getAttackAvaible())
            return;

        if (!this.getFollow()) {
            this.onStateUpdate(false);
            return;
        }

        let offsetDir = this.FaceX ? this.getDir() : 1;
        let offsetFinal = v3(this.OffsetX * offsetDir, this.OffsetY, 0);
        let start = this.node.worldPosition.clone();
        let end = this.Follow.worldPosition.clone().add(offsetFinal);
        let result = new Vec3();
        Vec3.lerp(result, start, end, math.clamp(this.m_far ? this.RatioRun : this.RatioMove, 0, 1));
        this.node.worldPosition = result;

        this.onStateUpdate(true);
    }

    //

    onFollowEvent(Target: Node) {
        if (Target == null)
            return;
        this.unscheduleAllCallbacks();
        this.scheduleOnce(() => {
            this.Follow = Target;
            this.node.setParent(Target.parent, true);
        }, this.Delay)
        if (this.Once)
            director.off(this.OnFollow, this.onFollowEvent, this);
    }

    onFollowForce(target: Node) {
        if (target == null)
            return;
        this.Follow = target;
        this.node.setParent(target.parent, true);
    }

    onStay() {
        this.Follow = null;
    }

    getDir(): number {
        if (this.Follow == null)
            return this.m_dir;
        this.m_dir = this.node.worldPosition.clone().x < this.Follow.worldPosition.clone().x ? 1 : -1;
        return this.m_dir;
    }

    getFollow(): boolean {
        if (this.Follow == null)
            this.m_folow = false;
        else if (!this.FaceX)
            this.m_folow = true;
        else
            this.m_folow = Math.abs(this.node.worldPosition.clone().x - this.Follow.worldPosition.clone().x) > Math.abs(this.OffsetX);
        return this.m_folow;
    }

    getFar(): boolean {
        if (this.Follow == null)
            this.m_far = false;
        else
            this.m_far = Math.abs(this.node.worldPosition.clone().x - this.Follow.worldPosition.clone().x) > Math.abs(this.OffsetX) + this.OffsetSlowX;
        return this.m_far;
    }

    //STATE

    private onStateUpdate(move: boolean) {
        if (move == this.m_move)
            return;
        this.m_move = move;
        this.m_spine.onFaceDir(this.getDir());
        if (!move)
            this.m_spine.onAnimation(this.AnimIdle, true);
        else if (this.getFar())
            this.m_spine.onAnimation(this.AnimRun, true);
        else
            this.m_spine.onAnimation(this.AnimMove, true);
    }

    //GET

    getAttack(): boolean {
        return this.m_bodyAttack != null ? this.m_bodyAttack.m_attack : false;
    }

    getAttackAvaible(): boolean {
        return this.m_bodyAttack.getAttackAvaible();
    }
}