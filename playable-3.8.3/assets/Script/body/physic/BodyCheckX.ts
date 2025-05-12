import { _decorator, CCBoolean, CCInteger, CircleCollider2D, Collider2D, Component, Contact2DType, director, Enum, ERaycast2DType, IPhysics2DContact, macro, math, Node, PhysicsSystem2D, RigidBody2D, v2, v3, Vec2 } from 'cc';
import { BodyPlatformX } from './BodyPlatformX';
import { ConstantBase } from '../../ConstantBase';
const { ccclass, property, requireComponent } = _decorator;

export enum BodyType {
    STICK,
    BALL,
}
Enum(BodyType)

@ccclass('BodyCheckX')
@requireComponent(RigidBody2D)
export class BodyCheckX extends Component {

    @property({ group: { name: 'Option' }, type: CCBoolean })
    Raycast: boolean = false;
    @property({ group: { name: 'Option' }, type: CCBoolean, visible(this: BodyCheckX) { return this.Raycast; } })
    RaycastBot: boolean = true;
    @property({ group: { name: 'Option' }, type: CCBoolean, visible(this: BodyCheckX) { return this.Raycast; } })
    RaycastHead: boolean = false;

    @property({ group: { name: 'Self' }, type: CCInteger })
    TagBody: number = 100;
    @property({ group: { name: 'Self' }, type: CCInteger, visible(this: BodyCheckX) { return !this.Raycast; } })
    TagTop: number = 99;
    @property({ group: { name: 'Self' }, type: CCInteger, visible(this: BodyCheckX) { return !this.Raycast; } })
    TagBot: number = 98;
    @property({ group: { name: 'Self' }, type: CCInteger, visible(this: BodyCheckX) { return !this.Raycast; } })
    TagHead: number = 97;
    @property({ group: { name: 'Self' }, type: CCInteger, visible(this: BodyCheckX) { return !this.Raycast; } })
    TagBotHead: number = 96;
    @property({ group: { name: 'Self' }, type: CCInteger })
    TagInteraction: number = 103;

    @property({ group: { name: 'Other' }, type: CCBoolean })
    TagBodyAsGround: boolean = false;
    @property({ group: { name: 'Other' }, type: CCInteger })
    TagGround: number = -1;
    @property({ group: { name: 'Other' }, type: CCInteger })
    TagPlatform: number = -2;
    @property({ group: { name: 'Other' }, type: CCInteger })
    TagBox: number = 300;

    m_dir: number = 1;

    m_countBody: number = 0;
    m_countTop: number = 0;
    m_countBot: number = 0;
    m_countHead: number = 0;
    m_countBotHead: number = 0;

    m_isBody: boolean = false;
    m_isTopCollider: boolean = false;
    protected m_isBotCollide: boolean = false;
    protected m_isBotForce?: boolean = null;
    get m_isBot() {
        if (this.Raycast) {
            if (this.m_isBotForce != null)
                return this.m_isBotForce;
            if (this.m_countBody > 0 && !this.m_isHead)
                return true;
        }
        if (this.m_isBotCollide)
            return true;
        return false;
    }
    set m_isBot(value: boolean | null) { this.m_isBotForce = value; }
    m_isHead: boolean = false;
    m_isBotHead: boolean = false;

    m_offsetHeadX: number;
    m_offsetBotHeadX: number;

    m_topNode: Node = null;
    m_topRigidbody: RigidBody2D = null;
    m_botNode: Node = null;
    m_botRigidbody: RigidBody2D = null;
    m_interacteNode: Node[] = [];

    m_raycastSchedule: Function = null;

    m_colliderBody: Collider2D = null;
    m_colliderBodyCircle: CircleCollider2D = null;
    m_colliderBot: Collider2D = null;
    m_colliderTop: Collider2D = null;
    m_colliderHead: Collider2D = null;
    m_colliderBotHead: Collider2D = null;
    m_colliderinteracte: Collider2D = null;

    protected onLoad(): void {
        let colliders = this.getComponents(Collider2D);
        for (let i = 0; i < colliders.length; i++) {
            let collider = colliders[i];
            switch (collider.tag) {
                case this.TagBody:
                    this.m_colliderBody = collider;
                    this.m_colliderBodyCircle = collider as CircleCollider2D;
                    break;
                case this.TagTop:
                    this.m_colliderTop = collider;
                    break;
                case this.TagBot:
                    this.m_colliderBot = collider;
                    break;
                case this.TagHead:
                    this.m_colliderHead = collider;
                    break;
                case this.TagBotHead:
                    this.m_colliderBotHead = collider;
                    break;
                case this.TagInteraction:
                    this.m_colliderinteracte = collider;
                    break;
                default:
                    continue;
            }
            collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
            collider.on(Contact2DType.END_CONTACT, this.onEndContact, this);
        };
        if (this.Raycast && (this.RaycastBot || this.RaycastHead)) {
            this.m_raycastSchedule = () => this.onRaycastSchedule();
            this.schedule(this.m_raycastSchedule, PhysicsSystem2D.instance.fixedTimeStep, macro.REPEAT_FOREVER, 0);
        }
    }

    protected start(): void {
        if (this.m_colliderHead != null)
            this.m_offsetHeadX = this.m_colliderHead.offset.x;
        if (this.m_colliderBotHead != null)
            this.m_offsetBotHeadX = this.m_colliderBotHead.offset.x;
    }

    //Contact

    protected onBeginContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        switch (selfCollider.tag) {
            case this.TagBody:
                switch (otherCollider.tag) {
                    case this.TagGround:
                        if (otherCollider.getComponent(BodyPlatformX) != null || otherCollider.sensor)
                            break;
                        this.m_countBody++;
                        this.m_isBody = this.m_countBody > 0;
                        break;
                    default:
                        if (otherCollider.getComponent(BodyPlatformX) != null)
                            break;
                        this.node.emit(ConstantBase.NODE_BODY_COLLIDE, otherCollider.node, true);
                        break;
                }
                break;
            case this.TagTop:
                switch (otherCollider.tag) {
                    case this.TagBody:
                        if (otherCollider.sensor || !this.TagBodyAsGround)
                            break;
                        if (this.m_countTop == 0) {
                            this.m_topNode = otherCollider.node;
                            this.m_topRigidbody = otherCollider.body;
                        }
                        this.m_countTop++;
                        this.m_isTopCollider = this.m_countTop > 0;
                        break;
                }
                break;
            case this.TagBot:
                switch (otherCollider.tag) {
                    case this.TagGround:
                    case this.TagPlatform:
                        if (otherCollider.sensor)
                            break;
                        if (this.m_countBot == 0) {
                            this.m_botNode = otherCollider.node;
                            this.m_botRigidbody = otherCollider.body;
                        }
                        this.m_countBot++;
                        let state = this.m_isBotCollide;
                        this.m_isBotCollide = this.m_countBot > 0;
                        if (state != this.m_isBotCollide) {
                            this.m_isBotForce = null;
                            this.node.emit(ConstantBase.NODE_BODY_BOT, this.m_isBotCollide);
                        }
                        break;
                    case this.TagBody:
                        if (otherCollider.sensor || !this.TagBodyAsGround)
                            break;
                        if (this.m_countBot == 0) {
                            this.m_botNode = otherCollider.node;
                            this.m_botRigidbody = otherCollider.body;
                        }
                        this.m_countBot++;
                        let state2 = this.m_isBotCollide;
                        this.m_isBotCollide = this.m_countBot > 0;
                        if (state2 != this.m_isBotCollide) {
                            this.m_isBotForce = null;
                            this.node.emit(ConstantBase.NODE_BODY_BOT, this.m_isBotCollide);
                        }
                        break;
                }
                break;
            case this.TagHead:
                switch (otherCollider.tag) {
                    case this.TagGround:
                        if (otherCollider.sensor || otherCollider.getComponent(BodyPlatformX) != null)
                            break;
                        this.m_countHead++;
                        this.m_isHead = this.m_countHead > 0;
                        break;
                }
                break;
            case this.TagBotHead:
                switch (otherCollider.tag) {
                    case this.TagGround:
                    case this.TagPlatform:
                        if (otherCollider.sensor)
                            break;
                        this.m_countBotHead++;
                        this.m_isBotHead = this.m_countBotHead == 0;
                        break;
                }
                break;

            case this.TagInteraction:
                switch (otherCollider.tag) {
                    case this.TagBox:
                        let index = this.m_interacteNode.findIndex(t => t == otherCollider.node);
                        if (index >= 0)
                            break;
                        this.m_interacteNode.push(otherCollider.node);
                        this.node.emit(ConstantBase.NODE_BODY_INTERACTE, otherCollider.node, true);
                        break;
                }
                break;
        }
    }

    protected onEndContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        switch (selfCollider.tag) {
            case this.TagBody:
                switch (otherCollider.tag) {
                    case this.TagGround:
                        if (otherCollider.getComponent(BodyPlatformX) != null || otherCollider.sensor)
                            break;
                        this.m_countBody = math.clamp(this.m_countBody - 1, 0, this.m_countBody);
                        this.m_isBody = this.m_countBody > 0;
                        break;
                    default:
                        if (otherCollider.getComponent(BodyPlatformX) != null)
                            break;
                        this.node.emit(ConstantBase.NODE_BODY_COLLIDE, otherCollider.node, false);
                        break;
                }
                break;
            case this.TagTop:
                switch (otherCollider.tag) {
                    case this.TagBody:
                        if (otherCollider.sensor || !this.TagBodyAsGround)
                            break;
                        this.m_countTop = math.clamp(this.m_countTop - 1, 0, this.m_countTop);
                        if (this.m_countTop == 0) {
                            this.m_topNode = null;
                            this.m_topRigidbody = null;
                        }
                        this.m_isTopCollider = this.m_countTop > 0;
                        break;
                }
                break;
            case this.TagBot:
                switch (otherCollider.tag) {
                    case this.TagGround:
                    case this.TagPlatform:
                        if (otherCollider.sensor)
                            break;
                        this.m_countBot = math.clamp(this.m_countBot - 1, 0, this.m_countBot);
                        if (this.m_countBot == 0) {
                            this.m_botNode = null;
                            this.m_botRigidbody = null;
                        }
                        let state = this.m_isBotCollide;
                        this.m_isBotCollide = this.m_countBot > 0;
                        if (state != this.m_isBotCollide) {
                            this.m_isBotForce = null;
                            this.node.emit(ConstantBase.NODE_BODY_BOT, this.m_isBotCollide);
                        }
                        break;
                    case this.TagBody:
                        if (otherCollider.sensor || !this.TagBodyAsGround)
                            break;
                        this.m_countBot = math.clamp(this.m_countBot - 1, 0, this.m_countBot);
                        if (this.m_countBot == 0) {
                            this.m_botNode = null;
                            this.m_botRigidbody = null;
                        }
                        let state2 = this.m_isBotCollide;
                        this.m_isBotCollide = this.m_countBot > 0;
                        if (state2 != this.m_isBotCollide) {
                            this.m_isBotForce = null;
                            this.node.emit(ConstantBase.NODE_BODY_BOT, this.m_isBotCollide);
                        }
                        break;
                }
                break;
            case this.TagHead:
                switch (otherCollider.tag) {
                    case this.TagGround:
                        if (otherCollider.sensor || otherCollider.getComponent(BodyPlatformX) != null)
                            break;
                        this.m_countHead = math.clamp(this.m_countHead - 1, 0, this.m_countHead);
                        this.m_isHead = this.m_countHead > 0;
                        break;
                }
                break;
            case this.TagBotHead:
                switch (otherCollider.tag) {
                    case this.TagGround:
                    case this.TagPlatform:
                        if (otherCollider.sensor)
                            break;
                        this.m_countBotHead = math.clamp(this.m_countBotHead - 1, 0, this.m_countBotHead);
                        this.m_isBotHead = this.m_countBotHead == 0;
                        break;
                }
                break;
            case this.TagInteraction:
                switch (otherCollider.tag) {
                    case this.TagBox:
                        let index = this.m_interacteNode.findIndex(t => t == otherCollider.node);
                        if (index < 0)
                            break;
                        this.m_interacteNode.splice(index, 1);
                        this.node.emit(ConstantBase.NODE_BODY_INTERACTE, otherCollider.node, false);
                        break;
                }
                break;
        }
    }

    //Raycast

    protected onRaycastSchedule() {
        // if (!this.Raycast)
        //     return;
        if (this.RaycastBot)
            this.onRaycastBot();
        if (this.RaycastHead)
            this.onRaycastHead();
    }

    protected onRaycastBot() {
        if (this.m_isBotForce != null) {
            this.node.emit(ConstantBase.NODE_BODY_BOT, this.m_isBotForce);
            this.m_isBotForce = null;
            return;
        }
        //Check Ground
        let length: number;
        if (this.m_colliderBodyCircle != null)
            length = this.m_colliderBodyCircle.worldRadius;
        else
            length = this.m_colliderBody.worldAABB.size.clone().x;
        let p1 = this.node.worldPosition;
        let p2 = p1.clone().subtract(v3(0, length + 1, 0));
        const results = PhysicsSystem2D.instance.raycast(p1, p2, ERaycast2DType.Any);
        let state = this.m_isBotCollide;
        if (results.length < 1) {
            //Not collide with any collision!
            this.m_isBotCollide = false;
        }
        else {
            //Collide with aleast 1 collision!
            for (let i = 0; i < results.length; i++) {
                let out = false;
                switch (results[i].collider.tag) {
                    case this.TagGround:
                    case this.TagPlatform:
                        if (results[i].collider.sensor)
                            break;
                        this.m_isBotCollide = true;
                        out = true;
                        break;
                    case this.TagBody:
                        if (results[i].collider.sensor || !this.TagBodyAsGround)
                            break;
                        this.m_isBotCollide = true;
                        out = true;
                        break;
                    default:
                        this.m_isBotCollide = false;
                        break;
                }
                if (out)
                    break;
            }
        }
        if (state != this.m_isBotCollide)
            this.node.emit(ConstantBase.NODE_BODY_BOT, this.m_isBotCollide);
    }

    protected onRaycastHead() {
        //Check Ground
        let length: number;
        if (this.m_colliderBodyCircle != null)
            length = this.m_colliderBodyCircle.worldRadius;
        else
            length = this.m_colliderBody.worldAABB.size.clone().x;
        let p1 = this.node.worldPosition;
        let p2 = p1.clone().add(v3((length + 1) * this.m_dir, 0, 0));
        const results = PhysicsSystem2D.instance.raycast(p1, p2, ERaycast2DType.Any);
        let state = this.m_isHead;
        if (results.length < 1) {
            //Not collide with any collision!
            this.m_isHead = false;
        }
        else {
            //Collide with aleast 1 collision!
            for (let i = 0; i < results.length; i++) {
                let out = false;
                switch (results[i].collider.tag) {
                    case this.TagGround:
                    case this.TagPlatform:
                        this.m_isHead = true;
                        out = true;
                        break;
                    default:
                        this.m_isHead = false;
                        break;
                }
                if (out)
                    break;
            }
        }
        // if (state != this.m_isHead)
        //     this.node.emit(this.m_emitHead, this.m_isHead);
    }

    //Dir

    onDirUpdate(dir: number) {
        if (dir > 0)
            dir = 1;
        else if (dir < 0)
            dir = -1;
        else return;

        let dirLast = this.m_dir;
        this.m_dir = dir;

        if (dirLast == dir)
            return;

        this.m_isHead = false;
        this.m_countHead = 0;
        this.m_isBotHead = false;
        this.m_countBotHead = 0;

        this.scheduleOnce(() => {
            if (this.m_colliderHead != null ? this.m_colliderHead.isValid : false) {
                let headColliderOffset = this.m_colliderHead.offset;
                headColliderOffset.x = this.m_offsetHeadX * dir;
                this.m_colliderHead.offset = headColliderOffset;
                this.m_colliderHead.apply(); //Called this onStart() make bug (?)
            }

            if (this.m_colliderBotHead != null ? this.m_colliderBotHead.isValid : false) {
                let botHeadColliderOffset = this.m_colliderBotHead.offset;
                botHeadColliderOffset.x = this.m_offsetBotHeadX * dir;
                this.m_colliderBotHead.offset = botHeadColliderOffset;
                this.m_colliderBotHead.apply(); //Called this onStart() make bug (?)
            }
        })
    }

    //Bot

    onBotCheckOut() {
        this.m_isBotForce = false;
    }
}