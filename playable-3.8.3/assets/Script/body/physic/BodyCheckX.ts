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
    TagInteracte: number = 103;

    @property({ group: { name: 'Other' }, type: CCBoolean })
    TagBodyAsGround: boolean = false;
    @property({ group: { name: 'Other' }, type: CCInteger })
    TagGround: number = -1;
    @property({ group: { name: 'Other' }, type: CCInteger })
    TagPlatform: number = -2;
    @property({ group: { name: 'Other' }, type: CCInteger })
    TagInteract: number = 300;
    @property({ group: { name: 'Other' }, type: [CCInteger] })
    TagEnermy: number[] = [];

    m_dir: number = 1;

    m_currentTop: Collider2D = null;
    m_currentBot: Collider2D = null;
    m_currentInteracte: Collider2D[] = [];

    m_countBody: number = 0;
    m_countTop: number = 0;
    m_countBot: number = 0;
    m_countHead: number = 0;
    m_countBotHead: number = 0;

    m_isBody: boolean = false; //Most used for BALL body with Raycast
    m_isTop: boolean = false;

    protected m_isBot: boolean = false; //Can't used directly else where to avoid glitch
    protected m_isBotForce?: boolean = null; //Used for fixed bot check glitch
    get m_isBotFinal() {
        if (this.Raycast) {
            if (this.m_isBotForce != null) return this.m_isBotForce;
            if (this.m_countBody > 0 && !this.m_isHead) return true;
        }
        return this.m_isBot;
    }

    m_isHead: boolean = false;
    m_isBotHead: boolean = false;

    m_offsetHeadX: number;
    m_offsetBotHeadX: number;

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
                    if (this.Raycast)
                        continue;
                    this.m_colliderTop = collider;
                    break;
                case this.TagBot:
                    if (this.Raycast)
                        continue;
                    this.m_colliderBot = collider;
                    break;
                case this.TagHead:
                    if (this.Raycast)
                        continue;
                    this.m_colliderHead = collider;
                    break;
                case this.TagBotHead:
                    if (this.Raycast)
                        continue;
                    this.m_colliderBotHead = collider;
                    break;
                case this.TagInteracte:
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
                    //Check Ground
                    case this.TagGround:
                    case this.TagPlatform:
                        if (otherCollider.getComponent(BodyPlatformX) != null || otherCollider.sensor)
                            break;
                        this.m_countBody++;
                        this.m_isBody = this.m_countBody > 0;
                        break;
                    //Other
                    case this.TagInteract:
                        break;
                    default:
                        let enermyTagIndex = this.TagEnermy.findIndex(t => t == otherCollider.tag);
                        if (enermyTagIndex >= 0)
                            this.node.emit(ConstantBase.NODE_COLLIDE_ENERMY, true, otherCollider);
                        break;
                }
                break;
            case this.TagTop:
                switch (otherCollider.tag) {
                    case this.TagBody:
                        if (otherCollider.sensor || !this.TagBodyAsGround)
                            break;
                        if (this.m_countTop == 0)
                            this.m_currentTop = otherCollider;
                        this.m_countTop++;
                        this.m_isTop = this.m_countTop > 0;
                        break;
                }
                break;
            case this.TagBot:
                let isBotLast: boolean = false;
                switch (otherCollider.tag) {
                    //Check Ground
                    case this.TagGround:
                    case this.TagPlatform:
                        if (otherCollider.sensor)
                            break;
                        if (this.m_countBot == 0)
                            this.m_currentBot = otherCollider;
                        this.m_countBot++;
                        isBotLast = this.m_isBot;
                        this.m_isBot = this.m_countBot > 0;
                        if (isBotLast != this.m_isBot) {
                            this.m_isBotForce = null;
                            this.node.emit(ConstantBase.NODE_COLLIDE_BOT, this.m_isBot, otherCollider);
                        }
                        break;
                    //Check Clone
                    case this.TagBody:
                        if (otherCollider.sensor || !this.TagBodyAsGround)
                            break;
                        if (this.m_countBot == 0)
                            this.m_currentBot = otherCollider;
                        this.m_countBot++;
                        isBotLast = this.m_isBot;
                        this.m_isBot = this.m_countBot > 0;
                        if (isBotLast != this.m_isBot) {
                            this.m_isBotForce = null;
                            this.node.emit(ConstantBase.NODE_COLLIDE_BOT, this.m_isBot, otherCollider);
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
                    //Check Ground
                    case this.TagGround:
                    case this.TagPlatform:
                        if (otherCollider.sensor)
                            break;
                        this.m_countBotHead++;
                        this.m_isBotHead = this.m_countBotHead == 0;
                        break;
                }
                break;
            case this.TagInteracte:
                switch (otherCollider.tag) {
                    case this.TagInteract:
                        let index = this.m_currentInteracte.findIndex(t => t == otherCollider);
                        if (index >= 0)
                            break;
                        this.m_currentInteracte.push(otherCollider);
                        this.node.emit(ConstantBase.NODE_COLLIDE_INTERACTE, true, otherCollider);
                        break;
                }
                break;
        }
    }

    protected onEndContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        switch (selfCollider.tag) {
            case this.TagBody:
                switch (otherCollider.tag) {
                    //Check Ground
                    case this.TagGround:
                    case this.TagPlatform:
                        if (otherCollider.getComponent(BodyPlatformX) != null || otherCollider.sensor)
                            break;
                        this.m_countBody = math.clamp(this.m_countBody - 1, 0, this.m_countBody);
                        this.m_isBody = this.m_countBody > 0;
                        break;
                    //Other
                    case this.TagInteract:
                        break;
                    default:
                        let enermyTagIndex = this.TagEnermy.findIndex(t => t == otherCollider.tag);
                        if (enermyTagIndex >= 0)
                            this.node.emit(ConstantBase.NODE_COLLIDE_ENERMY, false, otherCollider);
                        break;
                }
                break;
            case this.TagTop:
                switch (otherCollider.tag) {
                    case this.TagBody:
                        if (otherCollider.sensor || !this.TagBodyAsGround)
                            break;
                        this.m_countTop = math.clamp(this.m_countTop - 1, 0, this.m_countTop);
                        if (this.m_countTop == 0)
                            this.m_currentTop = null;
                        this.m_isTop = this.m_countTop > 0;
                        break;
                }
                break;
            case this.TagBot:
                switch (otherCollider.tag) {
                    //Check Ground
                    case this.TagGround:
                    case this.TagPlatform:
                        if (otherCollider.sensor)
                            break;
                        this.m_countBot = math.clamp(this.m_countBot - 1, 0, this.m_countBot);
                        if (this.m_countBot == 0)
                            this.m_currentBot = null;
                        let state = this.m_isBot;
                        this.m_isBot = this.m_countBot > 0;
                        if (state != this.m_isBot) {
                            this.m_isBotForce = null;
                            this.node.emit(ConstantBase.NODE_COLLIDE_BOT, otherCollider, this.m_isBot);
                        }
                        break;
                    //Check Clone
                    case this.TagBody:
                        if (otherCollider.sensor || !this.TagBodyAsGround)
                            break;
                        this.m_countBot = math.clamp(this.m_countBot - 1, 0, this.m_countBot);
                        if (this.m_countBot == 0)
                            this.m_currentBot = null;
                        let state2 = this.m_isBot;
                        this.m_isBot = this.m_countBot > 0;
                        if (state2 != this.m_isBot) {
                            this.m_isBotForce = null;
                            this.node.emit(ConstantBase.NODE_COLLIDE_BOT, this.m_isBot, otherCollider);
                        }
                        break;
                }
                break;
            case this.TagHead:
                switch (otherCollider.tag) {
                    //Check Ground
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
                    //Check Ground
                    case this.TagGround:
                    case this.TagPlatform:
                        if (otherCollider.sensor)
                            break;
                        this.m_countBotHead = math.clamp(this.m_countBotHead - 1, 0, this.m_countBotHead);
                        this.m_isBotHead = this.m_countBotHead == 0;
                        break;
                }
                break;
            case this.TagInteracte:
                switch (otherCollider.tag) {
                    case this.TagInteract:
                        let index = this.m_currentInteracte.findIndex(t => t == otherCollider);
                        if (index < 0)
                            break;
                        this.m_currentInteracte.splice(index, 1);
                        this.node.emit(ConstantBase.NODE_COLLIDE_INTERACTE, false, otherCollider);
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
            this.node.emit(ConstantBase.NODE_COLLIDE_BOT, this.m_isBotForce, this.m_currentBot);
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
        let state = this.m_isBot;
        let collider: Collider2D = null;
        if (results.length < 1) {
            //Not collide with any collision!
            this.m_isBot = false;
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
                        this.m_isBot = true;
                        collider = results[i].collider;
                        out = true;
                        break;
                    case this.TagBody:
                        if (results[i].collider.sensor || !this.TagBodyAsGround)
                            break;
                        this.m_isBot = true;
                        collider = results[i].collider;
                        out = true;
                        break;
                    default:
                        this.m_isBot = false;
                        break;
                }
                if (out)
                    break;
            }
        }
        if (state != this.m_isBot) {
            let botColliderLast = this.m_currentBot;
            this.m_currentBot = collider;
            this.node.emit(ConstantBase.NODE_COLLIDE_BOT, this.m_isBot, collider ?? botColliderLast);
        }
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